package saves

import (
	"context"
	"database/sql"
	"encoding/binary"
	"errors"
	"math"
	"path"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/Rethunk-Tech/mortar/internal/fsx"

	_ "modernc.org/sqlite"
)

// SaveGame fields of a Vintage Story world's gamedata row, from the protobuf schema github.com/bluelightning32/vs-proto
// generates from the game (schema-1.21.0.rc.3.proto).
const (
	vsWorldName          = 13
	vsTotalSecondsPlayed = 14
	vsLastSavedVersion   = 21
	vsPlayStyle          = 29
	vsSavegameIdentifier = 34
)

var errBadProto = errors.New("the world's game data is not a protobuf message")

// readWorld fills a Vintage Story world's name, play style, game version and play time from the one gamedata row of
// its .vcdbs, a SQLite database holding a protobuf SaveGame.
func readWorld(ctx context.Context, file string, info *Info) error {
	conn, err := sql.Open("sqlite", fsx.ReadOnlySQLiteURI(file))
	if err != nil {
		return err
	}
	defer func() { _ = conn.Close() }()
	var data []byte
	if err := conn.QueryRowContext(ctx, "SELECT data FROM gamedata LIMIT 1").Scan(&data); err != nil {
		return err
	}
	return eachField(data, func(num, v uint64, b []byte) {
		switch num {
		case vsWorldName:
			info.Name = string(b)
		case vsTotalSecondsPlayed:
			// An int32 in the game; a negative one is a broken count, not a play time.
			if v <= math.MaxInt32 {
				info.MillisecondsPlayed = int64(v) * 1000
			}
		case vsLastSavedVersion:
			info.GameVersion = string(b)
		case vsPlayStyle:
			info.PlayStyle = string(b)
		case vsSavegameIdentifier:
			info.WorldID = string(b)
		}
	})
}

// eachField calls f with each top-level field of a protobuf message: a varint's value, or a length-delimited field's
// bytes. Fixed-width fields and groups (protobuf-net writes some nested objects as groups) are skipped.
func eachField(msg []byte, f func(num, v uint64, b []byte)) error {
	depth := 0
	for len(msg) > 0 {
		key, n := binary.Uvarint(msg)
		if n <= 0 {
			return errBadProto
		}
		msg = msg[n:]
		num := key >> 3
		switch key & 7 {
		case 0:
			v, n := binary.Uvarint(msg)
			if n <= 0 {
				return errBadProto
			}
			msg = msg[n:]
			if depth == 0 {
				f(num, v, nil)
			}
		case 1, 5:
			size := 8
			if key&7 == 5 {
				size = 4
			}
			if len(msg) < size {
				return errBadProto
			}
			msg = msg[size:]
		case 2:
			l, n := binary.Uvarint(msg)
			if n <= 0 || l > math.MaxInt32 {
				return errBadProto
			}
			size, rest := int(l), msg[n:]
			if size > len(rest) {
				return errBadProto
			}
			if depth == 0 {
				f(num, 0, rest[:size])
			}
			msg = rest[size:]
		case 3:
			depth++
		case 4:
			if depth == 0 {
				return errBadProto
			}
			depth--
		default:
			return errBadProto
		}
	}
	return nil
}

// worldIDPattern is the shape of a world's SavegameIdentifier (a GUID), which names files outside the saves folder.
var worldIDPattern = regexp.MustCompile(`^[0-9A-Fa-f-]{1,64}$`)

// LinkedOf lists the files outside the saves folder that belong to save name, as slash paths under Dir's parent:
// each Linked pattern with {uuid} filled from the world's own identifier (a Vintage Story world's minimap,
// Maps/<uuid>.db). Only those that exist are listed.
func (l Layout) LinkedOf(ctx context.Context, name string) []string {
	if len(l.Linked) == 0 || !l.IsSave(name) || !strings.EqualFold(path.Ext(name), ".vcdbs") {
		return nil
	}
	var info Info
	if readWorld(ctx, filepath.Join(l.Dir, filepath.FromSlash(name)), &info) != nil || !worldIDPattern.MatchString(info.WorldID) {
		return nil
	}
	var out []string
	for _, p := range l.Linked {
		rel := strings.ReplaceAll(p, "{uuid}", info.WorldID)
		if fsx.IsFile(filepath.Join(filepath.Dir(l.Dir), filepath.FromSlash(rel))) {
			out = append(out, rel)
		}
	}
	return out
}
