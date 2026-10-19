import { expect, test } from 'bun:test'
import type { ServerSetting } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/packsvc/models.ts'
import { serverFieldChanged, serverFieldError } from './serverForm.ts'

const base: ServerSetting = {
  id: 'password',
  name: 'Password',
  hint: '',
  value: '',
  default: '',
  pattern: '.{5,64}',
  required: true,
  secret: true,
  set: false,
}

test('a required setting with nothing saved asks for a value; a saved one does not', () => {
  expect(serverFieldError(base, '')).toBe('required')
  expect(serverFieldError({ ...base, set: true }, '')).toBeUndefined()
  expect(serverFieldError({ ...base, default: 'x' }, '')).toBeUndefined()
  expect(serverFieldError({ ...base, required: false }, '')).toBeUndefined()
})

test('the catalog pattern must match the whole value', () => {
  expect(serverFieldError(base, 'abcd')).toBe('invalid')
  expect(serverFieldError(base, 'abcde')).toBeUndefined()
  expect(serverFieldError({ ...base, pattern: '[0-9]{1,5}' }, '123456')).toBe('invalid')
  expect(serverFieldError({ ...base, pattern: '[' }, 'anything')).toBe('invalid')
})

test('typed text changes a secret; a plain field changes when it differs', () => {
  expect(serverFieldChanged(base, '')).toBe(false)
  expect(serverFieldChanged(base, 'abcde')).toBe(true)
  const world = { ...base, secret: false, value: 'Mine' }
  expect(serverFieldChanged(world, 'Mine')).toBe(false)
  expect(serverFieldChanged(world, 'Other')).toBe(true)
})
