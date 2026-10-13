package profile

import "testing"

func TestSetNexusFileReplacesAWrongPageAndIsInHistory(t *testing.T) {
	t.Parallel()
	e := newEnv(t)
	p, err := e.Create("stardew", "S")
	if err != nil {
		t.Fatal(err)
	}
	res, err := e.InstallArchive(t.Context(), "stardew", p.ID, zipOf(t, "a.zip", map[string]string{
		"A/manifest.json": `{"Name":"A","Author":"x","Version":"1.0.0","UniqueID":"x.a","EntryDll":"a.dll"}`, "A/a.dll": "x",
	}))
	if err != nil {
		t.Fatal(err)
	}
	key := res.Profile.Entries[0].Key
	for _, f := range []NexusFile{{ModID: 10}, {ModID: 20, FileID: 7}} {
		got, err := e.SetNexusFile("stardew", p.ID, key, f)
		if err != nil {
			t.Fatal(err)
		}
		if s := got.Entries[0].Source; s.Kind != KindNexus || s.ModID != f.ModID || s.FileID != f.FileID || s.Version != "1.0.0" {
			t.Fatalf("source = %+v, want page %d file %d", s, f.ModID, f.FileID)
		}
	}
	hist, err := e.History("stardew", p.ID)
	if err != nil || len(hist) == 0 || hist[0].Change != ChangeSourced || hist[0].Name == "" {
		t.Fatalf("history = %+v, %v", hist, err)
	}
	if _, err := e.SetNexusFile("stardew", p.ID, key, NexusFile{}); err == nil {
		t.Fatal("a page with no id was accepted")
	}
}
