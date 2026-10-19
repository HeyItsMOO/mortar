package configsvc

import (
	"errors"
	"os"
	"path/filepath"
	"testing"

	"github.com/Rethunk-Tech/mortar/internal/profile"
)

func TestDeleteUnownedRemovesOnlyFilesNoModOwns(t *testing.T) {
	s, _ := newService(t)
	f, ok := s.Profiles.(fakeProfiles)
	if !ok {
		t.Fatal("newService builds a fakeProfiles")
	}
	cfg := filepath.Join(f.dir, "BepInEx", "config")
	stray := filepath.Join(cfg, "Stray.cfg")
	if err := os.WriteFile(stray, []byte("[A]\n## x\n# Setting type: Boolean\n# Default value: true\nX = true\n"), 0o600); err != nil {
		t.Fatal(err)
	}
	f.mods = []profile.Mod{{Key: "bs", ID: "thunderstore:Ex-BetterStuff", Name: "Better Stuff", Enabled: true}}
	s.Profiles = f
	if err := s.DeleteUnowned("g", "p", "com.example.betterstuff.cfg"); err == nil {
		t.Fatal("a file a mod owns was deleted")
	}
	if err := s.DeleteUnowned("g", "p", "../x.cfg"); err == nil {
		t.Fatal("a path outside the config folder was accepted")
	}
	if err := s.DeleteUnowned("g", "p", "Stray.cfg"); err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(stray); !errors.Is(err, os.ErrNotExist) {
		t.Fatalf("stray file still there: %v", err)
	}
	if _, err := os.Stat(filepath.Join(cfg, "com.example.betterstuff.cfg")); err != nil {
		t.Fatalf("the owned file went too: %v", err)
	}
}
