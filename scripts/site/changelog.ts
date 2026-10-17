// /changelog/: every release's player-facing notes (build/release/notes/v*.md), newest first, dated from the
// AppStream metainfo's release list so no git history is needed to build it.
import { readdirSync, readFileSync } from 'node:fs'
import { escapeHTML, page, REPO } from './chrome.ts'

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

export function changelogPage(): string {
  const metainfo = readFileSync(METAINFO, 'utf8')
  const versions = readdirSync(NOTES)
    .map((f) => /^v(\d+\.\d+\.\d+)\.md$/.exec(f)?.[1])
    .filter((v): v is string => v !== undefined)
    .sort(byVersionDesc)
  const sections = versions.map((v) => {
    const date = new RegExp(`<release version="${v.replaceAll('.', '\\.')}" date="([^"]+)"`).exec(
      metainfo,
    )?.[1]
    if (!date) {
      throw new Error(`site: ${METAINFO} has no dated <release version="${v}">`)
    }
    return `      <section id="v${v}">
        <h2><a href="${REPO}/releases/tag/v${v}">${v}</a> <time datetime="${date}">${date}</time></h2>
${release(readFileSync(`${NOTES}/v${v}.md`, 'utf8'))}
      </section>`
  })
  return page({
    path: 'site/changelog/index.html',
    title: 'Mortar changelog',
    description: "What's new in each Mortar release: new games, features and fixes.",
    body: `      <h1 class="ext-title">Changelog</h1>
      <p class="lede">What changed in each release, newest first. The app shows the same notes in What's new after an update.</p>
${sections.join('\n')}`,
  })
}
