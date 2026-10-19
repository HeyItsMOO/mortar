import { msg } from '@lingui/core/macro'
import { SetFrozen } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/profile/service.ts'
import { i18n } from '../i18n/index.ts'
import { useProfiles } from '../profiles/store.ts'
import { reportError } from '../toasts/report.ts'
import { useUpdates } from './updates.ts'

/** Freezes the open profile (every mod held at its version) or lifts the freeze. */
export async function setFrozen(frozen: boolean) {
  const { game, openId } = useProfiles.getState()
  if (!(game && openId)) {
    return
  }
  try {
    useProfiles.getState().replace(await SetFrozen(game.id, openId, frozen))
  } catch (e) {
    reportError(
      i18n._(frozen ? msg`Could not freeze the profile` : msg`Could not unfreeze the profile`),
    )(e)
    return
  }
  await useUpdates.getState().load()
}
