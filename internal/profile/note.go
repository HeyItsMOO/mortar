package profile

import (
	"errors"
	"fmt"
	"strings"
	"unicode"
	"unicode/utf8"
)

const (
	// MaxEntryNote caps an entry's note, in characters.
	MaxEntryNote = 500
	// MaxEntryTags is how many tags an entry may hold.
	MaxEntryTags = 8
	// MaxEntryTag caps one tag, in characters.
	MaxEntryTag = 24
)

// CleanTag trims a tag and reports whether it is a usable one: non-empty, within MaxEntryTag runes, no control characters.
func CleanTag(raw string) (string, bool) {
	tag := strings.TrimSpace(raw)
	ok := tag != "" && utf8.RuneCountInString(tag) <= MaxEntryTag && !strings.ContainsFunc(tag, unicode.IsControl)
	return tag, ok
}

// CleanEntryNoteTags trims a note and tags and checks the caps.
func CleanEntryNoteTags(note string, tags []string) (string, []string, error) {
	note = strings.TrimSpace(note)
	if n := utf8.RuneCountInString(note); n > MaxEntryNote {
		return "", nil, fmt.Errorf("note is longer than %d characters", MaxEntryNote)
	}
	out := make([]string, 0, len(tags))
	seen := map[string]bool{}
	for _, raw := range tags {
		if strings.TrimSpace(raw) == "" {
			continue
		}
		tag, ok := CleanTag(raw)
		if !ok {
			return "", nil, fmt.Errorf("a tag is longer than %d characters or has control characters", MaxEntryTag)
		}
		key := strings.ToLower(tag)
		if seen[key] {
			continue
		}
		seen[key] = true
		out = append(out, tag)
	}
	if len(out) > MaxEntryTags {
		return "", nil, fmt.Errorf("more than %d tags", MaxEntryTags)
	}
	if len(out) == 0 {
		out = nil
	}
	return note, out, nil
}

// SetEntryNoteTags records the note and tags on one profile entry.
func (s *Store) SetEntryNoteTags(game, id, key, note string, tags []string) (Profile, error) {
	note, tags, err := CleanEntryNoteTags(note, tags)
	if err != nil {
		return Profile{}, err
	}
	return s.patchEntry(game, id, key, func(e *Entry) error {
		e.Note = note
		e.Tags = tags
		return nil
	})
}

// MaxDisplayField caps an entry's display name, author or version, in characters.
const MaxDisplayField = 100

func cleanDisplay(label, raw string) (string, error) {
	v := strings.TrimSpace(raw)
	if utf8.RuneCountInString(v) > MaxDisplayField || strings.ContainsFunc(v, unicode.IsControl) {
		return "", fmt.Errorf("the %s is longer than %d characters or has control characters", label, MaxDisplayField)
	}
	return v, nil
}

// SetEntryDisplay sets the name, author and version this profile shows for an entry that holds one mod; a blank value
// goes back to the mod's own. The mod's files are not touched.
func (s *Store) SetEntryDisplay(game, id, key, name, author, version string) (Profile, error) {
	var vals [3]string
	for i, f := range []struct{ label, raw string }{{"name", name}, {"author", author}, {"version", version}} {
		v, err := cleanDisplay(f.label, f.raw)
		if err != nil {
			return Profile{}, err
		}
		vals[i] = v
	}
	return s.patchEntry(game, id, key, func(e *Entry) error {
		if len(e.Mods) != 1 {
			return errors.New("this download holds several mods, so it has no single name to change")
		}
		e.DisplayName, e.DisplayAuthor, e.DisplayVersion = vals[0], vals[1], vals[2]
		return nil
	})
}
