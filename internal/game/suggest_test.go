package game

import (
	"os"
	"path/filepath"
	"slices"
	"testing"
)

func TestSuggestFoldersFindsACopyTwoLevelsDown(t *testing.T) {
	home := t.TempDir()
	info, ok := catalogGame("stardew")
	if !ok {
		t.Fatal("no stardew in the catalog")
	}
	want := filepath.Join(home, "Games", "Heroic", "Stardew Valley")
	marker := filepath.Join(want, filepath.FromSlash(info.MarkerPath()))
	if err := os.MkdirAll(filepath.Dir(marker), 0o700); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(marker, nil, 0o600); err != nil {
		t.Fatal(err)
	}
	if err := os.MkdirAll(filepath.Join(home, "Desktop", "notes"), 0o700); err != nil {
		t.Fatal(err)
	}
	got := (&Service{home: home}).SuggestFolders("stardew")
	if !slices.Equal(got, []string{want}) {
		t.Fatalf("suggested %v, want %v", got, []string{want})
	}
}
