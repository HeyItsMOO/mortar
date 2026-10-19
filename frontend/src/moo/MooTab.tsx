import { useLingui } from '@lingui/react/macro'
import { Box, Button, Typography } from '@mui/material'
import { keyframes } from '@mui/material/styles'
import { useCallback, useEffect, useState } from 'react'
import { MOO_INTERVAL_MS, mooRunning, playMoo, primeMoo, stopMoo } from './mooSound.ts'

const dance = keyframes`
  0% { transform: translateY(0) rotate(-6deg) scale(1, 1); }
  25% { transform: translateY(-34px) rotate(0deg) scale(0.96, 1.06); }
  50% { transform: translateY(0) rotate(6deg) scale(1.05, 0.95); }
  75% { transform: translateY(-34px) rotate(0deg) scale(0.96, 1.06); }
  100% { transform: translateY(0) rotate(-6deg) scale(1, 1); }
`
const sway = keyframes`
  0%, 100% { transform: rotate(-12deg); }
  50% { transform: rotate(12deg); }
`
const wag = keyframes`
  0%, 100% { transform: rotate(-22deg); }
  50% { transform: rotate(26deg); }
`
const disco = keyframes`
  0% { background-position: 0% 50%; }
  100% { background-position: 150% 50%; }
`
const pop = keyframes`
  0% { opacity: 0; transform: scale(0.2) rotate(var(--r)); }
  20% { opacity: 1; transform: scale(1.25) rotate(var(--r)); }
  70% { opacity: 1; transform: scale(1) rotate(var(--r)); }
  100% { opacity: 0; transform: scale(1.4) translateY(-30px) rotate(var(--r)); }
`

const BURST_MS = 1400
const BURST_EVERY_MS = 420
const MAX_BURSTS = 6
const WORDS = ['MOO!', 'MOO!', 'MOOOO!', 'Moo!', 'MOO MOO!']

interface Burst {
  id: number
  left: number
  top: number
  rotate: number
  size: number
  text: string
}

function randomBurst(id: number): Burst {
  return {
    id,
    left: 4 + Math.random() * 80,
    top: 4 + Math.random() * 78,
    rotate: Math.round(Math.random() * 50 - 25),
    size: 28 + Math.round(Math.random() * 44),
    text: WORDS[Math.floor(Math.random() * WORDS.length)] ?? 'MOO!',
  }
}

const INK = '#2b2b2b'
const PINK = '#f6a6b8'

function Leg({ x }: { x: number }) {
  return (
    <>
      <rect x={x} y="205" width="24" height="62" rx="9" fill="#fff" stroke={INK} strokeWidth="4" />
      <rect x={x - 2} y="258" width="28" height="14" rx="5" fill={INK} />
    </>
  )
}

function Cow() {
  return (
    <svg
      viewBox="0 0 320 300"
      width="100%"
      height="100%"
      role="img"
      aria-hidden={true}
      style={{ overflow: 'visible' }}
    >
      <g className="moo-tail">
        <path d="M250 140 Q290 150 285 205" stroke={INK} strokeWidth="7" fill="none" />
        <ellipse cx="285" cy="212" rx="9" ry="14" fill={INK} />
      </g>
      <Leg x={210} />
      <Leg x={236} />
      <ellipse cx="165" cy="170" rx="100" ry="62" fill="#fff" stroke={INK} strokeWidth="4" />
      <ellipse cx="190" cy="150" rx="26" ry="20" fill={INK} />
      <ellipse cx="225" cy="185" rx="20" ry="26" fill={INK} />
      <ellipse cx="160" cy="205" rx="22" ry="14" fill={INK} />
      <path d="M150 226 Q165 252 182 226 Z" fill={PINK} stroke={INK} strokeWidth="3" />
      <Leg x={95} />
      <Leg x={121} />
      <g className="moo-head">
        <path
          d="M58 92 Q40 72 52 58"
          stroke="#e8d9a8"
          strokeWidth="9"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M122 92 Q140 72 128 58"
          stroke="#e8d9a8"
          strokeWidth="9"
          fill="none"
          strokeLinecap="round"
        />
        <ellipse
          cx="46"
          cy="104"
          rx="20"
          ry="11"
          fill="#fff"
          stroke={INK}
          strokeWidth="4"
          transform="rotate(-20 46 104)"
        />
        <ellipse
          cx="134"
          cy="104"
          rx="20"
          ry="11"
          fill="#fff"
          stroke={INK}
          strokeWidth="4"
          transform="rotate(20 134 104)"
        />
        <ellipse cx="90" cy="120" rx="52" ry="48" fill="#fff" stroke={INK} strokeWidth="4" />
        <ellipse cx="68" cy="92" rx="14" ry="10" fill={INK} />
        <ellipse cx="90" cy="150" rx="36" ry="24" fill={PINK} stroke={INK} strokeWidth="4" />
        <ellipse cx="78" cy="150" rx="5" ry="7" fill="#b9566f" />
        <ellipse cx="102" cy="150" rx="5" ry="7" fill="#b9566f" />
        <circle cx="70" cy="112" r="9" fill="#fff" stroke={INK} strokeWidth="3" />
        <circle cx="110" cy="112" r="9" fill="#fff" stroke={INK} strokeWidth="3" />
        <circle cx="72" cy="114" r="4.5" fill={INK} />
        <circle cx="108" cy="114" r="4.5" fill={INK} />
        <path
          d="M54 104 H126 V114 Q126 128 112 128 Q98 128 94 114 H86 Q82 128 68 128 Q54 128 54 114 Z"
          fill="#111"
          opacity="0.88"
        />
      </g>
    </svg>
  )
}

// The "MOO!" words that pop up around the cow, a new one every moment and each gone again after a second or so.
function useBursts(): Burst[] {
  const [bursts, setBursts] = useState<Burst[]>([])
  useEffect(() => {
    let next = 0
    const timers = new Set<ReturnType<typeof setTimeout>>()
    const spawn = () => {
      const burst = randomBurst(next++)
      setBursts((prev) => [...prev.slice(-(MAX_BURSTS - 1)), burst])
      const gone = globalThis.setTimeout(() => {
        timers.delete(gone)
        setBursts((prev) => prev.filter((b) => b.id !== burst.id))
      }, BURST_MS)
      timers.add(gone)
    }
    spawn()
    const timer = globalThis.setInterval(spawn, BURST_EVERY_MS)
    return () => {
      globalThis.clearInterval(timer)
      for (const id of timers) {
        globalThis.clearTimeout(id)
      }
    }
  }, [])
  return bursts
}

// Whether sound is flowing, and the moo on a loop while it is. Leaving the tab closes the audio for good.
function useMooing(): { running: boolean; wake: () => void } {
  const [running, setRunning] = useState(() => mooRunning())

  // The sidebar click already woke the audio; wake() is the fallback for when the browser still says no.
  const wake = useCallback(() => {
    const c = primeMoo()
    c?.resume().then(
      () => setRunning(c.state === 'running'),
      () => undefined,
    )
  }, [])

  useEffect(() => {
    const c = primeMoo()
    const sync = () => setRunning(c?.state === 'running')
    c?.addEventListener('statechange', sync)
    sync()
    return () => c?.removeEventListener('statechange', sync)
  }, [])

  useEffect(() => {
    if (!running) {
      return
    }
    playMoo()
    const timer = globalThis.setInterval(playMoo, MOO_INTERVAL_MS)
    return () => globalThis.clearInterval(timer)
  }, [running])

  useEffect(() => stopMoo, [])
  return { running, wake }
}

function BurstLayer({ bursts }: { bursts: Burst[] }) {
  return (
    <Box aria-hidden={true} sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {bursts.map((b) => (
        <Box
          key={b.id}
          component="span"
          sx={{
            '--r': `${b.rotate}deg`,
            position: 'absolute',
            left: `${b.left}%`,
            top: `${b.top}%`,
            fontSize: b.size,
            fontWeight: 900,
            fontFamily: 'Impact, "Arial Black", sans-serif',
            color: '#fff',
            WebkitTextStroke: '2px #111',
            textShadow: '3px 3px 0 #111',
            animation: `${pop} ${BURST_MS}ms ease-out forwards`,
            '@media (prefers-reduced-motion: reduce)': { animationDuration: '2400ms' },
          }}
        >
          {b.text}
        </Box>
      ))}
    </Box>
  )
}

// Shown while the browser still refuses to play sound: one click on the big button lets the cow be heard.
function WakeOverlay({ onWake }: { onWake: () => void }) {
  const { t } = useLingui()
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        bgcolor: 'rgba(0,0,0,0.45)',
      }}
    >
      <Button
        variant="contained"
        size="large"
        onClick={onWake}
        sx={{ fontSize: 56, fontWeight: 900, px: 8, py: 2, borderRadius: 6 }}
      >
        {t`MOO`}
      </Button>
      <Typography sx={{ color: '#fff', fontWeight: 700 }}>{t`Click to let the cow moo`}</Typography>
    </Box>
  )
}

// A big dancing cow that moos on a loop for as long as the tab is open.
export function MooTab() {
  const { running, wake } = useMooing()
  const bursts = useBursts()
  return (
    <Box
      data-testid="moo-tab"
      sx={{
        flex: 1,
        minHeight: 0,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(90deg, #ff3d9a, #ffb400, #3ddc84, #29b6f6, #7c4dff, #ff3d9a)',
        backgroundSize: '300% 100%',
        animation: `${disco} 4s linear infinite`,
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
          background: 'linear-gradient(110deg, #ffd6ea, #fff1c4, #d4f5e0)',
        },
      }}
    >
      <BurstLayer bursts={bursts} />
      <Box
        sx={{
          width: 'min(70vh, 70%)',
          maxWidth: 520,
          aspectRatio: '320 / 300',
          animation: `${dance} 0.9s ease-in-out infinite`,
          transformOrigin: '50% 100%',
          filter: 'drop-shadow(0 18px 12px rgba(0,0,0,0.35))',
          '& .moo-head': {
            transformOrigin: '90px 150px',
            animation: `${sway} 0.9s ease-in-out infinite`,
          },
          '& .moo-tail': {
            transformOrigin: '250px 140px',
            animation: `${wag} 0.45s ease-in-out infinite`,
          },
          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
            '& .moo-head, & .moo-tail': { animation: 'none' },
          },
        }}
      >
        <Cow />
      </Box>
      {running ? null : <WakeOverlay onWake={wake} />}
    </Box>
  )
}
