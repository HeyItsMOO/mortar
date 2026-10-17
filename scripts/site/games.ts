// A page and a share page per playable game in the bundled catalog, and the linked game list on the landing page.
import { readFileSync } from 'node:fs'
import { escapeHTML, listed, page, SITE } from './chrome.ts'

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

// Steam's header art is this size; the games grid shows it at half.
const HEADER = { width: 460, height: 215 }

function artImage(g: Game, art: Record<string, string>, width: number, height: number): string {
  const appId = (g.stores?.steam as { appId?: string } | undefined)?.appId
  const src = appId ? art[appId] : undefined
  return src
    ? `<img class="game-art" src="${src}" width="${width}" height="${height}" alt="${escapeHTML(g.name)} on Steam" loading="lazy" referrerpolicy="no-referrer" />`
    : ''
}

/** The game's own page: what Mortar does for it and how to start, from its catalog entry. */
export function gamePage(g: Game, art: Record<string, string>): string {
  const f = facts(g)
  const name = escapeHTML(g.name)
  const loaderRow = f.loader
    ? `<tr><td>Mod loader</td><td>${escapeHTML(f.loader)}, installed and kept up to date per profile</td></tr>`
    : "<tr><td>Mod loader</td><td>None needed: Mortar puts each profile's mods where the game reads them</td></tr>"
  const install = f.loader
    ? `Pick ${name}. Mortar installs ${escapeHTML(f.loader)} and makes your first profile.`
    : `Pick ${name}. Mortar makes your first profile and keeps its mods apart from every other profile's.`
  const body = `      <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Mortar</a> › <a href="/games/">Games</a></nav>
      <h1 class="ext-title">${name}</h1>
      <p class="lede">Mod ${name} with Mortar, a free and open source mod manager for Linux, Windows and Steam Deck.</p>
      ${artImage(g, art, HEADER.width, HEADER.height)}
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
        <a class="btn-ghost" href="/games/">All supported games</a>
      </div>`
  const loaderText = f.loader ? `installs ${f.loader}, ` : ''
  return page({
    path: `site/${g.id}/index.html`,
    title: `${g.name} mod manager: Mortar`,
    description: `Mortar is a free, open source mod manager for ${g.name} on Linux, Windows and Steam Deck: it ${loaderText}keeps each set of mods in its own profile and downloads from ${f.sources}.`,
    body,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Mortar', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Games', item: `${SITE}/games/` },
        { '@type': 'ListItem', position: 3, name: g.name, item: `${SITE}/${g.id}/` },
      ],
    },
  })
}

export function sharePage(g: Game): string {
  return readFileSync(SHARE_PAGE, 'utf8').replaceAll('GAME_NAME', escapeHTML(g.name))
}

const FEATURED = ['stardew', 'lethal-company', 'valheim', 'vintage-story', 'sims4']

/** The landing page's answer to which games: the best known by name, then a link to the full list. */
export function gameList(games: Game[]): string {
  const featured = FEATURED.flatMap((id) => games.filter((g) => g.id === id))
  const links = featured.map((g) => `<a href="/${g.id}/">${escapeHTML(g.name)}</a>`)
  return `${links.join(', ')} and <a href="/games/">${games.length - featured.length} more</a>`
}

function options(label: string, id: string, values: string[]): string {
  const opts = [...new Set(values)].sort((a, b) => a.localeCompare(b))
  return `<label>${label}
          <select id="${id}"><option value="">Any</option>${opts.map((v) => `<option>${escapeHTML(v)}</option>`).join('')}</select>
        </label>`
}

/** /games/: every playable game as a card, filtered in the browser by name, loader, mod site and store. */
export function gamesIndexPage(games: Game[], art: Record<string, string>): string {
  const loaderOf = (g: Game) => facts(g).loader || 'None needed'
  const sourcesOf = (g: Game) =>
    named(
      (g.sources ?? []).map((s) => s.id),
      SOURCE_NAMES,
    )
  const storesOf = (g: Game) => named(Object.keys(g.stores ?? {}), STORE_NAMES)
  const sorted = [...games].sort((a, b) => a.name.localeCompare(b.name))
  const cards = sorted
    .map(
      (
        g,
      ) => `        <li data-name="${escapeHTML(g.name.toLowerCase())}" data-loader="${escapeHTML(loaderOf(g))}" data-sources="${escapeHTML(sourcesOf(g).join('|'))}" data-stores="${escapeHTML(storesOf(g).join('|'))}">
          <a href="/${g.id}/">${artImage(g, art, HEADER.width / 2, Math.round(HEADER.height / 2))}<span class="game-name">${escapeHTML(g.name)}</span><span class="game-meta">${escapeHTML(loaderOf(g))}</span></a>
        </li>`,
    )
    .join('\n')
  return page({
    path: 'site/games/index.html',
    title: 'Games Mortar supports',
    description: `The ${games.length} games Mortar manages mods for, with each game's mod loader, mod sites and stores.`,
    script: '/games.js',
    body: `      <h1 class="ext-title">Supported games</h1>
      <p class="lede">${games.length} games, each with its mod loader and mod sites set up for you. Pick one to see how Mortar handles it.</p>
      <div class="game-filters">
        <label>Search <input type="search" id="game-q" autocomplete="off" placeholder="Game name" /></label>
        ${options('Mod loader', 'game-loader', games.map(loaderOf))}
        ${options('Mod site', 'game-source', games.flatMap(sourcesOf))}
        ${options('Store', 'game-store', games.flatMap(storesOf))}
      </div>
      <p class="game-count" id="game-count" aria-live="polite"></p>
      <ul class="game-grid" id="game-grid">
${cards}
      </ul>`,
  })
}
