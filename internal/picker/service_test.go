package picker

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/Rethunk-Tech/mortar/internal/winhost"
)

type pickedFile struct {
	winhost.Host
	path string
}

func (p pickedFile) OpenFile(winhost.Dialog) (string, error) { return p.path, nil }

func TestReadTextFileReturnsTheFileAndRefusesALargeOne(t *testing.T) {
	path := filepath.Join(t.TempDir(), "list.txt")
	if err := os.WriteFile(path, []byte("- A 1.0\n"), 0o600); err != nil {
		t.Fatal(err)
	}
	s := &Service{App: pickedFile{path: path}}
	if text, err := s.ReadTextFile("Open"); err != nil || text != "- A 1.0\n" {
		t.Fatalf("read %q, %v", text, err)
	}
	if text, err := (&Service{App: pickedFile{}}).ReadTextFile("Open"); err != nil || text != "" {
		t.Fatalf("cancelled: %q, %v", text, err)
	}
	if err := os.WriteFile(path, []byte(strings.Repeat("x", maxTextBytes+1)), 0o600); err != nil {
		t.Fatal(err)
	}
	if _, err := s.ReadTextFile("Open"); err == nil {
		t.Fatal("read a file over the cap")
	}
}
