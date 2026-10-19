package cli

import (
	"strings"
	"testing"

	"github.com/Rethunk-Tech/mortar/internal/profile"
)

func TestModsConfigListsAndSets(t *testing.T) {
	results := map[string]any{
		"mods.config": []profile.ConfigField{
			{Path: "Season", Value: "Spring", AllowValues: []string{"Spring", "Summer", "Fall"}},
		},
	}
	r := invoke(t, results, "mods", "config", "stardew", "Farm", "A.Pack")
	if r.code != 0 || r.calls[0].method != "mods.config" || len(r.calls[0].params.IDs) != 1 {
		t.Fatalf("list: %+v", r)
	}
	if !strings.Contains(r.out, "Season = Spring") || !strings.Contains(r.out, "Spring, Summer, Fall") {
		t.Fatalf("print: %q", r.out)
	}
	r = invoke(t, results, "mods", "config", "stardew", "Farm", "A.Pack", "nested.foo", "2")
	if r.code != 0 || r.calls[0].params.Key != "nested.foo" || r.calls[0].params.Value != "2" {
		t.Fatalf("set: %+v", r)
	}
}

func TestNewVerbsSendTheirArguments(t *testing.T) {
	results := map[string]any{"console.send": nil, "nexus.endorse": "Endorsed", "sync.apply": nil}
	r := invoke(t, results, "console", "stardew", "debug", "wm", "1")
	if r.code != 0 || r.calls[0].method != "console.send" || r.calls[0].params.Value != "debug wm 1" {
		t.Fatalf("console: %+v", r)
	}
	r = invoke(t, results, "endorse", "stardew", "541", "1.2", "--remove")
	if r.code != 0 || r.calls[0].params.ID != "541" || r.calls[0].params.Version != "1.2" || !r.calls[0].params.Remove {
		t.Fatalf("endorse: %+v", r)
	}
	r = invoke(t, results, "sync", "apply", "stardew", "abc", "theirs")
	if r.code != 0 || r.calls[0].method != "sync.apply" || r.calls[0].params.Value != "theirs" {
		t.Fatalf("sync apply: %+v", r)
	}
	if r = invoke(t, results, "sync", "apply", "stardew", "abc", "both"); r.code != 2 {
		t.Fatalf("sync apply both: %+v", r)
	}
}
