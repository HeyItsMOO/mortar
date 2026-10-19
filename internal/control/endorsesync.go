package control

import (
	"context"
	"errors"
	"fmt"
	"strconv"

	"github.com/Rethunk-Tech/mortar/internal/syncsvc"
)

// SyncStatus is the sync folder's waiting revisions and the profiles stalled on another machine's files.
type SyncStatus struct {
	Offers  []syncsvc.Offer `json:"offers"`
	Stalled []syncsvc.Stall `json:"stalled"`
}

// nexusEndorse endorses the Nexus mod p.ID at p.Version, or withdraws the endorsement with p.Remove.
func (s *Services) nexusEndorse(ctx context.Context, p Params) (string, error) {
	id, err := strconv.Atoi(p.ID)
	if err != nil || id <= 0 {
		return "", fmt.Errorf("endorse needs a Nexus mod id, not %q", p.ID)
	}
	if p.Remove {
		return s.Nexus.Abstain(ctx, p.Game, id, p.Version)
	}
	return s.Nexus.Endorse(ctx, p.Game, id, p.Version)
}

// syncCall scans the sync folder and reports it, or answers the offer for profile p.ID (its id in the sync folder)
// with p.Value, theirs or mine.
func (s *Services) syncCall(ctx context.Context, method string, p Params) (any, error) {
	if s.Sync == nil {
		return nil, errors.New("sync is unavailable")
	}
	offers, err := s.Sync.Scan(ctx)
	if err != nil {
		return nil, err
	}
	if method == "sync.status" {
		return SyncStatus{Offers: offers, Stalled: s.Sync.Stalled()}, nil
	}
	for _, o := range offers {
		if o.Game == p.Game && o.Remote == p.ID {
			return nil, s.Sync.Resolve(ctx, o.Game, o.Remote, o.Revision, p.Value)
		}
	}
	return nil, fmt.Errorf("no change is waiting for %s %s", p.Game, p.ID)
}
