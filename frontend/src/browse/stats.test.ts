import { expect, test } from 'bun:test'
import { formatCardStats, parseCardStats } from './stats.ts'

test('card stats keep display order, drop unknown ids, and store an empty choice as none', () => {
  expect(parseCardStats('updated,popularity,bogus')).toEqual(['popularity', 'updated'])
  expect(parseCardStats('none')).toEqual([])
  expect(formatCardStats(['size', 'downloads'])).toBe('downloads,size')
  expect(formatCardStats([])).toBe('none')
})
