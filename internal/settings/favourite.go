package settings

import (
	"slices"
	"strings"
)

// FavouriteKey is how a starred mod is named: its source and the id the source gives it, in lower case. The window
// builds the same key for a Browse hit and for an installed mod of that source.
func FavouriteKey(source, id string) string {
	return strings.ToLower(source + ":" + id)
}

// SetModFavourite stars a mod for the game, or removes its star.
func (s *Service) SetModFavourite(game, key string, favourite bool) error {
	key = strings.ToLower(strings.TrimSpace(key))
	return s.set(func(v *Settings) {
		gp := v.GamePrefs(game)
		kept := slices.DeleteFunc(slices.Clone(gp.FavouriteMods), func(k string) bool { return k == key })
		if favourite && key != "" {
			kept = append(kept, key)
		}
		gp.FavouriteMods = kept
		putGame(v, game, gp)
	})
}
