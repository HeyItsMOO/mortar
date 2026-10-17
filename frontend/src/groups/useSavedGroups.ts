import { useLingui } from '@lingui/react/macro'
import type { SavedGroup } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/savedgroups/models.ts'
import { List } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/savedgroups/service.ts'
import { useLoaded } from '../shell/useLoaded.ts'
import { reportError } from '../toasts/report.ts'

const NONE: SavedGroup[] = []

// The game's saved groups; `open` false skips the read (a closed dialog).
export function useSavedGroups(game: string, open = true) {
  const { t } = useLingui()
  const { data, setData, loading } = useLoaded(
    open ? () => List(game).then((listed) => listed ?? NONE) : null,
    [game, open],
    NONE,
    reportError(t`Could not read saved groups`),
  )
  return { savedGroups: data, setSavedGroups: setData, loading }
}
