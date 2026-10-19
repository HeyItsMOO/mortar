package problems

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Rethunk-Tech/mortar/internal/framework"
	"github.com/Rethunk-Tech/mortar/internal/github"
	"github.com/Rethunk-Tech/mortar/internal/profile"
)

func TestGitHubPrereleasesAreOfferedOnlyOnTheBetaChannel(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		_, _ = w.Write([]byte(`[
			{"tag_name":"v2.0.0-beta.1","prerelease":true,"assets":[{"name":"m.zip","browser_download_url":"x"}]},
			{"tag_name":"v1.1.0","assets":[{"name":"m.zip","browser_download_url":"x"}]}]`))
	}))
	t.Cleanup(srv.Close)
	s := &Service{GitHub: &github.Client{APIBase: srv.URL, CacheDir: t.TempDir()}}
	mod := framework.Mod{Key: "k", Name: "M", Version: "1.0.0", SourceKind: profile.KindGitHub, SourceRepo: "o/r"}
	for channel, want := range map[string]string{"": "1.1.0", "optional": "1.1.0", "beta": "2.0.0-beta.1"} {
		mod.UpdateChannel = channel
		got := s.githubUpdates(t.Context(), []framework.Mod{mod}, nil)
		if len(got) != 1 || got[0].Version != want {
			t.Errorf("channel %q offered %+v, want %s", channel, got, want)
		}
	}
}
