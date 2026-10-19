package configsvc

import "testing"

func TestHitsInMatchesKeyLabelDescriptionAndSectionName(t *testing.T) {
	sc := Schema{File: ConfigFile{Name: "a.cfg"}, Sections: []Section{
		{Name: "Combat", Entries: []Entry{{Key: "Damage", Value: "1"}, {Key: "Speed", Label: "Move rate", Description: "How fast you run"}}},
		{Name: "Audio", Entries: []Entry{{Key: "Volume"}}},
	}}
	for query, want := range map[string]int{"damage": 1, "move": 1, "fast": 1, "combat": 2, "volume": 1, "zzz": 0} {
		if got := hitsIn(query, "Me.A", "A", sc); len(got) != want {
			t.Errorf("%q: %d hits, want %d: %+v", query, len(got), want, got)
		}
	}
	got := hitsIn("damage", "Me.A", "A", sc)
	if got[0].File != "a.cfg" || got[0].Section != "Combat" || got[0].ModName != "A" || got[0].Value != "1" {
		t.Errorf("hit = %+v", got[0])
	}
}
