package settings

import (
	"os"
	"regexp"
	"slices"
	"testing"
)

// The window offers these columns and groupings; a value the settings refuse makes the window's choice undo itself.
func TestListChoicesMatchTheWindow(t *testing.T) {
	quoted := regexp.MustCompile(`'([a-zA-Z]+)'`)
	for _, c := range []struct {
		file, start, end string
		known            []string
	}{
		{"../../frontend/src/mods/listColumns.ts", "const LIST_COLUMN_GROUPS = [", "] as const", knownListColumns},
		{"../../frontend/src/mods/group.ts", "const GROUP_BY_IDS = [", "] as const", listGroupBys},
	} {
		raw, err := os.ReadFile(c.file)
		if err != nil {
			t.Fatal(err)
		}
		src := string(raw)
		i := regexp.MustCompile(regexp.QuoteMeta(c.start)).FindStringIndex(src)
		if i == nil {
			t.Fatalf("%s: no %q", c.file, c.start)
		}
		body := src[i[1]:]
		body = body[:regexp.MustCompile(regexp.QuoteMeta(c.end)).FindStringIndex(body)[0]]
		var ids []string
		for _, m := range quoted.FindAllStringSubmatch(body, -1) {
			ids = append(ids, m[1])
		}
		if !slices.Equal(slices.Sorted(slices.Values(ids)), slices.Sorted(slices.Values(c.known))) {
			t.Errorf("%s offers %v, settings accept %v", c.file, ids, c.known)
		}
	}
}
