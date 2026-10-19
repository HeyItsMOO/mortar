package sysaccent

import (
	"testing"

	"github.com/godbus/dbus/v5"
)

func TestFromDWMReadsABGR(t *testing.T) {
	if got := FromDWM(0xFFB07A3C); got != "#3C7AB0" {
		t.Errorf("got %s", got)
	}
}

func TestFromPortal(t *testing.T) {
	for name, c := range map[string]struct {
		in   any
		want string
		ok   bool
	}{
		"nested variants": {dbus.MakeVariant(dbus.MakeVariant([]any{1.0, 0.0, 0.5019607843137255})), "#FF0080", true},
		"plain":           {[]any{0.0, 0.0, 0.0}, "#000000", true},
		"unset is -1":     {[]any{-1.0, -1.0, -1.0}, "", false},
		"wrong shape":     {[]any{0.1, 0.2}, "", false},
		"not a colour":    {"red", "", false},
	} {
		if got, ok := FromPortal(c.in); got != c.want || ok != c.ok {
			t.Errorf("%s: %q %v", name, got, ok)
		}
	}
}
