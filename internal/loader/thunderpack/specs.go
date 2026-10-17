package thunderpack

import (
	"path"
	"path/filepath"
	"slices"
	"strings"

	"github.com/Rethunk-Tech/mortar/internal/components"
	"github.com/Rethunk-Tech/mortar/internal/loader"
)

// topLevelDLL says whether pack file rel is a library at the pack's top, which sits beside the executable.
func topLevelDLL(rel string) bool {
	return !strings.Contains(rel, "/") && strings.EqualFold(path.Ext(rel), ".dll")
}

// specs are the loaders, from r2modman's ecosystem schema and its installers and launch instructions (ebkr/r2modmanPlus
// src/installers, src/r2mm/launching/instructions/instructions/loader), checked against the packages on Thunderstore.
var specs = []Spec{
	{
		// ReturnOfModding (Risk of Rain Returns) and Hell2Modding (Hades II) share one pack layout; the library is
		// version.dll in one and d3d12.dll in the other, next to the executable.
		LoaderID: "returnofmodding", Name: "ReturnOfModding", Root: "ReturnOfModdingPack",
		Placed: topLevelDLL,
		Files:  []string{"version.dll", "d3d12.dll"},
		Args: func(dir string, proton bool) []string {
			return []string{"--rom_modding_root_folder", hostPath(dir, proton)}
		},
		VanillaArgs: []string{"--rom_enabled", "false"},
		Overrides:   topDLLs,
		ImportDirs:  []string{"ReturnOfModding"}, ConfigFolders: []string{"ReturnOfModding/config"},
		Route: perFile(func(p, pkg string) string {
			for _, folder := range []string{"plugins", "plugins_data", "config"} {
				if rest, ok := inFolder(p, folder); ok {
					return path.Join("ReturnOfModding", folder, pkg, rest)
				}
			}
			return path.Join("ReturnOfModding", "plugins", pkg, p)
		}),
	},
	{
		LoaderID: "gdweave", Name: "GDWeave",
		Placed:  func(rel string) bool { return rel == "winmm.dll" },
		Replace: []string{"GDWeave/core"},
		Files:   []string{"winmm.dll", "GDWeave/core"},
		Args: func(dir string, proton bool) []string {
			return []string{"--gdweave-folder-override=" + hostPath(filepath.Join(dir, "GDWeave"), proton)}
		},
		VanillaArgs: []string{"--gdweave-disable"},
		Overrides:   topDLLs, ProxyDLL: "winmm",
		ImportDirs: []string{"GDWeave"},
		Route:      gdweaveRoute,
	},
	{
		// Lovely's proxy was version.dll until 0.10, winmm.dll since; its own files go in the mods folder it is given.
		LoaderID: "lovely", Name: "Lovely",
		Placed: topLevelDLL,
		Move:   map[string]string{"lovely": "mods/lovely"},
		Seed:   []string{"lovely/config.toml"},
		Files:  []string{"winmm.dll", "version.dll", "mods/lovely"},
		Args: func(dir string, proton bool) []string {
			return []string{"--mod-dir", hostPath(filepath.Join(dir, "mods"), proton)}
		},
		VanillaArgs: []string{"--vanilla"},
		Overrides:   topDLLs, ProxyDLL: "winmm",
		ImportDirs: []string{"mods"},
		Route:      perFile(func(p, pkg string) string { return path.Join("mods", pkg, p) }),
	},
	{
		// Rivet's whole release is laid out in the profile; only its version.dll proxy sits beside the executable. The
		// loader and its mods folder are named on the command line.
		LoaderID: "rivet", Name: "Rivet", Root: "RivetPack",
		Placed: topLevelDLL,
		Seed:   []string{"Rivet.ini"},
		Files:  []string{"version.dll", "Rivet.ini", "Rivet"},
		Args: func(dir string, proton bool) []string {
			return []string{
				"-rivetEnable", "true",
				"-rivetTarget", hostPath(filepath.Join(dir, "Rivet", "Loader.dll"), proton),
				"-rivetDirectory", hostPath(filepath.Join(dir, "Rivet", "Mods"), proton),
			}
		},
		VanillaArgs: []string{"-rivetEnable", "false"},
		Overrides:   topDLLs, ProxyDLL: "version",
		ImportDirs: []string{"Rivet"},
		Route:      perFile(func(p, pkg string) string { return path.Join("Rivet", "Mods", pkg, p) }),
	},
	{
		// Unity Mod Manager rides on a Doorstop proxy; the pack's Doorstop is 3 or 4, whose flags differ and each of which
		// ignores the other's, so both are passed. Where a mod's files go is the game's install rules in the catalog.
		LoaderID: "umm", Name: "Unity Mod Manager",
		Placed:  func(rel string) bool { return rel == "winhttp.dll" || rel == "doorstop_config.ini" },
		Replace: []string{"UMM/Core"},
		Files:   []string{"UMM/Core", "winhttp.dll", "doorstop_config.ini", ".doorstop_version", "doorstop_libs"},
		Args: func(dir string, proton bool) []string {
			target := hostPath(filepath.Join(dir, "UMM", "Core", "UnityModManager.dll"), proton)
			return []string{"--doorstop-enabled", "true", "--doorstop-target-assembly", target, "--doorstop-enable", "true", "--doorstop-target", target}
		},
		VanillaArgs: []string{"--doorstop-enabled", "false", "--doorstop-enable", "false"},
		Overrides:   topDLLs, ProxyDLL: "winhttp",
		ImportDirs: []string{"UMM"},
	},
	{
		// Northstar's whole release is laid out in the profile, which it is told is its R2Northstar folder; the launcher
		// and the libraries around it are placed beside the game's executable.
		LoaderID: "northstar", Name: "Northstar", Root: "Northstar",
		Placed: func(rel string) bool {
			return !strings.HasPrefix(rel, "R2Northstar/mods/") && !strings.HasSuffix(strings.ToLower(rel), ".pdb")
		},
		Replace: []string{"R2Northstar/mods/Northstar.*"},
		Files:   []string{"NorthstarLauncher.exe", "R2Northstar", "bin"},
		Args: func(dir string, proton bool) []string {
			return []string{"-northstar", "-profile=" + hostPath(filepath.Join(dir, "R2Northstar"), proton)}
		},
		Overrides: func([]string) []string { return []string{"wsock32"} },
		Exe:       "NorthstarLauncher.exe", ImportDirs: []string{"R2Northstar"},
	},
}

// gdweaveRoute puts the files of the package's own mod folder, the shallowest folder below the package's top that holds a
// manifest.json (the top one is Thunderstore's), in GDWeave/mods/<package>. Packages are laid out all over the place.
func gdweaveRoute(files []string, pkg string) map[string]string {
	var dirs []string
	for _, f := range files {
		if p, ok := components.PackageFile(f, pkg); ok && strings.EqualFold(path.Base(p), "manifest.json") && path.Dir(p) != "." {
			dirs = append(dirs, path.Dir(p))
		}
	}
	out := map[string]string{}
	if len(dirs) == 0 {
		return out
	}
	slices.SortFunc(dirs, func(a, b string) int {
		if d := strings.Count(a, "/") - strings.Count(b, "/"); d != 0 {
			return d
		}
		return strings.Compare(a, b)
	})
	for _, f := range files {
		if p, ok := components.PackageFile(f, pkg); ok {
			if rest, in := strings.CutPrefix(p, dirs[0]+"/"); in {
				out[f] = path.Join("GDWeave", "mods", pkg, rest)
			}
		}
	}
	return out
}

type northstarLoader struct{ Loader }

// ProcessNames are the launcher and the game it starts, since the launcher is the process Mortar starts.
func (northstarLoader) ProcessNames() []string {
	return []string{"NorthstarLauncher.exe", "NorthstarLauncher", "Titanfall2.exe", "Titanfall2"}
}

var _ = register()

func register() bool {
	for _, s := range specs {
		if s.LoaderID == "northstar" {
			loader.Register(northstarLoader{Loader{Spec: s}})
			continue
		}
		loader.Register(Loader{Spec: s})
	}
	return true
}
