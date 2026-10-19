import { expect, test } from 'bun:test'
import { accents } from '../theme/accents.ts'
import { accentColour, isAccent } from './theme.ts'

test('isAccent rejects unknown names', () => {
  expect(isAccent('copper')).toBe(true)
  expect(isAccent('neon')).toBe(false)
})

test('the system accent follows the desktop and falls back to the default accent', () => {
  expect(accentColour('system', '#3C7AB0')).toBe('#3C7AB0')
  expect(accentColour('system', '')).toBe(accents.sand)
  expect(accentColour('moss', '#3C7AB0')).toBe(accents.moss)
})
