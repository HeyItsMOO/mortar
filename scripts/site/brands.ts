// Mod site and store marks for the game pages, from the same simple-icons marks and vendor artwork the app draws
// (frontend/src/brand), as one SVG sprite plus copies of the artwork that is not a vector mark.
import { readFileSync } from 'node:fs'
import {
  siCurseforge,
  siDiscord,
  siEa,
  siEpicgames,
  siFlatpak,
  siGithub,
  siGogdotcom,
  siItchdotio,
  siLutris,
  siModrinth,
  siPatreon,
  siSteam,
  siThunderstore,
} from 'simple-icons'
import { escapeHTML } from './chrome.ts'

const VENDOR = 'frontend/src/brand/vendor'
// The app draws Xbox as a plain X rather than Microsoft's mark (frontend/src/brand/launchers/LauncherLogo.tsx).
// A game its own installer put in place has no store, so it gets a generic install mark (Material Design's
// "download", Apache-2.0).
const INSTALL_PATH = 'M12 3v10.17l3.59-3.58L17 11l-5 5-5-5 1.41-1.41L11 13.17V3h1zM5 18h14v2H5z'
const X_PATH = 'M4 3h4.5L12 8.6 15.5 3H20l-5.7 9L20 21h-4.5L12 15.4 8.5 21H4l5.7-9z'

// Marks whose brand colour is black or near it take the text colour, as the app does for GitHub and Patreon.
const MARKS: Record<string, { path: string; colour: string }> = {
  thunderstore: { path: siThunderstore.path, colour: `#${siThunderstore.hex}` },
  curseforge: { path: siCurseforge.path, colour: `#${siCurseforge.hex}` },
  modrinth: { path: siModrinth.path, colour: `#${siModrinth.hex}` },
  github: { path: siGithub.path, colour: 'currentColor' },
  discord: { path: siDiscord.path, colour: 'currentColor' },
  itch: { path: siItchdotio.path, colour: `#${siItchdotio.hex}` },
  patreon: { path: siPatreon.path, colour: 'currentColor' },
  steam: { path: siSteam.path, colour: '#1A9FFF' },
  gog: { path: siGogdotcom.path, colour: `#${siGogdotcom.hex}` },
  epic: { path: siEpicgames.path, colour: 'currentColor' },
  ea: { path: siEa.path, colour: 'currentColor' },
  xbox: { path: X_PATH, colour: '#107C10' },
  standalone: { path: INSTALL_PATH, colour: 'currentColor' },
  lutris: { path: siLutris.path, colour: `#${siLutris.hex}` },
  flatpak: { path: siFlatpak.path, colour: `#${siFlatpak.hex}` },
}

// Artwork rather than vector marks, copied from the app into site/img/vendor (vendored files the linter skips).
const ART: Record<string, string> = {
  nexus: 'nexusmods.svg',
  vsmoddb: 'vsmoddb.png',
  bottles: 'bottles.svg',
}

/** A #RRGGBB brand colour as rgb(), the form the site's styles use. */
function rgb(colour: string): string {
  const hex = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(colour)
  return hex
    ? `rgb(${hex
        .slice(1)
        .map((h) => Number.parseInt(h, 16))
        .join(', ')})`
    : colour
}

/** site/img/brands.svg: one <symbol> per vector mark, drawn in currentColor so each use sets its colour. */
export function brandSprite(): string {
  const symbols = Object.entries(MARKS).map(
    ([id, m]) =>
      `  <symbol id="${id}" viewBox="0 0 24 24"><path fill="currentColor" d="${m.path}" /></symbol>`,
  )
  return `<svg xmlns="http://www.w3.org/2000/svg">\n  <title>Mod site and store marks</title>\n${symbols.join('\n')}\n</svg>\n`
}

/** The artwork files to copy, as [published path, bytes]. */
export function brandArt(): [string, Buffer][] {
  return Object.values(ART).map((file) => [
    `site/img/vendor/${file}`,
    readFileSync(`${VENDOR}/${file}`),
  ])
}

/** A brand's mark as a square button, its name in the tooltip and accessible label; a link when the brand has a page
 * for the game. A brand with no mark shows its name instead. */
export function brandIcon(id: string, name: string, href?: string): string {
  const mark = MARKS[id]
  const art = ART[id]
  let body = `${escapeHTML(name)}`
  if (mark) {
    body = `<svg style="color: ${rgb(mark.colour)}" aria-hidden="true"><use href="/img/brands.svg#${id}" /></svg>`
  } else if (art) {
    body = `<img src="/img/vendor/${art}" alt="" />`
  }
  const label = escapeHTML(name)
  const hidden = mark || art ? `<span class="visually-hidden">${label}</span>` : ''
  return href
    ? `<a class="fact-icon" href="${href}" title="${label}">${body}${hidden}</a>`
    : `<span class="fact-icon" title="${label}">${body}${hidden}</span>`
}
