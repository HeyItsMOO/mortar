package share

import (
	"testing"

	"github.com/Rethunk-Tech/mortar/internal/profile"
)

// A nested group is a "/" path inside one flat name, so the link carries no new field and a Mortar that does not nest
// reads it as a plain group.
func TestNestedGroupNamesRoundTripAsFlatNames(t *testing.T) {
	e := profile.Entry{Key: "k", Source: profile.Source{Kind: profile.KindNexus, ModID: 1, FileID: 2}, Mods: []profile.Component{{ID: "smapi:A.One", Folder: "A"}}}
	p := profile.Profile{Name: "P", Entries: []profile.Entry{e}, Groups: []profile.Group{{Name: "Looks/Hats", Keys: []string{"k"}}}}
	res, err := Encode("stardew", p, profile.ShareFacts{})
	if err != nil {
		t.Fatal(err)
	}
	got, err := Parse(res.Payload)
	if err != nil {
		t.Fatal(err)
	}
	groups := RefGroups(got.Entries)
	if len(groups) != 1 || groups[0].Name != "Looks/Hats" {
		t.Fatalf("groups = %+v", groups)
	}
}
