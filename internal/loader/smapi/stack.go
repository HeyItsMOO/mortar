package smapi

import (
	"github.com/Rethunk-Tech/mortar/internal/loader"
	"github.com/Rethunk-Tech/mortar/internal/loader/dotnetstack"
)

// StackBlame names the mod frame nearest the throw of each exception stack in a SMAPI log.
func (Loader) StackBlame(log string) []loader.Blame {
	return dotnetstack.Blames(log, dotnetstack.SMAPI)
}
