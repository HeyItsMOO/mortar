package settings

import (
	"slices"
	"strings"
)

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

// HidesAuthor reports whether the game hides every mod by this author from Browse.
func (g GameSettings) HidesAuthor(author string) bool {
	return author != "" && slices.ContainsFunc(g.HiddenAuthors, func(a string) bool { return strings.EqualFold(a, author) })
}

// HideBrowseAuthor hides every mod by the author from the game's Browse.
func (s *Service) HideBrowseAuthor(game, author string) error {
	return s.set(func(v *Settings) {
		gp := v.GamePrefs(game)
		if author != "" && !gp.HidesAuthor(author) {
			gp.HiddenAuthors = append(gp.HiddenAuthors, author)
		}
		putGame(v, game, gp)
	})
}

// UnhideBrowseAuthor shows the author's mods in the game's Browse again.
func (s *Service) UnhideBrowseAuthor(game, author string) error {
	return s.set(func(v *Settings) {
		gp := v.GamePrefs(game)
		gp.HiddenAuthors = slices.DeleteFunc(slices.Clone(gp.HiddenAuthors), func(a string) bool { return strings.EqualFold(a, author) })
		putGame(v, game, gp)
	})
}

// SetGameHidden hides a game from the game list, or shows it again.
func (s *Service) SetGameHidden(game string, hidden bool) error {
	return s.set(func(v *Settings) {
		kept := slices.DeleteFunc(slices.Clone(v.HiddenGames), func(g string) bool { return g == game })
		if hidden {
			kept = append(kept, game)
		}
		v.HiddenGames = kept
	})
}
