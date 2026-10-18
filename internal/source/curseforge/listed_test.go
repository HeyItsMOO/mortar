package curseforge

import (
	"strconv"
	"testing"

	"github.com/Rethunk-Tech/mortar/internal/source"
)

func TestListedStopsGrowingPastTheCap(t *testing.T) {
	t.Parallel()
	var s listedStore
	first := source.VersionRef{ID: "1", Version: "v0"}
	var last source.VersionRef
	for i := range listedCap + 50 {
		last = source.VersionRef{ID: strconv.Itoa(i + 1), Version: "v" + strconv.Itoa(i)}
		s.put(last, []string{"dep"})
	}
	if s.len() != listedCap {
		t.Fatalf("len = %d, want %d", s.len(), listedCap)
	}
	if _, ok := s.get(first); ok {
		t.Fatal("oldest version still listed")
	}
	if _, ok := s.get(last); !ok {
		t.Fatal("newest version missing")
	}
}
