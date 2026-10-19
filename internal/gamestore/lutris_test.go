package gamestore

import (
	"os"
	"path/filepath"
	"runtime"
	"slices"
	"testing"

	"github.com/Rethunk-Tech/mortar/internal/components"
)

func TestLutrisFindsANativeLinuxBuildByTheLinuxMarker(t *testing.T) {
	if runtime.GOOS != "linux" {
		t.Skip("lutris discovery is Linux-only")
	}
	home := t.TempDir()
	install := filepath.Join(home, "Games", "vs")
	touchFile(t, filepath.Join(install, "Vintagestory"))
	games := filepath.Join(home, ".local", "share", "lutris", "games")
	if err := os.MkdirAll(games, 0o700); err != nil {
		t.Fatal(err)
	}
	cfg := "game_slug: vintage-story\nslug: vintage-story-1\ngame:\n  exe: " + filepath.Join(install, "Vintagestory") + "\n  working_dir: " + install + "\n"
	if err := os.WriteFile(filepath.Join(games, "vs.yml"), []byte(cfg), 0o600); err != nil {
		t.Fatal(err)
	}
	g := components.GameInfo{
		ID: "vs", Name: "VS", Marker: "Vintagestory.exe", LinuxMarker: "Vintagestory",
		Stores: components.GameStores{Lutris: &components.LutrisStore{Slug: "vintage-story", Keyword: "vintagestory"}},
	}
	got := Discover(home, nil, g)
	if want := []Install{{Store: StoreLutris, Dir: install}}; !slices.Equal(got, want) {
		t.Fatalf("got %+v, want %+v", got, want)
	}
}
