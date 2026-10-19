package bepinex5

import "github.com/Rethunk-Tech/mortar/internal/loader"

// ArmIntroSkip writes the Mortar BepInEx Bridge's intro request for the profile in dir, or removes it.
func (Loader) ArmIntroSkip(dir string, skip loader.IntroSkip) error {
	return loader.WriteIntroSkip(dir, skip)
}
