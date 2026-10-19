//go:build windows

package profile

import (
	"os"
	"os/exec"
	"syscall"
)

// linkDir makes link point at the folder target: a symbolic link when the account may create one, else a directory
// junction, which needs no privilege.
func linkDir(link, target string) error {
	if os.Symlink(target, link) == nil {
		return nil
	}
	cmd := exec.Command("cmd", "/c", "mklink", "/J", link, target)
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	return cmd.Run()
}
