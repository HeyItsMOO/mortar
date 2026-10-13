package profile

import (
	"context"
	"errors"
	"io/fs"
	"os"
	"path/filepath"
	"slices"
	"strings"

	"github.com/Rethunk-Tech/mortar/internal/datadir"
	"github.com/Rethunk-Tech/mortar/internal/fsx"
	"github.com/Rethunk-Tech/mortar/internal/installer"
)

// looseModKinds is whether the game reads its mods as loose files from a folder (the folder loader) and the
// lower-case extensions, without a dot, that its mods target names; none named means any file is a mod.
func looseModKinds(game string) ([]string, bool) {
	g := installerGame(game)
	if !slices.Contains(g.Loaders, folderLoader) {
		return nil, false
	}
	var kinds []string
	for _, t := range g.Targets {
		if t.ID != installer.TargetMods {
			continue
		}
		for ext := range t.MaxDepth {
			kinds = append(kinds, ext)
		}
	}
	return kinds, true
}

func isLooseMod(name string, kinds []string) bool {
	return len(kinds) == 0 || slices.Contains(kinds, strings.ToLower(strings.TrimPrefix(filepath.Ext(name), ".")))
}

// scanLooseMods lists what a folder game's mods folder holds at its top level as one slot each: a mod file, or a
// folder that holds one at any depth. Links and the game's own files (its Resource.cfg) are not mods.
func scanLooseMods(modsDir string, kinds []string) ([]gameModSlot, error) {
	entries, err := os.ReadDir(modsDir)
	if errors.Is(err, fs.ErrNotExist) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	root, err := fsx.EvalSymlinks(modsDir)
	if err != nil {
		return nil, err
	}
	var slots []gameModSlot
	for _, it := range entries {
		child := filepath.Join(modsDir, it.Name())
		switch {
		case it.Type().IsRegular():
			if !isLooseMod(it.Name(), kinds) {
				continue
			}
		case datadir.RealDirUnder(root, child):
			if !holdsLooseMod(child, kinds) {
				continue
			}
		default:
			continue
		}
		slots = append(slots, gameModSlot{folder: gameModFolder{dir: child, label: it.Name(), loose: true}, ready: true})
	}
	return slots, nil
}

func holdsLooseMod(dir string, kinds []string) bool {
	found := false
	_ = filepath.WalkDir(dir, func(p string, d fs.DirEntry, err error) error {
		if err == nil && d.Type().IsRegular() && isLooseMod(d.Name(), kinds) {
			found = true
			return fs.SkipAll
		}
		return nil
	})
	return found
}

// importLoose adds a folder game's mod file or folder to the profile under its own name, so it lays out in the
// profile where it sat in the game's folder.
func (s *Store) importLoose(ctx context.Context, game, id string, f gameModFolder) (key, change string, err error) {
	scratch, err := os.MkdirTemp(filepath.Dir(s.root), "mortar-import-*")
	if err != nil {
		return "", "", err
	}
	defer func() { _ = os.RemoveAll(scratch) }()
	staged := filepath.Join(scratch, "mod")
	dest := filepath.Join(staged, f.label)
	info, err := os.Stat(f.dir)
	if err != nil {
		return "", "", err
	}
	if info.IsDir() {
		err = datadir.CopyTreeResolvingLinks(f.dir, dest)
	} else if err = os.MkdirAll(staged, 0o700); err == nil {
		err = datadir.CopyFile(f.dir, dest)
	}
	if err != nil {
		return "", "", err
	}
	if key, err = s.items.AddHashedDir(ctx, game, staged); err != nil {
		return "", "", err
	}
	res, err := s.installKey(game, id, key, Source{Kind: KindLocal, Name: f.label})
	return key, res.Profile.LastChange, err
}
