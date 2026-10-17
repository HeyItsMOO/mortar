import { expect, test } from 'bun:test'
import type { Mod } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/profile/models.ts'
import { unneededImplicit } from './disableUnneeded.ts'

const mod = (id: string, needs: string[] = [], over: Partial<Mod> = {}) =>
  ({ key: id, id, name: id, enabled: true, needs, ...over }) as Mod

test('switching a mod off names the implicit mods only it needed, through what they need', () => {
  const pack = mod('Me.Pack', ['Lib.Core', 'Lib.Shared', 'Me.Chosen'])
  const all = [
    pack,
    mod('Lib.Core', ['Lib.Deep']),
    mod('Lib.Deep'),
    mod('Lib.Shared'),
    mod('Other.Mod', ['Lib.Shared']),
    mod('Me.Chosen'),
  ]
  const implicit = (m: Mod) => m.id.startsWith('Lib.')
  expect(unneededImplicit(all, [pack], implicit).map((m) => m.id)).toEqual(['Lib.Core', 'Lib.Deep'])
})
