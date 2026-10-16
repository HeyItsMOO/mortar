package gamestore

import (
	"path/filepath"
	"slices"
	"testing"

	"github.com/Rethunk-Tech/mortar/internal/components"
)

func TestXboxFindsTheCopyItsPackageNamesInItsContentFolder(t *testing.T) {
	pkg := filepath.Join(t.TempDir(), "Valheim")
	touchFile(t, filepath.Join(pkg, "Content", "X.exe"))
	old := appxLocation
	t.Cleanup(func() { appxLocation = old })
	appxLocation = func(name string) string {
		if name == "Coffee.X" {
			return pkg
		}
		return ""
	}
	g := components.GameInfo{ID: "x", Name: "X", Marker: "X.exe", Stores: components.GameStores{Xbox: &components.XboxStore{Package: "Coffee.X"}}}
	if got, want := Discover(t.TempDir(), nil, g), []Install{{Store: StoreXbox, Dir: filepath.Join(pkg, "Content")}}; !slices.Equal(got, want) {
		t.Fatalf("got %+v, want %+v", got, want)
	}
	g.Stores.Xbox.Package = "Other.Y"
	if got := Discover(t.TempDir(), nil, g); len(got) != 0 {
		t.Fatalf("an uninstalled package found %+v", got)
	}
	for _, bad := range []string{"", "a'b", "a;b", "a b", "-a", "a$b"} {
		if components.PlainPackage(bad) {
			t.Fatalf("%q passed as a plain package name", bad)
		}
	}
}
