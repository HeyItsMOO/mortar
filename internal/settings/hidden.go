package settings

import "strings"

// HiddenMod is a mod hidden from Browse: its source and id, and its name for the list that unhides it.
type HiddenMod struct {
	Source string `json:"source"`
	ID     string `json:"id"`
	Name   string `json:"name"`
}

func (h HiddenMod) is(source, id string) bool {
	return strings.EqualFold(h.Source, source) && strings.EqualFold(h.ID, id)
}

// HidesMod reports whether the game hides the mod with this source and id from Browse.
func (g GameSettings) HidesMod(source, id string) bool {
	for _, h := range g.HiddenMods {
		if h.is(source, id) {
			return true
		}
	}
	return false
}

// HideBrowseMod hides a mod from the game's Browse.
func (s *Service) HideBrowseMod(game string, mod HiddenMod) error {
	return s.set(func(v *Settings) {
		gp := v.GamePrefs(game)
		if !gp.HidesMod(mod.Source, mod.ID) {
			gp.HiddenMods = append(gp.HiddenMods, mod)
		}
		putGame(v, game, gp)
	})
}

// UnhideBrowseMod shows a hidden mod in the game's Browse again.
func (s *Service) UnhideBrowseMod(game, source, id string) error {
	return s.set(func(v *Settings) {
		gp := v.GamePrefs(game)
		kept := make([]HiddenMod, 0, len(gp.HiddenMods))
		for _, h := range gp.HiddenMods {
			if !h.is(source, id) {
				kept = append(kept, h)
			}
		}
		gp.HiddenMods = kept
		putGame(v, game, gp)
	})
}
