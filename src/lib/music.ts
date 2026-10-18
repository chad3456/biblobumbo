import type { StepId } from './types'

/**
 * The garba orchestra: original folk-style loops synthesised live with WebAudio
 * (no audio files). Each track is a taal cycle written as text patterns, one
 * character per half-beat, so drums, claps and dance steps share one clock.
 */

export type Voice = 'shehnai' | 'harmonium' | 'flute'

export interface Track {
  id: string
  name: string
  gujarati: string
  mood: string
  bpm: number
  step: StepId | 'aarti'
  /** half-beat slots per taal cycle */
  slots: number
  dhol: string
  manjira: string
  clap: string
  stick?: string
  bell?: string
  /** melody tokens, one per half-beat: S R G M P D n, ' = upper, . prefix = lower, - = hold, _ = rest */
  melody: string
  voice: Voice
}

export const TRACKS: Track[] = [
  {
    id: 'ambe',
    name: 'Ambe Maa no Garbo',
    gujarati: 'અંબે માં નો ગરબો',
    mood: 'steady, joyful two-clap garba',
    bpm: 104,
    step: 'be-taali',
    slots: 16,
    dhol: 'D.TdD.T.D.TdD.T.',
    manjira: 'x...x...x...x...',
    clap: '....c.c.....c.c.',
    melody: 'S - R G M - G R G - M P M G R - S - R G M P D P M G R G S - - -',
    voice: 'shehnai',
  },
  {
    id: 'tran',
    name: 'Tran Taali Thumko',
    gujarati: 'ત્રણ તાળી ઠુમકો',
    mood: 'bend, turn and clap-clap-clap',
    bpm: 112,
    step: 'tran-taali',
    slots: 12,
    dhol: 'D.T.d.D.T.T.',
    manjira: 'x...x...x...',
    clap: '......c.c.c.',
    melody: "P - D P M G R G M - G R S R G M P - M G R S - -",
    voice: 'harmonium',
  },
  {
    id: 'dodhiyu',
    name: 'Dodhiyu Dhamaka',
    gujarati: 'દોઢિયું ધમાકો',
    mood: 'fast and fiery — keep up!',
    bpm: 148,
    step: 'dodhiyu',
    slots: 16,
    dhol: 'DTdTDTdTDTdTDTdT',
    manjira: 'x.x.x.x.x.x.x.x.',
    clap: '......c.......c.',
    melody: "S' n D P M P D n S' - n D P - - - P D n S' R' S' n D P M G M P - - -",
    voice: 'shehnai',
  },
  {
    id: 'hinch',
    name: 'Hinch ni Hilor',
    gujarati: 'હીંચ ની હિલોર',
    mood: 'swaying 6/8 hinch',
    bpm: 96,
    step: 'hinch',
    slots: 12,
    dhol: 'D...T.d...T.',
    manjira: 'x.....x.....',
    clap: '..........c.',
    melody: 'G - - M - P D - P M - G R - G M - G R - - S - -',
    voice: 'flute',
  },
  {
    id: 'popat',
    name: 'Popat no Pankh',
    gujarati: 'પોપટ નો પાંખ',
    mood: 'playful dip-and-pop',
    bpm: 118,
    step: 'popatiyu',
    slots: 16,
    dhol: 'D.TTd.T.D.TTd.T.',
    manjira: 'x.x.x.x.x.x.x.x.',
    clap: '..c...c...c...c.',
    melody: 'P P D P M G R G M - G R S - - - S R G - M P - D P M G R G - - -',
    voice: 'harmonium',
  },
  {
    id: 'dandiya',
    name: 'Dandiya Dhoom',
    gujarati: 'દાંડિયા ધૂમ',
    mood: 'pairs strike sticks on every beat',
    bpm: 128,
    step: 'dandiya',
    slots: 16,
    dhol: 'D.T.D.T.D.TdD.T.',
    manjira: '..x...x...x...x.',
    clap: '................',
    stick: 'k.k.k.k.k.k.k.k.',
    melody: "D P M P D - S' - n D P M G - - - M P D n S' n D P M G R G S - - -",
    voice: 'shehnai',
  },
  {
    id: 'aarti',
    name: 'Maa ni Aarti',
    gujarati: 'માં ની આરતી',
    mood: 'everyone pauses, faces Maa and joins hands',
    bpm: 72,
    step: 'aarti',
    slots: 16,
    dhol: 'd.......d.......',
    manjira: 'x...x...x...x...',
    clap: '................',
    bell: 'b.......b.......',
    melody: 'S - - R G - - - M - G - R - S - P - - D P - M - G - R - S - - -',
    voice: 'harmonium',
  },
]

export const TRACK_BY_ID = Object.fromEntries(TRACKS.map((t) => [t.id, t])) as Record<string, Track>

const DEGREES: Record<string, number> = { S: 0, R: 2, G: 4, M: 5, P: 7, D: 9, n: 10 }
const TONIC = 293.66 // D4 as Sa

/** Parses a melody token to a frequency, or 'hold' / null (rest). */
export function noteFreq(token: string): number | 'hold' | null {
  if (token === '-') return 'hold'
  if (token === '_') return null
  let oct = 0
  let t = token
  if (t.startsWith('.')) { oct = -1; t = t.slice(1) }
  if (t.endsWith("'")) { oct = 1; t = t.slice(0, -1) }
  const semi = DEGREES[t]
  if (semi === undefined) return null
  return TONIC * Math.pow(2, (semi + oct * 12) / 12)
}

export function melodyTokens(track: Track): string[] {
  return track.melody.trim().split(/\s+/)
}

/** How many half-beats a melody note starting at `i` lasts (following holds). */
export function noteLength(tokens: string[], i: number): number {
  let n = 1
  while (tokens[(i + n) % tokens.length] === '-' && n < tokens.length) n++
  return n
}

/* ---------------- engine ---------------- */

export class GarbaOrchestra {
  ctx: AudioContext | null = null
  master: GainNode | null = null
  private noise: AudioBuffer | null = null
  private timer: number | null = null
  private nextSlot = 0
  private nextTime = 0
  private startTime = 0
  private silentStart = performance.now()
  private drone: { stop: () => void } | null = null
  track: Track = TRACKS[0]
  playing = false
  volume = 0.8

  /** Continuous beat count used by every animation (works even when muted). */
  beat(): number {
    if (this.playing && this.ctx) return Math.max(0, (this.ctx.currentTime - this.startTime) * (this.track.bpm / 60))
    return ((performance.now() - this.silentStart) / 1000) * (this.track.bpm / 60)
  }

  setTrack(id: string) {
    const t = TRACK_BY_ID[id]
    if (!t) return
    const wasPlaying = this.playing
    if (wasPlaying) this.stopAudio()
    this.track = t
    this.silentStart = performance.now()
    if (wasPlaying) this.play()
  }

  setVolume(v: number) {
    this.volume = v
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(v * 0.5, this.ctx.currentTime, 0.05)
  }

  play() {
    if (this.playing) return
    this.ctx ??= new AudioContext()
    const ctx = this.ctx
    void ctx.resume()
    if (!this.master) {
      this.master = ctx.createGain()
      const comp = ctx.createDynamicsCompressor()
      this.master.connect(comp).connect(ctx.destination)
    }
    this.master.gain.value = this.volume * 0.5
    if (!this.noise) {
      this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
      const d = this.noise.getChannelData(0)
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    }
    this.startTime = ctx.currentTime + 0.08
    this.nextTime = this.startTime
    this.nextSlot = 0
    this.playing = true
    this.drone = this.startDrone()
    this.timer = window.setInterval(() => this.schedule(), 25)
  }

  stop() {
    if (!this.playing) return
    // keep the silent clock in phase so dancers don't jump
    const b = this.beat()
    this.stopAudio()
    this.silentStart = performance.now() - (b / (this.track.bpm / 60)) * 1000
  }

  private stopAudio() {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
    this.drone?.stop()
    this.drone = null
    this.playing = false
  }

  private schedule() {
    const ctx = this.ctx!
    const half = 60 / this.track.bpm / 2
    while (this.nextTime < ctx.currentTime + 0.12) {
      this.playSlot(this.nextSlot, this.nextTime)
      this.nextSlot++
      this.nextTime += half
    }
  }

  private playSlot(slot: number, at: number) {
    const tr = this.track
    const i = slot % tr.slots
    const t = at
    const hit = (pat: string | undefined) => (pat ? pat[i] : '.')
    const d = hit(tr.dhol)
    if (d === 'D') this.dhol(t, 1)
    else if (d === 'd') this.dhol(t, 0.6)
    else if (d === 'T') this.slap(t)
    if (hit(tr.manjira) === 'x') this.manjira(t)
    if (hit(tr.clap) === 'c') this.clap(t)
    if (hit(tr.stick) === 'k') this.stick(t)
    if (hit(tr.bell) === 'b') this.bell(t)
    const tokens = melodyTokens(tr)
    const mi = slot % tokens.length
    const f = noteFreq(tokens[mi])
    if (typeof f === 'number') this.note(t, f, noteLength(tokens, mi) * (60 / tr.bpm / 2), tr.voice)
  }

  /* ---- instruments ---- */

  private env(at: number, peak: number, attack: number, decay: number) {
    const g = this.ctx!.createGain()
    g.gain.setValueAtTime(0.0001, at)
    g.gain.exponentialRampToValueAtTime(peak, at + attack)
    g.gain.exponentialRampToValueAtTime(0.0001, at + attack + decay)
    g.connect(this.master!)
    return g
  }

  private noiseSrc(at: number, dur: number) {
    const s = this.ctx!.createBufferSource()
    s.buffer = this.noise
    s.start(at, Math.random() * 0.5, dur)
    return s
  }

  private dhol(at: number, vel: number) {
    const ctx = this.ctx!
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.setValueAtTime(110, at)
    o.frequency.exponentialRampToValueAtTime(48, at + 0.25)
    o.connect(this.env(at, 0.9 * vel, 0.005, 0.38))
    o.start(at)
    o.stop(at + 0.45)
    const n = this.noiseSrc(at, 0.05)
    const f = ctx.createBiquadFilter()
    f.type = 'lowpass'
    f.frequency.value = 400
    n.connect(f).connect(this.env(at, 0.3 * vel, 0.002, 0.05))
  }

  private slap(at: number) {
    const ctx = this.ctx!
    const n = this.noiseSrc(at, 0.12)
    const f = ctx.createBiquadFilter()
    f.type = 'bandpass'
    f.frequency.value = 1100
    f.Q.value = 1.4
    n.connect(f).connect(this.env(at, 0.55, 0.002, 0.1))
    const o = ctx.createOscillator()
    o.frequency.setValueAtTime(330, at)
    o.frequency.exponentialRampToValueAtTime(220, at + 0.08)
    o.connect(this.env(at, 0.25, 0.002, 0.08))
    o.start(at)
    o.stop(at + 0.12)
  }

  private manjira(at: number) {
    const ctx = this.ctx!
    for (const fr of [3520, 5280, 6900]) {
      const o = ctx.createOscillator()
      o.type = 'square'
      o.frequency.value = fr
      const hp = ctx.createBiquadFilter()
      hp.type = 'highpass'
      hp.frequency.value = 3000
      o.connect(hp).connect(this.env(at, 0.035, 0.001, 0.32))
      o.start(at)
      o.stop(at + 0.36)
    }
  }

  private clap(at: number) {
    const ctx = this.ctx!
    for (let k = 0; k < 3; k++) {
      const t = at + k * 0.012
      const n = this.noiseSrc(t, 0.06)
      const f = ctx.createBiquadFilter()
      f.type = 'bandpass'
      f.frequency.value = 1700
      f.Q.value = 0.9
      n.connect(f).connect(this.env(t, k === 2 ? 0.5 : 0.25, 0.001, k === 2 ? 0.12 : 0.02))
    }
  }

  private stick(at: number) {
    const ctx = this.ctx!
    const o = ctx.createOscillator()
    o.type = 'triangle'
    o.frequency.setValueAtTime(1900, at)
    o.frequency.exponentialRampToValueAtTime(1300, at + 0.04)
    o.connect(this.env(at, 0.4, 0.001, 0.06))
    o.start(at)
    o.stop(at + 0.08)
  }

  private bell(at: number) {
    const ctx = this.ctx!
    for (const [fr, amp] of [[880, 0.25], [2140, 0.12], [3520, 0.06]] as const) {
      const o = ctx.createOscillator()
      o.frequency.value = fr
      o.connect(this.env(at, amp, 0.003, 2.2))
      o.start(at)
      o.stop(at + 2.4)
    }
  }

  private note(at: number, freq: number, dur: number, voice: Voice) {
    const ctx = this.ctx!
    const out = ctx.createGain()
    const len = Math.max(0.12, dur * 0.95)
    out.gain.setValueAtTime(0.0001, at)
    out.gain.exponentialRampToValueAtTime(voice === 'flute' ? 0.16 : 0.12, at + 0.04)
    out.gain.setValueAtTime(voice === 'flute' ? 0.14 : 0.1, at + len - 0.05)
    out.gain.exponentialRampToValueAtTime(0.0001, at + len)
    const filter = ctx.createBiquadFilter()
    filter.type = voice === 'shehnai' ? 'bandpass' : 'lowpass'
    filter.frequency.value = voice === 'shehnai' ? 1400 : voice === 'flute' ? 2400 : 1800
    filter.Q.value = voice === 'shehnai' ? 1.2 : 0.7
    filter.connect(out).connect(this.master!)

    const vib = ctx.createOscillator()
    const vibAmt = ctx.createGain()
    vib.frequency.value = 5.5
    vibAmt.gain.value = voice === 'harmonium' ? 0 : freq * 0.008
    vib.connect(vibAmt)

    const types: OscillatorType[] = voice === 'shehnai' ? ['sawtooth', 'square'] : voice === 'flute' ? ['sine', 'triangle'] : ['sawtooth', 'sawtooth']
    types.forEach((type, k) => {
      const o = ctx.createOscillator()
      o.type = type
      o.frequency.value = voice === 'flute' && k === 1 ? freq * 2 : freq
      o.detune.value = voice === 'harmonium' ? (k ? 7 : -7) : 0
      vibAmt.connect(o.frequency)
      const g = ctx.createGain()
      g.gain.value = k === 0 ? 1 : 0.4
      o.connect(g).connect(filter)
      o.start(at)
      o.stop(at + len + 0.02)
    })
    vib.start(at)
    vib.stop(at + len + 0.02)
  }

  /** Tanpura-like drone on Sa and Pa underneath everything. */
  private startDrone() {
    const ctx = this.ctx!
    const g = ctx.createGain()
    g.gain.value = 0.0001
    g.gain.setTargetAtTime(0.05, ctx.currentTime, 0.6)
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 700
    lp.connect(g).connect(this.master!)
    const oscs = [TONIC / 2, (TONIC / 2) * 1.5, TONIC / 4].map((f) => {
      const o = ctx.createOscillator()
      o.type = 'sawtooth'
      o.frequency.value = f
      o.connect(lp)
      o.start()
      return o
    })
    return {
      stop: () => {
        g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.1)
        oscs.forEach((o) => o.stop(ctx.currentTime + 0.5))
      },
    }
  }
}

export const orchestra = new GarbaOrchestra()
