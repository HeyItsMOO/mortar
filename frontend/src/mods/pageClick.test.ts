import { expect, test } from 'bun:test'
import { opensPage } from './pageClick.ts'

const press = (button: number, ctrlKey = false) => ({ button, ctrlKey, metaKey: false })

test('middle click opens the page; Ctrl+click only where Ctrl+click is not a selection', () => {
  expect(opensPage(press(1), false)).toBe(true)
  expect(opensPage(press(0, true), true)).toBe(true)
  expect(opensPage(press(0, true), false)).toBe(false)
  expect(opensPage(press(0), true)).toBe(false)
  expect(opensPage(press(2), true)).toBe(false)
})
