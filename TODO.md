# TODO

Work that is decided but not built. `AGENTS.md` and `docs/` describe what
exists; this file is the only place that describes what does not.

Sections are unordered.

## shell completion does not place games after a groups or tools subverb

`mortar groups apply <game> <saved group> <profile>` and `mortar tools add|update|remove <game> …`
take the game as the word after the subverb. `positions` for `groups` always
returns `gameAt == 1` (`internal/cli/complete.go:107`), which is the subverb
slot. `tools` only moves the game to 2 when `words[1] == "run"` (`:116`);
add, update and remove stay at 1. Tab after `groups apply` therefore offers
no game ids. The same hole is `lan send <game> <profile> <peer>` (lan is not
in `positions` at all, so it falls through to `:180` as game 1 / profile 2)
and `queue add` never offering `--source` values.

Bare `groups <game>` and `tools <game>` already complete at position 1
(subverbs mixed with game ids, the mods pattern). That list form must keep
working. The missing piece is position 2 once a write subverb is chosen.

Rejected: treating every second word as a game. `groups delete` and
`groups rename` take a saved-group name there. `tools update|remove` take a
tool id after the game. Each subverb needs its own `gameAt` / `profileAt` /
tool-id slot, copied from the usage line in `internal/cli/cli.go` (`:2506`
groups, `:2635` tools, `:2640` lan send, `:2597` queue add).

This extends `positions` and the `__complete` tests. It does not change
dispatch or usage.

### Read

1. `internal/cli/complete.go:76` `positions` — `groups` at `:107` and `tools`
   at `:115`. Copy the `profile` farm branch at `:131` (`gameAt` 3 once the
   nested verb is known).
2. `internal/cli/complete.go:184` `complete` — position 1 for groups/tools
   already appends subverbs then games. Position 2 must not reuse `gameAt 1`.
3. `internal/cli/cli.go:2506` groups usage and `groups.apply` — apply
   is `game, saved group, profile`. create is `game, name, profile`.
4. `internal/cli/cli_test.go` `TestCompleteOffersVerbsGamesAndProfiles` —
   add cases that fail on `gameAt == 1` for `groups apply` and `tools add`.

### Traps

- **`groups <game>` is the list form.** Completing only subverbs at position
  1 was the old hole; mixing subverbs and games is required. A `positions`
  change that moves `gameAt` to 2 for every groups line removes game ids from
  `mortar groups <tab>`.
- **Saved-group names are not games.** After `groups apply stardew` the
  next word is a saved group, not a profile. Profile is third after the
  subverb (`cli.go:2498`).
- **`lan pair` takes `--code` / `--peer`, not a game.** Putting lan in the
  default `return 1, 2, 0` path offers fake profiles. Only `lan send` has a
  game.

### Acceptance

- `__complete groups apply` prints installed game ids. `__complete groups`
  still prints both `apply` and those ids.
- `__complete tools add` prints game ids. `__complete tools run <game>`
  still prints profiles, then tool ids.
- `__complete lan send` prints game ids. `__complete lan pair` prints
  nothing that looks like a game id from `games`.
- `__complete queue add stardew Farm 1 --source` prints the source ids the
  usage line names. `go test ./internal/cli/` stays green.

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

## `links` can enable and disable a source but cannot list owners

`links enable|disable --source nexus|thunderstore|curseforge` and `links
register` are wired (`internal/cli/more.go:137`, `internal/control/more.go:46`).
There is no `links` / `links list`. Who owns each scheme is already on disk
in the handler: `nxm.Handler.Owner` (`internal/nxm/handler.go:21`) and the
Downloads settings UI (`frontend/src/settings/sections/Downloads.tsx:193`).
`doctor` only reports Nexus handled-or-not (`internal/control/methods.go:1777`
`NxmHandled`). A script that toggles Thunderstore or CurseForge has to guess
or open Settings.

Shape: `links` with no subverb (or `links list`) calls a new `links` control
method that returns one row per `nxm.Schemes()` plus mortar://: scheme, owner
name, owner id, whether it is Mortar. CLI prints a table; `--json` is the
slice. No new setting. `complete.go:52` gains `list`.

Rejected: teaching people to parse `mortar doctor`. Doctor's report is a
prose blob and Nexus-only. Rejected: reading `settings.json` `nxmHandled`
from the CLI. The CLI must not open the data folder (`internal/cli/cli.go:2`).

### Read

1. `internal/nxm/handler.go:8` `Schemes` and `:21` `Owner`.
2. `internal/nxmsvc/service.go` `EnableSource` / `DisableSource` (same
   service `control/more.go:49` already uses).
3. `frontend/src/settings/sections/Downloads.tsx:193` — the GUI row this
   table matches.
4. `internal/cli/more.go:137` and `complete.go:52` — add list beside enable.

### Traps

- **Owner can fail per scheme.** One scheme's error is a row, not a failed
  command; otherwise Linux without a desktop database cannot list the rest.
- **VSModDB has a scheme too** (`settings.go` `VSModDBHandleLinks`). Enable
  CLI today names only nexus|thunderstore|curseforge (`more.go:162`). List
  every `Schemes()` entry; do not add vsmoddb to enable in the same change
  unless enable already supports it.
- **`links` with no subverb must not become a usage error** if list is the
  default; scripts that today get usage on `mortar links` would start
  succeeding.

### Acceptance

- `mortar links` (or `links list`) prints every registered scheme and whether
  Mortar owns it, with `--json` a slice of `{scheme,name,id,mine}`.
- Enable and disable keep their current argv and messages.
- A fake `Owner` in the control test can mark one scheme Mortar and one not.
  `go test ./internal/cli/ ./internal/control/` covers the method.

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
