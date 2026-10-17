import { useRef } from 'react'
import { useDetail } from './detail.ts'
import { useSelection } from './selection.ts'

/** Whether mod id is marked: in the selection, or the open mod while nothing is selected. Each row selects only its
 * own answer, so opening or selecting a mod re-renders the rows whose mark changed, not every row on screen. */
export function useMarked(id: string): boolean {
  const open = useDetail((s) => s.detailId === id)
  // One answer per row: selecting the first mod empties nothing else's mark, so it must not re-render every row.
  return useSelection((s) => s.ids.includes(id) || (s.ids.length === 0 && open))
}

/** The list's one Tab stop: the open mod's row, or the first row when the open mod is not listed. The list asks once
 * and hands each row a boolean, so a row never holds the whole order (which changes whenever a mod moves group). */
function useTabStopId(orderedIds: readonly string[]): string {
  return useDetail((s) => (orderedIds.includes(s.detailId) ? s.detailId : (orderedIds[0] ?? '')))
}

/** The Tab stop, and the current order behind a stable ref for shift-click ranges. */
export function useRowFocus(orderedIds: readonly string[]) {
  const orderedRef = useRef(orderedIds)
  orderedRef.current = orderedIds
  return { tabStopId: useTabStopId(orderedIds), orderedRef }
}
