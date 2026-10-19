package vslog

import (
	"reflect"
	"testing"

	"github.com/Rethunk-Tech/mortar/internal/loader"
)

// The lines are from client-main.log files users pasted into GitHub issues (Maltiez' crossbows, Yang Transport, Immersive
// Light), dates and all.
const sample = `23.6.2024 12:28:28 [Notification] Loaded 3 mods
23.6.2024 12:28:28 [Error] [maltiezcrossbows] Could not resolve some dependencies:
23.6.2024 12:28:28 [Error] [maltiezcrossbows]     fsmlib@0.4.1 - Missing
7.9.2026 00:10:18 [Error] [yttdiagonals] Could not resolve some dependencies:
7.9.2026 00:10:18 [Error] [yttdiagonals]     yangtransport@0.7.5 - Dependency 'yangtransport.zip' (yangtransport) has dependency errors itself
3.9.2026 17:09:20 [Error] [immersivelight] An exception was thrown when trying to start the mod:
System.NullReferenceException: Object reference not set to an instance of an object.
   at ImmersiveLight.ImmersiveLightModSystem.Start()
3.9.2026 17:09:20 [Error] Failed to run mod phase Start for mod ImmersiveLight.ImmersiveLightModSystem
`

func TestAnalyzeReadsDependencyAndStartFailures(t *testing.T) {
	got := analyzer{}.Analyze(loader.Logs{Loader: sample})
	want := []loader.Finding{
		{Kind: "missing-dependency", Plugin: "maltiezcrossbows", Message: "needs fsmlib 0.4.1, which is not installed", Dependency: "fsmlib", Line: 3, Source: "client-main.log"},
		{Kind: "dependency-not-loaded", Plugin: "yttdiagonals", Message: "needs yangtransport, which failed to load", Dependency: "yangtransport", Line: 5, Source: "client-main.log"},
		{Kind: "load-exception", Plugin: "immersivelight", Message: "System.NullReferenceException: Object reference not set to an instance of an object.", Line: 6, Source: "client-main.log"},
	}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("got %+v\nwant %+v", got, want)
	}
}
