package runtime

import (
	"errors"
	"path/filepath"

	"github.com/Rethunk-Tech/mortar/internal/components"
)

// launcherStores are the stores whose launcher keeps a Wine prefix for the game: Heroic's GOG and Epic copies, and Lutris.
var launcherStores = map[string]bool{"gog-heroic": true, "epic-heroic": true, "lutris": true}

type launcherPrefix struct{}

func (launcherPrefix) ID() string { return LauncherPrefix }

// Detect: a Windows build that Heroic or Lutris runs in a prefix they already made, which is where its saves are.
func (launcherPrefix) Detect(inst Install) bool {
	return inst.host() == "linux" && inst.Platform == "windows" && inst.Prefix != "" && launcherStores[inst.Store]
}

func (l launcherPrefix) Resolve(inst Install, t components.PathTemplate) (string, error) {
	if !l.Detect(inst) {
		return "", errors.New("install does not run in a launcher's prefix")
	}
	if t.Windows == "" {
		return "", errors.New("no path for a windows build")
	}
	return expand(t.Windows, prefixTokens(inst))
}

// CompatDataOf is the Proton compatdata folder of a launcher-run install: the folder above the prefix's pfx folder.
// ok is false for a plain Wine prefix, which Proton cannot run in.
func CompatDataOf(inst Install) (string, bool) {
	if !(launcherPrefix{}).Detect(inst) || filepath.Base(inst.Prefix) != "pfx" {
		return "", false
	}
	return filepath.Dir(inst.Prefix), true
}
