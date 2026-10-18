# TODO

Work that is decided but not built. `AGENTS.md` and `docs/` describe what
exists; this file is the only place that describes what does not.

Sections are unordered.

## Report a bug and Help have no Discord route

Decided 2026-10-18 (NOMAD) in `docs/design.md:21`. Blocked on the Discord
remake in Rethunk-Tech/mortar-discord creating the forum channels. Not a
CLI gap: the Help menu is GitHub-only today.

**Report a bug** (`frontend/src/shell/BugReportDialog.tsx:24`, submit around
the `BugURL` call) asks "Post on Discord or GitHub?" and remembers the last
choice. Discord copies the report, trimmed to 2000 characters, writes the
full diagnostics as a `.txt`, and opens
`https://mortar.rethunk.tech/go/bug-reports/`. GitHub keeps
`internal/support/service.go` `BugURL`.

**Help** (`frontend/src/shell/AppMenu.tsx:225`) gains "Ask on Discord",
opening `/go/help/`. Site redirects `/go/bug-reports/` and `/go/help/` to
the forum channels.

### Read

1. `docs/design.md:21` — the decided shape; do not relitigate.
2. `frontend/src/shell/BugReportDialog.tsx:15` `BugURL` and `:24` the dialog.
3. `frontend/src/shell/AppMenu.tsx:225` Help items.
4. `internal/support/service.go` `BugURL`.

### Traps

- **Do not ship the Discord choice before the site routes exist.** A 404
  from the installed build is worse than GitHub-only.
- **Discord's 2000-character limit is bytes in the product sense of the
  paste box.** Trim before copy; the `.txt` is the remainder.
- **Last choice is a new setting or a small local store.** Prefer an
  existing app-scoped pref if one fits; do not invent a second remember
  path.

### Acceptance

- Both routes open the right target from the installed build.
- Trimmed clipboard text pastes into a forum post without hitting the
  limit. GitHub prefilled issues still work when that radio is selected.
