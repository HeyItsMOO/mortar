package fonts

import (
	"context"
	"os/exec"
	"time"
)

const listTimeout = 10 * time.Second

// List is the installed font families, from fontconfig.
func List() ([]string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), listTimeout)
	defer cancel()
	out, err := exec.CommandContext(ctx, "fc-list", ":", "family").Output()
	if err != nil {
		return nil, err
	}
	return ParseFcList(string(out)), nil
}
