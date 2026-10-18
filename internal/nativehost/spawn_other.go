//go:build !windows

package nativehost

import (
	"context"
	"os/exec"
)

func start(exe, link string) error {
	cmd := exec.CommandContext(context.Background(), exe, link) //nolint:gosec // G204: exe is Mortar; link is a mortar:// URL
	if err := cmd.Start(); err != nil {
		return err
	}
	return cmd.Process.Release()
}
