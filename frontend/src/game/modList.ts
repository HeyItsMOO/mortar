import type { GameInfo } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/game/models.ts'

/** Whether the game's mods can be matched exactly between computers (packsvc farmSupported): Stardew by SMAPI id, a Thunderstore game by package id, Vintage Story by mod id. */
export const hasModList = (game: Pick<GameInfo, 'id' | 'sources'> | undefined): boolean =>
  game !== undefined &&
  (game.id === 'stardew' ||
    (game.sources ?? []).some((s) => s === 'thunderstore' || s === 'vsmoddb'))
