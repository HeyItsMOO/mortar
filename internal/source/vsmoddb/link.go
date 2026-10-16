package vsmoddb

import (
	"errors"
	"regexp"
	"strings"
)

// Schemes is the scheme of the site's 1-click install button.
func (Driver) Schemes() []string { return []string{"vintagestorymodinstall"} }

// HandleLinksDefault is false: the game registers these links to install mods itself, so Mortar takes them from the
// system only when the user opts in.
func (Driver) HandleLinksDefault() bool { return false }

// Ref names one release in an install link: the mod id its modinfo.json gives and the release's version.
type Ref struct{ ModID, Version string }

var (
	linkModID   = regexp.MustCompile(`^[A-Za-z0-9_-]{1,64}$`)
	linkVersion = regexp.MustCompile(`^[0-9A-Za-z.+-]{1,40}$`)
	errBadLink  = errors.New("not a vintagestorymodinstall link")
)

// ParseLink reads vintagestorymodinstall://<modid>@<version>, as the Mod DB's install button writes it.
func ParseLink(raw string) (Ref, error) {
	rest, ok := strings.CutPrefix(raw, "vintagestorymodinstall://")
	if !ok {
		return Ref{}, errBadLink
	}
	modID, ver, ok := strings.Cut(strings.TrimSuffix(rest, "/"), "@")
	if !ok || !linkModID.MatchString(modID) || !linkVersion.MatchString(ver) {
		return Ref{}, errBadLink
	}
	return Ref{ModID: modID, Version: ver}, nil
}
