package smapi

import "github.com/Rethunk-Tech/mortar/internal/loader"

// ArmIntroSkip writes the Mortar SMAPI Bridge's intro request for the profile in dir, or removes it. SMAPI's title
// screen is the game's main menu, so both levels skip to its buttons.
func (Loader) ArmIntroSkip(dir string, skip loader.IntroSkip) error {
	return loader.WriteIntroSkip(dir, skip)
}
