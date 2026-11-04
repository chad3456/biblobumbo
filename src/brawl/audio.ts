import type { GameEvent } from './engine'

/** Punchy synthesized sound effects and a looping street-beat, no audio files. */
export class BrawlAudio {
  ctx: AudioContext | null = null
  master: GainNode | null = null
  noise: AudioBuffer | null = null
  musicOn = true
  private timer: number | null = null
  private next = 0
  private step = 0

  start() {
    this.ctx ??= new AudioContext()
    void this.ctx.resume()
    if (!this.master) {
      this.master = this.ctx.createGain()
      this.master.gain.value = 0.6
      this.master.connect(this.ctx.destination)
      this.noise = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate)
      const d = this.noise.getChannelData(0)
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    }
    if (this.musicOn && !this.timer) {
      this.next = this.ctx.currentTime + 0.1
      this.timer = window.setInterval(() => this.schedule(), 30)
    }
  }

  stop() {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
  }

  setMusic(on: boolean) {
    this.musicOn = on
    if (!on) this.stop()
    else if (this.ctx) this.start()
  }

  private env(at: number, peak: number, dur: number, out?: AudioNode) {
    const g = this.ctx!.createGain()
    g.gain.setValueAtTime(peak, at)
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
    g.connect(out ?? this.master!)
    return g
  }

  private burst(at: number, dur: number, freq: number, type: BiquadFilterType, peak: number, q = 1) {
    const s = this.ctx!.createBufferSource()
    s.buffer = this.noise
    const f = this.ctx!.createBiquadFilter()
    f.type = type
    f.frequency.value = freq
    f.Q.value = q
    s.connect(f).connect(this.env(at, peak, dur))
    s.start(at, Math.random() * 0.5, dur + 0.05)
  }

  private thump(at: number, f0: number, f1: number, dur: number, peak: number) {
    const o = this.ctx!.createOscillator()
    o.frequency.setValueAtTime(f0, at)
    o.frequency.exponentialRampToValueAtTime(f1, at + dur)
    o.connect(this.env(at, peak, dur))
    o.start(at)
    o.stop(at + dur + 0.02)
  }

  play(events: GameEvent[]) {
    if (!this.ctx || !this.master) return
    const t = this.ctx.currentTime
    for (const e of events) {
      switch (e.type) {
        case 'hit':
          this.burst(t, e.heavy ? 0.16 : 0.08, e.heavy ? 900 : 1600, 'lowpass', e.heavy ? 0.9 : 0.6)
          this.thump(t, e.heavy ? 160 : 220, 60, e.heavy ? 0.18 : 0.1, e.heavy ? 0.8 : 0.5)
          break
        case 'whiff':
        case 'dodge':
          this.burst(t, 0.12, 2500, 'bandpass', 0.25, 0.8)
          break
        case 'land':
          this.thump(t, 90, 40, 0.2, 0.6)
          break
        case 'ko':
          this.thump(t, 330, 110, 0.4, 0.4)
          break
        case 'wave':
        case 'clear':
          for (const [i, f] of [523, 659, 784].entries()) {
            const o = this.ctx.createOscillator()
            o.type = 'square'
            o.frequency.value = e.type === 'clear' ? f * 1.5 : f
            o.connect(this.env(t + i * 0.09, 0.12, 0.25))
            o.start(t + i * 0.09)
            o.stop(t + i * 0.09 + 0.3)
          }
          break
        case 'revive':
          this.thump(t, 400, 900, 0.3, 0.3)
          break
        case 'throw':
          this.thump(t, 120, 45, 0.3, 0.9)
          this.burst(t, 0.25, 600, 'lowpass', 0.6)
          break
      }
    }
  }

  /** 4-bar loop: kick, snare, hats and a minor bass line at 128 bpm. */
  private schedule() {
    const c = this.ctx!
    const sixteenth = 60 / 128 / 4
    const bass = [45, 45, 48, 45, 43, 43, 40, 43]
    while (this.next < c.currentTime + 0.12) {
      const s = this.step % 64
      const at = this.next
      if (s % 4 === 0) this.thump(at, 120, 45, 0.18, 0.55)
      if (s % 8 === 4) this.burst(at, 0.12, 1800, 'bandpass', 0.35, 0.7)
      if (s % 2 === 0) this.burst(at, 0.03, 8000, 'highpass', 0.08)
      if (s % 4 === 2 || s % 8 === 7) {
        const note = bass[Math.floor(s / 8)]
        const o = c.createOscillator()
        o.type = 'sawtooth'
        o.frequency.value = 440 * Math.pow(2, (note - 69) / 12)
        const lp = c.createBiquadFilter()
        lp.type = 'lowpass'
        lp.frequency.value = 500
        o.connect(lp).connect(this.env(at, 0.16, sixteenth * 1.8))
        o.start(at)
        o.stop(at + sixteenth * 2)
      }
      this.step++
      this.next += sixteenth
    }
  }
}
