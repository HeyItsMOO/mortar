package configsvc

import (
	"fmt"
	"os"
	"slices"
)

// DeleteUnowned deletes a config file that no mod of the profile owns (one the Config page lists under Loader and
// other). A file a mod owns is refused, and so is any change while the profile's game runs.
func (s *Service) DeleteUnowned(game, profileID, file string) error {
	if err := s.refuseRunning(game, profileID); err != nil {
		return err
	}
	list, err := s.Mods(game, profileID)
	if err != nil {
		return err
	}
	i := slices.IndexFunc(list.Other, func(f ModFile) bool { return f.Name == file })
	if i < 0 {
		return fmt.Errorf("%q is not a config file without an owner in this profile", file)
	}
	var path string
	switch list.Other[i].Format {
	case FormatJSON:
		path, err = s.jsonPath(game, profileID, file)
	case FormatText:
		path, err = s.textPath(game, profileID, file)
	default:
		path, err = s.cfgPath(game, profileID, file)
	}
	if err != nil {
		return err
	}
	return os.Remove(path)
}
