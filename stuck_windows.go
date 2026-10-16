//go:build windows

package main

import (
	"errors"
	"math"
	"os"
	"time"

	"github.com/wailsapp/wails/v3/pkg/w32"
	"golang.org/x/sys/windows"
)

func processExe(pid int) (string, error) {
	if pid <= 0 || pid > math.MaxUint32 {
		return "", errors.New("not a process id")
	}
	h, err := windows.OpenProcess(windows.PROCESS_QUERY_LIMITED_INFORMATION, false, uint32(pid))
	if err != nil {
		return "", err
	}
	defer func() { _ = windows.CloseHandle(h) }()
	var buf [windows.MAX_LONG_PATH]uint16
	n := uint32(windows.MAX_LONG_PATH)
	if err := windows.QueryFullProcessImageName(h, 0, &buf[0], &n); err != nil {
		return "", err
	}
	return windows.UTF16ToString(buf[:n]), nil
}

// waitGone waits up to 5 seconds for an ended process to exit.
func waitGone(p *os.Process) {
	done := make(chan struct{})
	go func() {
		_, _ = p.Wait()
		close(done)
	}()
	select {
	case <-done:
	case <-time.After(5 * time.Second):
	}
}

func askEndStuck(msg string) bool {
	return w32.MessageBox(0, msg, "Mortar", mbYesNo|mbIconError|mbTopmost) == idYes
}
