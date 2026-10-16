import { expect, test } from 'bun:test'
import { partKey, supportParts } from './installReason.ts'

const CP = 'Pathoschild.ContentPatcher'

test('every mod of a download but its main one reads implicit', () => {
  // An expansion: its Content Patcher pack is the main mod; the code it requires, its other framework's pack and
  // farm-type code nothing requires came with it.
  const sveCode = { key: 'sve', id: 'FlashShifter.SVECode' }
  const sveFtm = { key: 'sve', id: 'flashshifter.sve-ftm', contentPackFor: 'Esca.FarmTypeManager' }
  const farm = { key: 'sve', id: 'FlashShifter.FrontierFarm' }
  // No pack: the first code mod is the main one.
  const workbench = { key: 'bc', id: 'leclair.bcworkbench' }
  const mods = [
    { key: 'other', id: 'Other.Pack', contentPackFor: CP },
    { key: 'sve', id: 'FlashShifter.SVECP', contentPackFor: CP, needs: ['FlashShifter.SVECode'] },
    sveCode,
    sveFtm,
    farm,
    { key: 'bc', id: 'leclair.bettercrafting' },
    workbench,
    { key: 'lib', id: 'Other.Lib' },
  ]
  expect(supportParts(mods)).toEqual(new Set([sveCode, sveFtm, farm, workbench].map(partKey)))
})
