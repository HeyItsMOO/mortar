# Why Mortar? (vs Stardrop)

Stardrop is a polished Stardew Valley manager, and Mortar reads its profiles. Choose Mortar to search for mods in the app, to have SMAPI installed for you, or to manage more games than Stardew.

| | Mortar | Stardrop |
|---|---|---|
| Platforms | Windows, Linux, Steam Deck | !win Windows, Linux, macOS ([v1.10.4](https://github.com/Floogen/Stardrop/releases/tag/v1.10.4)) |
| Games | !win GAME_COUNT | Stardew Valley ([docs](https://floogen.gitbook.io/stardrop/what-is-stardrop)) |
| SMAPI | !win Installed for you; updates offered | Must be installed first; updates offered ([docs](https://floogen.gitbook.io/stardrop/getting-started/installing-stardrop/linux)) |
| Finding mods | !win Browse searches :nexus: :curseforge: :modrinth: :github: | Local archives, or Mod Manager Download on :nexus: ([docs](https://floogen.gitbook.io/stardrop/guides/using-stardrop/adding-a-mod)) |
| Sharing | !win A link or a `.mortar` file | A JSON export ([source](https://github.com/Floogen/Stardrop/blob/main/Stardrop/Views/ProfileExportWindow.axaml.cs)) |
| Conflicts | !win Content Patcher conflicts explained in Problems | Duplicate mods skipped, missing dependencies reported |
| Licence | AGPL-3.0 | GPL-3.0 |

## Where Mortar differs

- Search, install and update mods without leaving the app, from Nexus Mods, CurseForge, Modrinth and GitHub.
- Problems names the Content Patcher mods that edit the same thing, and each mod's startup cost is measured.
- A shared profile opens from a link, with every mod fetched from its own page.

## Where Stardrop is stronger

- Native macOS builds.
- Years of tuning for one game: per-profile mod configs and Nexus Collections support ([features](https://floogen.gitbook.io/stardrop/guides/nexus-mods-integration/features)).

## Moving from Stardrop

On the Profiles page choose **Import…**: Mortar lists the Stardrop profiles it finds, with a preview. Stardrop and your game's Mods folder are left as they were.

Facts about Stardrop were checked against its source, docs and release v1.10.4 on 17 October 2026.
