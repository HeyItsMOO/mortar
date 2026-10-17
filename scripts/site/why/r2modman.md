# Why Mortar? (vs r2modman)

r2modman is the long-standing Thunderstore mod manager, and Mortar reads its profiles. Choose Mortar when you also play games outside Thunderstore, or want mods from more than one site.

| | Mortar | r2modman |
|---|---|---|
| Platforms | Windows, Linux, Steam Deck | Windows, Linux, Steam Deck ([README](https://github.com/ebkr/r2modmanPlus)) |
| Games | 188, including Stardew Valley, Vintage Story and The Sims 4 | !win 307 Thunderstore games ([ecosystem.json](https://github.com/ebkr/r2modmanPlus/blob/master/src/assets/data/ecosystem.json)) |
| Mod sites | !win Nexus Mods, Thunderstore, CurseForge, Modrinth, GitHub, Vintage Story Mod DB | Thunderstore ([README](https://github.com/ebkr/r2modmanPlus)) |
| Sharing | A link or a `.mortar` file | A code or an `.r2z` file ([source](https://github.com/ebkr/r2modmanPlus/blob/master/src/r2mm/mods/ProfileImportExport.ts)) |
| Import from other managers | !win r2modman, Gale, Vortex, Mod Organizer 2, Stardrop | Its own codes and files |
| Licence | AGPL-3.0 | MIT |

## Where Mortar differs

- One Browse searches Thunderstore beside Nexus Mods, CurseForge, Modrinth and GitHub, so a Valheim profile can hold a Nexus mod and a Thunderstore mod side by side.
- The same app manages Stardew Valley on SMAPI, Vintage Story and The Sims 4.
- Problems explains content conflicts, and each mod's startup cost is measured, so a slow launch has a named cause.

## Where r2modman is stronger

- More Thunderstore games: 307 configured against Mortar's 185, fed straight from Thunderstore's own schema.
- Years of use by a large community, and its profile codes are the format other Thunderstore managers share.

## Moving from r2modman

On the Profiles page choose **Import…**: Mortar lists the r2modman profiles it finds for the game, with a preview. A profile code or `.r2z` file works too, through **Use a code or file…**. Your r2modman profiles are left as they were.

Facts about r2modman were checked against its source and release v3.2.20 on 17 October 2026.
