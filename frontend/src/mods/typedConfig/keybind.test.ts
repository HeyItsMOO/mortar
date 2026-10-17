import { expect, test } from 'bun:test'
import { clearedKeybind, formatKeypress, looksLikeKeybind, usesInputSystem } from './keybind.ts'
import type { ConfigEntry } from './types.ts'

const entry = (key: string, value: string, over: Partial<ConfigEntry> = {}): ConfigEntry => ({
  key,
  type: 'string',
  default: value,
  value,
  description: '',
  ...over,
})
const press = (code: string, mods: { shift?: boolean; ctrl?: boolean; alt?: boolean } = {}) => ({
  code,
  shift: mods.shift ?? false,
  ctrl: mods.ctrl ?? false,
  alt: mods.alt ?? false,
})

test('a key-named entry holding a key spec is a keybind', () => {
  expect(looksLikeKeybind(entry('MenuKey', 'Tab'))).toBe(true)
  expect(looksLikeKeybind(entry('Keys.FreezeTime', 'LeftShift + F5'))).toBe(true)
  expect(looksLikeKeybind(entry('OpenEmoteMenuKeybind', '<Keyboard>/backquote'))).toBe(true)
  expect(looksLikeKeybind(entry('OpenMenuKey', 'LeftShift, RightTrigger'))).toBe(true)
  expect(looksLikeKeybind(entry('Hotkey', '', { default: 'None' }))).toBe(true)
  expect(looksLikeKeybind(entry('Toggle', 'OemPipe', { label: 'Toggle shortcut' }))).toBe(true)
  expect(looksLikeKeybind(entry('MenuKey', 'hello world'))).toBe(false)
  expect(looksLikeKeybind(entry('Volume', 'Tab'))).toBe(false)
})

test('a recorded key is written in the entry syntax, and clearing follows it', () => {
  expect(formatKeypress(press('KeyA'), false)).toBe('A')
  expect(formatKeypress(press('Digit1'), false)).toBe('D1')
  expect(formatKeypress(press('F5', { shift: true }), false)).toBe('LeftShift + F5')
  expect(formatKeypress(press('Backslash', { ctrl: true, alt: true }), false)).toBe(
    'LeftControl + LeftAlt + OemPipe',
  )
  expect(formatKeypress(press('Backquote'), false)).toBe('OemTilde')
  expect(formatKeypress(press('ShiftLeft', { shift: true }), false)).toBe('LeftShift')
  expect(formatKeypress(press('Numpad0'), false)).toBe('NumPad0')
  expect(formatKeypress(press('MediaPlay'), false)).toBeNull()
  expect(formatKeypress(press('Backquote'), true)).toBe('<Keyboard>/backquote')
  expect(formatKeypress(press('KeyA', { shift: true }), true)).toBe('<Keyboard>/a')
  expect(formatKeypress(press('ArrowUp'), true)).toBe('<Keyboard>/upArrow')
  expect(formatKeypress(press('F5'), true)).toBe('<Keyboard>/f5')
  expect(usesInputSystem('', '<Keyboard>/tab')).toBe(true)
  expect(usesInputSystem('Tab', '<Keyboard>/tab')).toBe(false)
  expect(clearedKeybind(true)).toBe('')
  expect(clearedKeybind(false)).toBe('None')
})
