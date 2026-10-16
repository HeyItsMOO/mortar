import { plural } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'
import { Button } from '@mui/material'
import type {
  Mod,
  Profile,
} from '../../bindings/github.com/Rethunk-Tech/mortar/internal/profile/models.ts'
import { SetIntentOffered } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/profile/service.ts'
import { useProfiles } from '../profiles/store.ts'
import { usePending } from '../toasts/usePending.ts'
import { useCustomCategories } from './customCategories.ts'
import { customCategoryById, resolvedCategoryLabel } from './group.ts'
import { ListCallout } from './ListCallout.tsx'
import { legacyImplicitKeys } from './legacyReasons.ts'
import { markImplicit } from './markImplicit.ts'
import { siteCategory } from './modSearch.ts'
import { useNexusDetails } from './nexusDetails.ts'
import { useMods } from './store.ts'

const NONE: string[] = []

// Once per profile from before install reasons: offers to mark the libraries and tilesheet packs its game's defaults
// name as implicit. Either answer ends the offer.
export function LegacyReasonsCallout({ profile, mods }: { profile: Profile; mods: Mod[] }) {
  const { t } = useLingui()
  const game = useProfiles((s) => s.game?.id ?? '')
  const nexusById = useNexusDetails((s) => s.byId)
  const customById = customCategoryById(useCustomCategories((s) => s.categories))
  const supporting = useMods((s) => s.problems?.supporting ?? NONE)
  const [pending, run] = usePending()
  if (profile.intentOffered) {
    return null
  }
  const keys = legacyImplicitKeys(
    profile,
    mods,
    (e) =>
      resolvedCategoryLabel(
        e.categoryOverride,
        siteCategory(e, nexusById[e.source.modId ?? 0]?.details?.category),
        customById,
      ),
    supporting,
  )
  if (keys.length === 0) {
    return null
  }
  const answer = (mark: boolean) =>
    run(
      async () => {
        if (mark) {
          await markImplicit(
            mods.filter((m) => keys.includes(m.key)),
            true,
          )
        }
        useProfiles.getState().replace(await SetIntentOffered(game, profile.id))
      },
      { errorTitle: t`Could not save that answer` },
    )
  return (
    <ListCallout
      text={plural(keys.length, {
        one: '# mod looks like a library and was added before Mortar kept install reasons',
        other: '# mods look like libraries and were added before Mortar kept install reasons',
      })}
      actions={
        <>
          <Button variant="text" disabled={pending} onClick={() => answer(false)}>
            {t`Keep explicit`}
          </Button>
          <Button variant="contained" disabled={pending} onClick={() => answer(true)}>
            {t`Mark implicit`}
          </Button>
        </>
      }
    />
  )
}
