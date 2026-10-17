// The parts every page of the site shares: nav, footer, search and link-preview metadata, and the page frame the
// generated pages are written in.

export const SITE = 'https://mortar.rethunk.tech'
export const REPO = 'https://github.com/Rethunk-Tech/mortar'
const DISCORD = 'https://discord.gg/TfecaTm8J2'
const OG_IMAGE = {
  url: `${SITE}/img/og-dbcbd71467.jpg`,
  alt: "Mortar's game select: the supported games as a grid of cover art",
}

// What differs between pages: where the site root is from the page, which nav link is the current page, whether the
// nav links the FAQ, and which extra links the footer carries.
export interface Page {
  path: string
  root: string
  current?: 'download' | 'extension' | 'guide'
  faq?: boolean
  footer: { downloads?: boolean; agpl?: boolean; source?: string }
}

export function escapeHTML(raw: string): string {
  return raw.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
}

export function listed(names: string[]): string {
  if (names.length <= 1) {
    return names.join('')
  }
  return `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`
}

/** The public address of a file under site/: its folder for an index.html. */
export function urlOf(path: string): string {
  return `${SITE}/${path.replace(/^site\//, '').replace(/index\.html$/, '')}`
}

export function nav(p: Page): string {
  const home = p.root ? '/' : ''
  const link = (href: string, label: string, optional: boolean, current?: string) =>
    `<a${optional ? ' class="optional"' : ''} href="${href}"${current && p.current === current ? ' aria-current="page"' : ''}>${label}</a>`
  return `<nav class="nav" aria-label="Main">
      <div class="wrap">
        <a class="brand" href="/">
          <svg width="28" height="28" aria-hidden="true"><use href="${p.root}img/icons.svg#brand" /></svg>
          Mortar
        </a>
        <div class="nav-links">
          ${link(`${home}#features`, 'Features', true)}
          ${link('/guide/', 'Guide', true, 'guide')}
          ${link('/extension/', 'Extension', true, 'extension')}
          ${p.faq ? `${link(`${home}#faq`, 'FAQ', true)}\n          ` : ''}${link('/download/', 'Download', false, 'download')}
          <a href="${REPO}">GitHub</a>
          <a class="optional" href="${DISCORD}">Discord</a>
        </div>
      </div>
    </nav>`
}

export function footer(p: Page): string {
  const { downloads, agpl, source = REPO } = p.footer
  const links = [
    '<a href="/guide/">Guide</a>',
    '<a href="/changelog/">Changelog</a>',
    '<a href="/privacy/">Privacy</a>',
    '<a href="/code-signing/">Code signing</a>',
    `<a href="${source}">Source</a>`,
    `<a href="${DISCORD}">Discord</a>`,
    ...(downloads ? ['<a href="/download/">Downloads</a>'] : []),
    ...(agpl ? ['<a href="https://www.gnu.org/licenses/agpl-3.0.html">AGPL-3.0</a>'] : []),
  ]
  return `<footer class="foot">
      <div class="wrap">
        <span>Mortar by <a href="https://we.rethunk.tech/">Rethunk.Tech</a>. Not affiliated with any game developer or mod site.</span>
        <span>${links.join(' · ')}</span>
      </div>
    </footer>`
}

/**
 * The canonical address, link-preview and theme metadata of a page. A page that writes its own og:title or
 * og:description outside this block keeps it, and the block leaves that one out.
 */
export function seo(m: {
  url: string
  title: string
  description: string
  ownTitle?: boolean
  ownDescription?: boolean
  jsonLd?: object
}): string {
  const meta = (property: string, content: string) =>
    `<meta property="${property}" content="${escapeHTML(content)}" />`
  return [
    `<link rel="canonical" href="${m.url}" />`,
    '<meta name="theme-color" content="#19191e" />',
    meta('og:type', 'website'),
    meta('og:site_name', 'Mortar'),
    meta('og:url', m.url),
    ...(m.ownTitle ? [] : [meta('og:title', m.title)]),
    ...(m.ownDescription ? [] : [meta('og:description', m.description)]),
    meta('og:image', OG_IMAGE.url),
    meta('og:image:type', 'image/jpeg'),
    meta('og:image:width', '1200'),
    meta('og:image:height', '630'),
    meta('og:image:alt', OG_IMAGE.alt),
    '<meta name="twitter:card" content="summary_large_image" />',
    ...(m.jsonLd
      ? [`<script type="application/ld+json">${JSON.stringify(m.jsonLd)}</script>`]
      : []),
  ].join('\n    ')
}

/** A whole generated page, its links rooted at / so it reads the same from any address (the 404 page included). */
export function page(p: {
  path: string
  title: string
  description: string
  body: string
  current?: Page['current']
  index?: boolean
}): string {
  const frame: Page = {
    path: p.path,
    root: '/',
    faq: false,
    footer: { downloads: true },
    ...(p.current ? { current: p.current } : {}),
  }
  return `<!doctype html>
<!-- Written by scripts/site.ts; edit the generator, not this file. -->
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="referrer" content="no-referrer" />
    <meta name="color-scheme" content="dark" />${p.index === false ? '\n    <meta name="robots" content="noindex" />' : ''}
    <title>${escapeHTML(p.title)}</title>
    <meta name="description" content="${escapeHTML(p.description)}" />
    ${seo({ url: urlOf(p.path), title: p.title, description: p.description })}
    <link rel="icon" href="/favicon.png" />
    <link rel="apple-touch-icon" href="/img/icon-192.png" />
    <link rel="stylesheet" href="/base.css" />
    <link rel="stylesheet" href="/landing.css" />
    <link rel="stylesheet" href="/download.css" />
  </head>
  <body>
    ${nav(frame)}

    <main class="wrap dl prose">
${p.body}
    </main>

    ${footer(frame)}
  </body>
</html>
`
}
