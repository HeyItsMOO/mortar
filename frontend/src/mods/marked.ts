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

/** The current order behind a stable ref, for shift-click ranges. */
export function useRowFocus(orderedIds: readonly string[]) {
  const orderedRef = useRef(orderedIds)
  orderedRef.current = orderedIds
  return { orderedRef }
}

/** Whether row id is the list's one Tab stop: the open mod's row, or the first row while the open mod is not listed.
 * Only the first row is handed the order (null for the rest), so a new order re-renders that row and no other, and
 * opening another mod re-renders the two rows that changed, not the list. */
export function useTabStop(id: string, order: readonly string[] | null): boolean {
  return useDetail((s) => s.detailId === id || (order !== null && !order.includes(s.detailId)))
}
