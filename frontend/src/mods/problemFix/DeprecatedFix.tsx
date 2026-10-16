import { useLingui } from '@lingui/react/macro'
import { openProfileOf, useProfiles } from '../../profiles/store.ts'
import { download } from '../../queue/actions.ts'
import { reportUnexpected } from '../../toasts/report.ts'
import { entryOf, type Problem } from '../lookup.ts'
import type { WarningButton } from './warningButton.tsx'

// Queues the replacement package the deprecated one points to, with its install reason; nothing when it names none.
export function DeprecatedFix({
  problem,
  button,
}: {
  problem: Extract<Problem, { kind: 'deprecated' }>
  button: WarningButton
}) {
  const { t } = useLingui()
  const implicit = Boolean(entryOf(useProfiles(openProfileOf), problem.deprecated.key)?.implicit)
  const replacement = problem.deprecated.replacement ?? ''
  if (replacement === '') {
    return null
  }
  return button(t`Replace with ${{ name: replacement }}`, () => {
    download([{ kind: 'install', package: replacement, implicit }]).catch(reportUnexpected)
  })
}
