import { expect, test } from 'bun:test'
import type { Entry } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/profile/models.ts'
import { testProfile } from '../profiles/testProfile.ts'
import { isFrozen } from './frozen.ts'

const entry = (key: string, pinned: boolean, pinReason = '') =>
  ({
    key,
    previousKey: '',
    source: { kind: 'local', name: key },
    mods: [],
    disabled: [],
    pinned,
    pinReason,
  }) as Entry
const profile = (entries: Entry[]) => testProfile({ id: 'p', name: 'P', entries })

test('a profile is frozen when every mod is held and a freeze made a hold', () => {
  const frozen = 'Frozen with the profile'
  expect(isFrozen(profile([entry('a', true, frozen), entry('b', true, 'mine')]))).toBe(true)
  expect(isFrozen(profile([entry('a', true, 'mine'), entry('b', true, 'mine')]))).toBe(false)
  expect(isFrozen(profile([entry('a', true, frozen), entry('b', false)]))).toBe(false)
  expect(isFrozen(profile([]))).toBe(false)
  expect(isFrozen(undefined)).toBe(false)
})
