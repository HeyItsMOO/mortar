package cli

import (
	"strings"
	"testing"

	"github.com/Rethunk-Tech/mortar/internal/gmcm"
)

func TestModsMenuSetEqualsSendsTheSpec(t *testing.T) {
	results := map[string]any{
		"mods.menu": []gmcm.Edit{{Page: "Page", Index: 0, Name: "On", Value: true}},
	}
	r := invoke(t, results, "mods", "menu", "stardew", "Farm", "smapi:A", "--set=Page/0=true")
	if r.code != 0 || r.calls[0].method != "mods.menu" || r.calls[0].params.Value != "Page/0=true" {
		t.Fatalf("--set=: %+v", r)
	}
	r = invoke(t, results, "mods", "menu", "stardew", "Farm", "smapi:A", "--set", "Page/0=true")
	if r.code != 0 || r.calls[0].params.Value != "Page/0=true" {
		t.Fatalf("--set space: %+v", r)
	}
	r = invoke(t, nil, "mods", "menu", "stardew", "Farm", "smapi:A", "--set")
	if r.code != 2 || len(r.calls) != 0 || !strings.Contains(r.errOut, "page/index=value") {
		t.Fatalf("valueless --set: %+v %q", r, r.errOut)
	}
}
