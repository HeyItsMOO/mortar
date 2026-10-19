//go:build windows

package gamestore

import (
	"strings"

	"golang.org/x/sys/windows/registry"
)

// eaRegistryDir is the "Install Dir" a game's installer recorded under HKLM key (SOFTWARE\...), in the 64-bit view and
// then the 32-bit one. Vortex's Sims 4 extension reads it the same way (Nexus-Mods/Vortex,
// extensions/games/game-sims4/src/index.js, findGame), which finds a game on any drive, whichever EA launcher installed it.
func eaRegistryDir(key string) string {
	for _, k := range []string{key, `SOFTWARE\WOW6432Node\` + strings.TrimPrefix(key, `SOFTWARE\`)} {
		h, err := registry.OpenKey(registry.LOCAL_MACHINE, k, registry.QUERY_VALUE)
		if err != nil {
			continue
		}
		p, _, err := h.GetStringValue("Install Dir")
		_ = h.Close()
		if err == nil && p != "" {
			return p
		}
	}
	return ""
}
