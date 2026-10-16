package backup

import (
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/Rethunk-Tech/mortar/internal/fsx"
	"github.com/Rethunk-Tech/mortar/internal/saves"
)

func TestRestoreCopyPutsTheGamesOwnCopyBack(t *testing.T) {
	dir, backups := t.TempDir(), t.TempDir()
	write := func(name, body string) {
		p := filepath.Join(dir, filepath.FromSlash(name))
		if err := os.MkdirAll(filepath.Dir(p), 0o700); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(p, []byte(body), 0o600); err != nil {
			t.Fatal(err)
		}
	}
	read := func(name string) string {
		b, err := fsx.ReadFile(filepath.Join(dir, filepath.FromSlash(name)))
		if err != nil {
			t.Fatal(err)
		}
		return string(b)
	}
	write("worlds_local/W.fwl", "now")
	write("worlds_local/W.db", "now db")
	write("worlds_local/W_backup_auto-1.fwl", "then")
	write("worlds_local/W_backup_auto-1.db", "then db")
	write("Slot_00000002.save", "slot now")
	write("Slot_00000002.save.ver0", "slot then")
	l := saves.Layout{
		Dir:        dir,
		Files:      []string{"worlds_local/*.fwl", "Slot_*.save", "!*_backup_*"},
		Companions: []string{".db"},
		Copies:     []string{"{stem}_backup_auto-*{ext}", "{name}.ver?"},
	}
	if got := l.CopiesOf("worlds_local/W.fwl"); len(got) != 1 || got[0].Name != "worlds_local/W_backup_auto-1.fwl" {
		t.Fatalf("copies = %+v", got)
	}
	now := time.Now()
	if err := RestoreCopy(l, backups, "worlds_local/W.fwl", "worlds_local/W_backup_auto-1.fwl", 5, now); err != nil {
		t.Fatal(err)
	}
	if read("worlds_local/W.fwl") != "then" || read("worlds_local/W.db") != "then db" || read("worlds_local/W_backup_auto-1.fwl") != "then" {
		t.Fatal("world not restored from its copy, or the copy was moved")
	}
	if err := RestoreCopy(l, backups, "Slot_00000002.save", "Slot_00000002.save.ver0", 5, now.Add(time.Second)); err != nil || read("Slot_00000002.save") != "slot then" {
		t.Fatalf("slot restore: %v", err)
	}
	if err := RestoreCopy(l, backups, "Slot_00000002.save", "../elsewhere", 5, now); err == nil {
		t.Fatal("a path that is not one of the save's copies was restored")
	}
	if listed, _ := List(backups, l); len(listed) != 2 {
		t.Fatalf("backups before each restore = %d, want 2", len(listed))
	}
}
