package game

import (
	"os"
	"path/filepath"
	"runtime"
	"slices"
	"strings"
)

// maxSuggestChecks bounds the folders SuggestFolders looks into, so a home with thousands of folders answers at once.
const maxSuggestChecks = 4000

// SuggestFolders lists folders that hold an install of game id in the places a copy outside a launcher usually lands
// (the Desktop, Downloads and Games folders and the home itself; on Windows also each drive's root and Games folder),
// at most two levels down, so the Choose folder step can offer them before the folder picker.
func (s *Service) SuggestFolders(id string) []string {
	g := Find(id)
	if g == nil {
		return nil
	}
	var out []string
	checks := 0
	try := func(dir string) bool {
		checks++
		if g.ValidInstall(dir) == nil && !slices.Contains(out, dir) {
			out = append(out, dir)
			return true
		}
		return false
	}
	for _, root := range suggestRoots(s.home) {
		for _, a := range subdirs(root) {
			if checks >= maxSuggestChecks {
				return out
			}
			if try(a) {
				continue
			}
			for _, b := range subdirs(a) {
				if checks >= maxSuggestChecks {
					return out
				}
				try(b)
			}
		}
	}
	return out
}

func suggestRoots(home string) []string {
	roots := []string{filepath.Join(home, "Desktop"), filepath.Join(home, "Downloads"), filepath.Join(home, "Games"), home}
	if runtime.GOOS == "windows" {
		for d := 'C'; d <= 'Z'; d++ {
			drive := string(d) + `:\`
			if _, err := os.Stat(drive); err == nil {
				roots = append(roots, filepath.Join(drive, "Games"), drive)
			}
		}
	}
	return roots
}

// subdirs lists dir's visible folders; a dot folder holds settings, not games.
func subdirs(dir string) []string {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil
	}
	var out []string
	for _, e := range entries {
		if e.IsDir() && !strings.HasPrefix(e.Name(), ".") {
			out = append(out, filepath.Join(dir, e.Name()))
		}
	}
	return out
}
