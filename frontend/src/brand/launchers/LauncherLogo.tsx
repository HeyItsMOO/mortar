import { Box } from '@mui/material'
import {
  siEa,
  siEpicgames,
  siFlatpak,
  siGogdotcom,
  siHeroicgameslauncher,
  siLutris,
  siSteam,
} from 'simple-icons'
import { BrandMark } from '../BrandMark.tsx'
import bottles from '../vendor/bottles.svg'
import minigalaxy from '../vendor/minigalaxy.png'

// Microsoft's trademark terms forbid its logos without permission, so the Xbox tile carries a plain X.
const X_PATH = 'M4 3h4.5L12 8.6 15.5 3H20l-5.7 9L20 21h-4.5L12 15.4 8.5 21H4l5.7-9z'

// Launchers simple-icons has no mark for show their own GPL-3.0 icons (credited in THIRD_PARTY_NOTICES).
const ART: Record<string, { src: string; bg: string }> = {
  minigalaxy: { src: minigalaxy, bg: '#3B4A8C' },
  bottles: { src: bottles, bg: '#1C71D8' },
}

// Each launcher sits on a tile of its brand colour so every logo is the same size and reads in colour on dark and
// light surfaces. Steam's brand mark is black, so it takes the Steam client's blue instead.
const TILES: Record<string, { path: string; bg: string }> = {
  steam: { path: siSteam.path, bg: '#1A9FFF' },
  'flatpak-steam': { path: siSteam.path, bg: '#1A9FFF' },
  heroic: { path: siHeroicgameslauncher.path, bg: `#${siHeroicgameslauncher.hex}` },
  lutris: { path: siLutris.path, bg: `#${siLutris.hex}` },
  ea: { path: siEa.path, bg: `#${siEa.hex}` },
  epic: { path: siEpicgames.path, bg: `#${siEpicgames.hex}` },
  xbox: { path: X_PATH, bg: '#107C10' },
  gog: { path: siGogdotcom.path, bg: `#${siGogdotcom.hex}` },
}

// Launchers that run as a Flatpak carry its mark, so they read apart from the same launcher installed natively.
const FLATPAK = new Set(['flatpak-steam'])
const BADGE_SCALE = 0.5
// The badge overhangs the logo's corner by a quarter of its size, inside a dark ring this many pixels wide.
const BADGE_OVERHANG = 0.25
const BADGE_RING = 4
const MARK_SCALE = 0.62
// The artwork carries a transparent margin, so it draws larger to match the other marks.
const ART_SCALE = 0.86
const TILE_RADIUS = 0.22

function Tile({ size, bg, children }: { size: number; bg: string; children: React.ReactNode }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: `${Math.round(size * TILE_RADIUS)}px`,
        bgcolor: bg,
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
      }}
    >
      {children}
    </Box>
  )
}

export function LauncherLogo({ id, size }: { id: string; size: number }) {
  const art = ART[id]
  if (art) {
    return (
      <Tile size={size} bg={art.bg}>
        <Box
          component="img"
          src={art.src}
          alt=""
          width={size * ART_SCALE}
          height={size * ART_SCALE}
        />
      </Tile>
    )
  }
  const tile = TILES[id]
  if (!tile) {
    return null
  }
  const logo = (
    <Tile size={size} bg={tile.bg}>
      <BrandMark path={tile.path} size={Math.round(size * MARK_SCALE)} fill="#FFFFFF" />
    </Tile>
  )
  if (!FLATPAK.has(id)) {
    return logo
  }
  const badge = Math.round(size * BADGE_SCALE)
  return (
    <Box sx={{ position: 'relative', width: size, height: size }}>
      {logo}
      <Box
        sx={{
          position: 'absolute',
          right: -badge * BADGE_OVERHANG,
          bottom: -badge * BADGE_OVERHANG,
          width: badge + BADGE_RING,
          height: badge + BADGE_RING,
          display: 'grid',
          placeItems: 'center',
          borderRadius: '50%',
          bgcolor: '#1E1E26',
        }}
      >
        <BrandMark path={siFlatpak.path} size={badge} fill={`#${siFlatpak.hex}`} />
      </Box>
    </Box>
  )
}
