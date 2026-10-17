# Valheim: research for the third game

BepInEx 5 game with the largest modding base after Lethal Company. Sources: the Thunderstore API (`/api/cyberstorm/community/`, `/api/experimental/package/`), the Nexus Mods v2 GraphQL API, r2modman's ecosystem schema (`ebkr/r2modmanPlus` `src/assets/data/ecosystem.json`), MO2's `modorganizer-basic_games` `games/game_valheim.py`, Vortex's `Nexus-Mods/game-valheim` `src/common.ts`, and the `denikson-BepInExPack_Valheim` 5.4.2351 zip. Figures are from 2026-10-06.

| Community | Thunderstore packages | Thunderstore downloads | Nexus mods | Loader |
| --- | ---: | ---: | ---: | --- |
| Lethal Company (supported) | 53,949 | 1,474,087,767 | 184 | BepInEx 5 |
| Valheim | 13,546 | 180,993,369 | 3,022 | BepInEx 5 (own pack) |
| Risk of Rain 2 | 7,662 | 501,729,605 | not on Nexus | BepInEx 5 (own pack) |
| R.E.P.O. | 7,216 | 379,524,318 | 144 | BepInEx 5 |
| H3VR | 6,444 | 71,323,215 | not found | BepInEx 5 |
| Content Warning | 1,350 | 28,803,713 | 12 | BepInEx 5 |

Valheim leads on mod count on both sites; Risk of Rain 2 leads on downloads.

- **Discovery:** Steam app `892970`; r2modman also lists the Xbox build and the dedicated server (`896660`). Steam on Linux installs the native build (`valheim.x86_64`, the catalog's `linuxMarker`) unless the player picks Proton, which installs the Windows build (`valheim.exe`, the `marker`). A native-only install runs natively, with saves and `Player.log` under `{xdgConfig}/unity3d/IronGate/Valheim`.
- **Native launch:** the pack's (`denikson/BepInExPack_Valheim`) `start_game_bepinex.sh` turns the Doorstop flags into environment variables and preloads `doorstop_libs/libdoorstop_x64.so`. Mortar does the same without the script: it starts `valheim.x86_64` directly with `LD_PRELOAD` set to the profile's library, `DOORSTOP_ENABLED=1`, `DOORSTOP_TARGET_ASSEMBLY` set to the profile's preloader, and `SteamAppId` set so Steamworks does not restart the game through Steam. Steam's own start cannot carry that environment, so a native modded launch is always direct and nothing is placed in the game folder. The Doorstop flags are passed too, to match the process to its profile. The shared `BepInEx-BepInExPack` ships no Linux library, so this works only with a community pack that has one.
- **Loader:** the community's own pack `denikson-BepInExPack_Valheim` (Azumatt, Vapok, Margmas; BepInEx 5.4.23.5 with patches, Doorstop 4 `winhttp.dll`, `.doorstop_version` 4.4.0), named in the loader's `package`; the generic pack is not listed in the community. Its files sit under `BepInExPack_Valheim/` in the zip, which `InstallPack` finds by the folder holding the preloader. Its `BepInEx.cfg` hooks `UnityEngine.CoreModule` `GameObject..cctor`. Nexus mirrors it as mod 3605.
- **Mods:** Thunderstore community `valheim`, Nexus domain `valheim` (game id 3667), GitHub topic `valheim-mod` (138 repositories). Mods name the pack as a dependency, which Mortar skips because the loader install provides it. Jotunn (`ValheimModding-Jotunn`) is the shared library most content mods depend on.
- **Saves:** `{localLow}/IronGate/Valheim/` (`compatdata/892970/pfx` on Proton). Characters are single files, `characters_local/<name>.fch` (`.fch.old` backup). Worlds are pairs, `worlds_local/<name>.fwl` (metadata, seed) and `<name>.db` (terrain, buildings), with `.old` and timestamped `_backup_` copies. Steam Cloud saves live in `userdata/<id>/892970/remote/` instead. The catalog's `saveFiles`, `saveCompanions` (`.db` travels with its `.fwl`) and `saveCopies` (`{stem}_backup_auto-*{ext}`, a world's automatic backups) encode this.
- **Bridge:** `mortar-bepinex-bridge` targets netstandard2.1 against BepInEx.Core 5.4.21 and uses only `Application.version`, `Application.quitting` and `SceneManager`, so Valheim's Mono runtime needs no change.
- **Logs:** the pack's `Chainloader startup complete` line ends with counts, which `Ready` still matches. Plugin lines append the GUID after the bracketed name; duplicate-GUID skips add the GUID and both paths, and an identical second copy reads `because a duplicate of it was already loaded from <path>` (`AzumattDev/BepInEx` `Chainloader.cs`). The analyzer reads both wordings.
- **Startup and intro:** not read (no Valheim install, so no `assembly_valheim.dll` to inspect); the bridge's `MORTAR_SKIP_INTRO` holds no Valheim steps.
- **Unmeasured:** a real launch of a modded profile, native or under Proton. Sandbox checks ran against a stub executable.
