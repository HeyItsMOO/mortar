// Writes every generated part of site/ so nothing there is kept by hand twice: the nav, footer and search metadata of
// the hand-written pages, the landing page's game list and count, a page and a share page per playable game, the
// changelog, the user guide, the 404 page, robots.txt and sitemap.xml.
// `--check` fails instead of writing when anything is stale; the gate runs it that way.
// Either way it fails when a picture under site/ is linked from no page, stylesheet or script, so none ships unused.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname } from 'node:path'
import { refreshSteamArt, steamArt } from './site/art.ts'
import { brandArt, brandSprite } from './site/brands.ts'
import { changelogFeed, changelogPage } from './site/changelog.ts'
import { footer, nav, type Page, page, SITE, seo, urlOf } from './site/chrome.ts'
import { gameList, gamePage, gamesIndexPage, playableGames, sharePage } from './site/games.ts'
import { guidePage } from './site/guide.ts'

const block = (name: string) =>
  new RegExp(`(<!-- ${name}:start -->)[\\s\\S]*?(<!-- ${name}:end -->)`, 'g')

const PAGES: Page[] = [
  { path: 'site/index.html', root: '', faq: true, footer: { downloads: true, agpl: true } },
  {
    path: 'site/download/index.html',
    root: '../',
    current: 'download',
    faq: true,
    footer: { agpl: true },
  },
  { path: 'site/code-signing/index.html', root: '../', footer: {} },
  { path: 'site/privacy/index.html', root: '../', footer: {} },
  {
    path: 'site/extension/index.html',
    root: '../',
    current: 'extension',
    footer: { agpl: true, source: 'https://github.com/Rethunk-Tech/mortar-browser-extension' },
  },
]

function unescapeHTML(raw: string): string {
  return raw
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))
    .replaceAll('&quot;', '"')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
}

function appLd(): object {
  const version = /^\s+version: "([^"]+)"/m.exec(readFileSync('build/config.yml', 'utf8'))?.[1]
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Mortar',
    applicationCategory: 'GameApplication',
    operatingSystem: 'Windows, Linux',
    softwareVersion: version,
    url: `${SITE}/`,
    downloadUrl: `${SITE}/download/`,
    license: 'https://www.gnu.org/licenses/agpl-3.0.html',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }
}

/** The landing page's FAQ as FAQPage data: each <details> summary and its answer's text. */
function faqLd(html: string): object {
  const text = (raw: string) =>
    unescapeHTML(raw.replace(/<[^>]+>/g, ''))
      .replace(/\s+/g, ' ')
      .trim()
  const mainEntity = [
    ...html.matchAll(/<details[^>]*>\s*<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g),
  ].map(([, q, a]) => ({
    '@type': 'Question',
    name: text(q ?? ''),
    acceptedAnswer: { '@type': 'Answer', text: text(a ?? '') },
  }))
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity }
}

/** A hand-written page with its nav, footer, metadata and (on the landing page) game list filled in. */
function handPage(p: Page, playable: ReturnType<typeof playableGames>): string {
  const before = readFileSync(p.path, 'utf8')
  // Function replacements, so `$&` in a game name is not read as a replacement pattern.
  const fill = (src: string, name: string, body: string) =>
    src.replace(block(name), (_, open: string, close: string) => `${open}${body}${close}`)
  const chrome = (html: string) => `\n    ${html}\n    `
  const outside = before.replace(block('seo'), '')
  const title = /<title>([^<]*)<\/title>/.exec(outside)?.[1]
  const description = /<meta\s+name="description"\s+content="([^"]*)"/.exec(outside)?.[1]
  if (title === undefined || description === undefined) {
    throw new Error(`site: ${p.path} needs a <title> and a meta description`)
  }
  let after = fill(before, 'nav', chrome(nav(p)))
  after = fill(after, 'foot', chrome(footer(p)))
  const landing = p.path === 'site/index.html'
  if (landing) {
    after = fill(after, 'games', gameList(playable))
    after = fill(after, 'game-count', String(playable.length))
  }
  after = fill(
    after,
    'seo',
    chrome(
      seo({
        url: urlOf(p.path),
        title: unescapeHTML(title),
        description: unescapeHTML(description),
        ownTitle: /property="og:title"/.test(outside),
        ownDescription: /property="og:description"/.test(outside),
        ...(landing ? { jsonLd: [appLd(), faqLd(after)], feed: true } : {}),
      }),
    ),
  )
  return after
}

function notFoundPage(): string {
  return page({
    path: 'site/404.html',
    title: 'Page not found: Mortar',
    description: 'This page does not exist.',
    index: false,
    body: `      <h1 class="ext-title">Page not found</h1>
      <p class="lede">Nothing lives at this address. A shared profile link opens at <code>mortar.rethunk.tech/&lt;game&gt;/p</code>; check the link was copied whole.</p>
      <div class="cta ext-cta">
        <a class="btn" href="/">Mortar home</a>
        <a class="btn-ghost" href="/guide/">User guide</a>
      </div>`,
  })
}

const games = playableGames()
if (process.argv.includes('--refresh-art')) {
  await refreshSteamArt(
    games.flatMap((g) => (g.stores?.steam as { appId?: string } | undefined)?.appId ?? []),
  )
}
const art = steamArt()
const missingArt = games.filter((g) => {
  const appId = (g.stores?.steam as { appId?: string } | undefined)?.appId
  return appId !== undefined && art[appId] === undefined
})
if (missingArt.length > 0) {
  console.error(
    `site: no Steam art address for ${missingArt.map((g) => g.id).join(', ')}: run bun scripts/site.ts --refresh-art`,
  )
  process.exit(1)
}
const files = new Map<string, string | Buffer>()
files.set('site/games/index.html', gamesIndexPage(games, art))
for (const g of games) {
  files.set(`site/${g.id}/index.html`, gamePage(g, art, games))
  files.set(`site/${g.id}/p/index.html`, sharePage(g))
}
for (const p of PAGES) {
  files.set(p.path, handPage(p, games))
}
files.set('site/changelog/index.html', changelogPage())
files.set('site/changelog/feed.xml', changelogFeed())
files.set('site/img/brands.svg', brandSprite())
for (const [path, bytes] of brandArt()) {
  files.set(path, bytes)
}
files.set('site/guide/index.html', guidePage())
files.set('site/404.html', notFoundPage())
const listedPages = [
  ...PAGES.map((p) => p.path),
  'site/games/index.html',
  'site/guide/index.html',
  'site/changelog/index.html',
  ...games.map((g) => `site/${g.id}/index.html`),
]
files.set(
  'site/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${listedPages.map((p) => `  <url><loc>${urlOf(p)}</loc></url>`).join('\n')}
</urlset>
`,
)
files.set('site/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`)

const check = process.argv.includes('--check')
const stale = [...files].filter(
  ([path, want]) =>
    !existsSync(path) ||
    (typeof want === 'string'
      ? readFileSync(path, 'utf8') !== want
      : !readFileSync(path).equals(want)),
)
if (check && stale.length > 0) {
  console.error(
    `site pages are stale (${stale.map(([p]) => p).join(', ')}): run bun scripts/site.ts`,
  )
  process.exit(1)
}
for (const [path, want] of stale) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, want)
}

const PICTURE = /\.(webp|png|jpe?g|svg|ico|avif|gif)$/
const siteFiles = readdirSync('site', { recursive: true, encoding: 'utf8' })
const linking = [
  ...siteFiles
    .filter((f) => /\.(html|css|js)$/.test(f))
    .map((f) => readFileSync(`site/${f}`, 'utf8')),
  readFileSync('scripts/site/chrome.ts', 'utf8'),
].join('\n')
const unlinked = siteFiles.filter((f) => PICTURE.test(f) && !linking.includes(basename(f)))
if (unlinked.length > 0) {
  console.error(`site pictures nothing links: ${unlinked.join(', ')}`)
  process.exit(1)
}
