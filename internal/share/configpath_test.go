package share

import (
	"strings"
	"testing"
)

func TestValidConfigPath(t *testing.T) {
	t.Parallel()
	for _, tc := range []struct {
		path string
		want bool
	}{
		{path: "config.json", want: true},
		{path: "data/deep.json", want: true},
		{path: "Config.JSON", want: true},
		{path: "a b/x.json", want: true},
		{path: "run.sh"},
		{path: "manifest.json", want: true},
		{path: "../escape.json"},
		{path: "/abs.json"},
		{path: "con.json"},
		{path: "COM1.json"},
		{path: "nul/x.json"},
		{path: "x.json "},
		{path: "x.json."},
		{path: "x/"},
		{path: ""},
		{path: strings.Repeat("a", maxSegment-len(".json")) + ".json", want: true},
		{path: strings.Repeat("a", maxSegment-len(".json")+1) + ".json"},
		{path: strings.Repeat("a", 77) + "/" + strings.Repeat("a", 77) + "/" + strings.Repeat("a", 77) + ".json", want: true},
		{path: strings.Repeat("a", 78) + "/" + strings.Repeat("a", 78) + "/" + strings.Repeat("a", 78) + ".json"},
	} {
		if got := ValidConfigPath(tc.path); got != tc.want {
			t.Errorf("ValidConfigPath(%q) = %v, want %v", tc.path, got, tc.want)
		}
	}
}
