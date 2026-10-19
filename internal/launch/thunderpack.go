package launch

import "regexp"

// The logs of the Thunderstore-packed loaders, each its own format.
var (
	// Lovely: `LEVEL - [♥] message` for its own lines and `LEVEL - [G] message` for the game's (lovely-core src/log.rs).
	lovelyHeader = regexp.MustCompile(`^(ERROR|WARN|INFO|DEBUG|TRACE) - (?:\[(♥|G)\] )?(.*)$`)
	// GDWeave logs through Serilog's file sink: `2024-05-01 12:34:56.789 +00:00 [WRN] message`.
	serilogHeader = regexp.MustCompile(`^\d{4}-\d\d-\d\d (\d\d:\d\d:\d\d)\.\d+ [+-]\d\d:\d\d \[(VRB|DBG|INF|WRN|ERR|FTL)\] ?(.*)$`)
	// ReturnOfModding and Hell2Modding: `[H:M:S.0000000][LEVEL/file.cpp:123] message` (ReturnOfModdingBase logger.cpp).
	romHeader = regexp.MustCompile(`^\[(\d+:\d+:\d+)\.\d+\]\[(DEBUG|INFO|WARNING|ERROR)/([^:\]]+):\d+\] ?(.*)$`)
	// Northstar's spdlog file pattern: `[2024-05-01] [12:34:56] [NORTHSTAR] [warning] message`.
	northstarHeader = regexp.MustCompile(`^\[\d{4}-\d\d-\d\d\] \[(\d\d:\d\d:\d\d)\] \[([^\]]+)\] \[(trace|debug|info|warning|error|critical)\] ?(.*)$`)
)

var lovelyLevels = map[string]Level{"ERROR": Error, "WARN": Warn, "INFO": Info, "DEBUG": Debug, "TRACE": Trace}

var serilogLevels = map[string]Level{"VRB": Trace, "DBG": Debug, "INF": Info, "WRN": Warn, "ERR": Error, "FTL": Alert}

var romLevels = map[string]Level{"DEBUG": Debug, "INFO": Info, "WARNING": Warn, "ERROR": Error}

var northstarLevels = map[string]Level{"trace": Trace, "debug": Debug, "info": Info, "warning": Warn, "error": Error, "critical": Alert}

func parseLovely(line string) (Entry, bool) {
	m := lovelyHeader.FindStringSubmatch(line)
	if m == nil {
		return Entry{}, false
	}
	mod := "Lovely"
	if m[2] == "G" {
		mod = "Game"
	}
	return Entry{Level: lovelyLevels[m[1]], Mod: mod, Message: m[3]}, true
}

func parseSerilog(line string) (Entry, bool) {
	m := serilogHeader.FindStringSubmatch(line)
	if m == nil {
		return Entry{}, false
	}
	return Entry{Time: m[1], Level: serilogLevels[m[2]], Mod: "GDWeave", Message: m[3]}, true
}

func parseROM(line string) (Entry, bool) {
	m := romHeader.FindStringSubmatch(line)
	if m == nil {
		return Entry{}, false
	}
	return Entry{Time: m[1], Level: romLevels[m[2]], Mod: m[3], Message: m[4]}, true
}

func parseNorthstar(line string) (Entry, bool) {
	m := northstarHeader.FindStringSubmatch(line)
	if m == nil {
		return Entry{}, false
	}
	return Entry{Time: m[1], Level: northstarLevels[m[3]], Mod: m[2], Message: m[4]}, true
}
