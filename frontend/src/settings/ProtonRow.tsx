import { useLingui } from '@lingui/react/macro'
import { SetByKey } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/settings/service.ts'
import { PrefSelect } from './PrefControls.tsx'
import { persist } from './persist.ts'
import { useProtonBuilds } from './protonBuilds.ts'
import { SettingRow } from './SettingsSection.tsx'
import { useSettings } from './store.ts'

// Which of Steam's Proton builds a Windows copy outside Steam runs through; the builds are this computer's own.
export function ProtonRow({ game }: { game: string }) {
  const { t } = useLingui()
  const builds = useProtonBuilds(game)
  const value = useSettings((s) => s.games?.[game]?.protonVersion ?? '')
  if (builds.length === 0) {
    return null
  }
  const label = t`Proton version`
  return (
    <SettingRow
      label={label}
      description={t`The Proton build from Steam that runs this copy, which Steam does not start`}
    >
      <PrefSelect
        value={value}
        options={[
          { value: '', label: t`The newest Steam has` },
          ...builds.map((b) => ({ value: b, label: b })),
        ]}
        label={label}
        onChange={(v) =>
          persist(() => SetByKey('protonVersion', v, game), t`Could not save that setting`)
        }
      />
    </SettingRow>
  )
}
