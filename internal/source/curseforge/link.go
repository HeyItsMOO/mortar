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

// Project is what a link's project is: its name, the site's id of its game, and whether its author forbids
// downloads outside CurseForge's own page.
type Project struct {
	Name       string
	GameID     int
	Restricted bool
}

// Project reads the project a link names.
func (d Driver) Project(ctx context.Context, id int) (Project, error) {
	m, err := d.mod(ctx, strconv.Itoa(id))
	return Project{
		Name: m.Name, GameID: m.GameID, Restricted: m.AllowModDistribution != nil && !*m.AllowModDistribution,
	}, err
}

// PageURL is the project's page address, whose last segment is its slug; empty when the site gives none.
func (d Driver) PageURL(ctx context.Context, id string) (string, error) {
	m, err := d.mod(ctx, id)
	return m.Links.WebsiteURL, err
}
