package sysaccent

import "github.com/godbus/dbus/v5"

// Read is the desktop's accent colour as "#rrggbb"; false when the portal is absent or the desktop sets none.
func Read() (string, bool) {
	conn, err := dbus.ConnectSessionBus()
	if err != nil {
		return "", false
	}
	defer func() { _ = conn.Close() }()
	var out dbus.Variant
	call := conn.Object("org.freedesktop.portal.Desktop", "/org/freedesktop/portal/desktop").
		Call("org.freedesktop.portal.Settings.Read", 0, "org.freedesktop.appearance", "accent-color")
	if call.Store(&out) != nil {
		return "", false
	}
	return FromPortal(out)
}
