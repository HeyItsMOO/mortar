package source

import "context"

// Note is one version's release notes as plain text or Markdown.
type Note struct {
	Version string `json:"version"`
	Date    string `json:"date"`
	Body    string `json:"body"`
}

// Changelogger is a source that reads the notes of the versions an update from installed to latest crosses, newest
// first; id is the project's id at the source.
type Changelogger interface {
	Changelog(ctx context.Context, key, id, installed, latest, mortarVersion string) ([]Note, error)
}

// MaxNotes bounds how many versions' notes a Changelogger returns.
const MaxNotes = 10
