package components

import (
	"slices"
	"sync/atomic"
)

// userGames are the games the player described on this computer. They sit beside the signed catalog's, never replace
// one of its ids, and are never uploaded.
var userGames atomic.Pointer[[]GameInfo]

// SetUserGames replaces the player's own games, which Games and Game answer with after the catalog's.
func SetUserGames(games []GameInfo) { userGames.Store(&games) }

// withUserGames is catalog followed by the player's games whose ids the catalog does not use; catalog itself is never
// appended to, since it belongs to the manifest.
func withUserGames(catalog []GameInfo) []GameInfo {
	user := userGames.Load()
	if user == nil || len(*user) == 0 {
		return catalog
	}
	out := slices.Clone(catalog)
	for _, g := range *user {
		if !slices.ContainsFunc(catalog, func(c GameInfo) bool { return c.ID == g.ID }) {
			out = append(out, g)
		}
	}
	return out
}

func userGame(id string) (GameInfo, bool) {
	if user := userGames.Load(); user != nil {
		for _, g := range *user {
			if g.ID == id {
				return g, true
			}
		}
	}
	return GameInfo{}, false
}

// ValidateUser is Validate for a game the player described: it has no store, because its install is the folder the
// player chose.
func (g GameInfo) ValidateUser() error {
	g.Stores.Standalone = &StandaloneStore{Folders: []PathTemplate{{Windows: "{home}", Linux: "{home}"}}}
	return g.Validate()
}
