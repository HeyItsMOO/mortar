package main

import (
	"testing"

	"github.com/Rethunk-Tech/mortar/internal/settings"
)

func TestTrayIsWantedOnlyByItsOwnSettings(t *testing.T) {
	for _, c := range []struct{ keep, minimised, want bool }{{false, false, false}, {true, false, true}, {false, true, true}} {
		if got := trayWanted(settings.Settings{KeepInTray: c.keep, StartMinimised: c.minimised}); got != c.want {
			t.Errorf("keep %v minimised %v: %v", c.keep, c.minimised, got)
		}
	}
}
