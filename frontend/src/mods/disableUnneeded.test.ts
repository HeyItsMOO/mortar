import { expect, test } from 'bun:test'
import type { Mod } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/profile/models.ts'
import { unneededImplicit } from './disableUnneeded.ts'

const mod = (id: string, needs: string[] = [], over: Partial<Mod> = {}) =>
  ({ key: id, id, name: id, enabled: true, needs, ...over }) as Mod

test('switching a mod off names the implicit mods only it needed, through what they need', () => {
  const pack = mod('Me.Pack', ['Lib.Core', 'Lib.Shared', 'Me.Chosen', 'Lib.Extra'])
  const all = [
    pack,
    mod('Lib.Extra'),
    mod('Uses.Extra', ['Lib.Extra'], { optional: ['Lib.Extra'] }),
    mod('Lib.Core', ['Lib.Deep']),
    mod('Lib.Deep'),
    mod('Lib.Shared'),
    mod('Other.Mod', ['Lib.Shared']),
    mod('Me.Chosen'),
  ]
  const implicit = (m: Mod) => m.id.startsWith('Lib.')
  expect(unneededImplicit(all, [pack], implicit).map((m) => m.id)).toEqual(['Lib.Core', 'Lib.Deep'])
})

test('removing also takes switched-off libraries, and keeps what a switched-off mod that stays needs', () => {
  const pack = mod('Me.Pack', ['Lib.Off', 'Lib.Kept'])
  const all = [
    pack,
    mod('Lib.Off', [], { enabled: false }),
    mod('Lib.Kept'),
    mod('Me.Resting', ['Lib.Kept'], { enabled: false }),
  ]
  const implicit = (m: Mod) => m.id.startsWith('Lib.')
  expect(unneededImplicit(all, [pack], implicit, true).map((m) => m.id)).toEqual(['Lib.Off'])
  // Switching off instead leaves a library only switched-off mods need free to go off too.
  expect(unneededImplicit(all, [pack], implicit).map((m) => m.id)).toEqual(['Lib.Kept'])
})
