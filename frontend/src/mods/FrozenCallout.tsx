import { useLingui } from '@lingui/react/macro'
import { Button } from '@mui/material'
import type { Profile } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/profile/models.ts'
import { setFrozen } from './freeze.ts'
import { isFrozen } from './frozen.ts'
import { ListCallout } from './ListCallout.tsx'

// Shown above the mod list while the profile is frozen, with the way out.
export function FrozenCallout({ profile }: { profile: Profile }) {
  const { t } = useLingui()
  if (!isFrozen(profile)) {
    return null
  }
  return (
    <ListCallout
      text={t`This profile is frozen: its mods stay on their versions and no updates are offered.`}
      actions={
        <Button size="small" variant="text" onClick={() => setFrozen(false)}>
          {t`Unfreeze`}
        </Button>
      }
    />
  )
}
