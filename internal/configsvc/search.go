package configsvc

import "strings"

// Hit is one setting a profile-wide search found: which mod's file holds it and where.
type Hit struct {
	ModID   string `json:"modId"`
	ModName string `json:"modName"`
	File    string `json:"file"`
	Section string `json:"section"`
	Key     string `json:"key"`
	Label   string `json:"label,omitempty"`
	Value   string `json:"value"`
}

// MaxHits bounds a search so a one-letter query does not return every setting of every mod.
const MaxHits = 200

// matches reports whether the query, already lower-cased, is in the entry's key, label or description, or in the name
// of its section.
func matches(q string, section Section, e Entry) bool {
	return strings.Contains(strings.ToLower(section.Name), q) ||
		strings.Contains(strings.ToLower(e.Key), q) ||
		strings.Contains(strings.ToLower(e.Label), q) ||
		strings.Contains(strings.ToLower(e.Description), q)
}

// hitsIn is the entries of one schema that match the query.
func hitsIn(q, modID, modName string, sc Schema) []Hit {
	var out []Hit
	for _, sec := range sc.Sections {
		for _, e := range sec.Entries {
			if matches(q, sec, e) {
				out = append(out, Hit{ModID: modID, ModName: modName, File: sc.File.Name, Section: sec.Name, Key: e.Key, Label: e.Label, Value: e.Value})
			}
		}
	}
	return out
}

// Search finds the settings, across every mod's config files in the profile, whose key, label, description or section
// holds the query. Text files have no entries and the in-game menu is searched like any other file.
func (s *Service) Search(game, profileID, query string) ([]Hit, error) {
	q := strings.ToLower(strings.TrimSpace(query))
	out := []Hit{}
	if q == "" {
		return out, nil
	}
	list, err := s.Mods(game, profileID)
	if err != nil {
		return nil, err
	}
	for _, m := range list.Mods {
		for _, f := range m.Files {
			if f.Format == FormatText {
				continue
			}
			sc, err := s.Schema(game, profileID, string(m.ID), f.Name)
			if err != nil {
				continue
			}
			out = append(out, hitsIn(q, string(m.ID), m.Name, sc)...)
			if len(out) >= MaxHits {
				return out[:MaxHits], nil
			}
		}
	}
	return out, nil
}
