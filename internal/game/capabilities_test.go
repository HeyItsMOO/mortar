package game

import (
	"os"
	"path/filepath"
	"slices"
	"testing"
)

// Easy Save 3 writes .bac backups and .tmp files beside a Lethal Company slot; they belong to that slot, not the list.
func TestLethalCompanySideFilesTravelWithTheirSlot(t *testing.T) {
	dir := t.TempDir()
	for _, name := range []string{"LCSaveFile1", "LCSaveFile1.bac", "LCSaveFile1.tmp", "LCSaveFile4", "LCChallengeFile", "LCGeneralSaveData"} {
		if err := os.WriteFile(filepath.Join(dir, name), []byte("x"), 0o600); err != nil {
			t.Fatal(err)
		}
	}
	l := SaveLayout("lethal-company", dir)
	names, err := l.Names()
	if err != nil {
		t.Fatal(err)
	}
	slices.Sort(names)
	if want := []string{"LCChallengeFile", "LCSaveFile1", "LCSaveFile4"}; !slices.Equal(names, want) {
		t.Fatalf("saves = %v, want %v", names, want)
	}
	if got, want := l.Paths("LCSaveFile1"), []string{"LCSaveFile1", "LCSaveFile1.bac", "LCSaveFile1.tmp"}; !slices.Equal(got, want) {
		t.Fatalf("slot 1 = %v, want %v", got, want)
	}
}
