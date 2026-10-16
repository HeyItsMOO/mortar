package profile

import (
	"maps"
	"testing"

	"github.com/Rethunk-Tech/mortar/internal/mod"
)

func TestNewImplicit(t *testing.T) {
	t.Parallel()
	needsA := Entry{Key: "d", Mods: []Component{{ID: "smapi:D", Needs: []mod.ID{"smapi:A", "smapi:Opt"}, Optional: []mod.ID{"smapi:Opt"}}}}
	packForCP := Entry{Key: "p", Mods: []Component{{ID: "smapi:Pack", ContentPackFor: "smapi:CP"}}}
	off := needsA
	off.Disabled = []mod.ID{"smapi:D"}
	vs := Entry{Key: "v", Mods: []Component{{ID: "vs:x", ModID: "x", Requires: []string{"lib"}}}}
	link := Source{Kind: KindNexus}.WithFromLink()
	cases := []struct {
		name    string
		entries []Entry
		source  Source
		mods    []Component
		want    bool
	}{
		{"no intent is explicit", []Entry{needsA}, Source{Kind: KindNexus}, []Component{{ID: "smapi:A"}}, false},
		{"dependency intent", nil, Source{Kind: KindThunderstore}.WithImplicit(true), nil, true},
		{"Mortar's own entry", nil, Source{Kind: SourceSMAPI}, nil, true},
		{"link supplies a required mod", []Entry{needsA}, link, []Component{{ID: "smapi:a"}}, true},
		{"link supplies a framework", []Entry{packForCP}, link, []Component{{ID: "smapi:CP"}}, true},
		{"link supplies a Vintage Story requirement", []Entry{vs}, link, []Component{{ID: "vs:lib", ModID: "lib"}}, true},
		{"link supplies an optional mod", []Entry{needsA}, link, []Component{{ID: "smapi:Opt"}}, false},
		{"link supplies what is already there", []Entry{needsA, {Key: "a", Mods: []Component{{ID: "smapi:A"}}}}, link, []Component{{ID: "smapi:A"}}, false},
		{"link for a disabled dependent", []Entry{off}, link, []Component{{ID: "smapi:A"}}, false},
	}
	for _, c := range cases {
		if got := newImplicit(c.entries, c.source, c.mods); got != c.want {
			t.Errorf("%s: newImplicit = %v, want %v", c.name, got, c.want)
		}
	}
}

func TestSetImplicitMany(t *testing.T) {
	t.Parallel()
	s := newStore(t)
	p := pinTestProfile(t, s)
	p, err := s.SetImplicitMany("stardew", p.ID, []string{"nexus-1-1"}, true)
	if err != nil || !p.Entries[0].Implicit {
		t.Fatalf("mark implicit = %+v, %v", p.Entries, err)
	}
	evs, err := s.History("stardew", p.ID)
	if err != nil || len(evs) == 0 || evs[0].Change != ChangeMarkedImplicit || evs[0].Name == "" {
		t.Fatalf("history = %+v, %v", evs, err)
	}
	applyRestoredMeta(&p, Entry{Key: "nexus-1-1"})
	if p.Entries[0].Implicit {
		t.Fatal("a restore did not bring back the explicit flag")
	}
	if _, err := s.update("stardew", p.ID, func(cur *Profile, _ string) error {
		cur.Entries = append(cur.Entries, Entry{Key: "smapi", Source: Source{Kind: SourceSMAPI}, Implicit: true})
		return nil
	}); err != nil {
		t.Fatal(err)
	}
	if _, err := s.SetImplicitMany("stardew", p.ID, []string{"smapi"}, false); err == nil {
		t.Fatal("marked Mortar's own entry explicit")
	}
}

func TestInferImplicit(t *testing.T) {
	t.Parallel()
	got := InferImplicit(map[string][]string{
		"pack":  {"cp"},
		"cycA":  {"cycB"},
		"cycB":  {"cycA"},
		"outer": {"loopA"},
		"loopA": {"loopB"},
		"loopB": {"loopA"},
	})
	want := map[string]bool{"cp": true, "loopA": true}
	if !maps.Equal(got, want) {
		t.Fatalf("InferImplicit = %v, want %v", got, want)
	}
}
