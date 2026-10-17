import { expect, test } from 'bun:test'
import { keepFields, keepUnchanged } from './sameValue.ts'

test('keepUnchanged reuses equal items and the whole list when nothing changed', () => {
  const a = { k: 'a', v: 1 }
  const b = { k: 'b', v: 2 }
  const prev = [a, b]
  const key = (x: { k: string }) => x.k
  expect(
    keepUnchanged(
      prev,
      [
        { k: 'a', v: 1 },
        { k: 'b', v: 2 },
      ],
      key,
    ),
  ).toBe(prev)
  const changed = keepUnchanged(
    prev,
    [
      { k: 'a', v: 1 },
      { k: 'b', v: 3 },
    ],
    key,
  )
  expect(changed).not.toBe(prev)
  expect(changed[0]).toBe(a)
  expect(changed[1]).toEqual({ k: 'b', v: 3 })
  // Reordering keeps the objects but is a new list.
  const reordered = keepUnchanged(
    prev,
    [
      { k: 'b', v: 2 },
      { k: 'a', v: 1 },
    ],
    key,
  )
  expect(reordered).toEqual([b, a])
  expect(reordered[0]).toBe(b)
})

test('keepFields keeps each unchanged field and replaces the changed ones', () => {
  const prev = { a: { x: 1 }, b: { y: 2 } }
  const next = keepFields(prev, { a: { x: 1 }, b: { y: 3 } })
  expect(next.a).toBe(prev.a)
  expect(next.b).toEqual({ y: 3 })
})
