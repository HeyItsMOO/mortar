package vsmoddb

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestChangelogStopsAtTheInstalledRelease(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		_, _ = w.Write([]byte(`{"mod":{"modid":5,"releases":[
			{"modversion":"3.0.0","created":"2026-03-01 10:00:00","changelog":"<p>three</p>"},
			{"modversion":"2.0.0","created":"2026-02-01 10:00:00","changelog":"<p>two</p>"},
			{"modversion":"1.0.0","created":"2026-01-01 10:00:00","changelog":"<p>one</p>"}]}}`))
	}))
	t.Cleanup(srv.Close)
	got, err := Driver{HTTP: srv.Client(), URL: srv.URL}.Changelog(t.Context(), "", "5-50", "1.0.0", "2.0.0", "")
	if err != nil {
		t.Fatal(err)
	}
	if len(got) != 1 || got[0].Version != "2.0.0" || got[0].Date != "2026-02-01" || got[0].Body != "two" {
		t.Fatalf("notes = %+v", got)
	}
}
