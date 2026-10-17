package control

import (
	"testing"

	"github.com/Rethunk-Tech/mortar/internal/mod"
	"github.com/Rethunk-Tech/mortar/internal/profile"
	"github.com/Rethunk-Tech/mortar/internal/savedgroups"
)

func TestHoldsAllIgnoresOptionalFilesWithoutAnID(t *testing.T) {
	t.Parallel()
	main := mod.NewID(mod.FormatSMAPI, "M.One")
	prof := profile.Profile{Entries: []profile.Entry{{Key: "m", Mods: []profile.Component{{ID: main}}}}}
	group := savedgroups.SavedGroup{Mods: []savedgroups.Mod{
		{ID: main, EntryKey: "m"},
		{EntryKey: "opt", OverlayOf: "m"},
	}}
	if !holdsAll(prof, group) {
		t.Fatal("a profile with the main mod holds the group, optional file included")
	}
	group.Mods = append(group.Mods, savedgroups.Mod{ID: mod.NewID(mod.FormatSMAPI, "N.Two"), EntryKey: "n"})
	if holdsAll(prof, group) {
		t.Fatal("a missing mod must fail the match")
	}
}
