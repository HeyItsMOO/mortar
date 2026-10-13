package nexussvc

import (
	"slices"
	"testing"

	"github.com/Rethunk-Tech/mortar/internal/meta"
	"github.com/Rethunk-Tech/mortar/internal/mod"
	"github.com/Rethunk-Tech/mortar/internal/profile"
)

func TestCandidatePagesAreThoseEveryKnownModShares(t *testing.T) {
	index := map[string][]meta.Ref{
		"a.one":    {{Site: "Nexus", ID: 10}},
		"a.shared": {{Site: "Nexus", ID: 10}, {Site: "Nexus", ID: 20}},
		"a.other":  {{Site: "Nexus", ID: 30}},
		"a.curse":  {{Site: "CurseForge", ID: 40}},
	}
	mods := func(ids ...mod.ID) []profile.Component {
		out := make([]profile.Component, len(ids))
		for i, id := range ids {
			out[i] = profile.Component{ID: id}
		}
		return out
	}
	for name, tc := range map[string]struct {
		mods []profile.Component
		want []int
	}{
		"one page, id matched ignoring case":   {mods(mod.SMAPI("A.One")), []int{10}},
		"two pages for one mod":                {mods(mod.SMAPI("a.shared")), []int{10, 20}},
		"a sibling mod tells the pages apart":  {mods(mod.SMAPI("a.shared"), mod.SMAPI("a.one")), []int{10}},
		"an unlisted sibling does not block":   {mods(mod.SMAPI("a.one"), mod.SMAPI("a.unlisted")), []int{10}},
		"mods of different pages":              {mods(mod.SMAPI("a.one"), mod.SMAPI("a.other")), nil},
		"only on another site":                 {mods(mod.SMAPI("a.curse")), nil},
		"another loader's id of the same name": {mods(mod.NewID("bepinex", "a.one")), nil},
	} {
		if got := candidatePages(tc.mods, index); !slices.Equal(got, tc.want) {
			t.Errorf("%s: pages %v, want %v", name, got, tc.want)
		}
	}
}

func TestNarrowPagesPrefersTheInstalledVersionThenTheAuthor(t *testing.T) {
	installed := []profile.Component{{ID: mod.SMAPI("a.shared"), Version: "1.2.0", Author: "Ada, Bo (original author)"}}
	file := func(version string) []meta.File {
		return []meta.File{{Mods: []meta.Mod{{UniqueID: "A.Shared", Version: version}}}}
	}
	listed := map[int]meta.Page{
		10: {Author: "ada", Downloads: file("1.2.0")},
		20: {Author: "translator", Downloads: file("1.2.0")},
		30: {Author: "ada", Downloads: file("1.0.0")},
	}
	for name, tc := range map[string]struct {
		ids, want []int
	}{
		"version, then author":                 {[]int{10, 20, 30}, []int{10}},
		"no page at this version: author only": {[]int{30}, []int{30}},
		"still two":                            {[]int{10, 20, 40}, []int{10, 20, 40}},
	} {
		if got := narrowPages(installed, tc.ids, listed); !slices.Equal(got, tc.want) {
			t.Errorf("%s: pages %v, want %v", name, got, tc.want)
		}
	}
}
