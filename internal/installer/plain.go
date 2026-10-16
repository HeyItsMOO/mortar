package installer

import (
	"path"
	"slices"
	"strings"
)

var _ = Register(plain{})

// plain is the folder-per-package layout: everything the archive holds, minus junk, goes in the mods folder under the
// package's key.
type plain struct{}

func (plain) ID() string { return "plain" }

func (plain) Detect(Archive, Game) bool { return true }

func (plain) Layout(a Archive, g Game, _ Choices) (Layout, error) {
	all, err := files(a, ".")
	if err != nil {
		return Layout{}, err
	}
	// A folder game's mods are loose files the game reads below the target, so no folder is made for the archive,
	// unless the archive holds a mod folder of its own.
	folder := slices.Contains(g.Loaders, "folder")
	if dir, ok := modRootDir(all, g); folder && ok {
		return wholeFolder(a, g, all, dir)
	}
	var l Layout
	for _, f := range all {
		if !skip(f) {
			rel, target := path.Join(a.Key, f), TargetMods
			if folder {
				rel = f
				ext := strings.ToLower(strings.TrimPrefix(path.Ext(f), "."))
				if i := slices.IndexFunc(g.Targets, func(t Target) bool { return slices.Contains(t.Extensions, ext) }); i >= 0 {
					target = g.Targets[i].ID
				}
			}
			l.Files = append(l.Files, File{Src: f, Target: target, Rel: rel})
		}
	}
	return l, validate(l, g)
}

// modRootDir is the shallowest archive folder ("." for the root) holding the mods target's ModRoot file.
func modRootDir(all []string, g Game) (string, bool) {
	ti := slices.IndexFunc(g.Targets, func(t Target) bool { return t.ID == TargetMods })
	if ti < 0 || g.Targets[ti].ModRoot == "" {
		return "", false
	}
	depth := func(d string) int {
		if d == "." {
			return -1
		}
		return strings.Count(d, "/")
	}
	best, found := "", false
	for _, f := range all {
		if skip(f) || !strings.EqualFold(path.Base(f), g.Targets[ti].ModRoot) {
			continue
		}
		if d := path.Dir(f); !found || depth(d) < depth(best) {
			best, found = d, true
		}
	}
	return best, found
}

// wholeFolder lays the mod folder dir out as one folder named after the package; files outside it are not the mod's.
func wholeFolder(a Archive, g Game, all []string, dir string) (Layout, error) {
	var l Layout
	for _, f := range all {
		rel := f
		if dir != "." {
			var ok bool
			if rel, ok = strings.CutPrefix(f, dir+"/"); !ok {
				continue
			}
		}
		if !skip(f) {
			l.Files = append(l.Files, File{Src: f, Target: TargetMods, Rel: path.Join(a.Key, rel)})
		}
	}
	return l, validate(l, g)
}
