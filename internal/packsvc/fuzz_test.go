package packsvc

import (
	"testing"

	"github.com/Rethunk-Tech/mortar/internal/profile"
)

// FuzzParseFarm holds that no pasted multiplayer list makes the parse or the comparison with a profile panic.
func FuzzParseFarm(f *testing.F) {
	f.Add(`{"game":"stardew","name":"Host","mods":[{"id":"smapi:Me.A","name":"A","version":"1.0.0"}]}`)
	f.Add(`{"game":"stardew","mods":[{}]}`)
	f.Add(`{"game":"lethal","mods":[]}`)
	f.Add(`[`)
	f.Add("Enabled\n- [A \\[x\\]](https://www.nexusmods.com/stardewvalley/mods/1) 1.0\n\nDisabled\nB v2 - https://github.com/o/r")
	f.Fuzz(func(t *testing.T, text string) {
		l, err := ParseFarm(text)
		if err != nil {
			return
		}
		p := profile.Profile{Entries: []profile.Entry{{Key: "a", Mods: []profile.Component{{ID: "smapi:Me.A", Name: "A [x]", Version: "0.9.0"}}}}}
		_ = farmRows(l, p)
	})
}
