// Package sysaccent reads the accent colour the operating system's desktop is set to.
package sysaccent

import (
	"fmt"
	"math"

	"github.com/godbus/dbus/v5"
)

// FromDWM is the "#rrggbb" of a Windows DWM AccentColor value, which stores the colour as 0xAABBGGRR.
func FromDWM(v uint64) string {
	return fmt.Sprintf("#%02X%02X%02X", v&0xFF, (v>>8)&0xFF, (v>>16)&0xFF)
}

// FromPortal is the "#rrggbb" of the xdg-desktop-portal org.freedesktop.appearance accent-color answer, an (ddd) of
// RGB in 0 to 1 inside one or two variants. A component outside that range means the desktop has no accent.
func FromPortal(v any) (string, bool) {
	for {
		inner, ok := v.(dbus.Variant)
		if !ok {
			break
		}
		v = inner.Value()
	}
	rgb, ok := v.([]any)
	if !ok || len(rgb) != 3 {
		return "", false
	}
	var c [3]uint8
	for i, x := range rgb {
		f, ok := x.(float64)
		if !ok || f < 0 || f > 1 || math.IsNaN(f) {
			return "", false
		}
		c[i] = uint8(math.Round(f * 255))
	}
	return fmt.Sprintf("#%02X%02X%02X", c[0], c[1], c[2]), true
}
