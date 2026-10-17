// A page and a share page per playable game in the bundled catalog, and the linked game list on the landing page.
import { readFileSync } from 'node:fs'
import { escapeHTML, listed, page } from './chrome.ts'

const CATALOG = 'internal/components/components.json'
const SHARE_PAGE = 'scripts/site/share-page.html'

export interface Game {
  id: string
  name: string
  enabled: boolean
  stores?: Record<string, unknown>
  loaders?: { id: string; name: string }[]
  sources?: { id: string }[]
}

const STORE_NAMES: Record<string, string> = {
  steam: 'Steam',
  gog: 'GOG',
  epic: 'Epic Games',
  ea: 'the EA app',
  xbox: 'the Xbox app',
  lutris: 'Lutris',
  bottles: 'Bottles',
  flatpak: 'its Flatpak',
  standalone: 'where its own installer puts it',
}

const SOURCE_NAMES: Record<string, string> = {
  nexus: 'Nexus Mods',
  thunderstore: 'Thunderstore',
  curseforge: 'CurseForge',
  modrinth: 'Modrinth',
  github: 'GitHub',
  vsmoddb: 'the Vintage Story Mod DB',
  itch: 'itch.io',
  patreon: 'Patreon posts',
}

export function playableGames(): Game[] {
  const { games } = JSON.parse(readFileSync(CATALOG, 'utf8')) as { games: Game[] }
  return games.filter((g) => g.enabled)
}

function named(ids: string[], names: Record<string, string>): string[] {
  return ids.map((id) => {
    const name = names[id]
    if (!name) {
      throw new Error(`site: no display name for "${id}"; add it to scripts/site/games.ts`)
    }
    return name
  })
}

function facts(g: Game) {
  const loaders = (g.loaders ?? []).map((l) => l.name).filter((n) => n !== '')
  return {
    loader: listed(loaders),
    stores: listed(named(Object.keys(g.stores ?? {}), STORE_NAMES)),
    sources: listed(
      named(
        (g.sources ?? []).map((s) => s.id),
        SOURCE_NAMES,
      ),
    ),
  }
}

/** The game's own page: what Mortar does for it and how to start, from its catalog entry. */
export function gamePage(g: Game): string {
  const f = facts(g)
  const name = escapeHTML(g.name)
  const loaderRow = f.loader
    ? `<tr><td>Mod loader</td><td>${escapeHTML(f.loader)}, installed and kept up to date per profile</td></tr>`
    : "<tr><td>Mod loader</td><td>None needed: Mortar puts each profile's mods where the game reads them</td></tr>"
  const install = f.loader
    ? `Pick ${name}. Mortar installs ${escapeHTML(f.loader)} and makes your first profile.`
    : `Pick ${name}. Mortar makes your first profile and keeps its mods apart from every other profile's.`
  const body = `      <h1 class="ext-title">${name}</h1>
      <p class="lede">Mod ${name} with Mortar, a free and open source mod manager for Linux, Windows and Steam Deck.</p>
      <div class="table-wrap">
        <table>
          <tbody>
            ${loaderRow}
            <tr><td>Mods from</td><td>${escapeHTML(f.sources)}, searched together in Browse</td></tr>
            <tr><td>Finds the game in</td><td>${escapeHTML(f.stores)}, or a folder you choose</td></tr>
            <tr><td>Profiles</td><td>As many as you like, each with its own mods and settings, shared as a link</td></tr>
          </tbody>
        </table>
      </div>
      <h2>Start modding ${name}</h2>
      <ol class="steps">
        <li><a href="/download/">Download Mortar</a> for Linux or Windows and open it.</li>
        <li>${install}</li>
        <li>Open Browse, add the mods you want, and press Play.</li>
      </ol>
      <h2>Share a profile</h2>
      <p>A ${name} profile shared from Mortar is a link to <code>mortar.rethunk.tech/${g.id}/p</code>. Whoever opens it sees the mod list and imports it into Mortar in one click; the profile never leaves their browser.</p>
      <div class="cta ext-cta">
        <a class="btn" href="/download/">Download Mortar</a>
        <a class="btn-ghost" href="/#which-games">All supported games</a>
      </div>`
  const loaderText = f.loader ? `installs ${f.loader}, ` : ''
  return page({
    path: `site/${g.id}/index.html`,
    title: `${g.name} mod manager: Mortar`,
    description: `Mortar is a free, open source mod manager for ${g.name} on Linux, Windows and Steam Deck: it ${loaderText}keeps each set of mods in its own profile and downloads from ${f.sources}.`,
    body,
  })
}

export function sharePage(g: Game): string {
  return readFileSync(SHARE_PAGE, 'utf8').replaceAll('GAME_NAME', escapeHTML(g.name))
}

/** The landing page's sentence of supported games, each name linking to its page. */
export function gameList(games: Game[]): string {
  return listed(games.map((g) => `<a href="/${g.id}/">${escapeHTML(g.name)}</a>`))
}
