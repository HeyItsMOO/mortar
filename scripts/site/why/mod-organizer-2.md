# Why Mortar? (vs Mod Organizer 2)

Mod Organizer 2 is the manager of choice for heavily modded Bethesda games, and Mortar reads its profiles. Choose Mortar for the games MO2 supports only lightly, for native Linux, or for one search across mod sites.

| | Mortar | Mod Organizer 2 |
|---|---|---|
| Platforms | !win Windows, Linux, Steam Deck | Windows ([v2.5.2](https://github.com/ModOrganizer2/modorganizer/releases/tag/v2.5.2)); Linux through a [third-party Wine installer](https://github.com/rockerbacon/modorganizer2-linux-installer) |
| Games | GAME_COUNT, each with its loader installed | 10 fully supported Bethesda games, about 17 with basic support ([Game Support](https://github.com/ModOrganizer2/modorganizer/wiki/Game-Support)) |
| Mod sites | !win :nexus: :thunderstore: :curseforge: :modrinth: :github: :vsmoddb: | :nexus: and local archives ([source](https://github.com/ModOrganizer2/modorganizer/blob/master/src/nexusinterface.h)) |
| Loader install | !win SMAPI, BepInEx and each game's loader | Set up by hand ([wiki](https://github.com/ModOrganizer2/modorganizer/wiki/Running-Oblivion-OBSE-with-MO2)) |
| Sharing | !win A link or a `.mortar` file | None documented |
| Latest stable release | !win 0.3.4, October 2026 ([changelog](/changelog/)) | 2.5.2, August 2024 |
| Conflict tools | Content Patcher conflicts explained in Problems | !win Priority, winning and losing files, hidden files, LOOT ([comparison](https://github.com/ModOrganizer2/modorganizer/wiki/Mod-Managers-Comparison)) |
| Licence | AGPL-3.0 | GPL-3.0 |

## Where Mortar differs

- Native on Linux and the Deck, with no Wine layer under the manager.
- Installs SMAPI, BepInEx and each game's loader, and searches several mod sites in one Browse.
- A profile shares as a link or file that another player opens in one step.

## Where Mod Organizer 2 is stronger

- Its virtual file system keeps the game folder untouched and switches profiles instantly ([comparison](https://github.com/ModOrganizer2/modorganizer/wiki/Mod-Managers-Comparison)).
- Conflict and load order tools for Bethesda games: priority, winning and losing files, hidden files and LOOT.

## Moving from Mod Organizer 2

On the Profiles page choose **Import…**: Mortar lists the MO2 profiles it finds for the game, with a preview. MO2's folders are read, never changed.

Facts about Mod Organizer 2 were checked against its source, wiki and releases on 17 October 2026.
