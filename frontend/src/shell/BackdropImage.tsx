import { Box, type SxProps, type Theme } from '@mui/material'
import { useState } from 'react'
import { useReducedMotion } from '../theme/reducedMotion.ts'

// The background image. An animated one (GIF, animated WebP or APNG) plays unless motion is reduced; then its first
// frame is drawn once into a still, since an img element cannot be paused.
export function BackdropImage({ src, alt, sx }: { src: string; alt: string; sx: SxProps<Theme> }) {
  const still = useReducedMotion()
  const [frozen, setFrozen] = useState<{ src: string; url: string } | null>(null)
  const freeze = (img: HTMLImageElement) => {
    if (!still || frozen?.src === src || img.naturalWidth === 0) {
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
    setFrozen({ src, url: canvas.toDataURL('image/jpeg', 0.92) })
  }
  return (
    <Box
      component="img"
      alt={alt}
      draggable={false}
      src={still && frozen?.src === src ? frozen.url : src}
      onLoad={(e) => freeze(e.currentTarget)}
      sx={sx}
    />
  )
}
