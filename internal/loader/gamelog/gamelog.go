// Package gamelog holds the analyzers of logs that belong to a game rather than to a mod loader: the log of a game that
// has no loader (Vintage Story's client-main.log) is read by every analyzer here, and each recognises only its own
// format.
package gamelog

import "github.com/Rethunk-Tech/mortar/internal/loader"

var analyzers []loader.Analyzer

// Register adds an analyzer; it returns true so a package can register in a variable declaration.
func Register(a loader.Analyzer) bool {
	analyzers = append(analyzers, a)
	return true
}

// Analyze runs every registered analyzer over text.
func Analyze(text string) []loader.Finding {
	var out []loader.Finding
	for _, a := range analyzers {
		out = append(out, a.Analyze(loader.Logs{Loader: text})...)
	}
	return out
}
