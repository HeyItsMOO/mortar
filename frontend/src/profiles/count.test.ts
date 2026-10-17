import { expect, test } from 'bun:test'
import type { Entry } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/profile/models.ts'
import { chosenModCount, userModCount, userModEntries } from './count.ts'

test('bundled SMAPI mods are not counted', () => {
  const entry = (kind: string, n: number) => ({
    source: { kind },
    mods: Array.from({ length: n }, () => ({})),
  })
  expect(
    userModCount({ entries: [entry('smapi', 2), entry('mortar', 1), entry('nexus', 3)] }),
  ).toBe(3)
})

test('user mod entries omit SMAPI and Mortar bridge sources', () => {
  const entries = [
    { source: { kind: 'smapi' }, key: 'smapi-1' },
    { source: { kind: 'mortar' }, key: 'bridge-1' },
    { source: { kind: 'nexus' }, key: 'nexus-1' },
  ]
  expect(userModEntries(entries).map((e) => e.key)).toEqual(['nexus-1'])
})

test("chosen mods leave out implicit entries and the parts beside a download's main mod", () => {
  const entries = [
    { key: 'lib', source: { kind: 'nexus' }, implicit: true, mods: [{ id: 'A.Lib' }] },
    {
      key: 'sve',
      source: { kind: 'nexus' },
      mods: [{ id: 'S.CP', needs: ['S.Code'] }, { id: 'S.Code' }],
    },
    { key: 'one', source: { kind: 'nexus' }, mods: [{ id: 'B.One' }] },
  ] as Entry[]
  expect(chosenModCount({ entries })).toBe(2)
})
