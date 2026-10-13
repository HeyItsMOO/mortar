package profile

import (
	"maps"
	"slices"
)

// Unsourced is whether the source names no page to get the entry from again: a file the user picked, or a Nexus
// entry with no page id.
func (s Source) Unsourced() bool {
	return s.Kind == KindLocal || (s.Kind == KindNexus && s.ModID <= 0)
}

// withOwnFile is the source of an entry whose files the player replaced with an archive of their own: the same page,
// picture and names, so its links, details and update checks carry on, without what named the site's file.
func (s Source) withOwnFile(mods []Component) Source {
	s.FileID, s.Digest, s.Tag, s.Asset, s.Version = 0, "", "", "", ""
	if len(mods) > 0 {
		s.Version = mods[0].Version
	}
	return s
}

// NexusFile names a Nexus page and, where known, the file on it; FileID is 0 for an unknown file.
type NexusFile struct {
	ModID, FileID int
}

// SetNexusFiles records the Nexus page of each named entry that has no source of its own, which gives it that
// page's links and update checks, and the file of each that is on that page without one, which lets a share carry
// it. found maps entry keys to what was found.
func (s *Store) SetNexusFiles(game, id string, found map[string]NexusFile) (Profile, error) {
	return s.updateEntries(game, id, slices.Sorted(maps.Keys(found)), func(e *Entry, key string) error {
		f := found[key]
		if e.Source.Unsourced() {
			e.Source.Kind, e.Source.ModID = KindNexus, f.ModID
			if len(e.Mods) > 0 {
				e.Source.Version = e.Mods[0].Version
			}
		}
		if e.Source.Kind == KindNexus && e.Source.ModID == f.ModID && e.Source.FileID == 0 {
			e.Source.FileID = f.FileID
		}
		return nil
	})
}
