package browse

import (
	"context"
	"slices"
	"strings"
	"time"

	"github.com/Rethunk-Tech/mortar/internal/source"
)

// noiseWords start the words of category names that Browse leaves out by default: modpacks, translations, and cheats
// or hacks. Matching is by word prefix and case-insensitive, so it covers each source's own spelling ("Modpacks",
// "Translation", "Language", "Cheats and God items", "Hacks").
var noiseWords = []string{"modpack", "translation", "language", "cheat", "hack"}

func noisy(name string) bool {
	for _, w := range strings.FieldsFunc(strings.ToLower(name), func(r rune) bool { return r == ' ' || r == '-' || r == '_' || r == '/' || r == '&' }) {
		for _, p := range noiseWords {
			if strings.HasPrefix(w, p) {
				return true
			}
		}
	}
	return false
}

// withoutNoise adds the source's noisy categories to the exclude list, except any the player included on purpose.
func withoutNoise(names, include, exclude []string) []string {
	out := slices.Clone(exclude)
	for _, n := range names {
		if noisy(n) && !slices.ContainsFunc(include, func(i string) bool { return strings.EqualFold(i, n) }) &&
			!slices.ContainsFunc(out, func(e string) bool { return strings.EqualFold(e, n) }) {
			out = append(out, n)
		}
	}
	return out
}

// categoriesCached is the source's category names for the game, reused for categoryTTL; a source without categories
// or a failed lookup gives none.
func categoriesCached(ctx context.Context, game string, s source.Source, key string) []string {
	cat, ok := s.(source.Categorizer)
	if !ok {
		return nil
	}
	id := game + "|" + s.ID()
	catMu.Lock()
	e, hit := catCache[id]
	catMu.Unlock()
	if !hit || !time.Now().Before(e.until) {
		names, err := cat.Categories(ctx, key)
		if err != nil {
			return nil
		}
		e.names, e.until = names, time.Now().Add(categoryTTL)
		catMu.Lock()
		catCache[id] = e
		catMu.Unlock()
	}
	return e.names
}
