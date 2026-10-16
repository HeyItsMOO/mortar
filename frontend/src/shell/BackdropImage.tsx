import { Box, type SxProps, type Theme } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { State } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/launchsvc/models.ts'
import { useLaunch } from '../launch/store.ts'
import { useReducedMotion } from '../theme/reducedMotion.ts'

const STILL_QUALITY = 0.92

// The background image. An animated one (GIF, animated WebP or APNG) plays unless motion is reduced or a game is
// running, so it costs no GPU during play; then its current frame is drawn once into a still, since an img element
// cannot be paused.
export function BackdropImage({ src, alt, sx }: { src: string; alt: string; sx: SxProps<Theme> }) {
  const reduced = useReducedMotion()
  const playing = useLaunch((s) => s.status?.state === State.Running)
  const still = reduced || playing
  const ref = useRef<HTMLImageElement>(null)
  const [loaded, setLoaded] = useState('')
  const [frozen, setFrozen] = useState<{ src: string; url: string } | null>(null)
  useEffect(() => {
    const img = ref.current
    if (!still || loaded !== src || frozen?.src === src || !img || img.naturalWidth === 0) {
      return
    }
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }
    ctx.drawImage(img, 0, 0)
    setFrozen({ src, url: canvas.toDataURL('image/jpeg', STILL_QUALITY) })
  }, [still, src, loaded, frozen])
  return (
    <Box
      component="img"
      ref={ref}
      alt={alt}
      draggable={false}
      src={still && frozen?.src === src ? frozen.url : src}
      onLoad={() => setLoaded(src)}
      sx={sx}
    />
  )
}
