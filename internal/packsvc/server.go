package packsvc

import (
	"context"
	"errors"
	"fmt"

	"github.com/Rethunk-Tech/mortar/internal/bridge"
	"github.com/Rethunk-Tech/mortar/internal/components"
	"github.com/Rethunk-Tech/mortar/internal/mod"
	"github.com/Rethunk-Tech/mortar/internal/queue"
)

// MirrorClient queues the Thunderstore packages of a client profile into a dedicated server's profile, so the server
// runs the mod list the players join with. The server keeps its own loader and config; a package already in the server
// profile is left as it is.
func (s *Service) MirrorClient(ctx context.Context, serverGame, serverProfile, clientProfile string) (Result, error) {
	info, ok := components.Game(serverGame)
	if !ok || info.Server == nil {
		return Result{}, fmt.Errorf("%s is not a dedicated server", serverGame)
	}
	d, err := s.r2zDraft(info.Server.Clients, clientProfile)
	if err != nil {
		return Result{}, err
	}
	res := Result{Game: serverGame, Profile: serverProfile, Unsupported: []string{}, Disabled: []string{}}
	var reqs []queue.Request
	for _, r := range d.Packages {
		if bridge.IsOwnListing(r.Native) || r.Native == info.LoaderPackage() {
			continue
		}
		req := queue.Request{Kind: queue.KindInstall, Game: serverGame, Profile: serverProfile, Package: r.Native, Version: r.Version, InferReason: true}
		if r.Disabled {
			res.Disabled = append(res.Disabled, r.Native)
			req.Disabled = []mod.ID{mod.NewID(mod.FormatThunderstore, r.Native)}
		}
		reqs = append(reqs, req)
	}
	if len(reqs) == 0 {
		return res, errors.New("the client profile holds no Thunderstore packages to mirror")
	}
	items, err := s.Queue.Add(ctx, reqs)
	res.Queued = len(items)
	return res, err
}
