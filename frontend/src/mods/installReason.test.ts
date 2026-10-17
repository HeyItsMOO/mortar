import { expect, test } from 'bun:test'
import { partKey, supportParts } from './installReason.ts'

const CP = 'Pathoschild.ContentPatcher'

test('every mod of a download but its main one reads implicit', () => {
  // The base its other parts build on is the main mod: a code mod under its Content Patcher pack and translation.
  const loveCp = {
    key: 'loc',
    id: 'blueberry.LoveOfCooking.CP',
    contentPackFor: CP,
    needs: ['blueberry.LoveOfCooking'],
  }
  const loveEn = {
    key: 'loc',
    id: 'blueberry.LoveOfCooking.EN',
    contentPackFor: CP,
    needs: ['blueberry.LoveOfCooking.CP'],
  }
  // Parts that need nothing of each other: the pack for the primary framework is the main one.
  const zuzuFtm = { key: 'zuzu', id: 'DTZ.FTM', contentPackFor: 'Esca.FarmTypeManager' }
  const zuzuCc = { key: 'zuzu', id: 'DTZ.CC', contentPackFor: 'PeacefulEnd.CustomCompanions' }
  // No pack at all: the first code mod.
  const workbench = { key: 'bc', id: 'leclair.bcworkbench' }
  // A tagged base gives way to its untagged twin: the code reads explicit even where it requires its pack.
  const luckCp = {
    key: 'luck',
    id: 'moonslime.LuckSkill.CP',
    name: '[CP] Luck Skill',
    contentPackFor: CP,
  }
  const laceyCore = { key: 'lacey', id: 'Hat.Core', name: 'Hat Mouse Lacey - Core' }
  const mods = [
    luckCp,
    {
      key: 'luck',
      id: 'moonslime.LuckSkill',
      name: 'Luck Skill',
      needs: ['moonslime.LuckSkill.CP'],
    },
    laceyCore,
    { key: 'lacey', id: 'Hat.Lacey', name: 'Hat Mouse Lacey', needs: ['Hat.Core'] },
    { key: 'other', id: 'Other.Pack', contentPackFor: CP },
    loveEn,
    loveCp,
    { key: 'loc', id: 'blueberry.LoveOfCooking', needs: ['spacechase0.SpaceCore'] },
    zuzuFtm,
    zuzuCc,
    { key: 'zuzu', id: 'DTZ.CP', contentPackFor: CP },
    { key: 'bc', id: 'leclair.bettercrafting' },
    workbench,
    { key: 'lib', id: 'Other.Lib' },
  ]
  expect(supportParts(mods)).toEqual(
    new Set([loveCp, loveEn, zuzuFtm, zuzuCc, workbench, luckCp, laceyCore].map(partKey)),
  )
})
