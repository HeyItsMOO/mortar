import type {
  Entry,
  Mod,
  Profile,
} from '../../bindings/github.com/Rethunk-Tech/mortar/internal/profile/models.ts'
import { idKey } from './dependents.ts'

// The site categories that hold libraries: Thunderstore's Libraries and Nexus's Modding Tools.
const LIBRARY_CATEGORIES = new Set(['libraries', 'modding tools'])

type LegacyMod = Pick<Mod, 'key' | 'id' | 'enabled' | 'needs' | 'optional' | 'contentPackFor'>

const isPack = (m: LegacyMod) =>
  Boolean(m.contentPackFor) && idKey(m.contentPackFor ?? '') !== idKey(m.id)

// The entry keys a switched-on mod requires (its required dependencies and the framework of a content pack), each
// that another entry requires without leading back to it, so the members of a cycle nothing outside needs stay out.
function requiredKeys(mods: readonly LegacyMod[]): Set<string> {
  const keyOf = new Map(mods.map((m) => [idKey(m.id), m.key]))
  const requires = new Map<string, Set<string>>()
  for (const m of mods.filter((x) => x.enabled)) {
    const optional = new Set((m.optional ?? []).map(idKey))
    const wants = (m.needs ?? []).filter((n) => !optional.has(idKey(n)))
    for (const want of isPack(m) ? [...wants, m.contentPackFor ?? ''] : wants) {
      const key = keyOf.get(idKey(want))
      if (key !== undefined && key !== m.key) {
        requires.set(m.key, (requires.get(m.key) ?? new Set()).add(key))
      }
    }
  }
  const reaches = (from: string, to: string) => {
    const seen = new Set<string>()
    const stack = [...(requires.get(from) ?? [])]
    for (let n = stack.pop(); n !== undefined; n = stack.pop()) {
      if (n === to) {
        return true
      }
      if (!seen.has(n)) {
        seen.add(n)
        stack.push(...(requires.get(n) ?? []))
      }
    }
    return false
  }
  const out = new Set<string>()
  for (const [by, needs] of requires) {
    for (const key of needs) {
      if (!reaches(key, by)) {
        out.add(key)
      }
    }
  }
  return out
}

/**
 * The entries of a profile from before install reasons that its game's defaults mark implicit: what another mod
 * requires (a library, or the framework a content pack names), what sits in a library category, and the packs that
 * only supply tilesheets. Entries added since Mortar kept reasons stay as they are.
 */
export function legacyImplicitKeys(
  { entries, intentSince }: Pick<Profile, 'entries' | 'intentSince'>,
  mods: readonly LegacyMod[],
  categoryOf: (entry: Entry) => string,
  supporting: readonly string[],
): string[] {
  const since = Date.parse(intentSince ?? '')
  const required = requiredKeys(mods)
  return (entries ?? [])
    .filter((e) => {
      const added = Date.parse(e.added ?? '')
      const legacy = Number.isNaN(since) || Number.isNaN(added) || added < since
      if (!legacy || e.implicit || e.source.kind === 'smapi' || e.source.kind === 'mortar') {
        return false
      }
      if (supporting.includes(e.key) || required.has(e.key)) {
        return true
      }
      const own = mods.filter((m) => m.key === e.key)
      return !own.some(isPack) && LIBRARY_CATEGORIES.has(categoryOf(e).trim().toLowerCase())
    })
    .map((e) => e.key)
}
