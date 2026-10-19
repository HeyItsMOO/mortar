import { expect, test } from 'bun:test'
import type { Mod } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/profile/models.ts'
import { testProfile } from '../profiles/testProfile.ts'
import { switchedOffMods } from './switchedOff.ts'

const mod = (key: string, enabled: boolean) => ({ key, id: key, name: key, enabled }) as Mod
const entry = (key: string, kind: string) =>
  ({ key, previousKey: '', source: { kind, name: key }, mods: [], disabled: [] }) as never

test('only switched-off mods that are not bundled can be removed', () => {
  const profile = testProfile({
    id: 'p',
    name: 'P',
    entries: [entry('a', 'nexus'), entry('b', 'smapi'), entry('c', 'nexus')],
  })
  const got = switchedOffMods([mod('a', false), mod('b', false), mod('c', true)], profile)
  expect(got.map((m) => m.key)).toEqual(['a'])
})
