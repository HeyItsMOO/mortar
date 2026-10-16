package share

import (
	"encoding/json"
	"testing"

	"github.com/Rethunk-Tech/mortar/internal/profile"
)

func TestAModDBRefRoundTripsAndMatchesItsEntry(t *testing.T) {
	ref := Ref{VSModDB: "890-4405", FileID: 61448, Version: "1.14.3"}
	b, err := json.Marshal(ref)
	if err != nil {
		t.Fatal(err)
	}
	got, err := parseRef(b)
	if err != nil || got.VSModDB != ref.VSModDB || got.FileID != ref.FileID || got.Version != ref.Version || !got.valid() {
		t.Fatalf("%s read back as %+v, %v", b, got, err)
	}
	e := profile.Entry{Source: profile.Source{Kind: profile.KindVSModDB, Name: "890-4405", FileID: 61448, Version: "1.14.3"}}
	if !got.MatchesEntry(e) {
		t.Fatal("the ref does not match the entry it came from")
	}
	for _, bad := range []Ref{{VSModDB: "890:4405", FileID: 1, Version: "1"}, {VSModDB: "890-4405", Version: "1"}, {VSModDB: "890-4405", FileID: 1}} {
		if bad.valid() {
			t.Fatalf("%+v was accepted", bad)
		}
	}
}
