package gamestore

import (
	"path/filepath"
	"runtime"
	"slices"
	"testing"

	"github.com/Rethunk-Tech/mortar/internal/components"
)

func TestStandaloneAndFlatpakFindTheNativeLinuxBuild(t *testing.T) {
	if runtime.GOOS != "linux" {
		t.Skip("the Linux build and Flatpak exist on Linux only")
	}
	home := t.TempDir()
	t.Setenv("XDG_DATA_HOME", "")
	own := filepath.Join(home, ".local", "share", "vs")
	app := filepath.Join(home, ".local", "share", "flatpak", "app", "at.x.Game", "current", "active", "files", "extra", "vs")
	touchFile(t, filepath.Join(own, "Game"))
	touchFile(t, filepath.Join(app, "Game"))
	g := components.GameInfo{ID: "x", Name: "X", Marker: "Game.exe", LinuxMarker: "Game", Stores: components.GameStores{
		Standalone: &components.StandaloneStore{Folders: []components.PathTemplate{{Linux: "{xdgData}/vs"}, {Linux: "{home}/missing"}}},
		Flatpak:    &components.FlatpakStore{App: "at.x.Game", Folder: "extra/vs"},
	}}
	got := Discover(home, nil, g)
	if want := []Install{{Store: StoreStandalone, Dir: own}, {Store: StoreFlatpak, Dir: app}}; !slices.Equal(got, want) {
		t.Fatalf("got %+v, want %+v", got, want)
	}
}
