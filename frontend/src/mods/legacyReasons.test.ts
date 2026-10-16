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

test('the legacy offer names frameworks, libraries and tilesheet packs added before reasons were kept', () => {
  const entries = [
    entry('cp'),
    entry('pack'),
    entry('lib'),
    entry('tiles'),
    entry('new-lib', { added: '2026-10-17T00:00:00Z' }),
    entry('done', { implicit: true }),
    entry('plain'),
  ]
  const mods = [
    { key: 'cp', id: 'Pathoschild.ContentPatcher' },
    { key: 'pack', id: 'A.Pack', contentPackFor: 'pathoschild.contentpatcher' },
    { key: 'lib', id: 'B.Lib' },
    { key: 'tiles', id: 'C.Tiles', contentPackFor: 'Pathoschild.ContentPatcher' },
    { key: 'new-lib', id: 'D.Lib' },
    { key: 'plain', id: 'E.Plain' },
  ]
  const category = (e: Entry) =>
    e.key === 'lib' || e.key === 'new-lib' ? 'Modding Tools' : 'Gameplay'
  expect(
    legacyImplicitKeys({ entries, intentSince: '2026-10-16T00:00:00Z' }, mods, category, ['tiles']),
  ).toEqual(['cp', 'lib', 'tiles'])
})
