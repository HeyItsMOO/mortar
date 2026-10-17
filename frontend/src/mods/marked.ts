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

/** The list's one Tab stop is the open mod's row, or the first row while the open mod is not listed. The list asks only
 * whether it is listed and names the fallback row, so opening another listed mod re-renders the two rows that changed
 * and not the list; the current order sits behind a stable ref for shift-click ranges. */
export function useRowFocus(orderedIds: readonly string[]) {
  const orderedRef = useRef(orderedIds)
  orderedRef.current = orderedIds
  const openListed = useDetail((s) => orderedIds.includes(s.detailId))
  return { fallbackId: openListed ? '' : (orderedIds[0] ?? ''), orderedRef }
}

/** Whether row id is the Tab stop; fallback is whether the list named it the fallback row. */
export function useTabStop(id: string, fallback: boolean): boolean {
  return useDetail((s) => s.detailId === id) || fallback
}
