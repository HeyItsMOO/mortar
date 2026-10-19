package game

import (
	"errors"
	"testing"

	"github.com/Rethunk-Tech/mortar/internal/launch"
	"github.com/Rethunk-Tech/mortar/internal/launchplan"
)

func TestLauncherCopiesStartThroughTheirLauncherWhenItCanTakeThePlan(t *testing.T) {
	has := func(name string) (string, error) { return "/usr/bin/" + name, nil }
	plan := func(env map[string]string, args ...string) *launchplan.Plan {
		return &launchplan.Plan{Mode: launchplan.ModeProfile, Args: args, Env: env}
	}
	heroic := Install{Launcher: "heroic:legendary:Garlic"}
	c, ok, err := launcherCommand(heroic, plan(map[string]string{"WINEDLLOVERRIDES": "winhttp=n,b"}, "--a b"), has)
	if err != nil || !ok || c.Name != "/usr/bin/xdg-open" || !c.Relay || c.Failure != launch.HintLauncher ||
		c.Args[0] != "heroic://launch?appName=Garlic&arg=--a+b&runner=legendary" {
		t.Fatalf("heroic: %+v ok %v err %v", c, ok, err)
	}
	lutris := Install{Launcher: "lutris:vintage-story"}
	if c, ok, _ = launcherCommand(lutris, plan(nil), has); !ok || c.Args[0] != "lutris:rungame/vintage-story" {
		t.Fatalf("lutris: %+v ok %v", c, ok)
	}
	for name, tc := range map[string]struct {
		inst Install
		plan *launchplan.Plan
		look func(string) (string, error)
	}{
		"lutris cannot carry arguments":    {lutris, plan(nil, "-x"), has},
		"other environment is lost":        {heroic, plan(map[string]string{"DOORSTOP": "1"}), has},
		"the launcher is not installed":    {lutris, plan(nil), func(string) (string, error) { return "", errors.New("none") }},
		"a copy with no launcher":          {Install{}, plan(nil), has},
		"a loader that replaces the start": {heroic, &launchplan.Plan{Exe: "loader.exe"}, has},
	} {
		if _, ok, err := launcherCommand(tc.inst, tc.plan, tc.look); ok || err != nil {
			t.Errorf("%s: relayed (ok %v, err %v)", name, ok, err)
		}
	}
}
