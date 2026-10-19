// Package serverargs turns a dedicated server profile's settings (world name, port, password) into the server's
// launch arguments. The catalog says which arguments a server takes; the profile holds their values in server.json.
package serverargs

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"

	"github.com/Rethunk-Tech/mortar/internal/components"
	"github.com/Rethunk-Tech/mortar/internal/fsx"
)

// File is the profile's server settings, a JSON object of setting id to value.
const File = "server.json"

// Load reads the profile's server settings; none are set when the file is missing or unreadable.
func Load(profileDir string) map[string]string {
	values := map[string]string{}
	if b, err := fsx.ReadFile(filepath.Join(profileDir, File)); err == nil {
		_ = json.Unmarshal(b, &values)
	}
	return values
}

// Set stores one setting after checking it against the catalog; an empty value goes back to the default.
func Set(profileDir string, spec components.ServerSpec, id, value string) error {
	var arg *components.ServerArg
	for i := range spec.Args {
		if spec.Args[i].ID == id {
			arg = &spec.Args[i]
		}
	}
	if arg == nil {
		return fmt.Errorf("this server has no setting %q", id)
	}
	if value != "" && !arg.Matches(value) {
		return fmt.Errorf("%s does not accept that value", arg.Name)
	}
	values := Load(profileDir)
	if value == "" {
		delete(values, id)
	} else {
		values[id] = value
	}
	b, err := json.MarshalIndent(values, "", "  ")
	if err != nil {
		return err
	}
	// The file can hold a server password.
	if err := os.MkdirAll(profileDir, 0o700); err != nil {
		return err
	}
	return fsx.WriteFile(filepath.Join(profileDir, File), b, 0o600)
}

// Args is the server's command line after the executable: the fixed arguments, then each setting's flag and value.
// A setting the profile leaves unset takes its default; one with neither is left out, or fails when required. An error
// names the setting and never the value.
func Args(spec components.ServerSpec, values map[string]string) ([]string, error) {
	out := append([]string{}, spec.Fixed...)
	for _, a := range spec.Args {
		v := values[a.ID]
		if v == "" {
			v = a.Default
		}
		switch {
		case v == "" && a.Required:
			return nil, fmt.Errorf("set %s for this server first", a.Name)
		case v == "":
			continue
		case !a.Matches(v):
			return nil, errors.New(a.Name + " is not valid for this server")
		}
		out = append(out, a.Flag, v)
	}
	return out, nil
}
