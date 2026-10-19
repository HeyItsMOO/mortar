import { expect, test } from 'bun:test'
import { type History, move, visit } from './history.ts'

const game = (g: string, tab: 'mods' | 'browse' = 'mods') => ({
  route: { name: 'game' as const, game: g },
  tab,
})
const empty: History = { visits: [], at: -1 }

test('visiting then going back and forward walks the same pages', () => {
  let h = visit(empty, game('a'))
  h = visit(h, game('a', 'browse'))
  h = visit(h, { route: { name: 'game-select' }, tab: 'browse' })
  expect(h.at).toBe(2)
  h = move(h, -1)
  expect(h.visits[h.at]).toEqual(game('a', 'browse'))
  h = move(move(h, 1), 1)
  expect(h.at).toBe(2)
})

test('a new visit after going back drops the forward pages, and a repeat adds nothing', () => {
  let h = visit(visit(visit(empty, game('a')), game('b')), game('c'))
  h = move(move(h, -1), -1)
  expect(move(h, -1)).toBe(h)
  h = visit(h, game('d'))
  expect(h.visits.map((v) => v.route)).toEqual([
    { name: 'game', game: 'a' },
    { name: 'game', game: 'd' },
  ])
  expect(visit(h, game('d'))).toBe(h)
})

test('only a game page is told apart by its tab', () => {
  const h = visit(empty, { route: { name: 'game-select' }, tab: 'mods' })
  expect(visit(h, { route: { name: 'game-select' }, tab: 'browse' })).toBe(h)
})
