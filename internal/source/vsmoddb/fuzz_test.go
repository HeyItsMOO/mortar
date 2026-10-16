package vsmoddb

import (
	"bytes"
	"io"
	"net/http"
	"testing"

	"github.com/Rethunk-Tech/mortar/internal/source"
)

type canned []byte

func (c canned) RoundTrip(*http.Request) (*http.Response, error) {
	return &http.Response{StatusCode: http.StatusOK, Body: io.NopCloser(bytes.NewReader(c)), Header: http.Header{}}, nil
}

// FuzzDecoders holds that no answer body from the Mod DB makes search, resolve or the update read panic.
func FuzzDecoders(f *testing.F) {
	f.Add([]byte(`{"mods":[{"modid":1,"assetid":2,"name":"A","tags":["x"]}]}`))
	f.Add([]byte(`{"mod":{"modid":1,"assetid":2,"releases":[{"releaseid":3,"modversion":"1.0.0","mainfile":"https://c/f.zip"}]}}`))
	f.Add([]byte(`{"mod":null}`))
	f.Add([]byte(`{`))
	f.Fuzz(func(t *testing.T, body []byte) {
		d := Driver{HTTP: &http.Client{Transport: canned(body)}, URL: "http://moddb.test"}
		_, _ = d.Search(t.Context(), source.Query{Page: source.FirstPage + 1})
		_, _ = d.Resolve(t.Context(), "1-2", "")
		_, _ = d.Items(t.Context(), "", "", []string{"1-2"})
	})
}

// FuzzParseLink holds that an accepted install link names a mod id and a version of safe characters only.
func FuzzParseLink(f *testing.F) {
	f.Add("vintagestorymodinstall://carryon@1.14.3")
	f.Add("vintagestorymodinstall://carryon@0.13.0-pre.2/")
	f.Add("vintagestorymodinstall://../x@1")
	f.Fuzz(func(t *testing.T, raw string) {
		ref, err := ParseLink(raw)
		if err == nil && (!linkModID.MatchString(ref.ModID) || !linkVersion.MatchString(ref.Version)) {
			t.Fatalf("%q gave %+v", raw, ref)
		}
	})
}
