//go:build !windows

package profile

import "os"

// linkDir makes link point at the folder target.
func linkDir(link, target string) error { return os.Symlink(target, link) }
