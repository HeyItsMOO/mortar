import type {
  Entry,
  Mod,
  Profile,
} from '../../bindings/github.com/Rethunk-Tech/mortar/internal/profile/models.ts'
import { idKey } from './dependents.ts'

// The site categories that hold libraries: Thunderstore's Libraries and Nexus's Modding Tools.
const LIBRARY_CATEGORIES = new Set(['libraries', 'modding tools'])

const isPack = (m: Pick<Mod, 'id' | 'contentPackFor'>) =>
  Boolean(m.contentPackFor) && idKey(m.contentPackFor ?? '') !== idKey(m.id)

/**
 * The entries of a profile from before install reasons that its game's defaults mark implicit: the frameworks its
 * content packs name, what sits in a library category, and the packs that only supply tilesheets. Entries added since
 * Mortar kept reasons, and content packs, stay as they are.
 */
export function legacyImplicitKeys(
  { entries, intentSince }: Pick<Profile, 'entries' | 'intentSince'>,
  mods: readonly Pick<Mod, 'key' | 'id' | 'contentPackFor'>[],
  categoryOf: (entry: Entry) => string,
  supporting: readonly string[],
): string[] {
  const since = Date.parse(intentSince ?? '')
  const frameworks = new Set(mods.filter(isPack).map((m) => idKey(m.contentPackFor ?? '')))
  return (entries ?? [])
    .filter((e) => {
      const added = Date.parse(e.added ?? '')
      const legacy = Number.isNaN(since) || Number.isNaN(added) || added < since
      if (!legacy || e.implicit || e.source.kind === 'smapi' || e.source.kind === 'mortar') {
        return false
      }
      if (supporting.includes(e.key)) {
        return true
      }
      const own = mods.filter((m) => m.key === e.key)
      if (own.some(isPack)) {
        return false
      }
      return (
        own.some((m) => frameworks.has(idKey(m.id))) ||
        LIBRARY_CATEGORIES.has(categoryOf(e).trim().toLowerCase())
      )
    })
    .map((e) => e.key)
}
