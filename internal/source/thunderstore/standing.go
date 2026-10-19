package thunderstore

import (
	"context"
	"strings"

	"github.com/Rethunk-Tech/mortar/internal/source"
)

var _ source.StandingChecker = Driver{}

// Standings flags the packages the community's index no longer lists. An id is "community/Namespace-Name" because the
// index is per community; the answer is keyed by the id as given. A deprecated package is still listed (Deprecated
// reports those), so only a taken-down one is "removed". An empty or unreadable index flags nothing.
func (d Driver) Standings(ctx context.Context, version string, ids []string) (map[string]source.Standing, error) {
	byKey := map[string][]string{}
	for _, id := range ids {
		if key, name, ok := strings.Cut(id, "/"); ok {
			byKey[key] = append(byKey[key], name)
		}
	}
	out := map[string]source.Standing{}
	for key, names := range byKey {
		pk, err := d.packages(ctx, key, source.UserAgentWithSite(version))
		if err != nil {
			return nil, err
		}
		if len(pk) == 0 {
			continue
		}
		listed := make(map[string]bool, len(pk))
		for _, p := range pk {
			listed[packageID(p.Owner, p.Name)] = true
		}
		for _, name := range names {
			if !listed[strings.ToLower(name)] {
				out[key+"/"+name] = source.Standing{State: "removed"}
			}
		}
	}
	return out, nil
}
