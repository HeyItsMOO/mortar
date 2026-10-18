package modreport

import (
	"strings"
	"testing"
)

func TestErrorLines(t *testing.T) {
	t.Parallel()
	log := strings.Join([]string{
		"[19:43:46 INFO  SMAPI] SMAPI 4.5.2 with Stardew Valley 1.6.15",
		"[19:43:50 ERROR Content Patcher] patch failed: missing target",
		"   at ContentPatcher.Patch.Apply()",
		"[19:43:51 WARN  Content Patcher] maybe later",
		"[19:43:52 ERROR Lookup Anything] null reference",
		"[19:43:53 ALERT SMAPI] The game crashed: boom",
	}, "\n") + "\n"

	many := new(strings.Builder)
	for range maxErrorLines + 3 {
		many.WriteString("[12:00:00 ERROR Flood] line\n")
	}

	for _, tc := range []struct {
		name, log, mod string
		want           []string
	}{
		{
			name: "named mod keeps error and its continuation, not warnings or other mods",
			log:  log,
			mod:  "Content Patcher",
			want: []string{
				"[19:43:50 ERROR Content Patcher] patch failed: missing target",
				"   at ContentPatcher.Patch.Apply()",
			},
		},
		{
			name: "alert from SMAPI",
			log:  log,
			mod:  "SMAPI",
			want: []string{"[19:43:53 ALERT SMAPI] The game crashed: boom"},
		},
		{name: "empty name", log: log, mod: ""},
		{name: "no matching mod", log: log, mod: "Farm Type Manager"},
		{
			name: "caps at maxErrorLines",
			log:  many.String(),
			mod:  "Flood",
			want: repeatLine("[12:00:00 ERROR Flood] line", maxErrorLines),
		},
	} {
		got := ErrorLines(tc.log, tc.mod)
		if len(got) == 0 && len(tc.want) == 0 {
			continue
		}
		if strings.Join(got, "\n") != strings.Join(tc.want, "\n") {
			t.Errorf("%s:\n got %q\nwant %q", tc.name, got, tc.want)
		}
	}
}

func TestBuildFromLog(t *testing.T) {
	t.Parallel()
	log := "[19:43:46 INFO  SMAPI] SMAPI 4.5.2 with Stardew Valley 1.6.15\n" +
		"[19:43:50 ERROR Content Patcher] patch failed: missing target\n"
	for _, tc := range []struct {
		name string
		in   Input
		want []string
		not  []string
	}{
		{
			name: "empty versions and lines come from the log",
			in:   Input{ModName: "Content Patcher", Game: "stardew"},
			want: []string{"SMAPI: 4.5.2", "Game: Stardew Valley 1.6.15", "[19:43:50 ERROR Content Patcher] patch failed: missing target"},
		},
		{
			name: "supplied versions and lines stay",
			in: Input{
				ModName: "Content Patcher", SMAPIVersion: "9.9.9", GameVersion: "0.0", ErrorLines: []string{"already"},
			},
			want: []string{"SMAPI: 9.9.9", "Game: 0.0", "already"},
			not:  []string{"patch failed"},
		},
	} {
		got := BuildFromLog(log, "Content Patcher", tc.in)
		for _, w := range tc.want {
			if !strings.Contains(got.Text, w) {
				t.Errorf("%s: missing %q in %q", tc.name, w, got.Text)
			}
		}
		for _, n := range tc.not {
			if strings.Contains(got.Text, n) {
				t.Errorf("%s: unexpected %q in %q", tc.name, n, got.Text)
			}
		}
	}
}

func repeatLine(s string, n int) []string {
	out := make([]string, n)
	for i := range out {
		out[i] = s
	}
	return out
}
