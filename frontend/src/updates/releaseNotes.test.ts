import { expect, test } from 'bun:test'
import { groupNotes } from './releaseNotes.ts'

const text = (items: { line: { parts: { text: string }[] } }[]) =>
  items.map((i) => i.line.parts.map((p) => p.text).join(''))

test('area headings group new and fixed lines, new first, and closing paragraphs stay apart', () => {
  const { areas, extra } = groupNotes(
    '## New\n\n### Games\n\n- Vintage Story\n\n## Fixed\n\n### Saves\n\n- Slots once\n\n### Games\n\n- Profiles start\n\nNeeds glibc 2.38.\n\n[Full changelog](https://x/y)\n',
  )
  expect(areas.map((a) => a.title)).toEqual(['Games', 'Saves'])
  expect(areas[0]?.items.map((i) => i.kind)).toEqual(['new', 'fixed'])
  expect(text(areas[0]?.items ?? [])).toEqual(['- Vintage Story', '- Profiles start'])
  expect(extra).toHaveLength(2)
})

test('notes without areas group by New and Fixed', () => {
  const { areas } = groupNotes('## New\n\n- A\n- B\n\n## Fixed\n\n- C\n')
  expect(areas.map((a) => [a.title, a.byKind, a.items.length])).toEqual([
    ['new', true, 2],
    ['fixed', true, 1],
  ])
})
