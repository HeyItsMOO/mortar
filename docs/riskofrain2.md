# Risk of Rain 2: research for the fifth catalog game

The busiest Thunderstore community of the BepInEx 5 games Mortar lists. Ids read 2026-10-09 from the named source.

- **Discovery:** Steam app `632360` (Steam's store search API; r2modman's ecosystem schema also lists an Epic id and Steam app `1180760`, the dedicated server, which the catalog carries as `riskofrain2-server`). Executable `Risk of Rain 2.exe`, Steam folder `Risk of Rain 2`. Windows-only, so Proton on Linux. Hero art is Steam's `library_hero.jpg`, which answers 200.
- **Dedicated server:** `riskofrain2-server` (Steam app `1180760`, Windows-only, `minVersion` 0.3.8) shares the client's community and `bbepis-BepInExPack`. It starts with `-batchmode -nographics` plus the `+sv_hostname`, `+sv_port`, `+sv_password` and `+sv_maxplayers` console variables from the server profile's `server.json` (`profile set riskofrain2-server <profile> server.port <value>`; `server.mirror <client profile id>` queues the client profile's packages). The `+cvar` form is taken from the server's documented console variables and has not been run against the game.
- **Loader:** the community's own pack `bbepis-BepInExPack` 5.4.2122 (Thunderstore API; `RiskofThunder-BepInExPack` is deprecated). The community's mods do not depend on the generic `BepInEx-BepInExPack`, so the catalog names the pack in the loader's `package`. The zip holds `BepInExPack/winhttp.dll`, `doorstop_config.ini` and `.doorstop_version` 4.0.0.
- **Mods:** Thunderstore community `riskofrain2` (r2modman folder `RiskOfRain2`). No Nexus or GitHub source: Nexus does not carry the game's mods and its API answers 403 to automated reads.
- **Saves:** PCGamingWiki lists only Steam Cloud (`userdata/<id>/632360/remote/UserProfiles/`), outside any path template Mortar resolves, so the entry has no `saves` role.
- **Player.log:** `{localLow}/Hopoo Games, LLC/Risk of Rain 2/Player.log`, built from PCGamingWiki's registry key `HKCU\Software\Hopoo Games, LLC\Risk of Rain 2`; not read from an install.
- **Regress:** `scripts/selftest.sh regress --fake riskofrain2` (what it shows: [repo.md](repo.md)).
