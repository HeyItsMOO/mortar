import type { GameInfo } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/game/models.ts'

// The game's hero art, served by the app from Steam's local cache or Steam's public copy (see ArtMiddleware), so a
// game shows its art before any launcher is found. Nothing is bundled or re-hosted.
export const gameArt = (game: Pick<GameInfo, 'artUrl'> | undefined): string => game?.artUrl ?? ''
