# Mortar: decided, not yet built

Decided work, short enough to build cold. Delete an item in the change that lands it; the code and its commits are the record. Screens and styling: [gui-design.md](gui-design.md). Standing rules: [AGENTS.md](../AGENTS.md).

## Release

- Drop the `Rethunk-AI/wails` replace in `go.mod` and pin a tagged beta once one carries what branch `mortar/v3-next` adds to upstream master: #6202 (OnUpdateApplied, with WEP #6203), #6199 (service methods fall back to `Options.MarshalError`; `errorkind_test.go` relies on it), #6240 (single-instance lock released at the start of shutdown), #6197 (GTK4 transparency), #6281 and #6282 (session-bus fallbacks), #6283 (GTK4 drop motion), #6284 (tray Menu property), #6285 (server-mode shutdown hooks), #6287 (pre-Run main-thread queue), WEPs #6243 (local linuxdeploy) and #6244 (`-nopack`), and the fork-only apply-on-exit.
- **NOMAD-only** (Windows Steam with Stardew and SMAPI): set `"<game>\StardewModdingAPI.exe" %command%`, Play once from an account whose user name has a space, and check that `%APPDATA%\StardewValley\ErrorLogs\SMAPI-latest.txt` names the profile's `mods` folder as one path. Otherwise the Steam hand-off needs another form ([architecture.md](architecture.md#launch)). In the same sitting, check that a direct launch with **SMAPI console window** on shows SMAPI's output.

## Ready to build

### The Sims 4 before a release carries it

- **Verify** on a real install and record in [sims4.md](sims4.md): the `Options.ini` section header and whether key names match case-insensitively, a localized Documents folder name ("Die Sims 4"), a DX9 or legacy executable, the stock `Resource.cfg` text, EA's statement of the `.ts4script` depth limit, and `gameProcesses`.
- **NOMAD-only** (Steam under Proton, EA App on Windows): a modded profile launches with its script mods running; the game keeps `scriptmodsenabled` in the profile's `Options.ini` copy after a restart; Tray files appear in the game's library; the player's own Mods, saves and `Options.ini` are identical after quitting.
- **Decide** how Windows placement copes with large profiles: every Play places every file again (`internal/deploy/place.go`), which is several times slower on Windows than on Linux (`MORTAR_SCALE=1 go test ./internal/loader/folder -run ThreeThousand -v`). Options: show progress; leave files unchanged since the last Play in place; link files where the volume allows, which needs an answer for a mod that rewrites its own file.
- **Measure** the same test with the Mods folder inside a signed-in OneDrive folder (`MORTAR_SCALE_MODS=<folder>`, `MORTAR_SCALE_KB=<size>`); it needs a person with a Microsoft account.

### First real launches of the newer loaders

No owned game has launched these yet. The first real launch settles: the Wine `Z:` form of the folder flags for ReturnOfModding, GDWeave, Lovely and Northstar (r2modman passes host paths); `wsock32=native,builtin` for Northstar and whether it needs more beside the game than everything but `R2Northstar/mods` (`thunderpack.go` `Spec.Placed`); for MelonLoader, `--melonloader.basedir` under Proton, the `version=native,builtin` override and the `N Mods loaded.` ready line (`driver.go` `Ready`).

## Later

Parked; take up when asked.

- **Translucent window** through the fork's GTK4 `setTransparent()` fix (upstream #6197). Trap: a fading or `backdrop-filter` full-window layer turns WebKitGTK's translucent window opaque, and stacked alphas compound toward opaque, so images and overlays each need their own alpha. Windows needs Acrylic with the frameless window.
- **Frosted glass on Linux** once the desktop runs GNOME 51: in the fork beside `setTransparent()` (`v3/pkg/application/linux_cgo.go`), bind Wayland `ext_background_effect_manager_v1` and set the toplevel surface's blur region to the whole window, updated on resize, only while the translucent window is on.
- **Vintage Story dedicated server** profiles (`dotnet VintagestoryServer.dll --dataPath <folder>`), keeping Mods and ModConfig as for a client so a group's server and clients share one mod list.
- **Bridge for IL2CPP games:** a BepInEx 6 IL2CPP build of the BepInEx bridge (`BasePlugin`, .NET 6, Il2CppInterop) with its own packages.
- **MelonLoader beyond 64-bit Windows builds:** a 32-bit game needs `MelonLoader.x86.zip` (read the executable's PE machine type), a native Linux build `MelonLoader.Linux.x64.zip`. A game with MelonLoader as a second loader needs `installerGame` (`internal/profile/layout.go`) and `thunderstoreRules` (`internal/installer/thunderstore.go` `route`) to take the profile's own loader first.
- **GodotModLoader games** (Brotato, Dome Keeper): mods load only as `.zip` files from `--mods-path`, so a zipped mod becomes a new kind of placed file through the installer layout, placed-file record, drift and history.
- **More folder games:** Baldur's Gate 3 (a `modsettings.lsx` writer from each `.pak`'s `meta.lsx`), Mount & Blade II: Bannerlord (install-side target and load order), Planet Zoo (no source names its mods folder), and a loader pack for BepInEx games with no Thunderstore community (Graveyard Keeper).
- **More stores for catalog games** whose folder or marker no source gives: GOG for The Witcher 3 (`1207664663`) and Cyberpunk 2077 (`1423049311`); Darkest Dungeon on GOG and Epic (`_windowsnosteam/win64/Darkest.exe`, a second marker) and its native Linux build; Hogwarts Legacy on Epic; Starbound's Xbox package; Titanfall 2 on the EA app.
- **Northstar through Steam's own Proton:** `game/start.go` `command` runs `plan.Exe` directly, so it would run the launcher through the Steam Proton build and the install's `compatdata`. The ReturnOfModding, GDWeave, Lovely and Northstar logs (Lovely's in `mods/lovely/log`) are not read for launch problems.
- **Other loaders and game families:** Shimloader for Unreal Engine games on Thunderstore (Voices of the Void, Windrose, Astroneer, Palworld); Bethesda games (plugin load order, LOOT, script extenders, BSAs); Minecraft (Java instances, Fabric, Forge, NeoForge); Resonite on BepisLoader.
- **Runs that need an outside tester:** a launch from a real GOG install and from Flatpak Steam; a Linux launch with Stardew's launch method set to Steam, confirming SMAPI loads the profile's mods; Import from Vortex against a long-lived Vortex folder; timings with the data folder under OneDrive.
- **Catalog drift check in CI:** `components:audit` on a schedule, opening an issue on drift.
- **Hosted share service** with short codes and share versioning; the **Xbox app** version (WindowsApps folders are locked down); an **Add to Mortar** button on Nexus listing tiles, which needs Nexus's approval first ([nexus-application.md](nexus-application.md)).
- **Settings:** new profiles starting as a copy of the open profile or from a saved group; an offline mode that never contacts the network.
- **EA App libraries on another drive** are found only once the player adds the folder (`internal/gamestore/drivers.go` `eaDirs`).
- **Long mod paths:** a path longer than Windows reads (260 characters) is copied without a warning.
- **Windows code signing** with Azure Trusted Signing; until then installers stay unsigned and are checked against the signed `SHA256SUMS`.
- **Registering Mortar with Nexus:** SSO and OAuth PKCE are built behind `nexussso.Slug` / `ClientID`, waiting for Nexus approval ([nexus-application.md](nexus-application.md)).
- **Discord release post** drafted beside the release notes, once the new Discord thread exists.
- **UI translations** (strings already go through Lingui) and a **macOS build** (needs a Mac, CI and an Apple developer account).
