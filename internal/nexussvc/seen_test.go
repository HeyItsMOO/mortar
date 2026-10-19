package nexussvc

import "testing"

func TestMarkSeenKeepsNexusAndOtherSourcesApart(t *testing.T) {
	t.Parallel()
	dir := t.TempDir()
	s := &Service{}
	if err := s.MarkSeen("541", 1, ""); err == nil {
		t.Fatal("marking before the store opens must fail")
	}
	if err := s.UseDataDir(dir); err != nil {
		t.Fatal(err)
	}
	for _, k := range []string{""} {
		if err := s.MarkSeen(k, 1, "1"); err == nil {
			t.Fatalf("empty key accepted")
		}
	}
	if err := s.MarkSeen("541", 7, "1.2"); err != nil {
		t.Fatal(err)
	}
	if err := s.MarkSeen("github:me/mod", 0, "v3"); err != nil {
		t.Fatal(err)
	}
	s2 := &Service{}
	if err := s2.UseDataDir(dir); err != nil {
		t.Fatal(err)
	}
	got := s2.Seen()
	if got["541"].NewestChange != "1.2" || got["github:me/mod"].NewestChange != "v3" {
		t.Fatalf("reloaded %+v", got)
	}
}
