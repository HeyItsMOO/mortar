package source

import "context"

// ReportTarget is where a mod's problems are reported: its GitHub repository ("owner/repo") when the site links one,
// else the page to open.
type ReportTarget struct {
	Repo string `json:"repo"`
	URL  string `json:"url"`
}

// Reporter is a source that knows where its mod id is reported; key is the source's name for the game.
type Reporter interface {
	ReportTarget(ctx context.Context, key, id, mortarVersion string) (ReportTarget, error)
}
