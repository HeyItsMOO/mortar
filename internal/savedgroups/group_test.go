package savedgroups

import (
	"slices"
	"testing"

	"github.com/Rethunk-Tech/mortar/internal/mod"
	"github.com/Rethunk-Tech/mortar/internal/profile"
	modstore "github.com/Rethunk-Tech/mortar/internal/store"
)

func TestSaveGroupThenApplyCreatesTheGroupUnderAFreeName(t *testing.T) {
	svc, profiles, items := testService(t)
	addItem(t, items, "local-a", "A.One", "A One")
	addItem(t, items, "local-b", "B.Two", "B Two")
	addItem(t, items, "local-c", "C.Three", "C Three")
	from, err := profiles.Create("stardew", "From")
	if err != nil {
		t.Fatal(err)
	}
	for _, key := range []string{"local-a", "local-b", "local-c"} {
		if _, err := profiles.AddEntry("stardew", from.ID, key, profile.Source{}); err != nil {
			t.Fatal(err)
		}
	}
	for _, key := range []string{"local-a", "local-b"} {
		if _, err := profiles.AddToGroup("stardew", from.ID, "Core", key); err != nil {
			t.Fatal(err)
		}
	}

	saved, err := svc.SaveGroup("stardew", from.ID, "core", "Core set", false)
	if err != nil || len(saved.Mods) != 2 {
		t.Fatalf("saved = %+v, %v", saved, err)
	}
	if _, err := svc.SaveGroup("stardew", from.ID, "Core", "CORE SET", false); err == nil {
		t.Fatal("saving over an existing name must need replace")
	}
	if _, err := profiles.AddToGroup("stardew", from.ID, "Core", "local-c"); err != nil {
		t.Fatal(err)
	}
	replaced, err := svc.SaveGroup("stardew", from.ID, "Core", "Core set", true)
	if err != nil || replaced.ID != saved.ID || len(replaced.Mods) != 3 {
		t.Fatalf("replaced = %+v, %v", replaced, err)
	}
	other, err := svc.Create("stardew", "Other", from.ID, []mod.ID{"smapi:A.One"})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := svc.Rename("stardew", other.ID, "CORE set"); err == nil {
		t.Fatal("renaming onto another saved group's name must fail")
	}

	to, err := profiles.Create("stardew", "To")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := profiles.AddEntry("stardew", to.ID, "local-b", profile.Source{}); err != nil {
		t.Fatal(err)
	}
	if _, err := profiles.CreateGroup("stardew", to.ID, "core SET"); err != nil {
		t.Fatal(err)
	}
	res, err := svc.Apply("stardew", saved.ID, to.ID)
	if err != nil {
		t.Fatal(err)
	}
	if res.Added != 2 || res.Group != "Core set (2)" {
		t.Fatalf("apply = added %d group %q", res.Added, res.Group)
	}
	i := slices.IndexFunc(res.Profile.Groups, func(g profile.Group) bool { return g.Name == res.Group })
	if i < 0 || !slices.Equal(res.Profile.Groups[i].Keys, []string{"local-b", "local-a", "local-c"}) {
		t.Fatalf("groups = %+v", res.Profile.Groups)
	}
}

func TestRemovingAMainModRemovesItsOptionalFiles(t *testing.T) {
	svc, profiles, items := testService(t)
	main, opt := modstore.NexusKey(5, 1), modstore.NexusKey(5, 2)
	addFiles(t, items, main, map[string]string{"Mod/manifest.json": `{"Name":"M","UniqueID":"M.One","Version":"1.0.0"}`, "Mod/a.png": "main"})
	addFiles(t, items, opt, map[string]string{"Mod/a.png": "opt"})
	addItem(t, items, "local-n", "N.Two", "N Two")
	from, err := profiles.Create("stardew", "From")
	if err != nil {
		t.Fatal(err)
	}
	for _, add := range []struct {
		key  string
		file int
	}{{main, 1}, {opt, 2}} {
		src := profile.Source{Kind: profile.KindNexus, ModID: 5, FileID: add.file, Name: add.key + ".zip"}
		if _, err := profiles.AddEntry("stardew", from.ID, add.key, src); err != nil {
			t.Fatal(err)
		}
	}
	if _, err := profiles.AddEntry("stardew", from.ID, "local-n", profile.Source{}); err != nil {
		t.Fatal(err)
	}
	g, err := svc.Create("stardew", "Set", from.ID, nil)
	if err != nil || len(g.Mods) != 3 {
		t.Fatalf("created = %+v, %v", g.Mods, err)
	}
	g, err = svc.RemoveMods("stardew", g.ID, []mod.ID{"smapi:M.One"})
	if err != nil || len(g.Mods) != 1 || g.Mods[0].ID != "smapi:N.Two" {
		t.Fatalf("after remove = %+v, %v", g.Mods, err)
	}
}
