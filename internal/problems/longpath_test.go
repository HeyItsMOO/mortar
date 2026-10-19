package problems

import (
	"os"
	"path/filepath"
	"slices"
	"strings"
	"testing"

	"github.com/Rethunk-Tech/mortar/internal/components"
	"github.com/Rethunk-Tech/mortar/internal/datadir/datadirtest"
	"github.com/Rethunk-Tech/mortar/internal/framework"
	"github.com/Rethunk-Tech/mortar/internal/settings"
	"github.com/Rethunk-Tech/mortar/internal/testenv"
	"github.com/Rethunk-Tech/mortar/internal/testenv/testfs"
)

// pathOf is a path of exactly n characters below base.
func pathOf(t *testing.T, base string, n int) string {
	t.Helper()
	p := filepath.Join(base, "x")
	if pad := n - len(p); pad > 0 {
		p = filepath.Join(base, strings.Repeat("d", pad-1), "x")
	}
	if len(p) != n {
		t.Fatalf("cannot make a %d-character path below %s", n, base)
	}
	return p
}

func TestALongPathIsARowAndOneJustUnderIsNot(t *testing.T) {
	base := filepath.Join(string(filepath.Separator), "data")
	mods := []framework.Mod{{Key: "nexus-1-2", Name: "Pack"}, {Key: "nexus-3-4", Name: "Short"}}
	rows := longPathRows(mods, []readPath{
		{key: "nexus-1-2", path: pathOf(t, base, maxPath)},
		{key: "nexus-1-2", path: pathOf(t, base, maxPath+5)},
		{key: "nexus-3-4", path: pathOf(t, base, maxPath-1)},
		{key: "loose", path: pathOf(t, base, maxPath+1), placed: true},
	})
	if len(rows) != 2 {
		t.Fatalf("rows = %+v", rows)
	}
	if r := rows[0]; r.Name != "Pack" || r.Files != 2 || r.Length != maxPath+5 || len(r.Longest) != maxPath+5 || r.Placed {
		t.Fatalf("the entry's row counts both files and names the longest: %+v", r)
	}
	if r := rows[1]; r.Name != "loose" || !r.Placed {
		t.Fatalf("a file no mod holds is named by its key and keeps where it is read: %+v", r)
	}
	if (Result{LongPaths: rows}).Count() != 2 {
		t.Fatal("long paths are counted problems")
	}
}

func TestPathLengthCountsAsWindowsDoes(t *testing.T) {
	// U+1F600 is two UTF-16 code units and four bytes; é is one unit and two bytes.
	if n := pathLength(`C:\é\😀`); n != 7 {
		t.Fatalf("pathLength = %d, want 7", n)
	}
}

func TestPlacedFilesAreReadBelowTheGameFolder(t *testing.T) {
	dir, root := filepath.Join("/", "profile"), filepath.Join("/", "game", "Mods")
	got := placedPaths(dir, map[string]string{
		"Mods/one/x.package": "one",
		"Tray/a.trayitem":    "tray",
	}, "Mods", root)
	want := []readPath{
		{key: "one", path: filepath.Join(root, "one", "x.package"), placed: true},
		{key: "tray", path: filepath.Join(dir, "Tray", "a.trayitem")},
	}
	if len(got) != len(want) || got[0] != want[0] || got[1] != want[1] {
		t.Fatalf("placedPaths = %+v, want %+v", got, want)
	}
	if got := placedPaths(dir, map[string]string{"BepInEx/plugins/a.dll": "a"}, "", ""); got[0].placed || got[0].path != filepath.Join(dir, "BepInEx", "plugins", "a.dll") {
		t.Fatalf("a loader that places nothing is read in the profile: %+v", got)
	}
}

func TestOnlyLongFilesOfTheModsFolderAreListedWithTheirMod(t *testing.T) {
	modsDir := t.TempDir()
	deep := filepath.Join(modsDir, "nexus-1-2", "Pack")
	long := pathOf(t, deep, maxPath+3)
	// A switched-off mod's folder starts with a dot, and the game never reads it.
	off := pathOf(t, filepath.Join(modsDir, "nexus-3-4", ".Off"), maxPath+3)
	for _, p := range []string{long, off, filepath.Join(modsDir, "loose", "short.json")} {
		if err := os.MkdirAll(filepath.Dir(p), 0o750); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(p, []byte("{}"), 0o600); err != nil {
			t.Fatal(err)
		}
	}
	got := longModsFolderPaths(modsDir, []framework.Mod{{Key: "nexus-1-2", Folder: deep}})
	if len(got) != 1 || got[0].key != "nexus-1-2" || got[0].path != long {
		t.Fatalf("longModsFolderPaths = %+v", got)
	}
}

// A folder game's files are read where the folder loader places them, so a deep game folder makes a row that the
// profile's own shorter path would not.
func TestAPlacedFileIsJudgedAtItsPathInTheGameFolder(t *testing.T) {
	m, err := components.BundledManifest()
	if err != nil {
		t.Fatal(err)
	}
	const id = "long-game"
	m.Games = append(slices.Clone(m.Games), components.GameInfo{
		ID: id, Name: "Long Game", Enabled: true, Marker: "G.exe", Deploy: "profile",
		Targets: []components.TargetDef{{ID: "mods", Root: "{profile}/Mods"}},
		Stores:  components.GameStores{Steam: &components.SteamStore{AppID: "1"}},
		Loaders: []components.GameLoader{{ID: "folder", Name: "Mod folder"}},
		Paths:   map[string]components.PathTemplate{"mods": {Windows: "{documents}/G/Mods", Linux: "{documents}/G/Mods", Darwin: "{documents}/G/Mods"}},
	})
	if err := m.Validate(); err != nil {
		t.Fatal(err)
	}
	c := components.NewClient(nil)
	c.SetManifest(m)
	components.Use(c)
	t.Cleanup(func() { components.Use(nil) })

	datadirtest.Use(t, t.TempDir())
	folder := t.TempDir()
	if err := os.WriteFile(filepath.Join(folder, "G.exe"), []byte("x"), 0o600); err != nil {
		t.Fatal(err)
	}
	set, err := settings.Open()
	if err != nil {
		t.Fatal(err)
	}
	if _, err := set.Update(func(v *settings.Settings) { v.GameFolders[id] = folder }); err != nil {
		t.Fatal(err)
	}
	_, profiles := testenv.Stores(t)
	p := testenv.Profile(t, profiles, id, "A")
	base := t.TempDir()
	home := filepath.Join(base, strings.Repeat("h", max(200-len(base), 1)))
	placedDir := filepath.Join(home, "Documents", "G", "Mods", "pack")
	name := strings.Repeat("n", maxPath+5-len(placedDir)-len(".pkg")-1) + ".pkg"
	zip := testfs.WriteZip(t, filepath.Join(t.TempDir(), "pack.zip"), map[string]string{"pack/" + name: "x"})
	if _, err := profiles.InstallArchive(t.Context(), id, p.ID, zip); err != nil {
		t.Fatal(err)
	}
	dir, err := profiles.ProfileDir(id, p.ID)
	if err != nil {
		t.Fatal(err)
	}
	if n := pathLength(filepath.Join(dir, "Mods", "pack", name)); n >= maxPath {
		t.Fatalf("the profile's own path is %d characters; the test needs it short", n)
	}

	defer func(was bool) { checkLongPaths = was }(checkLongPaths)
	checkLongPaths = true
	s := NewService(home, set, profiles, nil)
	mods, err := s.installed(id, p.ID)
	if err != nil {
		t.Fatal(err)
	}
	rows := s.longPaths(id, p.ID, mods)
	if len(rows) != 1 || !rows[0].Placed || rows[0].Files != 1 || rows[0].Longest != filepath.Join(placedDir, name) || rows[0].Length != maxPath+5 {
		t.Fatalf("rows = %+v", rows)
	}
	checkLongPaths = false
	if rows := s.longPaths(id, p.ID, mods); len(rows) != 0 {
		t.Fatalf("a build that is not for Windows checks nothing: %+v", rows)
	}
}
