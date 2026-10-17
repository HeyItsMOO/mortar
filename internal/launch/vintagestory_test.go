package launch

import "testing"

// The version line as a Vintage Story 1.21.5 client log writes it at start.
func TestLogGameVersion(t *testing.T) {
	e, ok := parseVintageStory("30.11.2025 18:29:40 [Notification] Game Version: v1.21.5 (Stable)")
	if !ok || LogGameVersion(e.Message) != "1.21.5" {
		t.Fatalf("entry %+v: version %q", e, LogGameVersion(e.Message))
	}
	if LogGameVersion("Client logger started.") != "" {
		t.Fatal("a line naming no version gave one")
	}
}
