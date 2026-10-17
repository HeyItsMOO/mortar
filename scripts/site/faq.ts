// /faq/ from scripts/site/faq.md, the "Why Mortar?" pages from scripts/site/why/<manager>.md, and the landing page's
// short list of questions that links into the FAQ.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { brandIcon } from './brands.ts'
import { escapeHTML, page } from './chrome.ts'
import { SOURCE_NAMES } from './games.ts'

const FAQ = 'scripts/site/faq.md'
const WHY = 'scripts/site/why'
const LANDING_QUESTIONS = 4

interface Why {
  id: string
  /** The other manager's name, from the page's first heading "# Why Mortar? (vs <name>)". */
  name: string
  md: string
}

export function whyPages(): Why[] {
  if (!existsSync(WHY)) {
    return []
  }
  return readdirSync(WHY)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => {
      const md = readFileSync(`${WHY}/${f}`, 'utf8')
      const name = /^# Why Mortar\? \(vs (.+)\)\n/.exec(md)?.[1]
      if (!name) {
        throw new Error(`site: ${WHY}/${f} must start with "# Why Mortar? (vs <manager>)"`)
      }
      return { id: f.replace(/\.md$/, ''), name, md: md.replace(/^# .*\n/, '') }
    })
}

function render(md: string): string {
  return Bun.markdown
    .html(md, { headings: { ids: true } })
    .replaceAll('<table>', '<div class="table-wrap"><table>')
    .replaceAll('</table>', '</table></div>')
}

/** The FAQ's questions and their Markdown answers, in file order. */
function questions(gameCount: number, whys: Why[]): { q: string; a: string; id: string }[] {
  const whyLinks = whys.map((w) => `- [Why Mortar? (vs ${w.name})](/why/${w.id}/)`).join('\n')
  const md = readFileSync(FAQ, 'utf8')
    .replaceAll('GAME_COUNT', String(gameCount))
    .replaceAll('WHY_LINKS', whyLinks)
  return md
    .split(/^## /m)
    .filter((part) => part.trim() !== '')
    .map((part) => {
      const [q = '', ...rest] = part.split('\n')
      const id =
        Bun.markdown.html(`## ${q}`, { headings: { ids: true } }).match(/id="([^"]+)"/)?.[1] ?? ''
      return { q: q.trim(), a: rest.join('\n').trim(), id }
    })
}

const plain = (md: string) =>
  md
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()

export function faqPage(gameCount: number, whys: Why[]): string {
  const qs = questions(gameCount, whys)
  const md = qs.map((x) => `## ${x.q}\n\n${x.a}\n`).join('\n')
  return page({
    path: 'site/faq/index.html',
    current: 'faq',
    title: 'Mortar FAQ',
    description:
      'Answers about Mortar: price, games, Nexus Mods, the Steam Deck, downloads and coming from another mod manager.',
    body: `      <h1 class="ext-title">Questions</h1>
      <p class="lede">Short answers about Mortar. The <a href="/guide/">user guide</a> covers everything in detail.</p>
      <div class="faq-page">
${render(md)}
      </div>`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: qs.map((x) => ({
        '@type': 'Question',
        name: x.q,
        acceptedAnswer: { '@type': 'Answer', text: plain(x.a) },
      })),
    },
  })
}

/** The landing page's FAQ teaser: the first questions, each linking to its answer, and a link to the rest. */
export function landingFaq(gameCount: number, whys: Why[]): string {
  const qs = questions(gameCount, whys)
  const items = qs
    .slice(0, LANDING_QUESTIONS)
    .map((x) => `<li><a href="/faq/#${x.id}">${escapeHTML(x.q)}</a></li>`)
    .join('\n            ')
  return `
          <ul class="faq-links">
            ${items}
          </ul>
          <p class="center"><a class="btn-ghost" href="/faq/">All ${qs.length} questions</a></p>
          `
}

/** A run of `:source:` tokens (`:nexus: :github:`) as one row of mod-site icons. */
const sourceIcons = (html: string) =>
  html.replace(/(?::[a-z]+:\s*)+/g, (run) => {
    const ids = run.match(/[a-z]+/g) ?? []
    if (!ids.every((id) => id in SOURCE_NAMES || id === 'hexium')) {
      return run
    }
    const icons = ids.map((id) => brandIcon(id, SOURCE_NAMES[id] ?? 'Hexium')).join('')
    return `<span class="icon-row">${icons}</span>${run.endsWith(' ') ? ' ' : ''}`
  })

/** Mortar's own counts, filled into a comparison page's GAME_COUNT and THUNDERSTORE_COUNT. */
interface Counts {
  games: number
  thunderstore: number
}

export function whyPage(w: Why, counts: Counts): string {
  const md = w.md
    .replaceAll('GAME_COUNT', String(counts.games))
    .replaceAll('THUNDERSTORE_COUNT', String(counts.thunderstore))
  return page({
    path: `site/why/${w.id}/index.html`,
    title: `Why Mortar? (vs ${w.name})`,
    description: `How Mortar compares with ${w.name}, with sources for every claim about ${w.name}.`,
    body: `      <h1 class="ext-title">Why Mortar? (vs ${escapeHTML(w.name)})</h1>
${sourceIcons(render(md))
  .replaceAll('<td>!win ', '<td class="win">')
  // An even row highlights both sides: every value cell after the row's label.
  .replace(/<tr><td>(.*?)<\/td>(.*?)<\/tr>/g, (row, label: string, cells: string) =>
    cells.includes('class="win"')
      ? row
      : `<tr><td>${label}</td>${cells.replaceAll('<td>', '<td class="win">')}</tr>`,
  )
  .replace(
    '</table></div>',
    '</table></div>\n<p class="table-note">Highlighted: the stronger of the two, or both where they are even.</p>',
  )}
      <div class="cta ext-cta">
        <a class="btn" href="/download/">Download Mortar</a>
        <a class="btn-ghost" href="/faq/">All questions</a>
      </div>`,
  })
}
