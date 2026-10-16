import { msg, plural } from '@lingui/core/macro'
import type { Mod } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/profile/models.ts'
import { SetImplicitMany } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/profile/service.ts'
import { i18n } from '../i18n/index.ts'
import { batchProfile } from './storeEntries.ts'

export function markImplicit(mods: Mod[], implicit: boolean) {
  const count = mods.length
  return batchProfile(
    mods,
    (game, id, keys) => SetImplicitMany(game, id, keys, implicit),
    i18n._(
      implicit ? msg`Could not mark the mods implicit` : msg`Could not mark the mods explicit`,
    ),
    implicit
      ? plural(count, { one: 'Marked # mod implicit', other: 'Marked # mods implicit' })
      : plural(count, { one: 'Marked # mod explicit', other: 'Marked # mods explicit' }),
  )
}
