import { useLingui } from '@lingui/react/macro'
import { RefreshCw, Trash2 } from 'lucide-react'
import { memo } from 'react'
import { PageActions } from '../game/PageActions.tsx'
import { openProfileOf, useProfiles } from '../profiles/store.ts'
import { checkForUpdates } from '../shell/checkForUpdates.ts'
import { IconAction } from '../shell/IconAction.tsx'
import { reportUnexpected } from '../toasts/report.ts'
import { useMods } from './store.ts'
import { switchedOffMods } from './switchedOff.ts'
import { AddArchive } from './Toolbar.tsx'

// The Mods tab's buttons in the tab header: the update check (F5) and the Add split button.
// Takes no props, so a re-render of the tab around it skips it.
export const ModsHeaderActions = memo(function ModsHeaderActionsView() {
  const { t } = useLingui()
  const mods = useMods((s) => s.mods)
  const profile = useProfiles(openProfileOf)
  const off = switchedOffMods(mods, profile)
  const askRemove = useMods((s) => s.askRemove)
  return (
    <PageActions>
      {off.length > 0 ? (
        <IconAction
          label={t`Remove switched-off mods`}
          icon={<Trash2 size={16} aria-hidden={true} />}
          onClick={() => askRemove(off)}
        />
      ) : null}
      <IconAction
        label={t`Check mods and Mortar for updates (F5)`}
        icon={<RefreshCw size={16} aria-hidden={true} />}
        onClick={() => {
          checkForUpdates().catch(reportUnexpected)
        }}
      />
      <AddArchive variant="outlined" toolbar={true} />
    </PageActions>
  )
})
