package curseforge

import (
	"context"
	"errors"
	"net/url"
	"strconv"
)

// Schemes is the scheme of the site's Install button.
func (Driver) Schemes() []string { return []string{"curseforge"} }

// HandleLinksDefault is false: the CurseForge app owns these links for every game it serves, so Mortar takes them
// from the system only when the user opts in.
func (Driver) HandleLinksDefault() bool { return false }

// Ref names one file of a project in an install link.
type Ref struct {
	Project, File int
}

var errBadLink = errors.New("not a curseforge install link")

// ParseLink reads curseforge://install?addonId=<project>&fileId=<file>.
func ParseLink(raw string) (Ref, error) {
	u, err := url.Parse(raw)
	if err != nil || u.Scheme != "curseforge" || u.Host != "install" || u.User != nil || u.Fragment != "" ||
		(u.Path != "" && u.Path != "/") {
		return Ref{}, errBadLink
	}
	q, err := url.ParseQuery(u.RawQuery)
	if err != nil {
		return Ref{}, errBadLink
	}
	project, perr := strconv.Atoi(q.Get("addonId"))
	file, ferr := strconv.Atoi(q.Get("fileId"))
	if perr != nil || ferr != nil || project <= 0 || file <= 0 {
		return Ref{}, errBadLink
	}
	return Ref{Project: project, File: file}, nil
}

// Project names a project and gives the site's id of the game it is for.
func (d Driver) Project(ctx context.Context, id int) (name string, gameID int, err error) {
	m, err := d.mod(ctx, strconv.Itoa(id))
	return m.Name, m.GameID, err
}
