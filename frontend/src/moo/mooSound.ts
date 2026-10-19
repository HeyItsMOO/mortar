// A synthesised moo: two detuned oscillators with a falling pitch, a lowpass that opens and closes like a mouth, and a
// gain envelope, all through a compressor so it is loud without clipping. Nothing is loaded; it is all Web Audio.

const MOO_SECONDS = 1

export const MOO_INTERVAL_MS = 1200

let ctx: AudioContext | null = null
let bus: GainNode | null = null

function audioContext(): AudioContext | null {
  if (ctx) {
    return ctx
  }
  const Ctor: typeof AudioContext | undefined =
    globalThis.AudioContext ??
    (globalThis as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) {
    return null
  }
  ctx = new Ctor()
  const compressor = ctx.createDynamicsCompressor()
  compressor.threshold.value = -18
  compressor.knee.value = 12
  compressor.ratio.value = 12
  compressor.attack.value = 0.003
  compressor.release.value = 0.2
  bus = ctx.createGain()
  bus.gain.value = 1
  bus.connect(compressor)
  compressor.connect(ctx.destination)
  return ctx
}

// Call from the click that opens the tab: browsers only let audio start from a user gesture.
export function primeMoo(): AudioContext | null {
  const c = audioContext()
  if (c && c.state === 'suspended') {
    c.resume().catch(() => undefined)
  }
  return c
}

export function mooRunning(): boolean {
  return ctx !== null && ctx.state === 'running'
}

export function playMoo(): void {
  const c = ctx
  const out = bus
  if (!(c && out) || c.state !== 'running') {
    return
  }
  const t0 = c.currentTime
  const end = t0 + MOO_SECONDS

  const filter = c.createBiquadFilter()
  filter.type = 'lowpass'
  filter.Q.value = 6
  filter.frequency.setValueAtTime(350, t0)
  filter.frequency.linearRampToValueAtTime(1100, t0 + 0.3)
  filter.frequency.linearRampToValueAtTime(700, t0 + 0.75)
  filter.frequency.linearRampToValueAtTime(300, end)

  const gain = c.createGain()
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(1, t0 + 0.08)
  gain.gain.setValueAtTime(1, t0 + 0.65)
  gain.gain.exponentialRampToValueAtTime(0.0001, end)

  // A slow wobble on the pitch gives it the wavering voice.
  const wobble = c.createOscillator()
  wobble.frequency.value = 6
  const wobbleDepth = c.createGain()
  wobbleDepth.gain.value = 4
  wobble.connect(wobbleDepth)

  const saw = c.createOscillator()
  const square = c.createOscillator()
  saw.type = 'sawtooth'
  square.type = 'square'
  square.detune.value = -1200
  const oscillators = [saw, square]
  for (const osc of oscillators) {
    osc.frequency.setValueAtTime(155, t0)
    osc.frequency.linearRampToValueAtTime(140, t0 + 0.25)
    osc.frequency.exponentialRampToValueAtTime(95, end)
    wobbleDepth.connect(osc.frequency)
    osc.connect(filter)
  }
  filter.connect(gain)
  gain.connect(out)

  wobble.start(t0)
  wobble.stop(end + 0.05)
  for (const osc of oscillators) {
    osc.start(t0)
    osc.stop(end + 0.05)
  }
  saw.onended = () => {
    for (const node of [filter, gain, wobble, wobbleDepth, saw, square]) {
      node.disconnect()
    }
  }
}

// Silences everything and frees the audio device.
export function stopMoo(): void {
  const c = ctx
  ctx = null
  bus = null
  c?.close().catch(() => undefined)
}
