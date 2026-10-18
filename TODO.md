# TODO

Work that is decided but not built. `AGENTS.md` and `docs/` describe what
exists; this file is the only place that describes what does not.

Sections are unordered.

## `--set` is a boolean flag and a value flag on the same parser

`parse` treats `--set` as a boolean (`internal/cli/cli.go:312` `c.setFlag =
true`). `game steam-launch-option --set` means write Steam's launch options
(`internal/cli/gamelaunch.go:14`). `mods menu --set <page>/<index>=<value>`
means the next positional is a GMCM assignment (`internal/cli/modsmenu.go:16`,
`internal/gmcm/setflag.go:10` `ParseSetFlag`).

`--set=General/0=true` is therefore `unknown flag` (`cli.go:462`), while
every other value flag in `parse` has an `=` form. Giving `--set` a value
would steal the next argv word from `steam-launch-option` if someone wrote
`--set leftover`. The two commands cannot share one parse rule without a
verb-aware split or a new flag name, which is a contract change.

Rejected: `--set` consuming the next word globally. `mortar game
steam-launch-option stardew --set` today sends `Set: true` and no extra
positional (`gamelaunch_test.go`). Rejected: documenting only the space
form. The rest of the CLI accepts `=`.

### Read

1. `internal/cli/cli.go:312` `--set` / `:314` `--clear` — booleans for Steam.
2. `internal/cli/modsmenu.go:16` — needs `c.setFlag` and `a[3]`.
3. `internal/cli/gamelaunch.go:10` and `gamelaunch_test.go` — `--set` with no
   value.
4. `internal/gmcm/setflag.go:10` — the `page/index=value` grammar.

### Traps

- **`=` is inside the GMCM spec.** `--set=General/0=true` has two equals.
  `strings.TrimPrefix(a, "--set=")` is the whole spec; do not split on the
  first `=` only if you later parse the flag name.
- **Steam `--set` must stay valueless.** A helper that always reads a value
  when `--set` is present breaks `steam-launch-option`.
- **`--clear` stays boolean.** It is only Steam's counterpart.

### Acceptance

- `mods menu <game> <profile> <mod> --set=Page/0=true` calls `mods.menu` with
  `Value` `Page/0=true` and exit 0. The space form still works.
- `game steam-launch-option <game> --set` still sends `Set: true` and does
  not demand a following word.
- `game steam-launch-option <game> --set=1` is a usage error, not a silent
  Steam write. `go test ./internal/cli/` covers both verbs.

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
