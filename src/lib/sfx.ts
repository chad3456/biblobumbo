/** Tiny synthesized sounds for the Diwali scene (no audio files). */

let ctx: AudioContext | null = null
function ac() {
  ctx ??= new AudioContext()
  void ctx.resume()
  return ctx
}

/** Temple-bell chime when a diya is lit. */
export function chime() {
  const c = ac()
  const t = c.currentTime
  for (const [f, a, d] of [[880, 0.18, 2.4], [1320, 0.08, 1.8], [2217, 0.05, 1.2], [587, 0.1, 2.8]] as const) {
    const o = c.createOscillator()
    const g = c.createGain()
    o.frequency.value = f
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(a, t + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, t + d)
    o.connect(g).connect(c.destination)
    o.start(t)
    o.stop(t + d + 0.05)
  }
}

/** Soft distant firework pop + crackle. */
export function pop() {
  const c = ac()
  const t = c.currentTime
  const len = 0.6
  const buf = c.createBuffer(1, c.sampleRate * len, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    const k = i / data.length
    const crackle = Math.random() < 0.02 * (1 - k) ? 1 : 0.15
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - k, 3) * crackle
  }
  const src = c.createBufferSource()
  src.buffer = buf
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 1400
  const g = c.createGain()
  g.gain.value = 0.35
  src.connect(lp).connect(g).connect(c.destination)
  src.start(t)
  const boom = c.createOscillator()
  const bg = c.createGain()
  boom.frequency.setValueAtTime(120, t)
  boom.frequency.exponentialRampToValueAtTime(40, t + 0.3)
  bg.gain.setValueAtTime(0.25, t)
  bg.gain.exponentialRampToValueAtTime(0.0001, t + 0.35)
  boom.connect(bg).connect(c.destination)
  boom.start(t)
  boom.stop(t + 0.4)
}
