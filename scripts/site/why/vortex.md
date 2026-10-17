# Why Mortar? (vs Vortex)

Vortex is the Nexus Mods manager, with the widest game list here. Mortar works with Nexus Mods too, and reads Vortex profiles. Choose Mortar for native Linux and the Steam Deck, for mods from more than one site, or to skip the account.

| | Mortar | Vortex |
|---|---|---|
| Platforms | Windows, Linux, Steam Deck | Windows ([v2.8.2 assets](https://github.com/Nexus-Mods/Vortex/releases/tag/v2.8.2)); SteamOS support announced ([GamingOnLinux](https://www.gamingonlinux.com/2026/01/nexus-mods-say-they-are-committed-to-supporting-vortex-on-steamos-linux)) |
| Games | 188 | Over 250 ([README](https://github.com/Nexus-Mods/Vortex)) |
| Mod sites | Nexus Mods, Thunderstore, CurseForge, Modrinth, GitHub, Vintage Story Mod DB | Nexus Mods ([README](https://github.com/Nexus-Mods/Vortex)) |
| Account | None needed; Nexus sign-in only for Nexus downloads | Nexus login to download from Nexus |
| Sharing | A link or a `.mortar` file | Nexus Collections ([docs](https://github.com/Nexus-Mods/Vortex/blob/master/docs/mod-management/collections.md)) |
| Usage analytics | None | Mixpanel, keyed to the Nexus user id ([docs](https://github.com/Nexus-Mods/Vortex/blob/master/docs/analytics.md)) |
| Licence | AGPL-3.0 | GPL-3.0 |

## Where Mortar differs

- Native builds for Windows and Linux, plus Add to Steam for Game Mode on the Deck.
- One Browse searches Nexus Mods beside Thunderstore, CurseForge, Modrinth and GitHub. Mod Manager Download on a Nexus page works with a free account.
- A profile shares as a link anyone can open, without a Nexus upload.

## Where Vortex is stronger

- Game breadth, and deep Bethesda tooling: LOOT sorting, plugin management, file conflict views and a choice of deployment methods ([README](https://github.com/Nexus-Mods/Vortex)).
- First-party Nexus integration: Collections, endorsements and Premium download speeds in one app.

## Moving from Vortex

On the Profiles page choose **Import…**: Mortar lists the Vortex profiles it finds for the game, with a preview. Mods Vortex linked into the game folder are copied, not moved, so Vortex keeps working.

Facts about Vortex were checked against its source and release v2.8.2 on 17 October 2026.
