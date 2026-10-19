package packsvc

import (
	"context"
	"errors"
	"fmt"

	"github.com/Rethunk-Tech/mortar/internal/bridge"
	"github.com/Rethunk-Tech/mortar/internal/components"
	"github.com/Rethunk-Tech/mortar/internal/mod"
	"github.com/Rethunk-Tech/mortar/internal/queue"
	"github.com/Rethunk-Tech/mortar/internal/serverargs"
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

// ServerSetting is one launch setting of a dedicated server profile as the settings form shows it. A secret's value
// never leaves Mortar: Set says whether one is saved.
type ServerSetting struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Hint     string `json:"hint"`
	Value    string `json:"value"`
	Default  string `json:"default"`
	Pattern  string `json:"pattern"`
	Required bool   `json:"required"`
	Secret   bool   `json:"secret"`
	Set      bool   `json:"set"`
}

// ServerForm is a server profile's settings form. Clients is empty for a game that is not a dedicated server.
type ServerForm struct {
	Clients    string          `json:"clients"`
	ClientName string          `json:"clientName"`
	Settings   []ServerSetting `json:"settings"`
}

// ServerSettings reads the form for the profile.
func (s *Service) ServerSettings(gameID, profileID string) (ServerForm, error) {
	info, ok := components.Game(gameID)
	if !ok || info.Server == nil {
		return ServerForm{Settings: []ServerSetting{}}, nil
	}
	dir, err := s.Profiles.ProfileDir(gameID, profileID)
	if err != nil {
		return ServerForm{}, err
	}
	values := serverargs.Load(dir)
	form := ServerForm{Clients: info.Server.Clients, Settings: []ServerSetting{}}
	if client, ok := components.Game(info.Server.Clients); ok {
		form.ClientName = client.Name
	}
	for _, a := range info.Server.Args {
		set := ServerSetting{ID: a.ID, Name: a.Name, Hint: a.Hint, Default: a.Default, Pattern: a.Pattern, Required: a.Required, Secret: a.Secret, Set: values[a.ID] != ""}
		if !a.Secret {
			set.Value = values[a.ID]
		}
		form.Settings = append(form.Settings, set)
	}
	return form, nil
}

// SetServerSetting saves one setting after the catalog's pattern accepts it; an empty value goes back to the default.
func (s *Service) SetServerSetting(gameID, profileID, id, value string) error {
	info, ok := components.Game(gameID)
	if !ok || info.Server == nil {
		return fmt.Errorf("%s is not a dedicated server", gameID)
	}
	dir, err := s.Profiles.ProfileDir(gameID, profileID)
	if err != nil {
		return err
	}
	return serverargs.Set(dir, *info.Server, id, value)
}
