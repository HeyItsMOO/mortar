package launch

import "regexp"

// Vintage Story writes `d.M.yyyy HH:mm:ss [Level] message` to the files in its Logs folder.
var vintageStoryHeader = regexp.MustCompile(`^\d{1,2}\.\d{1,2}\.\d{4} (\d\d:\d\d:\d\d) \[(\w+)\] ?(.*)$`)

// vintageStoryLevels maps the game's levels onto the console's; its others (Notification, Event, Chat, Audit, Build,
// StoryEvent, Worldgen) read as information.
var vintageStoryLevels = map[string]Level{
	"Fatal":        Alert,
	"Error":        Error,
	"Warning":      Warn,
	"Debug":        Debug,
	"VerboseDebug": Trace,
}

// vintageStoryVersion is the line Vintage Story logs at start: "Game Version: v1.21.5 (Stable)".
var vintageStoryVersion = regexp.MustCompile(`^Game Version: v(\d+(?:\.\d+)+)`)

// LogGameVersion is the game version a log message names, for a game whose loader does not read its own log.
func LogGameVersion(message string) string {
	if m := vintageStoryVersion.FindStringSubmatch(message); m != nil {
		return m[1]
	}
	return ""
}

func parseVintageStory(line string) (Entry, bool) {
	m := vintageStoryHeader.FindStringSubmatch(line)
	if m == nil {
		return Entry{}, false
	}
	level, ok := vintageStoryLevels[m[2]]
	if !ok {
		level = Info
	}
	return Entry{Time: m[1], Level: level, Message: m[3]}, true
}
