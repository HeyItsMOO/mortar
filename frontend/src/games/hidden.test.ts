import { expect, test } from 'bun:test'
import { listedGames } from './hidden.ts'

const games = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]

test('hidden games leave the list unless they are shown', () => {
  expect(listedGames(games, ['b'], false).map((g) => g.id)).toEqual(['a', 'c'])
  expect(listedGames(games, ['b'], true)).toBe(games)
  expect(listedGames(games, null, false)).toBe(games)
})
