import type { Mod } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/profile/models.ts'
import { idKey, requiredIdsOf } from './dependents.ts'

type PartMod = Pick<Mod, 'key' | 'id' | 'needs' | 'optional' | 'contentPackFor'>

export const partKey = (m: Pick<Mod, 'key' | 'id'>) => `${m.key}\n${idKey(m.id)}`

const framework = (m: PartMod) => idKey(m.contentPackFor ?? '')

// The framework most content packs in the list are written for (Content Patcher in Stardew), or none.
function primaryFramework(mods: readonly PartMod[]): string {
  const counts = new Map<string, number>()
  for (const m of mods) {
    if (framework(m) !== '') {
      counts.set(framework(m), (counts.get(framework(m)) ?? 0) + 1)
    }
  }
  return [...counts].toSorted((a, b) => b[1] - a[1])[0]?.[0] ?? ''
}

/**
 * The mods that came in a download beside its main mod, which read implicit whatever the download's reason; the main
 * mod takes the download's. The main mod is the base the other parts build on: one that requires no other mod of the
 * download, the one most of them require (Love of Cooking under its [CP] and [EN] packs). Where nothing in the download
 * requires another, a pack for the primary framework wins (a town's Content Patcher pack beside its Farm Type Manager
 * and Custom Companions packs), else a mod that is no content pack, else the first.
 */
export function supportParts(
  mods: readonly PartMod[],
  all: readonly PartMod[] = mods,
): Set<string> {
  const primary = primaryFramework(all)
  const byKey = new Map<string, PartMod[]>()
  for (const m of mods) {
    byKey.set(m.key, [...(byKey.get(m.key) ?? []), m])
  }
  const needs = (a: PartMod, b: PartMod) => requiredIdsOf(a).some((id) => idKey(id) === idKey(b.id))
  const out = new Set<string>()
  for (const parts of byKey.values()) {
    if (parts.length < 2) {
      continue
    }
    const bases = parts.filter((b) => !parts.some((a) => a !== b && needs(b, a) && !needs(a, b)))
    const dependents = (b: PartMod) => parts.filter((a) => a !== b && needs(a, b)).length
    // Being required by more parts outweighs both tie-breaks, which cannot both hold.
    const score = (m: PartMod) =>
      dependents(m) * 4 +
      (primary !== '' && framework(m) === primary ? 2 : 0) +
      (framework(m) === '' ? 1 : 0)
    const main = (bases.length > 0 ? bases : parts).reduce((best, m) =>
      score(m) > score(best) ? m : best,
    )
    for (const m of parts) {
      if (m !== main) {
        out.add(partKey(m))
      }
    }
  }
  return out
}

// Whether a mod reads implicit: its download is, or it came in that download beside the main mod.
export function readsImplicit(
  implicit: boolean | undefined,
  mod: PartMod,
  all: readonly PartMod[],
) {
  return (
    Boolean(implicit) ||
    supportParts(
      all.filter((m) => m.key === mod.key),
      all,
    ).has(partKey(mod))
  )
}
