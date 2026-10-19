import { expect, test } from 'bun:test'
import { hasModList } from './modList.ts'

test('the mod list is offered for Stardew, Thunderstore games and Vintage Story only', () => {
  expect(hasModList({ id: 'stardew', sources: ['nexus'] })).toBe(true)
  expect(hasModList({ id: 'repo', sources: ['thunderstore', 'nexus'] })).toBe(true)
  expect(hasModList({ id: 'vintage-story', sources: ['vsmoddb'] })).toBe(true)
  expect(hasModList({ id: 'sims4', sources: ['curseforge'] })).toBe(false)
  expect(hasModList(undefined)).toBe(false)
})
