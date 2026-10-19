package thunderpack

import (
	"time"

	"github.com/Rethunk-Tech/mortar/internal/launch"
)

// newestFile is the file a glob names that was written last, "" when none exists.
func newestFile(glob string) string { return launch.NewestMatch(glob, time.Time{}) }
