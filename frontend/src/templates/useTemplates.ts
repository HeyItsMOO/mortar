import { useLingui } from '@lingui/react/macro'
import { useCallback, useEffect, useState } from 'react'
import type { Template } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/templates/models.ts'
import { Templates } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/templates/service.ts'
import { sameValue } from '../shell/sameValue.ts'
import { reportError } from '../toasts/report.ts'

// An unchanged answer keeps the list, so opening a menu that reads the templates does not redraw it.
const keepEqual = (prev: Template[], next: Template[]) => (sameValue(prev, next) ? prev : next)

/** The game's templates, read when `active` turns on and again on `reload`. */
export function useTemplates(game: string, active: boolean) {
  const { t } = useLingui()
  const [templates, setTemplates] = useState<Template[]>([])
  const reload = useCallback(
    () =>
      game
        ? Templates(game)
            .then((found) => setTemplates((prev) => keepEqual(prev, found ?? [])))
            .catch(reportError(t`Could not read the templates`))
        : Promise.resolve(),
    [game, t],
  )
  useEffect(() => {
    if (active) {
      reload()
    }
  }, [active, reload])
  return { templates, reload }
}
