// Compares the catalog with Thunderstore, run by hand before a release (`wails3 task components:audit`): lists the
// listed communities with enough packages that the catalog lacks, and fails when a catalog game's community or loader
// pack is gone. Communities measured and left out, with why, are in docs/design.md (Later).
import { readFileSync } from 'node:fs'

const SOURCE = 'components.source.json'
const API = 'https://thunderstore.io/api'
// A community smaller than this is not worth a catalog entry yet.
const MIN_PACKAGES = 20

interface Game {
  id: string
  sources?: { id: string; key?: string }[]
  loaders?: { package?: string }[]
}
interface Community {
  identifier: string
  name: string
  is_listed: boolean
  total_package_count: number
}

async function json<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mortar catalog audit' } })
  if (!res.ok) {
    throw new Error(`${url}: ${res.status}`)
  }
  return (await res.json()) as T
}

async function packageExists(id: string): Promise<boolean> {
  const cut = id.indexOf('-')
  const res = await fetch(`${API}/experimental/package/${id.slice(0, cut)}/${id.slice(cut + 1)}/`, {
    method: 'HEAD',
  })
  return res.ok
}

const games: Game[] = JSON.parse(readFileSync(SOURCE, 'utf8')).games
const keyed = new Map<string, string>()
for (const g of games) {
  const key = g.sources?.find((s) => s.id === 'thunderstore')?.key
  if (key) {
    keyed.set(key, g.id)
  }
}
const { results } = await json<{ results: Community[] }>(`${API}/cyberstorm/community/`)
const live = new Set(results.map((c) => c.identifier))

const missing = results
  .filter((c) => c.is_listed && !keyed.has(c.identifier) && c.total_package_count >= MIN_PACKAGES)
  .toSorted((a, b) => b.total_package_count - a.total_package_count)
console.log(
  `${missing.length} listed communities with ${MIN_PACKAGES}+ packages are not in the catalog:`,
)
for (const c of missing) {
  console.log(`  ${c.identifier} (${c.name}): ${c.total_package_count} packages`)
}

const drift: string[] = []
for (const [key, id] of keyed) {
  if (!live.has(key)) {
    drift.push(`${id}: Thunderstore has no community "${key}"`)
  }
}
const packs = new Set(
  games.flatMap((g) => (g.loaders ?? []).map((l) => l.package ?? '')).filter(Boolean),
)
for (const pack of packs) {
  if (!(await packageExists(pack))) {
    drift.push(`loader pack ${pack} is not on Thunderstore`)
  }
}
console.log(
  drift.length === 0 ? 'Every catalog community and loader pack is live.' : drift.join('\n'),
)
process.exitCode = drift.length === 0 ? 0 : 1
