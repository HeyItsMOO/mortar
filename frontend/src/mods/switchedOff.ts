import type {
  Mod,
  Profile,
} from '../../bindings/github.com/Rethunk-Tech/mortar/internal/profile/models.ts'
import { entryOf } from './lookup.ts'

const BUNDLED = new Set(['smapi', 'mortar'])

/** The mods that are switched off and can be removed: Mortar's own bundled mods cannot be. */
export function switchedOffMods(mods: readonly Mod[], profile: Profile | undefined): Mod[] {
  return mods.filter((m) => !(m.enabled || BUNDLED.has(entryOf(profile, m.key)?.source.kind ?? '')))
}
