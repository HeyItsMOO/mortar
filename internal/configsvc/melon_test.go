package configsvc

import (
	"strings"
	"testing"
)

// The layout is what MelonPreferences_Entry.Save writes through Tomlet: the description as a preceding comment, the
// optional inline comment after the value.
const melonSample = `[MelonLoader]
# Mod load order
load_order = "default" # inline

[BetterHands]
# Turns the feature on
Enabled = true
# Multiplier
Speed = 2.5
Count = 4
Names = ["a", "b"]
Label = "Hello # not a comment"
`

func TestMelonPreferencesAreTypedByTheirValuesAndEditedInPlace(t *testing.T) {
	d := parseMelon(melonSample)
	schema := d.schema(ConfigFile{Name: melonName, Format: FormatMelon}, func(s string) bool { return s == "BetterHands" })
	if len(schema.Sections) != 1 {
		t.Fatalf("sections %+v", schema.Sections)
	}
	got := map[string]Entry{}
	for _, e := range schema.Sections[0].Entries {
		got[e.Key] = e
	}
	for key, want := range map[string]string{"Enabled": TypeBool, "Speed": TypeFloat, "Count": TypeInt, "Names": TypeList, "Label": TypeString} {
		if got[key].Type != want {
			t.Errorf("%s type %q, want %q", key, got[key].Type, want)
		}
	}
	if got["Enabled"].Description != "Turns the feature on" || got["Label"].Value != "Hello # not a comment" {
		t.Errorf("entries %+v", got)
	}
	out, err := d.set("BetterHands", "Speed", "3")
	if err != nil || !strings.Contains(out, "Speed = 3.0\n") || strings.Count(out, "\n") != strings.Count(melonSample, "\n") {
		t.Fatalf("set float: %q %v", out, err)
	}
	out, err = d.set("MelonLoader", "load_order", "custom")
	if err != nil || !strings.Contains(out, `load_order = "custom" # inline`+"\n") {
		t.Fatalf("set string keeps the inline comment: %q %v", out, err)
	}
	if _, err := d.set("BetterHands", "Count", "x"); err == nil {
		t.Fatal("a non-number was accepted for an int")
	}
	if !ownsMelonCategory([]string{"thunderstore:Ada-Better_Hands"}, "BetterHands") || ownsMelonCategory([]string{"thunderstore:Ada-Other"}, "BetterHands") {
		t.Fatal("category ownership")
	}
}
