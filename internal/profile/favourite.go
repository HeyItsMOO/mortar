package profile

// SetFavourite stars a profile, or removes its star. Like its colour and icon it never touches mods/, so a running
// game does not block it.
func (s *Store) SetFavourite(game, id string, favourite bool) (Profile, error) {
	return s.update(game, id, func(p *Profile, _ string) error {
		p.Favourite = favourite
		return nil
	})
}
