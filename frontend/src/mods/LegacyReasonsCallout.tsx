import { plural } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'
import { Button } from '@mui/material'
import { useState } from 'react'
import type {
  Mod,
  Profile,
} from '../../bindings/github.com/Rethunk-Tech/mortar/internal/profile/models.ts'
import { SetIntentOffered } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/profile/service.ts'
import { useProfiles } from '../profiles/store.ts'
import { usePending } from '../toasts/usePending.ts'
import { useCustomCategories } from './customCategories.ts'
import { customCategoryById, resolvedCategoryLabel } from './group.ts'
import { LegacyReview } from './LegacyReview.tsx'
import { ListCallout } from './ListCallout.tsx'
import { legacyImplicit } from './legacyReasons.ts'
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
  const [reviewing, setReviewing] = useState(false)
  if (profile.intentOffered) {
    return null
  }
  const picks = legacyImplicit(
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
  if (picks.length === 0) {
    return null
  }
  const answer = (keys: string[]) =>
    run(
      async () => {
        if (keys.length > 0) {
          await markImplicit(
            mods.filter((m) => keys.includes(m.key)),
            true,
          )
        }
        setReviewing(false)
        useProfiles.getState().replace(await SetIntentOffered(game, profile.id))
      },
      { errorTitle: t`Could not save that answer` },
    )
  return (
    <ListCallout
      text={plural(picks.length, {
        one: 'Mortar identified # mod as a library or supporting mod',
        other: 'Mortar identified # mods as libraries or supporting mods',
      })}
      actions={
        <>
          <Button variant="text" disabled={pending} onClick={() => answer([])}>
            {t`Keep explicit`}
          </Button>
          <Button variant="text" disabled={pending} onClick={() => setReviewing(true)}>
            {t`Review…`}
          </Button>
          <Button
            variant="contained"
            disabled={pending}
            onClick={() => answer(picks.map((p) => p.key))}
          >
            {t`Mark implicit`}
          </Button>
          {reviewing ? (
            <LegacyReview
              picks={picks}
              mods={mods}
              busy={pending}
              onCancel={() => setReviewing(false)}
              onMark={answer}
            />
          ) : null}
        </>
      }
    />
  )
}
