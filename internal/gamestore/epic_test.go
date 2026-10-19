package gamestore

import (
	"fmt"
	"os"
	"path/filepath"
	"slices"
	"testing"

	"github.com/Rethunk-Tech/mortar/internal/components"
)

func TestEpicFindsTheInstallItsLauncherListsUnderTheGamesAppName(t *testing.T) {
	lib := t.TempDir()
	game, other := filepath.Join(lib, "Garlic"), filepath.Join(lib, "Other")
	touchFile(t, filepath.Join(game, "X.exe"))
	touchFile(t, filepath.Join(other, "X.exe"))
	launcher := t.TempDir()
	list := fmt.Sprintf(`{"InstallationList":[{"InstallLocation":%q,"AppName":"Other"},{"InstallLocation":%q,"AppName":"Garlic"}]}`, other, game)
	if err := os.WriteFile(filepath.Join(launcher, epicInstalled), []byte(list), 0o600); err != nil {
		t.Fatal(err)
	}
	g := components.GameInfo{ID: "x", Name: "X", Marker: "X.exe", Stores: components.GameStores{Epic: &components.EpicStore{AppNames: []string{"Garlic"}}}}
	got := Discover(t.TempDir(), map[string][]string{LauncherEpic: {launcher}}, g)
	if want := []Install{{Store: StoreEpic, Dir: game}}; !slices.Equal(got, want) {
		t.Fatalf("got %+v, want %+v", got, want)
	}
	if (epicStore{}).Launchers("linux") != nil || len((epicStore{}).Launchers("windows")) != 1 {
		t.Fatal("the Epic Games Launcher is listed on Windows only")
	}
}

func TestEpicFindsACopyHeroicInstalledThroughLegendary(t *testing.T) {
	game := filepath.Join(t.TempDir(), "Garlic")
	touchFile(t, filepath.Join(game, "X.exe"))
	heroic := t.TempDir()
	list := fmt.Sprintf(`{"Garlic":{"app_name":"Garlic","install_path":%q,"platform":"Windows"}}`, game)
	touchFile(t, heroicEpicList(heroic))
	if err := os.WriteFile(heroicEpicList(heroic), []byte(list), 0o600); err != nil {
		t.Fatal(err)
	}
	g := components.GameInfo{ID: "x", Name: "X", Marker: "X.exe", Stores: components.GameStores{Epic: &components.EpicStore{AppNames: []string{"Garlic"}}}}
	got := Discover(t.TempDir(), map[string][]string{LauncherHeroic: {heroic}}, g)
	if want := []Install{{Store: StoreEpicHeroic, Dir: game, Launcher: "heroic:legendary:Garlic"}}; !slices.Equal(got, want) {
		t.Fatalf("got %+v, want %+v", got, want)
	}
	if LauncherOf(StoreEpicHeroic) != LauncherHeroic {
		t.Fatal("an Epic copy from Heroic belongs to the Heroic launcher")
	}
}
