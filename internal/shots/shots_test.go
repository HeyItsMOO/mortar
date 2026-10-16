package shots

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestListReadsPicturesNewestFirstAndSkipsTheRest(t *testing.T) {
	game, steam := t.TempDir(), t.TempDir()
	now := time.Now()
	for i, p := range []string{filepath.Join(game, "a.png"), filepath.Join(steam, "b.jpg"), filepath.Join(game, "notes.txt"), filepath.Join(game, ".hidden.png")} {
		if err := os.WriteFile(p, []byte("x"), 0o600); err != nil {
			t.Fatal(err)
		}
		if err := os.Chtimes(p, now, now.Add(time.Duration(i)*time.Minute)); err != nil {
			t.Fatal(err)
		}
	}
	if err := os.MkdirAll(filepath.Join(steam, "thumbnails"), 0o700); err != nil {
		t.Fatal(err)
	}
	g, err := List(map[string]string{SourceGame: game, SourceSteam: steam, "gone": filepath.Join(game, "missing")})
	if err != nil {
		t.Fatal(err)
	}
	if len(g.Shots) != 2 || g.Shots[0].Name != "b.jpg" || g.Shots[0].Source != SourceSteam || g.Shots[1].Name != "a.png" {
		t.Fatalf("shots = %+v", g.Shots)
	}
	if len(g.Sources) != 2 {
		t.Fatalf("sources = %v, want the two folders that exist", g.Sources)
	}
	if IsPicture("../a.png") || IsPicture("a.exe") || !IsPicture("A.JPG") {
		t.Fatal("IsPicture accepts only bare picture file names")
	}
}
