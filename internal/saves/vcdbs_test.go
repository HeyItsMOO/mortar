package saves

import (
	"database/sql"
	"encoding/binary"
	"path/filepath"
	"testing"

	"github.com/Rethunk-Tech/mortar/internal/fsx"
)

func protoString(b []byte, num uint64, s string) []byte {
	b = binary.AppendUvarint(b, num<<3|2)
	b = binary.AppendUvarint(b, uint64(len(s)))
	return append(b, s...)
}

func TestScanReadsAVintageStoryWorld(t *testing.T) {
	dir := t.TempDir()
	var data []byte
	data = binary.AppendUvarint(data, 7<<3|5) // a fixed32 the reader skips
	data = append(data, 1, 2, 3, 4)
	data = protoString(data, vsWorldName, "Bjornheim")
	data = binary.AppendUvarint(data, 40<<3|3) // a group whose own name field must not win
	data = protoString(data, vsWorldName, "inner")
	data = binary.AppendUvarint(data, 40<<3|4)
	data = binary.AppendUvarint(data, vsTotalSecondsPlayed<<3)
	data = binary.AppendUvarint(data, 7200)
	data = protoString(data, vsLastSavedVersion, "1.21.4")
	data = protoString(data, vsPlayStyle, "surviveandbuild")
	conn, err := sql.Open("sqlite", filepath.Join(dir, "Bjornheim.vcdbs"))
	if err != nil {
		t.Fatal(err)
	}
	for _, q := range []string{"PRAGMA journal_mode=WAL", "CREATE TABLE gamedata (savegameid integer PRIMARY KEY, data BLOB)"} {
		if _, err := conn.ExecContext(t.Context(), q); err != nil {
			t.Fatal(err)
		}
	}
	if _, err := conn.ExecContext(t.Context(), "INSERT INTO gamedata VALUES (1, ?)", data); err != nil {
		t.Fatal(err)
	}
	if err := conn.Close(); err != nil {
		t.Fatal(err)
	}
	if err := fsx.WriteFile(filepath.Join(dir, "Broken.vcdbs"), []byte("not sqlite"), 0o600); err != nil {
		t.Fatal(err)
	}
	s := &Scanner{Dir: dir, Files: []string{"*.vcdbs"}, Companions: []string{".vcdbs-shm", ".vcdbs-wal"}, CacheDir: t.TempDir()}
	infos, err := s.Scan(t.Context(), nil)
	if err != nil || len(infos) != 2 {
		t.Fatalf("Scan = %+v, %v", infos, err)
	}
	for _, in := range infos {
		switch in.Folder {
		case "Bjornheim.vcdbs":
			if in.Name != "Bjornheim" || in.GameVersion != "1.21.4" || in.PlayStyle != "surviveandbuild" || in.MillisecondsPlayed != 7_200_000 || !in.Unrecorded {
				t.Errorf("world = %+v", in)
			}
		case "Broken.vcdbs":
			if in.Name != "" || in.Played == 0 {
				t.Errorf("an unreadable world should keep only its file details: %+v", in)
			}
		}
	}
}
