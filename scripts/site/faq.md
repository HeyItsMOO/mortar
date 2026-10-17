## Is Mortar free?

Yes. Mortar is free and open source under the AGPL-3.0 licence, with no account, ads or tracking in the app.

## Which games does it support?

[GAME_COUNT games](/games/), each with its mod loader and mod sites set up: Stardew Valley on SMAPI, Lethal Company, Valheim and the other Thunderstore games on BepInEx, Vintage Story and The Sims 4. Mortar finds them on Steam (Flatpak Steam too), GOG, Epic Games, the EA app, the Xbox app, Heroic, Lutris and Bottles, or in a folder you choose.

## Coming from another mod manager?

Mortar imports profiles from r2modman, Gale, Vortex, Mod Organizer 2 and Stardrop. How it compares:

WHY_LINKS

## Do I need Nexus Mods Premium?

No. With a free Nexus account you click Mod Manager Download on a mod's page and Mortar takes it from there. Premium members can also download from inside Mortar.

## Does Mortar host mod files?

No. Every mod downloads from its own page on Nexus Mods, Thunderstore, CurseForge, Modrinth, GitHub or the Vintage Story Mod DB, so authors keep their downloads and endorsements. The one exception is sending a profile to another of your own computers on your network.

## Does Mortar work on the Steam Deck?

Yes. In Desktop Mode, download the AppImage and run it. Open a profile's menu, choose Add to Steam, and the profile shows up in Game Mode. The Flatpak cannot add itself to Steam, so the [AppImage](/download/#appimage) is the one to use on the Deck.

## Windows says it protected my PC. Is that normal?

Yes. The Windows builds are not code-signed, so SmartScreen warns the first time. Choose More info, then Run anyway. The source and the release builds are public on GitHub.

## How do I know a download is genuine?

Every release is built from the public source by GitHub Actions. The package repositories, Flatpak repository and each release's checksums are signed with the Mortar packages key, and Mortar checks a signature on every update before installing it. The [code signing policy](/code-signing/) shows how to check a file yourself.

## What happened to Concrete?

[Concrete](https://github.com/LethalModding/Concrete), our Lethal Company mod manager, is archived. Mortar is its successor, rebuilt from scratch for several games.

## Where do I report a bug?

Use Report a Mortar bug in the app's help menu, which attaches diagnostics, or open an issue on [GitHub](https://github.com/Rethunk-Tech/mortar/issues).
