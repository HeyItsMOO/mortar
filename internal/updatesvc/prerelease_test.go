package updatesvc

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestLatestPrereleaseTagRefusesAnOversizedBody(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`[{"tag_name":"`))
		_, _ = w.Write(bytes.Repeat([]byte("1"), 8<<20))
		_, _ = w.Write([]byte(`","prerelease":true}]`))
	}))
	defer srv.Close()
	p := &prereleaseProvider{client: srv.Client()}
	// latestPrereleaseTag hits api.github.com; swap the request by serving through a client that rewrites.
	p.client = &http.Client{Transport: rewriteHost{base: srv.URL, next: srv.Client().Transport}}
	_, err := p.latestPrereleaseTag(t.Context(), "0.1.0")
	if err == nil {
		t.Fatal("oversized GitHub releases body was accepted")
	}
}

type rewriteHost struct {
	base string
	next http.RoundTripper
}

func (r rewriteHost) RoundTrip(req *http.Request) (*http.Response, error) {
	u, err := req.URL.Parse(r.base + req.URL.RequestURI())
	if err != nil {
		return nil, err
	}
	clone := req.Clone(req.Context())
	clone.URL = u
	clone.Host = u.Host
	return r.next.RoundTrip(clone)
}
