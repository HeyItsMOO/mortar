import type { ConfigEntry } from './types.ts'

const KEY_NAME = /key ?binds?|hotkey|shortcut|\bkeys?\b/i
const CAMEL_GAP = /([a-z])([A-Z])/g
const INPUT_SYSTEM_PREFIX = '<Keyboard>/'
const INPUT_SYSTEM_PATH = /^<Keyboard>\/[A-Za-z0-9]+$/
const ALTERNATIVE_SEPARATOR = ', '
const COMBO_SEPARATOR = ' + '
const LETTER = /^Key([A-Z])$/
const DIGIT = /^Digit(\d)$/
const NUMPAD_DIGIT = /^Numpad(\d)$/
const FUNCTION_KEY = /^F\d{1,2}$/

// KeyboardEvent.code → SMAPI SButton name, for the keys that are not spelled the same.
const SBUTTON_BY_CODE: Record<string, string> = {
  ShiftLeft: 'LeftShift',
  ShiftRight: 'RightShift',
  ControlLeft: 'LeftControl',
  ControlRight: 'RightControl',
  AltLeft: 'LeftAlt',
  AltRight: 'RightAlt',
  Backquote: 'OemTilde',
  Backslash: 'OemPipe',
  Minus: 'OemMinus',
  Equal: 'OemPlus',
  BracketLeft: 'OemOpenBrackets',
  BracketRight: 'OemCloseBrackets',
  Semicolon: 'OemSemicolon',
  Quote: 'OemQuotes',
  Comma: 'OemComma',
  Period: 'OemPeriod',
  Slash: 'OemQuestion',
  Backspace: 'Back',
  ArrowUp: 'Up',
  ArrowDown: 'Down',
  ArrowLeft: 'Left',
  ArrowRight: 'Right',
  NumpadAdd: 'Add',
  NumpadSubtract: 'Subtract',
  NumpadMultiply: 'Multiply',
  NumpadDivide: 'Divide',
  NumpadDecimal: 'Decimal',
  Space: 'Space',
  Enter: 'Enter',
  Escape: 'Escape',
  Tab: 'Tab',
  Insert: 'Insert',
  Delete: 'Delete',
  Home: 'Home',
  End: 'End',
  PageUp: 'PageUp',
  PageDown: 'PageDown',
  CapsLock: 'CapsLock',
  Pause: 'Pause',
}

// KeyboardEvent.code → Unity InputSystem keyboard control name.
const INPUT_SYSTEM_BY_CODE: Record<string, string> = {
  ShiftLeft: 'leftShift',
  ShiftRight: 'rightShift',
  ControlLeft: 'leftCtrl',
  ControlRight: 'rightCtrl',
  AltLeft: 'leftAlt',
  AltRight: 'rightAlt',
  Backquote: 'backquote',
  Backslash: 'backslash',
  Minus: 'minus',
  Equal: 'equals',
  BracketLeft: 'leftBracket',
  BracketRight: 'rightBracket',
  Semicolon: 'semicolon',
  Quote: 'quote',
  Comma: 'comma',
  Period: 'period',
  Slash: 'slash',
  Backspace: 'backspace',
  ArrowUp: 'upArrow',
  ArrowDown: 'downArrow',
  ArrowLeft: 'leftArrow',
  ArrowRight: 'rightArrow',
  NumpadAdd: 'numpadPlus',
  NumpadSubtract: 'numpadMinus',
  NumpadMultiply: 'numpadMultiply',
  NumpadDivide: 'numpadDivide',
  NumpadDecimal: 'numpadPeriod',
  Space: 'space',
  Enter: 'enter',
  Escape: 'escape',
  Tab: 'tab',
  Insert: 'insert',
  Delete: 'delete',
  Home: 'home',
  End: 'end',
  PageUp: 'pageUp',
  PageDown: 'pageDown',
  CapsLock: 'capsLock',
  Pause: 'pause',
}

// SButton names a key spec may hold beyond the keyboard keys above: mouse and controller buttons.
const OTHER_SBUTTONS = [
  'MouseLeft',
  'MouseRight',
  'MouseMiddle',
  'MouseX1',
  'MouseX2',
  'ControllerA',
  'ControllerB',
  'ControllerX',
  'ControllerY',
  'ControllerBack',
  'ControllerStart',
  'LeftStick',
  'RightStick',
  'LeftShoulder',
  'RightShoulder',
  'LeftTrigger',
  'RightTrigger',
  'DPadUp',
  'DPadDown',
  'DPadLeft',
  'DPadRight',
  'BigButton',
]

const MODIFIER_CODES = new Set([
  'ShiftLeft',
  'ShiftRight',
  'ControlLeft',
  'ControlRight',
  'AltLeft',
  'AltRight',
])

const lettersAndDigits = (code: string): string | null => {
  const letter = LETTER.exec(code)?.[1]
  if (letter) {
    return letter
  }
  return DIGIT.exec(code)?.[1] ?? null
}

function sbuttonName(code: string): string | null {
  const plain = lettersAndDigits(code)
  if (plain) {
    return DIGIT.test(code) ? `D${plain}` : plain
  }
  const pad = NUMPAD_DIGIT.exec(code)?.[1]
  if (pad) {
    return `NumPad${pad}`
  }
  if (FUNCTION_KEY.test(code)) {
    return code
  }
  return SBUTTON_BY_CODE[code] ?? null
}

function inputSystemName(code: string): string | null {
  const plain = lettersAndDigits(code)
  if (plain) {
    return plain.toLowerCase()
  }
  const pad = NUMPAD_DIGIT.exec(code)?.[1]
  if (pad) {
    return `numpad${pad}`
  }
  if (FUNCTION_KEY.test(code)) {
    return code.toLowerCase()
  }
  return INPUT_SYSTEM_BY_CODE[code] ?? null
}

const KNOWN_SBUTTONS = new Set([...Object.values(SBUTTON_BY_CODE), ...OTHER_SBUTTONS])
const SBUTTON_SHAPE = /^([A-Z]|D\d|F\d{1,2}|NumPad\d)$/

const isSButton = (name: string): boolean => SBUTTON_SHAPE.test(name) || KNOWN_SBUTTONS.has(name)

// `None`, an SButton or a "+" combo of them with ", " alternatives (a KeybindList), or an InputSystem keyboard path.
function isKeySpec(spec: string): boolean {
  if (spec === 'None' || INPUT_SYSTEM_PATH.test(spec)) {
    return true
  }
  return spec
    .split(ALTERNATIVE_SEPARATOR)
    .every((alt) => alt.split(COMBO_SEPARATOR).every(isSButton))
}

function looksLikeKeybind(e: ConfigEntry): boolean {
  const named = `${e.key} ${e.label ?? ''} ${e.key.replace(CAMEL_GAP, '$1 $2')}`
  return KEY_NAME.test(named) && (isKeySpec(String(e.value)) || isKeySpec(String(e.default)))
}

// InputSystem syntax when the value, or an empty value's default, is a keyboard path.
function usesInputSystem(value: string, fallback: string): boolean {
  return (value === '' ? fallback : value).startsWith(INPUT_SYSTEM_PREFIX)
}

// A recorded key press written as the entry's syntax: one binding, modifiers held prefixed in SMAPI form (InputSystem
// paths name a single control), or null for a key with no name.
function formatKeypress(
  press: { code: string; shift: boolean; ctrl: boolean; alt: boolean },
  inputSystem: boolean,
): string | null {
  if (inputSystem) {
    const name = inputSystemName(press.code)
    return name === null ? null : `${INPUT_SYSTEM_PREFIX}${name}`
  }
  const name = sbuttonName(press.code)
  if (name === null) {
    return null
  }
  if (MODIFIER_CODES.has(press.code)) {
    return name
  }
  const held = [
    ...(press.ctrl ? ['LeftControl'] : []),
    ...(press.shift ? ['LeftShift'] : []),
    ...(press.alt ? ['LeftAlt'] : []),
  ]
  return [...held, name].join(COMBO_SEPARATOR)
}

const clearedKeybind = (inputSystem: boolean): string => (inputSystem ? '' : 'None')

export { clearedKeybind, formatKeypress, looksLikeKeybind, usesInputSystem }
