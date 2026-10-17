# GUI design

The design system and screen rules for Mortar's UI. Read it before any UI change. The code in `frontend/src` is the record of every label, tooltip, menu entry and state: this doc gives the rules that apply everywhere, then per screen its purpose, structure and the rules a change could break. Concrete (`LethalModding/Concrete`, archived) is one reference for the look, not a template to copy.

## Window

- **Logo:** the running-bond mark, seven rounded bricks in three courses, filled in the primary colour (`frontend/src/brand/`); the title bar (18px), the app icon on a dark rounded square, and desktop notifications use it.
- Frameless on a solid window ([architecture.md](architecture.md#stack)): 1280×720 by default, 768×432 minimum. The frame is a 1px light border with rounded corners, since GNOME draws no shadow for a frameless window.
- `user-select: none` everywhere except text fields and the console. The WebKit default context menu is suppressed except on an editable field or with a text selection.
- Icons come from one set, Lucide (MIT), at 1.5-2px stroke; no hand-drawn or mixed icons.

### Title bar

48px (40px compact), draggable with its buttons not draggable; double-click maximises. Code: `shell/TitleBar.tsx`, `AppMenu.tsx`, `titleMenus.ts`. Left to right: the **Mortar menu** (logo and name; app-level actions, update check, help, bug report, source offer), the **game switcher** (the open game; its menu follows Game select's order), the **profile switcher** after a "/" while a game is open (its menu lists the game's profiles and the management entries; its context menu is the shared profile menu, [Profile management](#profile-management)), then on the right the **downloads pill**, the **notifications bell** and the window buttons. With nothing under way the title bar stays quiet: the pill shows only while the queue has items under way.

- **Notifications:** a bell with an unread count opening a solid dark panel (Ctrl+Shift+N). **New** holds this session's unread toasts; **Earlier** holds read toasts, then the open profile's change history. A toast action such as Undo is offered only while it still applies.
- **Startup repair:** a one-time "Mortar tidied up N things" notification after a launch that repaired something.
- **Mortar update ready:** a full-width info banner under the title bar once a background self-update is staged (it applies when Mortar closes).
- **What's new** (`updates/WhatsNewDialog.tsx`): once per version after an upgrade, a dialog of that release's GitHub notes; offline skips until a later start ([architecture.md](architecture.md#release)).
- **Tray** (`main.go`, `tray_other.go`, `tray_windows.go`; **Keep Mortar in the tray**, Settings › General): closing the window keeps Mortar running; off means close quits. GNOME needs the AppIndicator extension (the helper text says so). A desktop notification when a Mortar-started run ends raises the window on that profile's Console.

### Menus and the command palette

- Every menu uses the one dark paper, a 1px light border and 8px corners (`MuiMenu` in `frontend/src/theme/theme.ts`); an item with an obvious icon carries a Lucide one. Dividers are the shared `MenuRule`, never hand-rolled. Tooltips on menu rows and rails use `OneTip` (one at a time, closed by a press). One set of profile items (`game/ProfileMenuItems.tsx`) serves the switcher and the Profiles row menu.
- **Command palette** (`commandPalette/`, Ctrl+K): fuzzy search over actions, destinations and the shortcuts that run from anywhere. A shortcut that does what an action does shows its keys on that action, never as a second row; shortcuts for the focused list are left out; an action needing an open profile is greyed with "Open a profile first." SMAPI's bundled mods and the Mortar bridge are omitted, as on the Mods tab.

### Input, focus and accessibility

- Every focusable control shows a visible focus ring on keyboard focus: a 2px outline in the primary colour, 2px outside the control; a whole-row or whole-tile cover button draws it 2px inside, since its row clips what spills over.
- Everything works at 1280×800 (the Steam Deck) with the arrow keys, Tab and Enter that Steam Input maps a controller to, and no screen scrolls sideways. Grids move focus by the nearest item in the next row (`shell/arrowFocus.ts`); the mod list drops optional columns until the name keeps 160px (`fitListColumns`). `e2e/deck.pw.ts` checks it.
- **Gamepad** (`shell/gamepad.ts`, `gamepadInput.ts`, `e2e/gamepad.pw.ts`): the d-pad and stick send arrow keys to the focused control first, so lists, tabs, menus and grids keep their own movement, and otherwise move focus to the nearest control, staying inside an open dialog, menu or drawer. Focus the pad moves always shows the ring (`html[data-input="gamepad"]`), since browsers ring script focus only after keyboard use.
- **Touch or a gamepad as the main input** (`theme/roomy`): every control is at least 44×44px and compact density gives way; a resize handle keeps its thin line with an invisible 44px strip. A link in a line of text keeps its size (WCAG 2.5.8's inline exception). `e2e/deck.pw.ts` checks target sizes and runs axe-core.
- **Play prompt:** in play mode (`--play … --steam-session` from a Steam shortcut, [architecture](architecture.md#command-line)) the only thing drawn before a fix is the launch dialog that blocked Play, alone on the window background in a 560×480 window with 44px targets (`frontend/e2e/play.pw.ts`).

### Buttons and dialogs

- **Dialog actions:** Cancel or Close is a text button, leftmost; at most one contained primary sits rightmost; a destructive primary is contained `color="error"`; other actions beside them stay text. Saving a name that exists asks **Replace <name>?**; deleting a preset says **Delete preset**.
- Button and chip labels never wrap; a long message gets its own full-width row and truncates with an ellipsis rather than squeezing the buttons beside it.
- Dialogs use solid paper with no open or close transition ([Surfaces and colour](#surfaces-and-colour)). Shared pieces: `shell/ConfirmDialog.tsx`, `PromptDialog.tsx`, `useDiscardGuard.tsx`.

## Density

One spacing scale per **Density** level (Settings › Appearance › Display), set as CSS variables on `:root` (`theme/density.ts`, applied in `theme/theme.ts`). Layout code reads them through `space` and never hand-sets pixels for these roles, so a level change moves every page together. Touch or a gamepad still raises every target to 44px.

| Token | Role | Comfortable | Compact |
| ----- | ---- | ----------- | ------- |
| `--m-gutter` | a page's left and right edge, a controls row's inset | 16px | 12px |
| `--m-gap` | between controls in a row; between a row and what follows | 8px | 6px |
| `--m-pad` | inside a card or panel | 16px | 12px |
| `--m-row` | a table or list row | 36px | 30px |
| `--m-menu-y` | above and below a menu item's text, and a menu's own top and bottom | 6px | 4px |
| `--m-control` | buttons, dropdowns, fields and the page-actions slot that share a row | 36px | 32px |

Fixed on purpose: spacing of 6px and under (icon-to-label gaps, chip and badge insets, a row's inner rhythm), vertical margins between a heading and its text, indents, zero padding resets, chrome that is not a layout role (window buttons, title bar), and widths such as grid column minimums and panel widths. The tab header is `--m-control` plus twice `--m-gap` tall (52px comfortable, 44px compact).

## Surfaces and colour

- **No gradients** anywhere: not as backgrounds, scrims over art, fallbacks or placeholder art. Legibility over art comes from a solid layer with alpha; a missing image becomes a solid tone. The one exception is an image's edge fading to transparent through an alpha mask.
- **The window is solid.** Dark uses an opaque base, light an opaque `rgb(236,236,241)`. Behind the surfaces sits the wallpaper under a static tint (`--mortar-tint`). Hard-coded chrome colours live as `--mortar-*` tokens from `frontend/src/theme/palette.ts`, so both palettes share one set of surfaces.
  - Dark surfaces keep their alpha and composite over the tint; light surfaces are solid, with no translucent fills that turn muddy over the wallpaper.
  - Dialog paper (`MuiDialog` in `theme/theme.ts`) and the download queue sheet are opaque so the text they cover never shows through. Dialog and drawer backdrops are a static overlay (`--mortar-overlay-30`); dialogs and their backdrops open and close without a transition; the launch overlay uses `--mortar-overlay-80`. The drop overlay and first-run tour spotlight dim with `--mortar-scrim`.
  - Every popover (menus, the Saves backups list, pickers) is the solid menu surface with a hairline border, never the translucent paper colour.
- **Theme** (Settings › Appearance): Dark, Light or Follow system; app chrome only, game and profile settings are unchanged. Dark is the lead theme: screenshots, README and store listings show it.
  - Both themes keep the chosen accent as a fill, with white or near-black text on it, whichever reaches 4.5:1.
  - Text and icons tinted with the accent use `--mortar-accent-ink`: the accent on dark, the normal ink on light, where pastel accents are unreadable as text.
- **Background** (Settings › Appearance): **Image**, **Desktop** or **Solid**, all opaque. Image and Desktop draw the wallpaper full-window behind everything (title bar included), `object-fit: cover`, under the tint; it never fades or filters. The window loads it from `/background?mode=` with `Cache-Control: no-store`; under Reduce motion an animated image shows its first frame.
  - **Desktop** reads the user's own wallpaper at runtime: GNOME `org.gnome.desktop.background` `picture-uri-dark` under the dark colour scheme, else `picture-uri`; Windows the `HKCU\Control Panel\Desktop` `Wallpaper` value (measured on Windows 11 26H2). It falls back to Image's choice when unreadable.
  - **Default wallpaper:** Fedora 44's `f44-01-night` (Fedora Design Team, CC-BY-SA-4.0, credited in About): the system copy `/usr/share/backgrounds/f44/default/f44-01-night.jxl` on Linux when it exists (WebKitGTK 2.54 decodes JPEG XL, measured), else a bundled 2560px JPEG.
- **Text:** primary `rgba(255,255,255,0.90)`, secondary `rgba(225,225,230,0.95)`. Links are secondary text with a dotted underline.
- **Status colours** from Concrete: info `#2B8BDA`, success `#0CDF64`, warning `#F3B416`, error `#C70A0A` on dark; light darkens them until they meet 4.5:1 on paper.
- **Primary colour** is the user's choice from the palette in `frontend/src/theme/accents.ts`. It applies at once everywhere the primary appears, is never darkened, and is the same for every game; game colour appears only in hero art.
- **Scrollbars** are themed in the primary colour at low alpha (`theme/theme.ts`).
- **One-line status alerts** (a callout above a list, a read error with Retry, a settings status line) are the theme's compact Alert (`<Alert variant="compact" severity=…>`): 38px tall, the severity's callout fill and line. Size and colour come from the variant, never from a component's own `sx`. A window-wide banner, an alert with a title, and notes inside a dialog keep the standard Alert. Callout actions order text secondaries left and one contained primary right.
- **Fix and action buttons are never blue**; severity colours (warning for real conflicts, error for destructive) carry weight, and harmless rows use outlined buttons.

## Type

Open Sans (300 to 700) from `@fontsource/open-sans`, `htmlFontSize` 18 with MUI's responsive font sizes, as Concrete. Every string goes through Lingui.

## Copy

How every string reads. One wording per message: `bun run --cwd frontend i18n:dupes` fails when two msgids differ only in case, punctuation or placeholder names.

- **Enable / Disable** a mod, plugin or option; never "Switch on/off", "Turn on/off" or "Activate".
- **Remove** takes something out of a profile, group or list and leaves the thing itself; **Delete** destroys it on disk (a profile, saved group, template, preset, backup, downloaded file). The button, its confirmation and its toast use the same verb.
- Sentence case everywhere: "Open settings", not "Open Settings". A fragment that must be lowercase is lowercased in code, so one msgid serves both.
- Labels, buttons, headings and toast titles take no full stop; a sentence or line of body text does. Change lines and disabled-source reasons start with a capital ("Added <mod>").
- One placeholder name per concept: `{name}`, `{count}`, `{profile}`, `{game}`, `{version}`, `{path}`, `{when}`, `{min}`, `{max}`. No positional `{0}` and no per-site names (`{aName}`); plurals use `{count}`.
- A trailing "…" only on a control that opens further input (a dialog, a picker); the dialog's own title has none. A control that acts at once has none, and "…" is never a loading marker inside a sentence.
- No em dashes in text; use a colon, a full stop or a comma (an empty table cell may show one). Straight quotes and apostrophes only; a name goes in a placeholder without quotes.
- Errors read "Could not <verb> <thing>", never "Couldn't", "Failed to" or "Unable to"; no "Please".
- Shortest wording that keeps every fact: what it does, and when it matters.
- **Times:** a moment within the last week reads relative ("3 minutes ago", "yesterday"); older ones show the date, with the time where the list is a timeline (runs, backups, profile history, notifications). This covers every column, hero, card and status line that shows a time.
- **Names that cannot be resolved** read **Unknown mod** with the UniqueID in the tooltip, shown only when no id is known either.

## Game Select

Mortar opens on the last game used; Game Select shows at start only until a game has been opened, and otherwise from the title bar's Game Select tab. Code: `games/GameSelect.tsx`, `games/LetterRail.tsx`, `games/order.ts`.

One list of full-width game rows, 168px tall, however many games the catalog holds; it never wraps into columns. Rows touch (no gap, no margin around the list, no rounded corner) and the page scrolls when they do not fit. The three games used most recently (opened or played, newest first) come first under a small-caps **Recently played** heading; the rest follow by name under **All games**. With nothing used yet there are no headings. Names sort as typed, letters and digits only, so R.E.P.O. files under R.

- **Art:** the game's key art edge to edge under a light solid dim layer, with plain text straight on it kept legible by a text shadow and no panel behind. Art is Steam's `library_hero.jpg` read at runtime, never bundled.
- **Left:** the game name, then one line joined with " · ": the loader (installed version, or its name alone before install), the store, a relative last-played time while a last-played profile exists, total playtime, and **Not set up** until the game has a folder and a profile. Nothing on the line repeats what the profile cards show.
- **Profile cards** (installed and set up games): compact cards (name, health badge, relative last-played) in the left column under that line, with the same text shadow. They wrap rather than cut mid-word, at most six, then a **+N more** card that opens the game. Clicking a card opens that profile and does not fire the row's open handler. No Play on a card.
- **Right:** the mod sources as small logo-only badges (Nexus's own mark, the rest from Simple Icons; name in the tooltip and accessible name), with a contained **Play** under them when a profile exists and the game is set up: it opens the game on its last-played profile (else its first) and starts Play through the same Start path as the sidebar button, including SMAPI install and Steam checks. A game available but not set up shows **Set up** (gear icon, Play's size) in its place.
- **Opening:** a live game's tile is always clickable (not set up opens its setup; set up opens its main screen). No tile carries an edge stripe. Art for a tile that cannot open (a game coming later) is desaturated under a darker dim. The row under the pointer or holding keyboard focus grows 72px taller over 450ms, eased in and out, showing more art; the art never shifts sideways or zooms, and rows never dim on hover. Game status reloads when the window regains focus.
- **Letter rail:** once eight or more games sit under **All games**, a 28px rail of initials (**#** for digits) replaces the scrollbar on the right edge (44px wide with 44px letters in roomy mode). Letters share the rail's height up to 48px each, their type growing from 11px to 15px; capped letters are centred and the rail scrolls when they do not fit. Clicking a letter brings its first game to the top and focuses it; the letter of the first alphabetical row in view shows in `--mortar-accent-ink`.
- **Type to find:** typing on the page outside any field, menu or dialog jumps to the first game whose name starts with the letters typed (else the first that contains them), ignoring case, spaces and punctuation ("rep" finds R.E.P.O.). The row is focused, so Enter opens it; a one-second pause starts a new search.
- **No game found:** a footer line **No supported game was found in your launchers.** with **Check launchers…** opening Settings › Launchers.

## Main screen

A left sidebar and a detail pane. Code: `game/MainScreen.tsx`, `Sidebar.tsx`, `ProfileWorkspace.tsx`.

- **Sidebar:** 220px expanded, 76px as a rail (icon-only buttons with name and tooltip, badges in the top-right corner, an icon-only Play), a `--mortar-nav` surface with a 1px hairline on its right edge. The choice is saved per viewer (Ctrl+B); below 960px wide it is always the rail. It is one vertical tab list ("Profile sections"): one tab stop on the open section, arrow keys and a gamepad's shoulder buttons move between sections, each tab points at the workspace `tabpanel` by `aria-controls`, each group is a labelled `role="group"`.
  - **Home**, then small-caps groups of 38px rows (18px Lucide icon, label): **Library** (Mods with a primary badge of available updates, Saves, Config), **Get mods** (Browse), **Health** (Problems with a warning badge of its count, Load order, Performance), **Logs** (Console). Load order, Performance and Console show only when the loader supports them; a group left empty loses its header. The open row has a filled background and a 3px primary bar at its left edge. Ctrl+1 to Ctrl+8 select sections (Config is Ctrl+6; Home has none).
  - **Collapse** and **Play** pin to the foot. With no profile open only Play shows. Settings is not here (it displaced Play): it stays in the Mortar menu and on Ctrl+,.
- **Play** (`launch/PlayControl.tsx`, `playMenu.ts`): a full-width 64px primary button split with a caret. Its menu is plain items in arrow-key order: **PLAY WITH** and one row per named launch preset (**Standard** is the profile's own settings; the default ends in **(Default)**), **Set default preset…**, **Play without mods** (starts the game with no profile and does not lock mods). Compact opens the menu on right-click only. On Windows, when Steam's launch options run SMAPI, a dialog says Steam will still start SMAPI before offering Cancel or Play without mods.
- **Detail pane:** the open profile's section. Home alone shows the hero; every other section opens with the [Tab header](#tab-header).
- **Compact layout** (below 960px wide; minimum window 768×432): the icon rail, the hero becomes a one-line header (name and "N mods · N updates · N problems", zero parts left out), the mods search folds into a filter icon, other actions fold into icon buttons, the mod grid drops to two columns.

### Home

Hero, then <a id="home-page"></a>the **Home page** (`game/Home.tsx`, `Hero.tsx`, `HomePanel.tsx`): an action row, then a three-column grid of cards (one column when compact).

- **Hero:** 190px tall, bleeding to the pane's edges (one line at minimum size), with no actions beside the name: they are in the action row; Rename, cover and the rest live in the profile menus ([Profile management](#profile-management)). The name is large and bold with a soft white glow; the description shows under it as one truncated line with the full text in a tooltip (hidden when compact). A profile from a Nexus collection adds the collection, its revision (and a Review link when a newer one exists) and **Unlink**.
  - **Cover:** the image at full opacity under a light solid dim layer (`rgba(20,20,24,0.18)`), its alpha fading to transparent over the bottom 20% by an alpha mask so the backdrop shows through; the hero has no background of its own.
  - **Cover source, in order:** an image the user picked, the Nexus picture of the profile's most-endorsed mod (`endorsement_count` from the mod endpoint), Steam's hero art for the game (read at runtime from `<Steam>/appcache/librarycache/413150/library_hero.jpg`, never bundled), a solid tone. Never a random image.
- **Actions**, each with a leading icon: **Profile ▾** (this profile, copies, review, then Delete in the error colour), **Share…**, **Launch ▾** (Rocket icon: run the profile with a configured tool, manage tools, desktop shortcut, add to Steam where Steam can start Mortar) and, at the right, **<Game> settings**. Everything else stays in the profile menu.
- **Cards:** the **Crash card** (full width, only after a crashed run, hidden for that run by Dismiss) shows the likely cause and its evidence with **Disable it and play** (only when the log names a mod the profile has) and **Find the cause…** (a crash bisect, [architecture.md](architecture.md#launch)). **Notes** (two columns) edits in place, saved 0.8 s after the last keystroke and on Done, up to 20,000 characters. **At a glance** shows mod, update (opens the update review) and problem counts (opens Problems; absent until first read), dates and last played. **Changes since last run** (two columns, only when there are changes) shows the first three lines. **Saves** lists up to four saves newest first with **All saves (N)**; it takes a whole row when it follows At a glance and shares a row with Changes otherwise, so no card sits alone at one column.

### Launching

Code: `frontend/src/launch/`.

- **Launch overlay** (`LaunchLayer.tsx`): covers the window as an MUI Modal (focus trapped, Esc hides it, the window controls stay clickable through a cut-out) with a spinner and SMAPI's first log lines as they arrive, **Open console** and **Hide**, until the game is up or the launch fails (SMAPI exiting without a log fails with its exit code).
- While the game runs, Play becomes a Running status with elapsed time and **Stop game**, and the profile's mod controls lock ("Stop the game to change mods."): switching, removing, installing, dropping archives. While Mortar installs SMAPI itself, Play reads "Installing SMAPI…".
- **Pre-Play dialogs** are each omitted when nothing applies and follow the dialog action rule ([Buttons and dialogs](#buttons-and-dialogs)):

| Dialog | Appears when | Notes |
| ------ | ------------ | ----- |
| **Before you play** (`PrePlayDialog.tsx`) | Play is pressed with missing required dependencies, unresolved non-cosmetic conflicts, pending updates, broken or obsolete mods, or a newest save last played with another profile | groups show a count and up to five names, then "and N more"; offers Play anyway, Open Problems, Switch profile (last-played group), Update and play (pending updates). A **Don't check before Play** checkbox is stored on the profile when the dialog closes with Play or Cancel, and an opted-out profile skips the dialog |
| **The game was updated** (`UpdateWarnDialog.tsx`) | the installed game version differs from the one the last launch recorded (never on a first launch) | both versions and the profile's mods SMAPI's API marks broken for the new one |
| **Your last save needs other mods** (`SaveWarnDialog.tsx`) | the newest save uses mods the profile lacks or has disabled (an unreadable save does not ask) | the farm and mods, each **Not in this profile** or **Disabled in this profile**; Open saves |
| **Choose a graphics API** (`GraphicsDialog.tsx`) | the catalog entry offers graphics APIs and the profile resolves none | the entry's explanation, the recommendation's reason linked to its source, one button per choice (recommended last, contained). If the last run exited within seconds under a non-recommended choice, Play asks again, led by **The game closed right after starting last time.**, at most once more. The answer is saved to the game's Graphics API setting (Settings › Play; **Ask when I press Play** unsets it; a profile Overrides row) and Play carries on |

- **After a run:** a crash shows the Home crash card. A Mortar-started launch that ends with errors or a SMAPI crash opens a closed-with-errors dialog (`console/CrashDialog.tsx`): mods that logged errors with their first message, **Caused by `<ModName>`** with **Disable** / **Open page** when identified, **Open Console**, **Share log**, **Dismiss**; with an empty list, **Find the mod that crashes the game…** starts a crash bisect.

## Tab header

Every tab except Home opens with a 52px strip (`TabHeader`, rendered by `ProfileWorkspace`) tinted from the profile's colour (the accent when it has none), with a hairline under it. Left to right:

- the profile name (18px, bold);
- chips, a zero count left out: **N mods**; **N updates** (accent; opens the update review on Mods); **N problems** (warning colour; opens Problems); **N of M saves fit** (opens Saves; the tooltip says it counts saves whose recorded mod list the profile covers, out of the saves that record one; a game whose saves record none shows **N saves**);
- the first line of the profile's notes, ellipsised and hidden when compact;
- a spacer;
- the page-actions slot. A tab fills it with `<PageActions>` (a portal), so each tab keeps its buttons in one place. Every button, icon button and split-button half in the slot is 34px tall (icon buttons 34×34), set once on the slot (`pageActionsSx`), never per tab.

## Mods tab

Code: `mods/ModsTab.tsx`, `ModList.tsx`, `ModCards.tsx`, `ModListVirtual.tsx`, `ModMenu.tsx`, `ModsHeaderActions.tsx`, `ListColumnMenu.tsx`. Header actions: an icon button for the update check (F5) and the **Add archive…** split button whose menu adds from the downloads folder or extra mods folder and applies a template or saved group. Under the header, an accent banner "N updates ready" with **Review updates**, then the controls row: view toggle, **Group by**, the filter field and **Show**.

- **Filter and Show:** the field matches name, author, UniqueID, tags, note, source and category names, case-insensitively. **Show** (All mods, Off, Updates, Problems, Pinned, Local, Recent, Explicit, Implicit) also lists the profile's tags as toggleable chips (a mod must carry every selected one); the choice and the tags persist per profile.
- SMAPI's bundled Console Commands and Save Backup, and Mortar's console bridge, are installed in every profile and never shown, listed, counted or removable.

### Views

**Grid** and **List** (a table), remembered per user. Both virtualize (only on-screen group headers, rows and cards mount), share one details sidebar ([Mod detail](#mod-detail)) and show a pin icon for a kept version and last-run error and warning badges. The last loaded list for a profile stays on screen when the tab is left and returns, refreshed in the background; the first load shows eight skeleton rows.

- **List columns:** a default set plus more from the column menu; the defaults include On, Name, Version, Author, Source, Category, Status, Size and Startup (the mod's or pack's share of the latest startup report, [Startup timings](architecture.md#startup-timings)). Cells never wrap (ellipsis, full text in `title`). Author, Source, Category and the extras drop out below 960px even when enabled. Category is the Nexus category from cached page details (an em dash for other sources or before they are read): opening the list shows every cached category without a network call, then reads missing Nexus mods one at a time while signed in. Latest on Nexus uses the accent when newer than installed (`isNewer`).
- **Column menu:** right-click a header to show or hide columns (On and Name stay) and reset to the defaults. Left-click a header (not On) sorts ascending, again reverses; sort is within each group.
- **Reorder:** drag a header (or focus it and use Space and the arrows). The whole table takes the new order live while dragging, the dragged header keeps its slot with a primary outline and tint while a ghost follows the pointer, Escape cancels, the drop saves. Columns, order and sort persist in `settings.json` (`listColumns`, `listSortColumn`, `listSortDir`) and apply to every profile.
- **Grid:** responsive cards, `minmax(300px, 1fr)` at medium size (Settings › Appearance **Grid card size** moves the minimum; the details panel sits beside it while a mod is selected). A card shows the mod's icon (its Nexus `picture_url`, fetched once at install, cached under `cache/` and served at `/mod-picture/`; a letter tile when none), name, author (per **Author on cards**), version and status badges, with a primary New dot when the Nexus page has a newer file or changelog than the user last saw ([architecture.md](architecture.md#nexus-mods)). Cards are deliberately simple: no switch (the enable toggle lives in the sidebar). Remove acts on the whole archive entry the mod came in, and its confirm names the other mods in it.

### Grouping

**Group by** (None, Author, Category, Download, Framework, Group, Install reason, Source, Status, Tag; stored as `listGroupBy`) gives collapsible headers with counts in both views, collapse state remembered per game; the top group's header stays pinned on a solid surface until the next pushes it out.

- **Status** takes the first match of Problems, Update available, Enabled, Disabled. **Category** uses the mod's primary category: a per-entry override, else the cached Nexus category. **Framework** puts content packs under the framework they are for (ContentPackFor UniqueID, or the installed framework's name) and other mods under SMAPI mods. A mod with several tags appears under its first, which a tooltip says.
- **Edit categories…** (foot of the menu) adds, renames, recolours and deletes custom categories, stored per game in `<datadir>/categories/<game>.json`; deleting moves its mods to Uncategorized.
- **Implicit mods** (`implicitModsView`, in Show and Settings › Appearance): **Always shown**, **Nested** (each implicit mod beneath the first mod in its group that requires it, deeper for what that requires, the list row indented with ↳; one nothing in its group requires keeps its place) or **Hidden** (except while a search or Show › Implicit asks).
- **Install reason:** **Explicit** for a mod the player asked for, **Implicit** for one Mortar brought in for another. A download holding several mods has one main mod that takes the download's reason; the others read Implicit and offer no Mark items. Only **Mark explicit** and **Mark implicit** change it, each writing a history event. Removing mods with implicit leftovers nothing staying requires adds a checked **Also remove N libraries only these needed** to the confirm (Undo restores them); switching mods off toasts about leftover libraries with **Switch off**. A profile that predates install reasons shows a one-time callout offering **Keep explicit**, **Review…** (each suggestion with why: required by others, listed as a library on its site, supplies tilesheets) and **Mark implicit**; any answer ends it.
- **Mod groups** (Group by › Group; stored in `profile.json` `groups`): a header carries a switch for every mod in it and a ⋯ menu (Rename, **Save to library…**, Enable all, Disable all, **Delete group (mods stay)** with a confirm). A mod's menu has **Add to group…** and **Remove from <group>** for each group holding it.

### Selection, removal and menus

- **Bulk select:** click selects and fills the sidebar; Ctrl or Cmd click toggles; Shift click selects a range in the current order; Ctrl+A selects every visible filtered mod; Esc clears. With two or more selected a one-line bar offers **Enable**, **Disable**, **Remove** (one confirm), a **More actions** menu (tag, category, pin, mark explicit/implicit, skip updates, add to other profiles, make a group, **Share selection**) and clear. Every action except Share selection locks while the game runs the profile.
- Typing letters while the list or grid has focus (not a search field) jumps to the first visible mod whose name starts with (else contains) them, matching as Game select's type to find.
- **Removing a mod that enabled mods require** (their `Needs` minus optional, or ContentPackFor) warns **N mods need this**, naming them, with **Remove anyway** and **Remove all N+1**; the mod menu and selection bar share the confirm. Undo restores every entry the remove took out.
- **Mod menu** (`ModMenu.tsx`): right-click on a card or row, the Menu key or Shift+F10 on a focused one, or the card's ⋯. It splits into groups by dividers (enable and details; open page and files, reinstall with options only when the entry has FOMOD choices; category, pin, skip and install reason, the last not on loader or bridge entries; one **Other profiles** row that unfolds in place; split and combine for a multi-mod download; **Move up (loses files)** and **Move down (wins files)** for a game whose profile holds its loader, since a later package wins a file two mods both provide; groups; update in all profiles), with Remove last, in red. Everything that changes the profile is disabled while it is locked.
- **Endorsement prompt:** after five completed launches with no errors from an enabled Nexus mod the user has not endorsed or abstained, a snackbar **Enjoying these mods? Endorse them on Nexus** offers **Endorse**, **Not now** (five more clean sessions) and **Never for this mod**, when Settings › Accounts **Ask me to endorse mods I keep using** is on.

### Optional files

Nexus files without a manifest laid over a mod's main file ([architecture.md](architecture.md#storage)). Code: `mods/ExtraFilesChip.tsx`, `mods/updateReview/OptionalUpdates.tsx`, the details sidebar's Optional files section.

- Each shows in the list as a row nested under its main mod's first row (own switch, Remove icon with Undo; no selection, sorting or columns), dimmed while it or its main mod is disabled; the main mod's name cell and card carry an **N optional files** chip, and removing the main mod says in the same confirm that its optional files go too.
- Updates re-apply them: when the cached Nexus files list has a newer version of one (the author's `file_updates` chain, else the same file or archive name without its version) a checked **Also update N optional files** box queues it after the main file; Update before Play and a run error's **Update** do the same.
- The details sidebar lists the profile's optional files (with the main-mod paths each replaces and adds), then the page's other Optional and Miscellaneous files with **Download and add on top** (Premium) or **Open files page**. Files that replace some of the same files are alternatives under **Choose one**: enabling one disables the others, with a toast naming them and Undo.
- When Mortar cannot tell where an optional file's files go, **Place <file>** asks for the source and target folders; an optional file whose main file is not in the profile fails with a toast offering **Open files page**.

### Adding mods

- Dropping an archive on any page of the game (settings included) installs it into the open profile. After an install, "<mod> needs <A> and <B>" offers **Add them** for required dependencies the profile lacks; optional ones are left to Problems.
- An add that finds no manifest or several variants opens **Choose the mod folder** / **Choose a variant**, with **Show archive contents** (the same tree as the downloads dialog's preview).
- A batch install (several archives, a multi-select pick, the extra mods or downloads folder) toasts once, "Added N mods to <profile>", with failures counted in the body, names in the detail and **Undo all** (one history event); a single install keeps its own toast.
- **Empty profile:** "No mods yet", the paste hint (Ctrl+V takes a share or collection link), **Browse Nexus**, **Add archive**, **Import a shared profile…**; the hero uses Steam's art.

### Library callouts

Compact Alerts above the list ([Surfaces and colour](#surfaces-and-colour)):

- **Files an update no longer includes** (per entry): Show files, Keep, and a contained error **Delete** that moves them to Mortar's trash with Undo.
- **Mods in the game's Mods folder that differ from this profile** (`mods/GameModsReviewDialog.tsx`, `profiles/GameModsDialog.tsx`): counts folder mods the profile lacks plus those at another version; it clears once the profile matches and an unreadable folder never raises it. **Don't ask about these** dismisses the listed folders (Undo; Settings › game › Mods lists them with **Offer again**); **Review…** opens sections **Not in this profile** (all ticked), **Different version** (ticked only where the folder's copy is newer) and **Could not read**. **Copy into profile** (contained) adds the ticked missing mods and replaces the ticked different ones, leaving the game folder untouched; **Move into profile** (outlined) does the same and then removes those folders from the game folder. Both are disabled while the profile is locked; while running, a determinate bar replaces the lists and every button is disabled, then imported, skipped and failed counts with reasons. One undoable history event covers the sync, and Import from the game's Mods folder shows the same bar.
- **Hidden inside this mod** (mod panel, with `showDotHiddenMods` on): each dot-hidden mod has **Open folder** and **Unhide**, which asks first, then renames the dotted folders without their dots so SMAPI loads the mod.
## Mod detail

The **details panel** (`mods/DetailsAside.tsx`, `DetailsHeader.tsx`, `NexusDetails.tsx`, `ModDependencyTree.tsx`) is shared by both Mods views: a right-hand column while a mod is selected and absent otherwise, so the list takes the full width; at least 300px, at most half the tab, resized by dragging its left edge or with the arrow keys on that handle (width remembered). **More details** in a mod's menu selects the mod; there is no separate details dialog. Selecting the selected mod again keeps its fetched data, and the panel and list share one read of a mod's Nexus details per session.

Top to bottom: identity (picture, name, author · source, endorsements, the enable toggle at the top right with an aria-label naming the mod, version, **Mod id** = SMAPI UniqueID); for a Nexus-installed mod, once cached, whether the page is **Removed from Nexus** or **Hidden on Nexus**, a summary and a grid (latest version, accent when newer; category; downloads; updated); update banner and problem line; pin and skip controls (pinning stops update offers until unpinned); note (500 characters) and tags (up to 8, suggestions from tags already used in the profile); then the sections below.

- **Dependencies:** an indented tree of what the mod needs and what in the profile needs it, followed transitively with cycles shown once. Each node is enabled, disabled, missing or broken; a link selects that mod; a missing one offers **Open page** and **Add**.
- **Also in these profiles:** other profiles of the game whose `profile.json` names this UniqueID (version, enabled state); **Also add to…** copies the entry into the profiles the user ticks. Then the mods from the same download.
- **Versions** (only with a pin reason or an earlier version kept): the pin's reason and previous version, with **Roll back** after a confirm.
- **Settings:** the state of `config.json` (as shipped, changed, made by the mod, or none yet; a package's BepInEx `.cfg` files; settings from a mod's in-game menu) with **Edit config** ([Config page](#config-page)), **Open** and **Reset** (deletes the file after a confirm so the mod writes a fresh one).
- **Compatibility** (when a known issue is recorded) and, for a Nexus-installed mod, **More from the Nexus page**: cached chips, the installed file, Endorse/Abstain and Track/Untrack when signed in, **New since you last looked**, and folds for current files, changelog and description. BBCode renders as paragraphs, headings, list items, bold, italic and http(s) links; other markup is dropped (`mods/MarkdownView.tsx`).
- Foot: **Show files** and **Remove** side by side, both 36px tall; Remove is outlined in the readable destructive red, as destructive menu items are.

## Config page

The **Config** tab (Library group after Mods and Saves; Ctrl+6; palette **Switch to Config** and **Configure <mod>**) lists every mod with a config source and edits the chosen one beside the list. Code: `mods/typedConfig/` (`ConfigTab.tsx`, `ConfigPane.tsx`, `Widgets.tsx`, `StringWidgets.tsx`, `keybind.ts`, `convert.ts`). The edit model is typed rows ([architecture.md](architecture.md#profile-operations)).

- **Controls row** under the shared header: **Filter N mods** (name or UniqueID) and **Show** (All, Changed, In-game menu, Waiting for next launch).
- **List (300px, rows at `space.row`)** follows the Mods page's **Group by**, sort, collapse state and headers (the same settings, so a collapsed group stays collapsed in both). One row per mod with a config source (a SMAPI `config.json`, a BepInEx `.cfg` owned through its plugin GUID, a captured in-game menu): icon, name, and one chip (**N waiting**, then **Changed**, then **In-game menu**); a disabled mod is dimmed. A last group, **Loader and other**, holds `.cfg` and text files no mod owns (such as `BepInEx.cfg`), shown while no filter is on. The list is one `configsvc.Mods` call, cached per profile and re-read after a profile change or an edit; the selection is remembered per profile. With nothing to list the page says mods write their settings the first time the game runs and offers **Play**.
- **Entry points:** the details panel's **Edit config** and the mod menu item of that name (SlidersHorizontal icon, after More details) for a mod with a config source. The menu item reads the cached list, so opening a menu fetches nothing. The details panel's **Open** still opens the external `config.json`.
- **Editor** takes the full width with no close button and no title (the selected row names the mod). Its header has the file name, a **Config file** dropdown when the mod has more than one file, **Search entries** (matches key or description; a section heading keeps all its entries), **Presets** (apply, delete, **Save current as…**) and **Reset all** (off when nothing differs from default; asks first). The dropdown lists a SMAPI `config.json`, each BepInEx `.cfg` (labelled by plugin name) and each other text file the mod keeps in BepInEx's config folder or its package's subfolder there (`.json`, `.yaml`, `.yml`, `.toml`, `.xml`, `.ini`, `.txt`), labelled by file name with the path as tooltip.
- **Text files** have no schema: one monospace box holding the whole file (up to 1 MB), **Open in editor** at the left, **Revert** and **Save** at the right (off until the text changes). Save writes atomically, keeps a UTF-8 byte-order mark the file had, and is refused while the game runs or when a JSON (comments and trailing commas allowed), YAML or XML file does not parse, naming the line where it can.
- **Saving:** each change saves a moment after it is made. A failed write (including one refused because the game runs the profile) shows **Could not save: <reason>** under the row.

### Rows and value types

A section is a heading above its rows. A row shows the entry's name (the mod's label, else the key split into words at camelCase and number boundaries, raw key as tooltip; a label only breaks between words), an info button when the mod gave a description, the control, and a **Reset to default** icon when the value differs.

- **Type** comes from the JSON type of the current value, else of the shipped default (a null, or a number or boolean written as text, takes the default's), and a write keeps it: a boolean stays `true`, never `"true"`.
- A **Content Patcher** pack's values are all strings, so its `content.json` `ConfigSchema` decides and a write stays text (`"false"`, several choices comma-joined): `AllowValues` of exactly true and false is a switch, other `AllowValues` a select (multi-select with `AllowMultiple`), none a text field; `Default` is what reset returns to.
- Control by type: on/off a switch; a number a field (a slider when the mod gives a small range); a choice a select; a colour a swatch beside its hex field (invalid values error) opening a picker leftward into the page; a list removable chips with **Add an item**; anything else text. A text value gets the editor its shape calls for, written back in the form the mod already uses:
  - **Keybind:** a key-named entry holding `None`, a SMAPI key or key list (`LeftShift + F5`, alternatives separated by commas) or a Unity InputSystem path (`<Keyboard>/backquote`) keeps its text field and gains **Record** (takes the next press with Shift, Control and Alt held; Escape cancels) and a clear button. Recording replaces the whole value in its own syntax; clear writes `None`, or nothing for an InputSystem path.
  - **Comma list of words:** two or more short items become chips, joined with the existing separator.
  - **Number list or vector** (`200, 250, 350`): one small number field per item (an invalid item errors and is not written), **+** appends a copy of the last, × per item while more than one remains, with the value's own separator.
  - A description that lists its values keeps the suggestion field.
- **In-game menu:** a mod whose Generic Mod Config Menu the bridge captured lists **In-game menu** among its files (the only one without a `config.json`; the details panel then says **Settings from the mod's in-game menu**). Sections are the menu's pages and titles; a colour, image or custom widget reads **Change it in the game**. A changed row says **Applied when the game next starts**, its reset icon is **Keep the game's current value**, a change the game could not apply shows the reason, **Presets** is hidden and **Reset all** asks to discard every waiting change.

## Saves tab

Every save in the Saves folder with its fit for the profile, as a list or a card grid (toggle remembered per game); a line above says the save is picked inside the game. Code: `saves/SavesTab.tsx`, `SaveRow.tsx`, `SaveListRow.tsx`, `BackupsDialog.tsx`, `SaveBackupsButton.tsx`. The controls row has **Filter saves** and last-played sort (newest first); **Save backups…** is in the header's actions slot.

- **List:** a table built like the Mods list: sticky header (save, season as "Year 3 Fall", an em dash for games without a calendar, **Unknown** with a tooltip for a calendar game's save with no SaveGameInfo date, fit, an unlabelled actions column), 36px rows with the Mods list's hover, the card's actions in the actions column (each with tooltip and aria-label), and the "Needs N mods" line spanning the row beneath.
- **Cards:** a grid with a 340px minimum column: a solid tile coloured and iconed by season, farm name, `farmer · type farm`, icon stats (any the save lacks are left out), the mods it has used as removable chips (dismissing one toasts Undo) and a footer with the last played date, the profile that last played it ("a deleted profile" with the id in the tooltip when gone; the line's `title` repeats the sentence so long names are not clipped), the fit chip and Add all for mods Mortar can install.
- **Needs line:** when the last run's recorded mod list has mods the profile lacks or has disabled, "Needs N mods this profile lacks" with **Show** (name, recorded version, state: missing, disabled, or older with the profile's version) and **Add the missing mods**; hidden when nothing is missing.
- **Locks:** Add all, Add the missing mods and Copy from another profile read "Stop the game to change mods." while the game runs.
- **Back up now** zips that save only, labelled Manual and kept until deleted.
- **Backups popover** (History icon first in the card's top-right group; count badge when N > 0): anchored to the button, closed by Esc with focus back on the button. It lists every backup holding that save newest first (relative time, absolute in the tooltip; cause; size) with **Keep forever** / **Allow cleanup**, **Restore** and **Delete** (disabled while kept). Restore says the current save is backed up first, then reloads the cards; Delete confirms in red; both lock as the Save backups dialog does.
- **Save backups…** dialog: read afresh on every open, the open game's backup zips newest first (excluding those another profile took) with time, cause (before updating a named profile, "a deleted profile", before a restore, before playing, manual, unknown), size and farms inside; **Restore** is a dark menu (all, or each save of the zip alone). Restore names the saves it overwrites, says the current Saves folder is backed up first (solid paper, no transition), and reads "Stop the game to restore saves." while the game runs.

## Browse tab

Finds mods to add to the open profile; the shared header has no page actions here. Code: `browse/` (`BrowsePage.tsx`, `BrowseToolbar.tsx`, `BrowseFilters.tsx`, `BrowseShow.tsx`, `browseSort.ts`, `ResultCard.tsx`, `CardAction.tsx`, `cardState.ts`). Controls row one: grid/list toggle, **Source** switch, one debounced search field (focused when the tab opens). Row two: Include categories, Exclude categories, **Show**, Sort.

- **Source:** **All sources** (when more than one is searchable) then a chip per source in catalog order. A gated source (itch.io without an API key) is disabled with its reason, a capitalised sentence, as the tooltip. The search label follows the choice.
- **Top mods:** with nothing typed every source lists its top mods, so the tab opens on results; a source's empty-state text shows only when it has nothing to list.
- **Category pickers** are multi-selects, disabled with a tooltip for a source without categories.
- **Sort** offers best match and only the sorts the chosen source orders by on its own server, named for that source's metric (`browseSort.ts`; GitHub has no download count, itch.io only best match). **All sources** offers best match, most downloaded and recently updated, the sorts every source honours with comparable values: the last two merge every source's page into one order, and a hit without a value (a GitHub repo has no download count) lands after those that have one. A sort the source does not offer falls back to best match.
- **Show** (filter-icon button, primary while any row is not Off): **Mods in this profile**, **Obsolete** and **Broken**, each a segmented control of **Off**, **Gray out** (dimmed, its action stays readable) and **Hide**; **Broken** is disabled with a tooltip when the game has no compatibility list. It also holds **Card details**, which stats the cards show.
- **Results:** cards in the Mods grid's spacing, or rows. A card has a thumbnail (read through the local picture cache so a return visit shows every one; a failed one is a plain square), name, author (accent colour), two-line summary (body ink), stats line (dim, tabular), and the action. In the grid the action sits under the picture, as wide as it, so text takes the card's width; the card carries no open-page button (the page opens from its menu and details); list rows keep an open-page icon and the action at the end. Action labels stay short, each with its full sentence as tooltip and accessible name. A mod several sources list is one card with a badge per source that picks where it installs from.
- **Footer bar** under the results (hairline above, outside the scroll area): "N results", then "· N hidden" for hits Show hid and "· <source> did not answer" for a failed source. More than 20 results page at the foot. Loading shows placeholder cards; no results and a failed search (with **Retry**) each have an empty state.
- **Action:** **Download** on Nexus for a Premium account (**Sign in** while signed out), **Get** (opens the files page) for a free account, **Add** on every other source. Once pressed the card shows progress in place (queued, waiting for Nexus, downloading N%, installing, needs your input, failed with retry), then **Added**. A mod the game's loader is built on shows **Loader**, a companion Mortar installs itself **Built in**. Status chips take the button's width, height and corners.

## Problems tab

A full-height tab showing one section of the profile's problems at a time. Code: `mods/ProblemsTab.tsx`, `problemSection.ts`, `problemGroups.ts`, `ProblemRows.tsx`, `problemFix/`, `problemReport.ts`, `shell/SectionStrip.tsx`; each kind's plain-language explanation is `problemWhy.ts`, backed by [user-guide.md](user-guide.md).

Under the shared tab header, a full-width **section strip** (one MUI tab per non-empty section, label and count chip, the chosen one filled in the primary colour) scrolls sideways when it does not fit, never changes height, and moves with Left and Right (only the chosen tab is in the tab order). It never shows an empty section.

- **Which section shows:** the first that holds something broken (missing requirements, broken mods, damaged files, run errors, failed plugins, plugins shipped twice), else the first with anything. A choice is remembered per profile while Mortar runs, and counts only while its section exists.
- **Section action:** only missing requirements has one, **Add all N** (outlined, Plus icon, off while the queue call is in flight) in a right-aligned 44px row under the tabs; every other section's list starts under the tabs. Rows are dismissed and restored one at a time.
- **Page actions** (tab header): **Find the mod that crashes the game…** (a crash bisect: it turns mods off in halves and relaunches until the crash stops; enabled only when the newest run crashed with no suspected mod, otherwise off with the reason as tooltip, and the palette entry follows the same rule), **Asset map** and **Copy report** (plain text: counts by section, each row's sentence, each conflict's **Why?** keys, Dismissed, Cleanup, Redundant, Compatibility and the harmless count).
- Under the section body a muted **Checked <relative time>** line carries the check timings by family in its tooltip. Checks that could not run offline show the connection warning.

### Sections

In this order, only non-empty ones. "Counted" means it counts toward the tab chip, sidebar badge and Home's At a glance.

| Section | Notes | Counted |
| ------- | ----- | ------- |
| Missing requirements | | yes |
| Conflicts | the same mods with the same winner and fix are one row listing every asset | yes, except harmless cosmetic asset conflicts |
| Broken or outdated mods | author-marked obsolete or deprecated mods include the source and a short quoted reason; a Nexus replacement offers **Open replacement** without downloading | yes |
| Damaged files | "<mod> has damaged files" with **Repair**: downloads again from its source, or for a local mod re-extracts from its archive if still in downloads | yes |
| Errors in the last run | | yes |
| Failed to load | a plugin the loader's log says failed, attributed to the package that declares it | yes |
| Plugins shipped twice | two enabled packages with the same plugin GUID; **Keep newer** leaves the newest copy on | yes |
| Changed outside Mortar | | yes |
| Duplicates | | yes |
| Deprecated packages | Thunderstore marks them; **Replace with <package>** when one is named | yes |
| Settings | Content Patcher compatibility setting suggestions | yes |
| Cosmetic or harmless | | never |
| Dismissed | dismissed rows, muted, restorable | never |
| Compatibility | rows from SMAPI's compatibility list | yes (compatibility notes) |
| Slow startup | from the latest startup report: a mod adding 3 s or more, or a content pack adding 1 s or more, named with its framework; a framework that loads content packs (Content Patcher) is never a row itself | never |
| Redundant | see below | one per item or same-job group; warnings, never the chip |
| Cleanup | unused frameworks, implicit mods no switched-on mod needs, conservatively detected unused tilesheet packs, add-ons for a recolour the profile does not enable | yes |

The count comes from one helper, `problemCount`, feeding the tab chip, sidebar badge, Home's At a glance and cached profile badges, so it is zero only when the tab has nothing to fix. The Mods tab carries no problems banner. While problems load, the chip shows the profile's last known count.

- **Redundant:** mods replaced by an enabled replacement, packs every edit of which later packs overwrite, and C# mods doing the same job (a smaller may be "covered" by a larger). Each same-job group is one row ("A and B do the same job: both change X") with a **Remove one…** menu naming what each item removes. Every row has a quiet **Dismiss** before its remove action, for a finding the player judges wrong; dismissed rows stay listed dimmed under a small **Dismissed** label at the foot with **Restore**, and return by themselves when a different set of mods makes the mod redundant.

### Rows and fixes

- Warnings are amber tiles; information rows (Cleanup included) are neutral tiles with an info icon. A row shows the full wrapped text, severity icon, the Nexus author note when a listed requirement has one, and its fix actions.
- A missing or optional-dependency row links to that UniqueID in the Load order tab (falling back to the dependent). The mod list shows the same problem triangle and tooltip as a card, beside the name so it stays visible when the Status column is narrow or hidden.
- **Fix buttons run in order of weight:** the suggested fix first (a Content Patcher **Set … to …**, or **Make a pack win** when there is none) filled in the warning colour on real conflicts, then **Disable** outlined, then **Dismiss** as a quiet text button last. Dismissed rows keep their normal actions but swap Dismiss for **Restore**. Applying a Content Patcher **Set to** suggestion remembers that field value so the reverse hint stays hidden until the setting changes ([architecture.md](architecture.md#saves)).
- **Conflict rows** expand a **Why?** section listing each pack's clashing patch (source file and index, Action, Target, ToArea/FromArea, When, Priority) and, for image edits, a cropped preview of that pack's overlapping source region loaded when the section opens; it ends with a **Show conflicts** link into the Asset map filtered to that asset with rows open.
- **Asset map** (dialog): the game assets the profile's mods change, by default only those more than one mod changes (a switch shows all), filtered by **Find an asset**, with asset and shared counts and **Changed by N mods** (warning-coloured, with tooltip). An opened asset lists each mod's edit in load order (name linking to the mod, Action, Priority, winner marked); each loser offers **Make win** (outlined, only when loading it later decides the asset) and **Disable** (text). **Show more** loads the next 100.
- A load-order dependency chip names the dependency: an installed copy's name, else the Nexus page the metadata dataset lists for its id (`DependencyNames`, fetched for ids with no row), else the bare id; a missing required one reads "Needs <name> (missing)".

## Load order tab

A read-only list of the open profile's enabled mods in the order the game loader chooses ("The game loader chooses this order. Mortar does not change it.", SMAPI in the line's `title`). SMAPI sorts by dependencies: required and optional dependencies before dependents, content packs after their ContentPackFor framework, otherwise alphabetical (ModResolver). Code: `mods/LoadOrderTab.tsx`, `loadOrderText.ts`; `mortar profile load-order` prints the same list.

- A filter field fills the controls row (the shared `ControlsRow` with a growing `SearchField`, as on Mods, Saves and Console); **Copy load order** (numbered plain text) is in the header's actions slot.
- Each row shows position, name and chips for required dependencies, optional dependencies and dependents; past four required dependencies or two dependents it shows a **Used by N mods** chip expanding the full list. A required dependency the profile lacks is a red chip; a dependency cycle is flagged on its rows; clicking a chip for a listed mod scrolls to that row.
- Loading: placeholder rows in the list's shape ("Reading load order…"). Error: "Could not read load order" with **Retry**. None: "No enabled mods."

## In-between moments

- **Dropping an archive:** while an archive is dragged over the window, a dashed drop zone fills it 12px in from the edges and says where it goes ("Drop to install into Cookie farm") and the supported formats. It shows no file name: WebKitGTK and Wails expose none before the drop.
- **A Nexus link:** on a game's profile screen the link installs into the open profile at once, with a toast naming the mod ("Downloading <mod> into <profile>"). On any other screen a dialog, "Install <mod>?", asks which profile (the open one primary, **Other profile…**, or Ignore); further links queue behind it. A link never brings an open window to the front, so clicking downloads in browser tabs keeps the browser in front; only a window closed to the tray reopens. While the window is minimised, or behind another while a profile question is open, a desktop notification says the same and its Show action raises the window. The mod's name is its Nexus page title ("Nexus mod <id>" when signed out or offline). A refused link (wrong game, another account, expired, malformed) is a toast saying why.
- **Two copies of one mod:** a dialog shows both (source, version, what depends on it) and preselects the newer or Nexus-sourced one, switching the other off rather than deleting it; **Decide later** leaves both as a problem. When exactly one copy is from Nexus, **Keep the Nexus copy** is the recommended contained action; **Keep this one** keeps the selected non-Nexus copy. Code: `mods/DuplicateDialog.tsx`.
- **Loading:** a pane that waits on data shows the shared `SkeletonRows` in the shape of the content (announced by a label), never an empty pane.

## Console tab

The loader's log as it is written, monospace, in columns (level bar, time, level, mod, message); warnings and errors get a tinted row. Code: `console/ConsoleTab.tsx`, `VirtualLog.tsx`, `LogActions.tsx`, `LevelToggles.tsx`, `RunsPicker.tsx`, `consoleLinks.ts`, `smapiUpdateNotes.ts`.

- **Filter row:** search, level toggles (Info, Warn, Error, Alert) with compact line counts (6.2K), a **More levels** menu for Trace and Debug, a mod picker (choices as removable chips), Clear filters, the Runs picker, and icon toggles (tooltip, aria-label, `aria-pressed`) for timestamps and following new lines.
- **Log actions** sit in the tab header's page actions, not the filter row, as icon buttons with tooltip and aria-label: error navigation, **Copy log**, **Save log…** (default name `SMAPI-<profile>-<date>.txt`; the raw SMAPI log when this profile owns it, else the Console's lines), **Search all runs…**, **Clear**, and **Share log**, which shows the size, says the log becomes public at a link, asks before uploading to smapi.io/log, then copies the link.
- **Runs picker:** This session, or one of the profile's last 20 recorded launches (outcome Ran, Crashed or Failed, with time). A past run loads its stored log read-only, and Save log and Share log use it.
- **Links:** in visible rows only, an exact installed mod name or `UniqueID` is an underlined link in the row's own colour that selects the mod, and a path under the profile's `mods/` folder or the game folder opens its folder.
- **Update alert tags:** each line of SMAPI's **You can update** alert ends with a **Mortar:** tag saying how Mortar treats that version (from `UpdatesResult.Held` and the update list): already installed (only the manifest's number is stale), skipped, pinned, updates ignored, source skipped, prerelease, unofficial build, in Mortar's updates, or not downloadable here; the tooltip explains it.
- When SMAPI's own log says it is incompatible with the game's version, the console offers to reinstall SMAPI.
- **Input line** at the bottom (monospace, prompt `>`): hidden until this profile is running and This session is shown. Enter sends the command to the running game through the Mortar SMAPI Bridge and echoes it into the log as a Mortar line prefixed `>`; output arrives with SMAPI's own lines and Follow is switched back on. Up and Down browse the last 100 commands of that game (memory only). A failed send toasts.

## Performance tab

One scrolling page with no inner switch; the tab header is its only toolbar. Code: `console/PerformanceTab.tsx`, `StartupPanel.tsx`, `StartupSections.tsx`, `StartupTable.tsx`, `PerformancePanel.tsx`, `PerformanceComparison.tsx`, `useBridgePerf.ts`.

- **Page actions:** a run picker (last 10 launches, when more than one) and **Measure next launch** (off while a measurement is requested). Once requested, an info banner offers **Play now** (off while the game runs) and **Cancel**.
- **What to do:** up to three one-line findings from the selected run, each with one button: the mod that dominates the start (3 s or more) → show its packs or row; a slowdown of 1 s or more against the previous launch → **Compare** (scrolls to the table, sorts by change, adds a Change column); SMAPI's own mod loading when it takes 5 s and a tenth of the start → show the slowest mods. With none it says nothing stands out.
- **Where the time goes:** one stacked bar across the start with a coloured segment per phase (SMAPI loads mods, Mods start, Game content, First updates, Title intro), a legend of colour, name and time, and a hover explanation.
- **Slowest mods:** a sortable table (Mod, Total longest first, Why: one short phrase from the mod's own timings such as "slow UpdateTicked 19.2 s"). A row expands to entry, slowest event, assets and packs, and (after a measured launch) sampled time, plus a framework's content packs by time (25 shown, then a count). A name click shows the mod in Mods; Mortar's bridge row carries a **Mortar** label. Mods under 50 ms in both fold into **N other mods**; **Game and SMAPI** holds the unattributed rest.
- **In game:** a collapsible section, closed until the profile has saved reports. Reports are saved per profile and compared in the tab (before/now average milliseconds, signed change and percentage, new and gone mods called out). Empty states: before any measured launch a timer icon and copy that says to play the profile; before an in-game measurement a gauge icon and **Start measuring**.

### In-game measurement

Start measuring and Show report are off while the game is not running this profile or a past run is shown. The source depends on the loader's `perf` capability:

- **Console fallback** (no companion measurement): Start measuring sends SMAPI's `performance enable`, Show report sends `performance summary` and fills a sortable table (Mod or event, Average ms, Peak ms, Calls).
- **SMAPI with its bridge** (the same panel as BepInEx's; it replaces the console report): Start measuring asks the bridge for `perf start`, timing each mod's handlers of the per-frame events; no measured launch is needed. Show report reads `perf`; the table adds **95th ms** and **% of frame** when rows carry them. Above it: a frame line (fps, average, 95th and 99th percentile and worst frame ms, managed heap, garbage collections), a **Baseline** line (the mods' timed code in ms of the average frame, and the game and loader alone, which is the frame less the mods' timed code, not a launch with no mods) and a line saying a row is a mod's update, render and one-second handlers summed per frame, with Harmony patches and work outside events left in the baseline.
- **BepInEx:** the bridge measures only on a launch measured from Startup, so the empty state says to use **Measure next launch** first, and says the launch was not measured when Start measuring finds it was not. Show report reads `perf` as data and saves it, rows named by package (its plugins added up), with the same frame and baseline lines; a row counts Harmony prefixes, postfixes and finalizers and the plugin's own Update, LateUpdate and FixedUpdate, exclusive of nested timed calls, not transpiled code or other threads.

## Profile management

A page, as Concrete's. Code: `profiles/`, `game/ProfileMenuItems.tsx`, `game/NewProfileDialog.tsx`, `share/`. Header: back, **Import** menu, **New profile…**; below, every profile as a sortable row (dnd-kit, drop indicator) with colour and icon mark, summary (mod count, implicit count, cached update and problem counts, origin), one truncated description line, **Share** and a ⋯ menu of the shared profile items; asides for saved groups and recently deleted profiles.

- **Import** (the switcher's Import group mirrors it): the game's Mods folder (previews name, version and source, with switched-off copies marked and skipped or failed items given a reason; bundled SMAPI and the bridge are omitted), a link or file, a backup (**Restore from a file…** makes a new profile) and **Import…**, which lists profiles found for the game from r2modman, Gale, Vortex, Mod Organizer 2 and Stardrop and previews the pick (a Thunderstore pack opens the r2modman import dialog, which also takes a profile code or `.r2z`).
- **New profile…** starts empty, as a copy of the open profile, or from a template; a template's missing mods queue for download.
- **Damaged:** a section for each profile folder whose `profile.json` cannot be read, with **Repair** (from the latest history snapshot: keeps `mods/`, moves the broken file aside as `profile.json.damaged-<timestamp>`, toasts Undo; off with a reason when no snapshot exists), **Open folder** and **Move to trash**. Damaged rows are omitted from the sidebar and every profile picker.
- **Recently deleted:** a 320px side column listing the 30-day trash with days left, **Restore**, **Delete permanently** and **Empty trash** (outlined, error colour; each confirms with **This cannot be undone.**) ([architecture.md](architecture.md#profile-operations)). **Delete** says the profile stays restorable for the retention period and toasts Undo.
- **Find a mod in all profiles** lists matches by name or UniqueID; each link opens that profile with the mod selected.

### Profile menus

The switcher's context menu and the row ⋯ menu share `ProfileMenuItems`. Groups, split by dividers, in order: rename, edit and cover; history, **Check this profile**, duplicate, back up to a file (asks whether to include mod files, with the size it will take); **Compare…** (always on); saved groups and templates (template items only when the game has templates, except Save as template); desktop shortcut (Remove only when one exists) and Add this profile to Steam; Delete last. Sending, the Nexus collection draft and Thunderstore exports are reached from **Share…**. Send, Compare and Delete dialogs stay mounted so they survive the menu closing.

- **Check this profile:** findings grouped Missing from the store, Changed outside Mortar, History that cannot be read, Unfinished launch, Not used by any profile, each with a sentence and **Repair** (none when Mortar cannot fix it) and **Repair all**. Repair downloads again, restores changed files from the store (one history event), deletes an unreadable history entry (the profile is untouched), finishes an unfinished launch, or sends unused store items to Settings › Storage. Mortar also runs the check quietly once a week per profile (and after recovering from a crash), never while the game runs and only after startup's first problem check; a finding shows an amber shield pill with the count on the profile's sidebar and Profiles rows that opens the dialog. It never toasts.
- **Templates:** applying previews Adds, Already has, Different version (kept as is) and Settings changes, merges, queues missing downloads and toasts Undo. It records its own history event, after a baseline event when the newest event is not the current mods; Undo reverts to the baseline and restores the game settings and launch options the template replaced.
- **Saved groups** (library of mod sets per game, made from a group's **Save to library…**): adding one to a profile adds its missing mods and creates the group there so Enable all and Disable all switch them together; a clashing group name gets " (2)", " (3)"; one Undo reverts the whole add. Removing a mod from a saved group removes its optional files too, and the last mod cannot be removed.

### Change history

The open profile's History (`profiles/HistoryDialog.tsx`, `HistoryTimeline.tsx`, `HistoryEventRow.tsx`) is a wide dialog (MUI `md`): a toolbar (**Mark current as known good**, **Restore known good**, **Compare two…** which adds checkboxes and diffs exactly two snapshots) over a timeline grouped by day. Each entry shows its change type, a sentence-case summary, relative time with clock time, a **Known good** badge for a restore point, **Show mods** with **Revert this mod** (undoes only that mod's change), and **Undo these changes** (the profile goes back to before the entry, so newer entries are undone too) on hover or focus, keyboard-reachable, absent on the oldest or a trimmed entry. Event count is capped by Settings (`historyEventsKept`); snapshot file bytes are not ([architecture.md](architecture.md#profile-operations)). A revert that cannot find store files names the mods and offers **Download missing mods**.

### Edit profile

A solid-paper dialog without a transition, as tall as its tallest tab (capped by the window; tabs share one height). Code: `profiles/EditProfileDialog.tsx`, `OverrideRows.tsx`, `LaunchOptionsBlock.tsx`, `LaunchPresetsBlock.tsx`.

- Name (60 characters; a name the store refuses shows its message in the field), colour (eight swatches), icon (twelve Lucide icons; the chosen swatch or icon holds a ring and `aria-pressed`), cover image, description (280 characters); a loader select only for a game whose catalog lists more than one loader, saved at once.
- **Keep this profile's saves separate** (only for a game with a save folder): turning it on asks first and explains that while the profile runs the shared saves folder is set aside and returns when the game closes with nothing deleted, with a ticked option to start with a copy of the current saves; turning it off applies at once.
- **Overrides** ("These apply only to this profile."): each row is **Use game setting (labelled value)** or an explicit value, for the per-game settings a profile may override (launch method, game log, backup before Play and backups kept, update before Play, skip pre-Play check).
- **Launch options** (extra SMAPI arguments; Mortar sets `--mods-path` itself and refuses `--mods-path`, `--no-terminal`, `--skip-terminal`), **Launch prefix** (direct launches only, e.g. `gamemoderun mangohud`; unavailable on Windows) and **Launch environment** (one `VAR=value` per line; direct launches only), with a **Direct launch preview** (argv and environment, **Copy the command**). Steam launches receive neither prefix nor environment ([architecture.md](architecture.md#launch)). Loader-specific options (BepInEx: console window, log level) follow and save at once into the profile's BepInEx config, applying at the next start.
- **Launch presets:** **Standard** (the fields above) and named presets (set default, save as template, edit, duplicate, delete) with **Add preset** (name, options, prefix, environment, SMAPI console window) and **Add from game presets…**, the game-wide launch preset templates (Add copies one in, renaming on a clash; Delete removes the template only). Preset changes save at once, not with the dialog's Save.

### Compare and merge

- **Compare…** puts "[this profile] with [other]" over a filterable table grouped Different version, Only in each side, Enabled in one only, Different source, Identical (the last two hideable). The other side is one of the user's profiles or someone else's: a friend's link or file (opens Import against that profile) or, for Stardew, a multiplayer host's list. Every difference row has a checkbox (all checked); **Make <other> match <A>** applies only the checked rows to the target: mods only in the source and enabled-state differences are copied from the store, version and source differences switch the target's entry to the source's, mods only in the target stay (no removal). Each changing kind toasts Undo. Buttons are disabled with a tooltip while the game runs the target or when nothing selected would change it.
- **Merge into…** (Profile › Copies) previews adds, mods in both and mods only the target has; **For mods in both** keeps the target's versions (default) or takes the newer. The source is never changed, nothing is removed from the target, added mods keep enabled state and config, and the target's History gets one undoable "Merged N mods from <source>". Disabled while the preview loads, with nothing to do, and while the game runs the target.

### Share

**Share** (`share/ShareDialog.tsx`, `DestinationGrid.tsx`, `DestinationPanel.tsx`, `MethodPanes.tsx`, `Included.tsx`) is two steps in a dialog of constant width (step 1 as tall as its tiles, step 2 a fixed height). A share from the Mods selection limits link, file and mod list to those mods.

- **Step 1:** destination tiles (one row up to three, 2x2 for four, three per row for five), each a 32px icon, name and one-line hint: **Mortar** (link or `.mortar` file), **Nexus Mods** (collection draft), **Thunderstore** (r2modman code or modpack; Thunderstore games only), **Nearby computer**, **Mod list** (text for Discord or a forum). A tile is greyed only when it cannot carry anything and says why on the tile: with nothing to share every tile reads "No mods to share"; with only local archives, Nexus Mods and Thunderstore read "Local archives can't go here" while Mortar (a `.mortar` file includes them), Nearby computer (whole files to a paired computer) and Mod list stay open. The destination used last for the game (browser storage) takes focus with a **Last used** caption; arrows move, Enter opens, Esc closes. **Step 2** has a back arrow before the title; Back or Esc returns to step 1.
- **Mortar pane:** **Link | File** (File is preselected over about 240 mods or when the link is too large). Link shows `https://mortar.rethunk.tech/stardew/p#...` in a mono field with a meter of its length against Discord's 2,000 characters; File writes the `.mortar` file with settings and lists any settings files left out. Both show an **Included** block ("N of M mods" when fewer than the title bar's count are shared) with each option in force and **Change**: disabled mods; FOMOD choices (only when an included mod has them); notes and tags on a link, profile and mod notes in a file; config files and problem choices (dismissed problems, conflict winners) for the file and Nearby; libraries and supporting mods (when off, the share names only the mods the player chose and the receiver's import resolves the rest; on a link they are listed greyed out with the reason, since a link has no room). Every share carries pins, groups and install reasons. A warning row lists mods left out (archive, switched-off, unknown source), and **Preview what they see** shows the recipient's page.
- **Mod list pane:** **Markdown | Plain text | Discord** (kept for the session) over the text exactly as it will be pasted in a scrolling, selectable mono panel. Discord's list is shown as messages of at most 2,000 characters under sticky headers ("Message N of M", character count, a check once copied), copied one at a time; **Save to a file…** writes the whole list in the chosen format (Discord's as one Markdown list).
- **Thunderstore:** the r2modman code asks before uploading; the modpack export is always visible.
- **Nearby computer** (when sharing nearby is off it first offers **Turn on and continue**): the **Included** block as in File (same remembered defaults) above the peer list (nearby Mortars via mDNS, **Send to an address…** as `Host:port`, up to five recent addresses). Sending to an unpaired computer opens a links-only confirmation (config files stay here, everything else ticked is sent). The receiver sees "<sender> sent you <profile> (<game>)", with copy that mod files copy directly from a paired sender and otherwise download from each mod's source, and Decline, Compare with a profile, or Import as new profile. Accepting a paired send copies store files first (progress, Cancel), then opens Import ([architecture.md](architecture.md#sharing)).

## Import

A wide "Import profile from…" dialog over the dimmed game screen with tabs **Link** and **.mortar file** (archives go into an existing profile through Add archive or a drop, not Import). Nothing downloads before the user confirms; closing leaves nothing behind. Code: `share/ImportDialog.tsx`, `ImportPreview.tsx`, `ImportFooter.tsx`, `useImportFlow.ts`.

- **Preview:** a dense grid of mod tiles (icon with include tick, name, author with "different file" or "unverified" where they apply) with the mod's import state on the right in place of a version (installed, download, dependency, check later, unavailable; dependency covers both what the preview adds for a shared mod and what the share marks implicit). An unticked mod is left out.
- **Status bar:** "Ready to import", profile name, mod count, counts per state and the approximate download size (the sum of each file's `size_kb` from Nexus).
- **Problems before download**, one compact item each with its action: a mod removed from Nexus (with its page), a mod broken for this game version (SMAPI's update API; **Leave out**), missing dependencies (the mod dataset), and for a free account that each download takes one click on Nexus. Opened as **Match a friend's profile…**, a summary above the tiles says how many already match the target and lists missing, different-version and only-in-yours UniqueIDs.
- **Footer:** **Reset**; **New profile from link** (**from file** on the file tab), which creates the profile (named "<name> (2)" with the next free number when the name exists, and the toast says so) and fills the download queue (the sheet opens only when something was queued); **Add to <profile>** when opened from one; **Replace <profile>**, which asks first, lists the entries it removes, keeps local-only mods not in the share and writes a history event so the change can be reverted. The Imported toast carries **Save as template** (asks for a name, defaulting to the shared profile's).
- When the import needs Nexus downloads and no account is signed in, a banner offers Nexus settings and the import buttons stay off. The Link tab reads the clipboard only from **Paste from clipboard**; a `mortar://` link, a dropped `.mortar` file or a second launch opens the dialog filled in and previewed.

## Sync offers

With a sync folder set (Settings › Mods and profiles), a change another computer made to a profile is announced once by an info toast, **<profile> was changed on <machine>** (**… and here** when both sides changed it), with **Review**, which opens **Changes from your other machines** (`sync/SyncOffers.tsx`): one block per waiting change and **Later** to close.

- A block shows its title and, for a change both sides made, **Both sides changed it, so Mortar will not merge them. Pick one side.**
- **Apply** (contained; **Use theirs** when both changed) makes this computer's profile match the other's, creating it when it exists only there. **Keep mine** (not for a profile new to this computer) keeps this computer's profile and writes it over the other revision. **Show diff** lists **Adds <mod>** and **Removes <mod>** rows, or **Only settings and options differ.**
- Mod files are never part of a sync; mods an apply adds download from their sources.

## Download queue

A side sheet (`queue/`, `downloads/`; Ctrl+J, the title bar pill or the palette). The header gives parallel download counts, totals (done, in progress, failed, left, size) over a progress bar split by state (only once the queue holds items, and only in the queue view), and icon buttons for History, **Clear finished** (finished rows also have a dismiss icon; queued and in-progress items stay), **Pause all** / Resume (stops new starts; the in-flight download finishes; hidden while idle) and Close. Rows are 54px tall; Skip, Cancel and dismiss are icon buttons (Retry on a failed row stays a labelled button), every action on the row's right edge.

Sections, top down:

- **Needs your click** (free accounts): the head item with Open download page and Skip; the next page opens when it finishes. An update or latest-file item is skipped on its own once the profile already holds that file or a newer one from the same page ([architecture.md](architecture.md#nexus-mods)).
- **Choose a file** (a GitHub release with several archives): one button per archive. **Check this download** (a GitHub download whose mod SMAPI's update API does not tie to its repo): Install anyway and Skip.
- **Failed** (each row says why; Retry resumes a partial file), **In progress** (size, speed; Cancel only while downloading, not installing), **Up next** and **Done** (collapsed to one line each), then skipped or cancelled rows.

Premium accounts download without clicks. A rate limit shows when downloads resume. A Done row whose GitHub source could not be verified says so. History is the last 1,000 finished items with outcome and profile filters. Closing the sheet keeps the queue running.

### Update review

Code: `mods/updateReview/` (`ReviewList.tsx`, `Row.tsx`, `ReviewFooter.tsx`, `SourceGroups.tsx`, `KeptGroup.tsx`, `Changes.tsx`, `OptionalUpdates.tsx`).

- Each row offers **Update**, with **Open page**, **Update in all profiles**, **Skip this update** and **Pin this version** in its ⋯ menu (skipping or pinning is how a mod is left out of **Update all**; both apply even to updates Mortar cannot download). A row with a caution shows **Update despite this**; until ticked its Update is off and Update all leaves it out.
- The title counts the updates (no icon) with the checked time and **Load all changes**; rows show name, both versions and actions, with no source chip. The footer is one row: **Close**, a one-line note that settings are kept and saves backed up, **Update in every profile…**, **Update all (N)**.
- With more than one section the list is headed by the source that reported each update, and implicit mods' updates come last under **Libraries (N)**; a single section has no heading.
- A Nexus update with no file that supersedes the installed one (`pickFile`, [architecture.md](architecture.md#nexus-mods)) stays listed without Update, noting **Pick the file on Nexus**; Update all, Update before Play and the run-error **Update** skip it. Unofficial SMAPI versions are labelled and never included in Update all.
- Pinned mods never appear in the list or Update all; a collapsed **Kept at this version (N)** group shows each with **Unpin**, which re-checks updates.
- Each Nexus or GitHub update has a **What's new** disclosure loaded on open: versions newer than installed up to the new one, newest first (GitHub: release bodies, at most 10, with date). A warning triangle on the name means the notes mention a breaking change or new requirement.
- After an update finishes, **Update <mod> in other profiles** lists profiles still holding the old file (pinned destinations named and skipped). The Problems tab's missing dependency offers **Add** with **Open page** kept. While signed out, both toast a link to Settings › Accounts.

## First run

Mortar's own setup finds launchers, not games, and opens until finished once (`launchersConfirmed`); there is no skip. Code: `firstrun/` (`FirstRun.tsx`, `FindStep.tsx`, `GameSetup.tsx`, `LoaderStep.tsx`, `ProfileStep.tsx`), `firstrunTour/`.

- "Welcome to Mortar" lists each launcher Mortar reads on this OS as accordions in a two-column grid on a wide window, one column when narrow, centred vertically when they fit. Linux: Steam, Steam (Flatpak), Heroic, Lutris, Minigalaxy, Bottles, GOG; Windows: Steam, Heroic, GOG Galaxy. A folder belongs to one launcher, so Minigalaxy's install folder is not also GOG's. Settings › Launchers shows the same rows.
- A row's summary shows the launcher's logo (`simple-icons`, or Minigalaxy's own icon as a white silhouette; Flatpak launchers add a small badge), its name, the supported games found, and a large status icon left of the chevron (green check found, grey cross not). Expanded: every folder it was found in, or where Mortar looked, the user's added folders (each removable), **Add folder…** (filled when not found, outlined when found; the folder is checked to be that launcher's) and **Rescan**. With none found the first row starts open. Detection runs again when the window regains focus.
- **Continue** is always enabled and leads to Game Select, with a count of launchers found (or a note that games can still be set up by folder). Under it one quiet, never required line offers the Discord server (**Join our Discord**).

### Game setup

Each game runs its own setup when first opened from Game Select while not set up (folder unknown or no profile; it stays open while the game has none): a non-interactive stepper **Game folder**, the game's loader step when it has one (SMAPI for Stardew Valley), **First profile**. **Back to <previous game>** (**All games** when none was open) leaves it. **Choose folder…** falls back to a typed path field where there is no native folder dialog (server mode), as the Vortex folder prompt does.

1. **Game folder:** the game's art (Steam's cache, else Steam's public CDN image, dimmed until found). Found: store, folder with **Change…**, game and loader versions, **Continue**. Not found: each launcher and whether it holds the game, **Choose the game folder…** and **Rescan**, with no Continue until a folder is known.
2. **Loader** (if missing): starts by itself, unattended, with no button; progress as steps (downloaded, files added, launcher replaced, bundled mods added); a failure shows its error with **Retry**. On Windows with Steam, **One step in Steam** shows the launch-options line with **Copy** and **Set it in Steam for me** (disabled once set; fails with a toast while Steam is running).
3. **First profile:** when the game's `Mods` folder holds mods, three cards: **Import from the game's Mods folder** first (preview, then a new "Imported mods" profile), **Start empty** (name field) and **From a shared link** (asks for the Nexus sign-in first when the import needs downloads); otherwise the last two.

## Confirmations

**Toasts** (`toasts/`): bottom right, stacked (at most three; the oldest goes first), each with a coloured edge by kind and a dismiss button; they dismiss after 5 s (10 s for errors and warnings), hover pauses the countdown, and an action is offered where one exists (Undo, Redo update, Retry now, Show). A toast about a mod shows its picture from the card cache. Toasts stay in the session's notification history, the **New** and **Earlier** lists of the title bar bell ([Window](#window); [architecture.md](architecture.md#stack)).

- **Undo** is offered after a history revert, deleting a profile, removing a mod, dismissing a save warning and the Mods selection bar's bulk Tag, Set category, Pin and Skip updates.
- **New downloads:** the downloads folder raises "Add X to Y?" (**Add**) for one new archive in the Downloads or download folder, and "N new archives in your downloads folder" (**Review**, opening **From the downloads folder**) for several, per **Offer new downloads**; never while the game runs.

**Empty states:** a tab with nothing to show centres an icon, a title, a line on how to fill it and, where one helps, a button (`shell/EmptyState.tsx`): Saves with no saves, Problems with none found, Load order with no enabled mods, Console for a profile that has never run (an empty log with past runs shows the log), Performance before a report.

**First-open tips:** the Mods tab, Saves tab, Console and Share dialog each show a short dismissible banner (`tips/TipBanner.tsx`) the first time they open; Settings › General has **Show tips again**.

## Settings

Mortar's Settings holds only what is Mortar-wide, never one game's (the one exception is Downloads' default profile for Nexus links, labelled with its game). Per-game settings are the [Game settings](#game-settings) page. Code: `settings/SettingsPage.tsx`, `SettingsShell.tsx`, `SettingsNav.tsx`, `PrefRow.tsx`, `prefSpecs.ts`, `sections/` (one file per page); the registry is `internal/settings/registry.go`.

### Layout

- A full page with a back button (Esc also returns), reached from the Mortar menu and Ctrl+,, with a section list on the left and the page beside it. While open, the title bar shows a "Settings" tab and no game tab.
- A search field at the top filters rows by label and description across every page; sections with no match hide, and Esc clears the query.
- Every control is a row (16px label and a wrapping 14px description on the left, the control on the right) in its own rounded tile; a section is an 18px heading above its stack of tiles, in one content column capped at 880px. Under 560px wide a row puts its control under the label. Controls inside rows are filled, not outlined.
- A choice whose options each carry an explanation renders as radio cards under the label; two to four short options as a segmented strip; longer or dynamic lists as a dropdown.
- The section list shows an icon per page, with dividers after Appearance, Notifications and Launchers; 224px wide, 196px below a 1000px window.
- Lists and multi-step flows open dialogs rather than growing the page.
- Docs never state a setting's default; `mortar settings get` shows it.

### Pages

General opens first; every page's rows are in `settings/sections/` (one file per page). Rules and non-obvious behaviour:

- **General:** startup and window (including **Keep Mortar in the tray**, [Title bar](#title-bar)), antivirus, language, sharing, help, settings file.
  - **Antivirus** (app-wide): Automatic (Windows' antivirus through AMSI, clamd on Linux when it runs), clamd socket, Custom command (`{path}` is the folder; exit 0 is clean, any other code a detection named by the first line it prints) or Off (the mod sites' own scans still apply). The choice has no row title under the section heading, a **Scanner in use** line right under it, and the socket path or command field only under its choice. A flagged download is refused ("Flagged by <scanner>: <name> in <file>") with **Install anyway**, which asks in an error-coloured confirm, records the override in the profile's History and installs unscanned. A scan that could not finish installs the mod and warns that it was installed unscanned.
  - **Language:** the OS language when unset; English is the only catalog, so the select is disabled.
  - **Sharing:** LAN sharing, device name, auto-accept from my other Mortars, what a shared profile includes, and the port (**Automatic** stores 0, [architecture.md](architecture.md#sharing)); on Windows a firewall row with **Fix** appears when incoming sends are blocked.
  - **Settings file:** export and import through native dialogs; import lists what would change grouped by section, each ticked, and applies only the ticked sections ([architecture.md](architecture.md#settings-file)).
- **Appearance:** theme, accent, background ([Surfaces and colour](#surfaces-and-colour)), display (applied at once), mods view (default view, card size, author on cards, grouping, implicit mods, **Default sort** over every sortable list column in either direction), sidebar.
- **Mods and profiles:** installing behaviour and the **Sync folder** (profile settings, mod lists and configs are written there and offered to other machines using it; mod files are not copied; [Sync offers](#sync-offers)).
- **Downloads:** **Nexus links** (**Handle "Mod Manager Download" links** names the current owner in its tooltip and confirms before taking them from another app; a row to send other games' links to the previous handler appears when one is recorded; the extension connection; the default profile for Nexus links, **Last opened profile** when unset, is the one game-labelled row in Mortar's Settings), **Downloading** (parallelism, retry, pause while playing, MD5, preferred server once servers are seen) and **Files** (download folder, empty meaning the data folder's downloads directory).
- **Accounts:** one section per account. **Nexus Mods:** the personal API key, or once signed in a green alert with the account, a Premium or Free chip and **Sign out** (the first sign-in asks whether Mortar should handle `nxm://` links); **Untrack unused…** confirms that Nexus has no undo; an API-requests meter from the last response (free accounts get a note that each download needs one click on Nexus). **GitHub:** Mortar uses the `gh` login when present, which raises the rate limit, else the row says to run `gh auth login`. **itch.io:** an **API key** password field (kept in the system keyring; created on itch.io under Settings, API keys) with **Test**; a rejected key shows an error alert and stores nothing.
- **Updates:** **Mortar** (version, check, download, restart; a development or packaged build says it does not check; beta releases offer nightlies from GitHub; automatic install) and **Mods** (check at start; how often the open profile is rechecked while running; the background pass over every profile is fixed at 5 minutes after start, then every 4 hours; only enabled mods; pre-release versions).
- **Notifications:** a matrix of events (download finishes, download fails, game crashes, mod updates found) by **In Mortar** (toast) and **Desktop** (an OS notification with the app icon, sent whether or not the window is focused); the update digest (off, each, daily) also paces the desktop notice.
- **Storage:** **Move…** copies the data folder to a chosen empty location, verifies the copy, records `data-location` at the default path, removes the old copy and restarts; it is off with a reason while the game runs, and its confirm shows destination, data size and free space, refusing when space is short or the target is inside the current folder or not empty, with determinate progress. **Usage** is one tile measured in the background (total, space saved by sharing files, a segmented bar of profiles, store, cache, save backups, trash and other with an inline legend) with **Clean up…** (unused store items, older copies of a mod with the newest kept, leftover files, each ticked and sized, error-coloured **Remove**), **Clear cache…** (problem scans rebuild on the next check) and **Deleted profiles…**; **By game** lists sizes. **Integrity** checks store files with progress and a summary, and Mortar also verifies slowly in the background about once a week. **Retention** sets unused store item days, trash days and history events kept (per-game save backup and profile history rows live on the game's settings pages).
- **Launchers:** the [First run](#first-run) launcher rows.
- **Shortcuts:** grouped rows with a filter and keycaps. Click a keycap to record a combo (Esc cancels); a combo used by another row is refused, naming that action. Each row has Reset; **Reset all** asks first. Bindings persist in `settings.json`. Except Esc, shortcuts stay silent while typing or with a dialog open. Fixed keys: Ctrl+J Downloads, Ctrl+Shift+N notifications, Ctrl+PageUp/PageDown move the open profile, Ctrl+B sidebar, Ctrl+Shift+F find in all profiles, Ctrl+Shift+P plays without SMAPI.
- **About:** logo, licence, repository and **Open-source licences**: a dialog listing every library, icon and artwork built into Mortar in an aligned grid of 260px columns (name linking its page, then licence id); things Mortar downloads at run time (SMAPI, BepInEx, the mod dataset) are not listed. **Diagnostics:** **Run checks…** shows one row per check kind (Mortar version, data folder, games, Nexus download links, browser extension across every browser, settings, profiles, disk space, mod store) with its worst status, detail lines and **Repair** where one exists, plus **Copy report**, **Save diagnostics…** (the redacted zip) and **Run again**. A game that is not installed only warns when no game is.

### Game settings

Per game, on their own page (`settings/GameSettingsPage.tsx`), opened by the last icon button in the game screen's tab row (Lucide Settings2, "<game> settings") after **Share**. It reuses Settings' layout (nav with a back button to the game, search, Esc returns) with pages **Install**, the game's loader (**SMAPI** for Stardew Valley; none for a loader-less game), **Play**, **Mods**, **Save backups**, **Console** (only for a loader with a console) and **Streaming**; the title bar keeps the game tab highlighted. Anything tied to a game's loader, launcher, saves or content format lives here, with a per-profile override ([Edit profile](#edit-profile)).

- **Install › Game folder:** path, where it was found (or "Chosen by you"), game version, **Browse…** (checked before save) and **Use discovered** while a chosen folder overrides discovery; several found installs add a radio list; Flatpak Steam without read access adds a row with the grant command and **Grant access**. Backend errors (including a running game) show under the folder. **Reset game install** (outlined, error colour) deletes the folder, SMAPI and the mods placed there while keeping Saves and Mortar profiles ([architecture.md](architecture.md#finding-the-game)); on Windows a toast then offers to remove SMAPI from Steam's launch options.
- **SMAPI:** one row: installed version, a version picker (Latest or pinned) and one button (Install, Update or Reinstall while following Latest; **Install <version>…** for a pinned version, which asks first since every profile switches). Then update notices and `never` / `show` / `include` for pre-releases and unofficial builds.
- **Mods:** **Preferred source** is an ordered list (Move up, Move down): when a mod is on several sites its card installs from the first. **Dismissed folders** (game Mods folders the user chose not to move, each with **Offer again**) shows only when there are any.
- **Save backups:** back up before Play, one kept-count per kind (before Play, before a mod update, before a restore), scheduled backups (0 is Off) with a status line (a failed pass toasts with **Open backups folder**), per-save retention (off with a reason while scheduling is off), the backup folder, and a size with **Trim…**.
- **Streaming › Stream overlay** (`sections/StreamOverlay.tsx`, `overlayUrl.ts`; stored as `overlayEnabled`, `overlayPort`, `overlayToken`; the palette's Stream overlay action opens this page): changes apply on the next Play. Enabled, it offers **Show labels** (this visit only, not stored) and **Values**, which read "Load a save to see values" when `inGame` is false and "Start the game to see values" when the bridge is unreachable. Groups: World, Player and Skills for Stardew Valley; Player and Game for Lethal Company (moon, crew, day, quota, days left, credits) and Valheim (biome, day, bosses defeated, boss names), whose bridge reports a `game` in `/state` that also selects the OBS page's layout. Each field (plus All values) has a live preview (polled from `/state` every 2 s; an empty value is an em dash) and a copy icon for its OBS `file://` URL (`field` omitted on All values; `label=1` when Show labels is on). An OBS how-to (Sources, +, Browser, width 400, height 80, Custom CSS) offers **Copy CSS** using `#player` / `.player`, `#money` / `.money`, `#skill-mining` / `.skill.mining`. **Port** (1024 to 65535) and **Token** (password field with show/hide, copy and **Regenerate…**).

## Browser extension

The MV3 extension ([Rethunk-Tech/mortar-browser-extension](https://github.com/Rethunk-Tech/mortar-browser-extension), own repo and version) on `www.nexusmods.com`. When the two sides do not share a native-messaging protocol, its popup, button and filter section say **Update Mortar: it is too old for this browser extension** or **Update the browser extension: it is too old for this Mortar**. Native-host requests: [architecture.md](architecture.md#nexus-mods).

- **Popup:** **On Nexus pages** select (**Off (do not mark Nexus pages)** / **Highlight** / **Hide mods in profile**, stored in `chrome.storage.local` as `mode`). A status line says which state the connection is in (Mortar not installed, with **Open Mortar** hidden; not running, with **Open Mortar** primary; no profile open; the app's connection setting off; profile unreadable; or connected with the mod count). **Open Mortar** and **Check now** follow, and only while connected an **Updates** list linking each mod with its installed and latest version.
- **Listings, search and collections:** in Highlight, mod tiles (`data-e2eid="mod-tile"` and Nexus's other tile attributes) whose Nexus id is in the open profile get a green outline and **In profile** badge, or an amber **Update available** badge when Mortar knows of one; Hide removes those tiles (the installed row is disabled with its reason as text under it, and counts the removed tiles); Off draws nothing, the Mortar filter section included. The app's **Browser extension connection: Off** has the same effect everywhere (marks, panels, labels, updates), and a connection problem shows as a muted line in the filter section. Collection pages (`/games/<game>/collections/<slug>`, tiles linking to `/<game>/mods/<id>`) use the same marks. Mortar's UI appears only on games the native host lists as supported; other games' pages are left alone. A disabled row always shows its reason as text, and the download dialog is followed only when Mortar is installed and not Off.
- **Listing filters:** a Mortar section at the top of Nexus's filter sidebar (`#filters-panel`, built from Nexus's own classes) with three rows that dim and desaturate tiles in place (the listing keeps its length; hovering a dimmed tile brings it back up), saved per game in the extension's storage:
  - **Gray out mods in profile:** tiles of mods in the profile last open for that game.
  - **Gray out obsolete:** tiles whose title, or summary where the word speaks for the mod (its start, "This mod/file…", or a heading line), says obsolete, deprecated or depreciated: the same words and rule as the Problems check's author-marked mods (`authorStatusWord`; the extension's tests pin the same words). No connection to Mortar is needed.
  - **Gray out broken:** mods SMAPI's compatibility list marks broken for the version last played ([architecture.md](architecture.md#nexus-mods)); needs Mortar installed but not running.
- **Mod page:** a read-only panel under the title: **In <profile>: v<version>** or **Not in <profile>**, **Also in:** other profile names, **Nexus has a newer version**, **Update available in N of your profiles** (installed version older than the page's latest file, or Mortar's cached Nexus details mark an update), **Required by N mods in <profile>** (names on hover), **Pinned** or a skipped version or source when set on the entry, and **Open in Mortar** (`mortar://<game>/mod/<id>`). Off removes the panel.
