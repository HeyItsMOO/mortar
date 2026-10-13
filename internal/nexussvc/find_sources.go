package nexussvc

import (
	"context"
	"errors"
	"slices"
	"strings"
	"sync"
	"unicode"

	"github.com/Rethunk-Tech/mortar/internal/meta"
	"github.com/Rethunk-Tech/mortar/internal/mod"
	"github.com/Rethunk-Tech/mortar/internal/profile"
)

// pageFetches bounds the dataset pages read at once while telling candidate pages apart.
const pageFetches = 8

// FoundSources is the profile after FindSources, with how many source-less entries got a Nexus page and how many
// were left as they were.
type FoundSources struct {
	Profile profile.Profile `json:"profile"`
	Found   int             `json:"found"`
	Left    int             `json:"left"`
}

// FindSources gives each entry of the profile that has no source the Nexus page that publishes its mods, so mods
// copied in from a folder or another manager get their page and update checks back. Where the mod dataset lists
// several pages for an entry (reuploads, translations), the page is taken only when the installed version and the
// author single one out.
func (s *Service) FindSources(ctx context.Context, gameID, profileID string) (FoundSources, error) {
	if s.Profiles == nil {
		return FoundSources{}, errors.New("profiles are unavailable")
	}
	p, err := s.profileByID(gameID, profileID)
	if err != nil {
		return FoundSources{}, err
	}
	index, err := s.meta.Index(ctx)
	if err != nil {
		return FoundSources{}, err
	}
	candidates := map[string][]int{}
	var unsure []int
	left := 0
	for _, e := range p.Entries {
		if !e.Source.Unsourced() {
			continue
		}
		ids := candidatePages(e.Mods, index)
		if len(ids) == 0 {
			left++
			continue
		}
		candidates[e.Key] = ids
		if len(ids) > 1 {
			unsure = append(unsure, ids...)
		}
	}
	listed := s.datasetPages(ctx, unsure)
	pages := map[string]int{}
	for _, e := range p.Entries {
		ids := candidates[e.Key]
		if len(ids) > 1 {
			ids = narrowPages(e.Mods, ids, listed)
		}
		if len(ids) == 1 {
			pages[e.Key] = ids[0]
		} else if len(ids) > 1 {
			left++
		}
	}
	if len(pages) > 0 {
		if p, err = s.Profiles.SetNexusPages(gameID, profileID, pages); err != nil {
			return FoundSources{}, err
		}
	}
	return FoundSources{Profile: p, Found: len(pages), Left: left}, nil
}

// datasetPages reads the dataset's record of each page; one that cannot be read is left out.
func (s *Service) datasetPages(ctx context.Context, ids []int) map[int]meta.Page {
	slices.Sort(ids)
	ids = slices.Compact(ids)
	out := make(map[int]meta.Page, len(ids))
	var mu sync.Mutex
	var wg sync.WaitGroup
	slots := make(chan struct{}, pageFetches)
	for _, id := range ids {
		wg.Go(func() {
			slots <- struct{}{}
			defer func() { <-slots }()
			page, err := s.meta.Page(ctx, id)
			if err != nil {
				return
			}
			mu.Lock()
			out[id] = page
			mu.Unlock()
		})
	}
	wg.Wait()
	return out
}

// candidatePages are the Nexus pages that publish every listed mod the index knows, lowest id first.
func candidatePages(mods []profile.Component, index map[string][]meta.Ref) []int {
	var pages []int
	known := false
	for _, m := range mods {
		if m.ID.Format() != mod.FormatSMAPI {
			continue
		}
		var own []int
		for _, r := range index[strings.ToLower(m.ID.Local())] {
			if strings.EqualFold(r.Site, "nexus") {
				own = append(own, r.ID)
			}
		}
		if len(own) == 0 {
			continue
		}
		if !known {
			pages, known = own, true
			continue
		}
		pages = slices.DeleteFunc(pages, func(id int) bool { return !slices.Contains(own, id) })
	}
	slices.Sort(pages)
	return pages
}

// narrowPages keeps the candidates that publish one of the mods at its installed version, then those by an author
// of one; a test no candidate passes is skipped. It returns ids unchanged when a candidate's page was not read,
// since the page left out could be the right one.
func narrowPages(mods []profile.Component, ids []int, listed map[int]meta.Page) []int {
	for _, id := range ids {
		if _, ok := listed[id]; !ok {
			return ids
		}
	}
	for _, passes := range []func(meta.Page) bool{
		func(p meta.Page) bool { return publishesInstalled(p, mods) },
		func(p meta.Page) bool { return writtenBy(p, mods) },
	} {
		var kept []int
		for _, id := range ids {
			if passes(listed[id]) {
				kept = append(kept, id)
			}
		}
		if len(kept) > 0 {
			ids = kept
		}
	}
	return ids
}

func publishesInstalled(p meta.Page, mods []profile.Component) bool {
	for _, f := range p.Downloads {
		for _, published := range f.Mods {
			if slices.ContainsFunc(mods, func(m profile.Component) bool {
				return strings.EqualFold(m.ID.Local(), published.UniqueID) && m.Version == published.Version
			}) {
				return true
			}
		}
	}
	return false
}

// writtenBy matches names loosely, since a manifest's author is free text ("A, B (original author)") and a page's
// is an account name.
func writtenBy(p meta.Page, mods []profile.Component) bool {
	page := lettersOf(p.Author)
	if page == "" {
		return false
	}
	return slices.ContainsFunc(mods, func(m profile.Component) bool {
		author := lettersOf(m.Author)
		return author != "" && (strings.Contains(author, page) || strings.Contains(page, author))
	})
}

func lettersOf(s string) string {
	return strings.Map(func(r rune) rune {
		if unicode.IsLetter(r) || unicode.IsDigit(r) {
			return unicode.ToLower(r)
		}
		return -1
	}, s)
}
