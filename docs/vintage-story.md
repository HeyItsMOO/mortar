# Vintage Story

Catalog id `vintage-story`. Sold outside any store app by Anego Studios; native Windows and Linux builds of one .NET program.

## Installs

- **Windows:** the installer's default folder is `%APPDATA%\Vintagestory` (`Vintagestory.exe`), per the wiki's [Vintagestory folder](https://wiki.vintagestory.at/index.php/Vintagestory_folder) page. Found by the `standalone` store (shown as Default folder).
- **Linux, manual:** the tarball (`vs_client_linux-x64_<version>.tar.gz`) holds `vintagestory/` with `Vintagestory` (no `.exe`) and `run.sh`; its `install.sh` copies it to `~/.local/share/vintagestory` (`~/ApplicationData/vintagestory` before 1.19.2), both in the `standalone` store's folders. `run.sh` sets `FONTCONFIG_FILE` to the game's `fonts.conf` and the working folder, so a native start goes through it (`linuxStart`). A .NET runtime installed by Microsoft's script lives in `~/.dotnet`, which the desktop does not put in `DOTNET_ROOT`; Mortar sets it when it is unset and that runtime exists.
- **Linux, Flatpak:** `at.vintagestory.VintageStory` (the wiki's recommended Linux install, from Flathub or `flatpak.vintagestory.at`) unpacks the same tarball as extra data, so the game is `<flatpak>/app/at.vintagestory.VintageStory/current/active/files/extra/vintagestory` in the user or system installation, found by the `flatpak` store. It bundles its .NET runtime and is started with `flatpak run at.vintagestory.VintageStory`; its data folder is under `~/.var/app/at.vintagestory.VintageStory/config`.
- **AUR:** `/opt/vintagestory`; not in the catalog (a path template starts with a token), so the player chooses that folder.

## Data and mods

- The data folder is .NET's ApplicationData plus `VintagestoryData`: `%APPDATA%\VintagestoryData`, `$XDG_CONFIG_HOME/VintagestoryData` (wiki: [VintagestoryData folder](https://wiki.vintagestory.at/VintagestoryData_folder)).
- Mods go in `VintagestoryData/Mods`. The install's own `Mods` folder holds the base game's modules (`VSSurvivalMod.dll` and others, beside `do_not_add_mods_here.txt`).
- A mod is a zip whose root holds `modinfo.json` (`modid`, `version`, `dependencies`), a folder holding one, or a bare `.cs` or `.dll`. The `mods` target's `modRoot` is `modinfo.json`, so an archive is laid out as one folder named after its store item, and a bare file stays loose.
- Saves are `Saves/<name>.vcdbs` (SQLite) with `-shm` and `-wal` companions; a restore deletes the companions the restored copy lacks, since SQLite replays a leftover `-wal` over the restored file. Each world's one `gamedata` row is a protobuf `SaveGame` ([vs-proto](https://github.com/bluelightning32/vs-proto)'s generated schema: `WorldName` 13, `TotalSecondsPlayed` 14, `LastSavedGameVersion` 21, `PlayStyle` 29); Saves reads it read-only and immutable for the world's name, play style (`surviveandbuild`, `exploration`, `wildernesssurvival`, `homosapiens`, `creativebuilding`, the codes `vssurvivalmod` tests), play time and version.
- The game takes `--addModPath` and `--dataPath`; Mortar uses neither, since the folder deployer fills and empties the Mods folder for each launch.

## Sources

- **Vintage Story Mod DB** (`vsmoddb`, `internal/source/vsmoddb`): the public API at `https://mods.vintagestory.at/api`, no key. `/mods` lists mods (`text`, `orderby` `downloads`, `follows`, `lastreleased`, `asset.created`, `tagids[]`) with a `limit` and no offset; `/mod/<modid>` (or the mod id a `modinfo.json` names) lists releases newest first, test builds (`-rc`, `-pre`, `-dev`) included. A mod's page is `/show/mod/<assetid>` or `/<urlalias>`, and the API does not answer to the assetid, so Mortar's id is `<modid>-<assetid>`. Downloads take the newest stable release unless one is named; the release id is the entry's file id. Update checks read each installed mod once (`ItemLister`). Release files carry no hash and no dependency list, so after a Mod DB install Mortar reads the `dependencies` of each mod's `modinfo.json` and queues, from the Mod DB, every required mod id no mod in the profile has (the game's own `game`, `survival` and `creative` excepted).
- **Install links:** the site's 1-click install button opens `vintagestorymodinstall://<modid>@<version>` (the `modinfo.json` mod id), which the game's own installer registers for `Vintagestory -i`. Mortar claims the scheme only when the player turns it on, reads the Mod DB's ids for the mod so the entry matches one added from Browse, and installs that release.
- **Nexus** domain `vintagestory` (game id 3576) and **GitHub** topic `vintagestory-mod`.

## Settings

The folder loader reads every per-game setting as for The Sims 4. These do not apply: `skipIntro` and `graphicsApi` (no catalog entry for them), `consoleLevel`, `consoleTimestamps` and `consoleFollow` (the folder loader has no console), `gameSettingsMode` (no `requiredSettings`), `cacheClearing` (no `caches`), `defaultLaunchMethod` (no store relay: every copy starts directly), and `enableRequirements` and `missingRequirements` (a Mod DB install queues the mods it requires instead).
