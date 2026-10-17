# Why Mortar? (vs Gale)

Gale is a fast, open source Thunderstore manager, and Mortar reads its profiles. Choose Mortar when you play games outside Thunderstore, or want mods from Nexus Mods and other sites in the same profile.

| | Mortar | Gale |
|---|---|---|
| Platforms | Windows, Linux, Steam Deck | Windows, Linux ([README](https://github.com/Kesomannen/gale)) |
| Games | GAME_COUNT, including Stardew Valley, Vintage Story and The Sims 4 | 237 Thunderstore games ([games.json](https://github.com/Kesomannen/gale/blob/master/src-tauri/games.json)) |
| Mod sites | !win :nexus: :thunderstore: :curseforge: :modrinth: :github: :vsmoddb: | :thunderstore: :hexium: ([README](https://github.com/Kesomannen/gale)) |
| Sharing | A link or a `.mortar` file; opens Gale and r2modman codes and files | !win Codes and files compatible with r2modman, modpack upload to Thunderstore ([Features](https://github.com/Kesomannen/gale/wiki/Features)) |
| Import from other managers | !win r2modman, Gale, Vortex, Mod Organizer 2, Stardrop | r2modman and Thunderstore Mod Manager ([Features](https://github.com/Kesomannen/gale/wiki/Features)) |
| Licence | AGPL-3.0 | GPL-3.0 |

## Where Mortar differs

- One Browse searches Nexus Mods, CurseForge, Modrinth and GitHub as well as Thunderstore.
- The same app manages Stardew Valley on SMAPI, Vintage Story and The Sims 4.
- Problems explains content conflicts, and each mod's startup cost is measured.

## Where Gale is stronger

- Profiles hard link their files, so a mod used by five profiles is stored once ([Features](https://github.com/Kesomannen/gale/wiki/Features)).
- A built-in modpack creator that uploads to Thunderstore, and optional profile syncing between computers.

## Moving from Gale

On the Profiles page choose **Import…**: Mortar lists the Gale profiles it finds for the game, with a preview. A Gale code or file works too, through **Use a code or file…**. Your Gale profiles are left as they were.

Facts about Gale were checked against its source, wiki and release 1.23.2 on 17 October 2026.
