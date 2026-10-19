// Package vslog reads the errors Vintage Story's mod loader writes to client-main.log and server-main.log: a mod that
// is missing a dependency and one that threw while starting.
package vslog

import (
	"regexp"
	"strings"

	"github.com/Rethunk-Tech/mortar/internal/loader"
	"github.com/Rethunk-Tech/mortar/internal/loader/gamelog"
)

var _ = gamelog.Register(analyzer{})

type analyzer struct{}

func (analyzer) ID() string { return "vintagestory" }

// The messages are seen in the game's own logs (client-main.log pasted into GitHub issues for Maltiez' crossbows,
// Yang Transport, Campaign Cartographer and others); each line is `d.M.yyyy HH:mm:ss [Error] [modid] message`.
var (
	header     = regexp.MustCompile(`^\d{1,2}\.\d{1,2}\.\d{4} \d\d:\d\d:\d\d \[(Error|Fatal)\] \[([^\]\s]+)\] ?(.*)$`)
	dependency = regexp.MustCompile(`^\s+(\S+?)@(\S+) - (.*)$`)
)

const (
	unresolved  = "Could not resolve some dependencies:"
	startFailed = "An exception was thrown when trying to start the mod:"
	loadFailed  = "An exception was thrown when trying to load assembly:"
)

func (analyzer) Analyze(logs loader.Logs) []loader.Finding {
	var out []loader.Finding
	lines := strings.Split(logs.Loader, "\n")
	add := func(kind, mod, msg, dep string, n int) {
		out = append(out, loader.Finding{Kind: kind, Plugin: mod, Message: msg, Dependency: dep, Line: n, Source: "client-main.log"})
	}
	for i, raw := range lines {
		m := header.FindStringSubmatch(strings.TrimRight(raw, "\r"))
		if m == nil {
			continue
		}
		mod, msg := m[2], m[3]
		switch {
		case msg == unresolved:
			// The dependencies follow, one line each, under the same mod.
			for j := i + 1; j < len(lines); j++ {
				next := header.FindStringSubmatch(strings.TrimRight(lines[j], "\r"))
				if next == nil || next[2] != mod {
					break
				}
				d := dependency.FindStringSubmatch(next[3])
				if d == nil {
					continue
				}
				switch {
				case d[3] == "Missing":
					add("missing-dependency", mod, "needs "+d[1]+" "+d[2]+", which is not installed", d[1], j+1)
				case strings.Contains(d[3], "has dependency errors itself"):
					add("dependency-not-loaded", mod, "needs "+d[1]+", which failed to load", d[1], j+1)
				default:
					add("incompatible-version", mod, "needs "+d[1]+" "+d[2]+": "+d[3], d[1], j+1)
				}
			}
		case msg == startFailed || msg == loadFailed:
			add("load-exception", mod, firstException(lines[i+1:]), "", i+1)
		case strings.Contains(msg, "declared as code mod, but there are no .dll files"):
			add("load-exception", mod, strings.TrimPrefix(msg, "Exception: "), "", i+1)
		}
	}
	return out
}

// firstException is the exception line under a header, which names what threw.
func firstException(rest []string) string {
	for _, l := range rest {
		if l = strings.TrimSpace(l); l != "" {
			return l
		}
	}
	return "threw an exception"
}
