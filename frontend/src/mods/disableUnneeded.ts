import { msg, plural } from '@lingui/core/macro'
import type { Mod } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/profile/models.ts'
import { i18n } from '../i18n/index.ts'
import { openProfileOf, useProfiles } from '../profiles/store.ts'
import { reportUnexpected } from '../toasts/report.ts'
import { useToasts } from '../toasts/store.ts'
import { idKey, requiredIdsOf } from './dependents.ts'
import { readsImplicit } from './installReason.ts'
import { entryOf } from './lookup.ts'

const requires = (a: Mod, b: Mod) => requiredIdsOf(a).some((id) => idKey(id) === idKey(b.id))

/**
 * The implicit mods still on that only the mods just switched off needed: what those mods require, followed through
 * what that requires in turn, each implicit and needed by no mod that stays on.
 */
export function unneededImplicit(
  all: readonly Mod[],
  off: readonly Mod[],
  implicit: (m: Mod) => boolean,
): Mod[] {
  const byId = new Map(all.map((m) => [idKey(m.id), m]))
  const offIds = new Set(off.map((m) => idKey(m.id)))
  const candidates: Mod[] = []
  const queue = off.flatMap((m) => requiredIdsOf(m))
  for (let id = queue.shift(); id !== undefined; id = queue.shift()) {
    const dep = byId.get(idKey(id))
    if (dep?.enabled && implicit(dep) && !offIds.has(idKey(dep.id)) && !candidates.includes(dep)) {
      candidates.push(dep)
      queue.push(...requiredIdsOf(dep))
    }
  }
  const out: Mod[] = []
  for (let changed = true; changed; ) {
    changed = false
    for (const c of candidates) {
      const stillNeeded = all.some((m) => m.enabled && !offIds.has(idKey(m.id)) && requires(m, c))
      if (!(offIds.has(idKey(c.id)) || stillNeeded)) {
        offIds.add(idKey(c.id))
        out.push(c)
        changed = true
      }
    }
  }
  return out
}

// After mods are switched off, offers to switch off the implicit mods only they needed.
export function offerUnneeded(
  all: readonly Mod[],
  off: readonly Mod[],
  switchOff: (mods: Mod[]) => Promise<void>,
) {
  const profile = openProfileOf(useProfiles.getState())
  const unneeded = unneededImplicit(all, off, (m) =>
    readsImplicit(entryOf(profile, m.key)?.implicit, m, all),
  )
  if (unneeded.length === 0) {
    return
  }
  useToasts.getState().push({
    kind: 'info',
    title: plural(unneeded.length, {
      one: '# library only the switched-off mods needed is still on',
      other: '# libraries only the switched-off mods needed are still on',
    }),
    action: {
      label: i18n._(msg`Switch off`),
      run: () => switchOff(unneeded).catch(reportUnexpected),
    },
  })
}
