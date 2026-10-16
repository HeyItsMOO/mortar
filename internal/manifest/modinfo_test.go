package manifest

import (
	"slices"
	"testing"
)

func TestParseModInfoReadsAnyKeyCaseAndLenientJSON(t *testing.T) {
	info, err := ParseModInfo([]byte(`{
		// Vintage Story reads this with Newtonsoft, which takes comments and trailing commas.
		"Type": "code", "ModID": "carryon", "Name": "Carry On", "Version": "1.14.3",
		"authors": ["copygirl", "Nikea"],
	}`))
	if err != nil || info.Name != "Carry On" || info.ModID != "carryon" || info.Version != "1.14.3" ||
		!slices.Equal(info.Authors, []string{"copygirl", "Nikea"}) {
		t.Fatalf("info = %+v, %v", info, err)
	}
}
