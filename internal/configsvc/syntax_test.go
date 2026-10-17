package configsvc

import (
	"strings"
	"testing"
)

func TestCheckSyntax(t *testing.T) {
	for _, c := range []struct {
		file, text, want string
	}{
		{"a.json", "{\n  // a comment\n  \"on\": true,\n}", ""},
		{"a.json", "{\n  \"on\": true\n  \"off\": false\n}", "line 3"},
		{"a.yaml", "on: true\nlist: [1, 2\n", "not valid YAML"},
		{"a.xml", "<root><a></root>", "not valid XML"},
		{"a.toml", "not = [checked", ""},
	} {
		err := checkSyntax(c.file, c.text)
		if (c.want == "") != (err == nil) || (err != nil && !strings.Contains(err.Error(), c.want)) {
			t.Errorf("%s %q: %v, want %q", c.file, c.text, err, c.want)
		}
	}
}
