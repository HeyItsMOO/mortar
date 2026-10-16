import { expect, test } from 'bun:test'
import type { Entry } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/profile/models.ts'
import { legacyImplicitKeys } from './legacyReasons.ts'

const entry = (key: string, over: Partial<Entry> = {}): Entry =>
  ({
    key,
    source: { kind: 'nexus', name: '' },
    mods: [],
    disabled: [],
    previousKey: '',
    ...over,
  }) as Entry

test('the legacy offer names what other mods require, libraries and tilesheet packs added before reasons', () => {
  const keys = [
    ...['cp', 'pack', 'lib', 'core', 'tiles', 'new-lib', 'done', 'plain', 'cycA', 'cycB', 'opt'],
    ...['sve', 'sveAddon', 'maps', 'mapsPatch', 'mapsNpcs'],
  ]
  const entries = keys.map((k) =>
    entry(k, {
      ...(k === 'new-lib' ? { added: '2026-10-17T00:00:00Z' } : {}),
      ...(k === 'done' ? { implicit: true } : {}),
    }),
  )
  const mods = [
    { key: 'cp', id: 'Pathoschild.ContentPatcher', enabled: true },
    { key: 'pack', id: 'A.Pack', enabled: true, contentPackFor: 'pathoschild.contentpatcher' },
    { key: 'lib', id: 'B.Lib', enabled: true },
    { key: 'core', id: 'F.Core', enabled: true },
    { key: 'tiles', id: 'C.Tiles', enabled: true, contentPackFor: 'Pathoschild.ContentPatcher' },
    { key: 'new-lib', id: 'D.Lib', enabled: true },
    {
      key: 'plain',
      id: 'E.Plain',
      enabled: true,
      needs: ['f.core', 'G.Opt'],
      optional: ['G.Opt'],
    },
    { key: 'cycA', id: 'H.A', enabled: true, needs: ['H.B'] },
    { key: 'cycB', id: 'H.B', enabled: true, needs: ['H.A'] },
    { key: 'opt', id: 'G.Opt', enabled: true },
    // An expansion its add-ons need, and a mod only its own add-ons need, stay explicit.
    { key: 'sve', id: 'I.SVE', enabled: true, contentPackFor: 'pathoschild.contentpatcher' },
    { key: 'sveAddon', id: 'J.Addon', enabled: true, needs: ['I.SVE'] },
    { key: 'maps', id: 'Bouhm.NPCMapLocations', name: 'NPC Map Locations', enabled: true },
    {
      key: 'mapsPatch',
      id: 'Z.NPCMapLocationsPatch',
      enabled: true,
      needs: ['bouhm.npcmaplocations'],
    },
    {
      key: 'mapsNpcs',
      id: 'Y.Custom',
      name: 'Custom NPCs for NPC Map Locations',
      enabled: true,
      needs: ['Bouhm.NPCMapLocations'],
    },
  ].map((m) => ({ name: '', ...m }))
  const category = (e: Entry) =>
    e.key === 'lib' || e.key === 'new-lib' ? 'Modding Tools' : 'Gameplay'
  expect(
    legacyImplicitKeys({ entries, intentSince: '2026-10-16T00:00:00Z' }, mods, category, ['tiles']),
  ).toEqual(['cp', 'lib', 'core', 'tiles'])
})
