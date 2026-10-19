package secret

import (
	"errors"
	"fmt"
	"io"
	"math"
	"os"
	"strings"
	"time"

	"github.com/godbus/dbus/v5"
)

const (
	portalBus   = "org.freedesktop.portal.Desktop"
	portalPath  = "/org/freedesktop/portal/desktop"
	portalToken = "mortar_secret"
	// portalWait bounds the Response wait; the portal answers in milliseconds unless it is prompting for an unlock.
	portalWait = 30 * time.Second
)

// retrievePortalSecret asks the XDG Secret portal for this app's master secret. The portal returns the same bytes on
// every call for an app, and writes them to the pipe we pass.
func retrievePortalSecret() ([]byte, error) {
	conn, err := dbus.ConnectSessionBus()
	if err != nil {
		return nil, err
	}
	defer func() { _ = conn.Close() }()

	sender := strings.ReplaceAll(strings.TrimPrefix(conn.Names()[0], ":"), ".", "_")
	handle := dbus.ObjectPath(portalPath + "/request/" + sender + "/" + portalToken)
	match := []dbus.MatchOption{
		dbus.WithMatchObjectPath(handle),
		dbus.WithMatchInterface("org.freedesktop.portal.Request"),
		dbus.WithMatchMember("Response"),
	}
	// Subscribed before the call: the portal may answer before the call returns.
	if err := conn.AddMatchSignal(match...); err != nil {
		return nil, err
	}
	defer func() { _ = conn.RemoveMatchSignal(match...) }()
	signals := make(chan *dbus.Signal, 4)
	conn.Signal(signals)
	defer conn.RemoveSignal(signals)

	r, w, err := os.Pipe()
	if err != nil {
		return nil, err
	}
	defer func() { _ = r.Close() }()
	fd := w.Fd()
	if fd > math.MaxInt32 {
		_ = w.Close()
		return nil, errors.New("pipe descriptor out of range")
	}
	call := conn.Object(portalBus, portalPath).Call("org.freedesktop.portal.Secret.RetrieveSecret", 0,
		dbus.UnixFD(fd), map[string]dbus.Variant{"handle_token": dbus.MakeVariant(portalToken)})
	// Our copy must close or the read below never sees EOF.
	_ = w.Close()
	if call.Err != nil {
		return nil, call.Err
	}

	timeout := time.After(portalWait)
	for {
		select {
		case sig, ok := <-signals:
			if !ok {
				return nil, errors.New("the portal connection closed")
			}
			if sig.Path != handle || len(sig.Body) < 1 {
				continue
			}
			if code, _ := sig.Body[0].(uint32); code != 0 {
				return nil, fmt.Errorf("the secret portal refused (response %d)", code)
			}
			_ = r.SetReadDeadline(time.Now().Add(portalWait))
			secret, err := io.ReadAll(r)
			if err != nil {
				return nil, err
			}
			if len(secret) == 0 {
				return nil, errors.New("the secret portal returned an empty secret")
			}
			return secret, nil
		case <-timeout:
			return nil, errors.New("the secret portal did not answer")
		}
	}
}
