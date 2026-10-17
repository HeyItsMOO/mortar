import type { Profile } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/profile/models.ts'
import { partKey, supportParts } from '../mods/installReason.ts'

interface Counted {
  entries?: { source: { kind: string }; mods?: unknown[] | null }[] | null
}

// The bundled mods (SMAPI's and Mortar's bridge) sit in every profile and are never shown, so they are not counted.
export function userModEntries<T extends { source: { kind: string } }>(
  entries: T[] | null | undefined,
): T[] {
  return (entries ?? []).filter((e) => e.source.kind !== 'smapi' && e.source.kind !== 'mortar')
}

export function userModCount(profile: Counted): number {
  return userModEntries(profile.entries).reduce((n, e) => n + (e.mods ?? []).length, 0)
}

// The mods the player chose: those of entries not marked implicit, less the parts a download brought beside its main
// mod.
export function chosenModCount(profile: Pick<Profile, 'entries'>): number {
  const entries = userModEntries(profile.entries)
  const parts = supportParts(
    entries.flatMap((e) => (e.mods ?? []).map((m) => ({ ...m, key: e.key }))),
  )
  return entries
    .filter((e) => !e.implicit)
    .reduce(
      (n, e) =>
        n + (e.mods ?? []).filter((m) => !parts.has(partKey({ key: e.key, id: m.id }))).length,
      0,
    )
}
