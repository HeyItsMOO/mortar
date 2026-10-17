package cli

import (
	"fmt"
	"strings"

	"github.com/Rethunk-Tech/mortar/internal/control"
	"github.com/Rethunk-Tech/mortar/internal/profile"
)

func (c *cmd) modsGroup() error {
	a, err := c.need(2, "a game", "a profile", "list, create, rename, delete, add, remove, on, or off")
	if err != nil {
		return err
	}
	p := control.Params{Game: a[0], Profile: a[1], Sub: a[2]}
	switch a[2] {
	case "list":
		return show(c, "mods.group", p, func(groups []profile.Group) {
			if len(groups) == 0 {
				fmt.Fprintln(c.out, "No groups.")
				return
			}
			rows := make([][]string, 0, len(groups))
			for _, g := range groups {
				rows = append(rows, []string{g.Name, strings.Join(g.Keys, ", ")})
			}
			c.table("GROUP\tENTRIES", rows)
		})
	case "create", "delete", "on", "off":
		if len(a) < 4 {
			return usageError{"mods group " + a[2] + " needs a group name"}
		}
		p.Name = a[3]
		return show(c, "mods.group", p, func(got profile.Profile) {
			fmt.Fprintf(c.out, "Group %s %s.\n", p.Name, a[2])
		})
	case "rename":
		if len(a) < 5 {
			return usageError{"mods group rename needs a group name and a new name"}
		}
		p.Name, p.Value = a[3], strings.Join(a[4:], " ")
		return show(c, "mods.group", p, func(got profile.Profile) {
			fmt.Fprintf(c.out, "Group %s renamed to %s.\n", p.Name, p.Value)
		})
	case "add", "remove":
		if len(a) < 5 {
			return usageError{"mods group " + a[2] + " needs a group name and a mod id"}
		}
		p.Name = a[3]
		p.IDs = a[4:5]
		return show(c, "mods.group", p, func(got profile.Profile) {
			fmt.Fprintf(c.out, "%s %s %s.\n", strings.ToUpper(a[2][:1])+a[2][1:], p.IDs[0], p.Name)
		})
	default:
		return usageError{"mods group needs list, create, rename, delete, add, remove, on, or off"}
	}
}
