// /changelog/: every release's player-facing notes (build/release/notes/v*.md), newest first, dated from the
// AppStream metainfo's release list so no git history is needed to build it.
import { readdirSync, readFileSync } from 'node:fs'
import { escapeHTML, page, REPO, SITE } from './chrome.ts'

const NOTES = 'build/release/notes'
const METAINFO = 'build/linux/tech.rethunk.Mortar.metainfo.xml'

function byVersionDesc(a: string, b: string): number {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pb[i] ?? 0) - (pa[i] ?? 0)
    if (d !== 0) {
      return d
    }
  }
  return 0
}

/** A notes file's "## Group", "### Area" and "- line" lines as HTML. */
function release(md: string): string {
  const out: string[] = []
  let open = false
  const close = () => {
    if (open) {
      out.push('</ul>')
      open = false
    }
  }
  for (const line of md.split('\n')) {
    const heading = /^(##|###) (.+)$/.exec(line)
    if (heading) {
      close()
      const tag = heading[1] === '##' ? 'h3' : 'h4'
      out.push(`<${tag}>${escapeHTML(heading[2] ?? '')}</${tag}>`)
    } else if (line.startsWith('- ')) {
      if (!open) {
        out.push('<ul>')
        open = true
      }
      out.push(`<li>${escapeHTML(line.slice(2))}</li>`)
    }
  }
  close()
  return out.map((l) => `        ${l}`).join('\n')
}

interface Release {
  version: string
  date: string
  html: string
}

/** Every release with written notes, newest first, dated from the metainfo. */
function releases(): Release[] {
  const metainfo = readFileSync(METAINFO, 'utf8')
  return readdirSync(NOTES)
    .map((f) => /^v(\d+\.\d+\.\d+)\.md$/.exec(f)?.[1])
    .filter((v): v is string => v !== undefined)
    .sort(byVersionDesc)
    .map((version) => {
      const date = new RegExp(
        `<release version="${version.replaceAll('.', '\\.')}" date="([^"]+)"`,
      ).exec(metainfo)?.[1]
      if (!date) {
        throw new Error(`site: ${METAINFO} has no dated <release version="${version}">`)
      }
      return { version, date, html: release(readFileSync(`${NOTES}/v${version}.md`, 'utf8')) }
    })
}

export function changelogPage(): string {
  // The newest release reads open; older ones fold, so the page is a list of versions rather than one long wall.
  const sections = releases().map(
    (r, i) => `      <details class="release" id="v${r.version}"${i === 0 ? ' open' : ''}>
        <summary><h2>${r.version} <time datetime="${r.date}">${r.date}</time></h2></summary>
        <p class="release-link"><a href="${REPO}/releases/tag/v${r.version}">Downloads and full changelog for ${r.version}</a></p>
${r.html}
      </details>`,
  )
  return page({
    path: 'site/changelog/index.html',
    title: 'Mortar changelog',
    description: "What's new in each Mortar release: new games, features and fixes.",
    feed: true,
    body: `      <h1 class="ext-title">Changelog</h1>
      <p class="lede">What changed in each release, newest first. The app shows the same notes in What's new after an update. <a href="/changelog/feed.xml">Follow releases in a feed reader</a>.</p>
${sections.join('\n')}`,
  })
}

/** An Atom feed of the same releases, one entry each. */
export function changelogFeed(): string {
  const all = releases()
  const entries = all.map(
    (r) => `  <entry>
    <title>Mortar ${r.version}</title>
    <id>${SITE}/changelog/#v${r.version}</id>
    <link href="${SITE}/changelog/#v${r.version}" />
    <updated>${r.date}T00:00:00Z</updated>
    <content type="html">${escapeHTML(r.html)}</content>
  </entry>`,
  )
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Mortar releases</title>
  <id>${SITE}/changelog/</id>
  <link href="${SITE}/changelog/" />
  <link rel="self" href="${SITE}/changelog/feed.xml" />
  <updated>${all[0]?.date ?? '1970-01-01'}T00:00:00Z</updated>
  <author><name>Rethunk.Tech</name></author>
${entries.join('\n')}
</feed>
`
}
