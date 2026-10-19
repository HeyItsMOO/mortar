import { afterAll, expect, test } from 'bun:test'

const testing = await import('@testing-library/react')
const { flattenModGroups, useModReveal } = await import('./virtualRows.ts')

afterAll(() => {
  testing.cleanup()
})

const groups = [
  { key: 'problems', items: [{ id: 'p' }] },
  { key: 'enabled', items: [{ id: 'a' }, { id: 'b' }] },
]
const idOf = (item: { id: string }) => item.id

// Opening a mod reveals it once; collapsing its group or another one afterwards is the user's choice, not undone.
test('the open mod is revealed when opened, not after the user collapses a group', () => {
  const expanded: string[] = []
  const scrolled: number[] = []
  const setCollapsed = (fn: (cur: Record<string, boolean>) => Record<string, boolean>) => {
    expanded.push(Object.keys(fn({ enabled: true })).join())
  }
  const virtualizer = { scrollToIndex: (i: number) => scrolled.push(i) }
  const props = (detailId: string, collapsed: Record<string, boolean>) => ({
    detailId,
    groups,
    items: flattenModGroups(groups, { grouped: true, collapsed, idOf }),
    idOf,
    collapsed,
    setCollapsed,
    gameId: '',
    virtualizer,
  })
  const { rerender } = testing.renderHook((p: ReturnType<typeof props>) => useModReveal(p), {
    initialProps: props('b', {}),
  })
  expect(scrolled.length).toBe(1)

  rerender(props('b', { problems: true }))
  rerender(props('b', { problems: true, enabled: true }))
  expect(expanded).toEqual([])
  expect(scrolled.length).toBe(1)

  rerender(props('a', { problems: true, enabled: true }))
  expect(expanded.length).toBe(1)
})
