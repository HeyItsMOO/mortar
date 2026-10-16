import { i18n } from '@lingui/core'
import { msg } from '@lingui/core/macro'

const lcSlot = /^LCSaveFile(\d+)$/
// Lethal Company has three save slots of its own; a higher one comes from a mod.
const LC_GAME_SLOTS = 3
const extension = /\.[^.]+$/

// A save's display name: its farm, else Lethal Company's slot (its saves are files named by slot), else its folder or
// file name without the extension (a Valheim world is worlds_local/<name>.fwl).
export function saveName(save: { farm: string; folder: string }): string {
  if (save.farm) {
    return save.farm
  }
  const slot = lcSlot.exec(save.folder)?.[1]
  if (slot !== undefined) {
    return i18n._(msg`Save file ${slot}`)
  }
  if (save.folder === 'LCChallengeFile') {
    return i18n._(msg`Challenge moon`)
  }
  return (save.folder.split('/').at(-1) ?? '').replace(extension, '')
}

// What a save is: a Lethal Company slot or its weekly challenge (the game has three slots, so a fourth comes from a
// mod), or a Valheim character or world by the folder it sits in; empty for any other game's save.
export function saveKind(folder: string): string {
  if (folder === 'LCChallengeFile') {
    return i18n._(msg`Weekly challenge`)
  }
  const slot = lcSlot.exec(folder)?.[1]
  if (slot !== undefined) {
    return Number(slot) <= LC_GAME_SLOTS
      ? i18n._(msg`Save slot`)
      : i18n._(msg`Extra slot added by a mod`)
  }
  if (folder.startsWith('characters_local/')) {
    return i18n._(msg`Character`)
  }
  if (folder.startsWith('worlds_local/')) {
    return i18n._(msg`World`)
  }
  return ''
}
