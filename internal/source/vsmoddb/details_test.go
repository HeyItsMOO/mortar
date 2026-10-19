package vsmoddb

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestDetailsReadsTheModText(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		_, _ = w.Write([]byte(`{"mod":{"modid":5,"text":"<p>Hello <b>there</b></p>","tags":["QoL",""],"releases":[
			{"modversion":"2.0.0-rc.1","mainfile":"x","changelog":"<p>rc</p>"},
			{"modversion":"1.0.0","mainfile":"y","changelog":"<p>stable</p>"}]}}`))
	}))
	t.Cleanup(srv.Close)
	got, err := Driver{HTTP: srv.Client(), URL: srv.URL}.Details(t.Context(), "", "5-50", "")
	if err != nil || got.Description != "Hello **there**" || got.Changelog != "stable" ||
		len(got.Versions) != 2 || len(got.Categories) != 1 || got.Categories[0] != "QoL" {
		t.Fatalf("details %+v, %v", got, err)
	}
}
