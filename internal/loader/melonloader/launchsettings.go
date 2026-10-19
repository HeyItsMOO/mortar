package melonloader

import (
	"fmt"
	"slices"

	"github.com/Rethunk-Tech/mortar/internal/loader"
)

const (
	settingConsole  = "console"
	settingLogLevel = "logLevel"
)

type logLevel struct {
	choice string
	args   []string
}

// logLevels are the log level choices and the launch arguments each adds. "debug" is MelonLoader's debug mode
// (--melonloader.debug); "all" adds Harmony's debug log level (--melonloader.harmonyloglevel 4, "Debug" in
// LoaderConfig.HarmonyLogVerbosity) and the game's own player log (--melonloader.captureplayerlogs). The arguments
// are read in MelonLoader/LoaderConfig.cs of LavaGang/MelonLoader.
var logLevels = []logLevel{
	{"default", nil},
	{"debug", []string{"--melonloader.debug"}},
	{"all", []string{"--melonloader.debug", "--melonloader.harmonyloglevel", "4", "--melonloader.captureplayerlogs"}},
}

// LaunchSettings are the profile's console window and log level.
func (Loader) LaunchSettings(profileDir string) ([]loader.LaunchSetting, error) {
	m := readMarker(profileDir)
	choices := make([]string, len(logLevels))
	for i, l := range logLevels {
		choices[i] = l.choice
	}
	level := m.LogLevel
	if !slices.Contains(choices, level) {
		level = "default"
	}
	return []loader.LaunchSetting{
		{ID: settingConsole, Value: fmt.Sprint(m.Console)},
		{ID: settingLogLevel, Choices: choices, Value: level},
	}, nil
}

// SetLaunchSetting records one option in the profile's marker.
func (Loader) SetLaunchSetting(profileDir, id, value string) error {
	m := readMarker(profileDir)
	switch id {
	case settingConsole:
		if value != "true" && value != "false" {
			return fmt.Errorf("console must be true or false, not %q", value)
		}
		m.Console = value == "true"
	case settingLogLevel:
		if !slices.ContainsFunc(logLevels, func(l logLevel) bool { return l.choice == value }) {
			return fmt.Errorf("unknown log level %q", value)
		}
		m.LogLevel = value
	default:
		return fmt.Errorf("MelonLoader has no setting %q", id)
	}
	return writeMarker(profileDir, m)
}

// settingArgs are the launch arguments for the profile's console and log level: the console is hidden unless the user
// chose to show it (--melonloader.hideconsole).
func settingArgs(profileDir string) []string {
	m := readMarker(profileDir)
	var args []string
	if !m.Console {
		args = append(args, "--melonloader.hideconsole")
	}
	for _, l := range logLevels {
		if l.choice == m.LogLevel {
			args = append(args, l.args...)
		}
	}
	return args
}
