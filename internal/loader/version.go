package loader

import "strings"

// GameChanged reports that the game was updated since its last successful launch: its version differs when the loader
// reads one, else its store build does. A loader that reads the version ignores the build, which changes with hotfixes
// that leave the version alone.
func GameChanged(recorded, installed, recordedBuild, installedBuild string) bool {
	if strings.TrimSpace(installed) != "" {
		return VersionChanged(recorded, installed)
	}
	return VersionChanged(recordedBuild, installedBuild)
}

// VersionChanged reports that the installed game version is known and differs from the version recorded at the last
// successful launch.
func VersionChanged(recorded, installed string) bool {
	recorded, installed = strings.TrimSpace(recorded), strings.TrimSpace(installed)
	if recorded == "" || installed == "" {
		return false
	}
	return recorded != installed
}
