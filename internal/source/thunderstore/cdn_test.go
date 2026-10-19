package thunderstore

import (
	"slices"
	"testing"
)

func TestCDNOrder(t *testing.T) {
	hosts := []string{"https://a.example", "https://b.example", "https://c.example"}
	raw := "https://b.example/live/repository/packages/Me-Mod-1.0.0.zip?x=1"
	for name, c := range map[string]struct {
		pinned, last string
		want         []string
	}{
		"automatic starts at the first": {"", "", hosts},
		"the last good host leads":      {"", hosts[2], []string{hosts[2], hosts[0], hosts[1]}},
		"a pinned host stands alone":    {hosts[1], hosts[2], []string{hosts[1]}},
		"an unknown pin is automatic":   {"https://z.example", "", hosts},
	} {
		if got := CDNOrder(raw, hosts, c.pinned, c.last); !slices.Equal(got, c.want) {
			t.Errorf("%s: %v, want %v", name, got, c.want)
		}
	}
	if got, _ := OnHost(raw, hosts[2]); got != "https://c.example/live/repository/packages/Me-Mod-1.0.0.zip?x=1" {
		t.Errorf("OnHost = %q", got)
	}
	if CDNOrder("https://elsewhere.example/x.zip", hosts, "", "") != nil {
		t.Error("an address off the CDNs was given alternatives")
	}
}
