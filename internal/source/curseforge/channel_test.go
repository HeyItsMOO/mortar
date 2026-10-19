package curseforge

import (
	"testing"

	"github.com/Rethunk-Tech/mortar/internal/source"
)

func TestNewestFollowsTheChannel(t *testing.T) {
	files := []fileResp{
		{ID: 1, IsAvailable: true, ReleaseType: 1, FileDate: "2026-01-01"},
		{ID: 2, IsAvailable: true, ReleaseType: 2, FileDate: "2026-02-01"},
		{ID: 3, IsAvailable: true, ReleaseType: 3, FileDate: "2026-03-01"},
	}
	for channel, want := range map[string]int{"": 1, "optional": 2, "beta": 3} {
		if got, _ := newest(files, nil, source.Stability(channel)); got.ID != want {
			t.Errorf("channel %q picked file %d, want %d", channel, got.ID, want)
		}
	}
}
