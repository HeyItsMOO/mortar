// /guide/: docs/user-guide.md rendered with Bun's Markdown renderer, its links into the repo pointed at GitHub.
import { readFileSync } from 'node:fs'
import { escapeHTML, page, REPO } from './chrome.ts'

const GUIDE = 'docs/user-guide.md'

/** A link relative to docs/ points into the repo on GitHub; site and web addresses stay as they are. */
function repoLink(href: string): string {
  if (/^([a-z]+:|#|\/)/.test(href)) {
    return href
  }
  const path = new URL(href, 'https://repo.invalid/docs/').pathname.slice(1)
  return `${REPO}/blob/main/${path}`
}

export function guidePage(): string {
  const md = readFileSync(GUIDE, 'utf8').replace(/^# .*\n/, '')
  const html = Bun.markdown
    .html(md, { headings: { ids: true } })
    .replace(/href="([^"]+)"/g, (_, href: string) => `href="${repoLink(href)}"`)
    .replaceAll('<table>', '<div class="table-wrap"><table>')
    .replaceAll('</table>', '</table></div>')
  const contents = [...html.matchAll(/<h2 id="([^"]+)">(.*?)<\/h2>/g)]
    .map(([, id, text]) => `<li><a href="#${id}">${text}</a></li>`)
    .join('\n          ')
  return page({
    path: 'site/guide/index.html',
    current: 'guide',
    title: 'Mortar user guide',
    description:
      'How to install Mortar, add and update mods, keep profiles, share them, play and read Problems, for every game Mortar supports.',
    css: '/guide.css',
    module: '/guide.js',
    body: `      <h1 class="ext-title">User guide</h1>
      <p class="lede">${escapeHTML('Everything Mortar does, section by section.')}</p>
      <div class="guide-layout">
        <nav class="toc" aria-label="Contents">
          <ol>
          ${contents}
          </ol>
        </nav>
        <div class="guide">
${html}
        </div>
      </div>`,
  })
}
