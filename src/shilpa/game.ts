import {
  BANDS, FIGURE_H, GOAL_BAND, GOAL_S, LAMP_STAND, LOTUSES, NICHES, NICHE_Y, PATROLS, PILASTERS, PILLARS, ROOM, START, TOTAL_S,
  gapAt, isLit, pointAt, type LightState,
} from './level'

export type Mode = 'explore' | 'wall' | 'ending'

export interface Controls {
  /** explorer: forward/strafe; wall: x = left/right along the frieze, y = up/down a band */
  x: number
  y: number
  jump: boolean
  interact: boolean
  exit: boolean
  /** mouse/touch look deltas (radians) */
  look: [number, number]
}
export const IDLE: Controls = { x: 0, y: 0, jump: false, interact: false, exit: false, look: [0, 0] }

export type Msg = { text: string; t: number }

const WALK = 3.2
const FIG_SPEED = 2.1
const JUMP_V = 4.2
const GRAV = 11
const BAND_CLIMB = 0.35
const MAX_DIYAS = 3

export class Shilpa {
  mode: Mode = 'explore'
  // explorer (first person)
  px = -6.6
  pz = 4.4
  yaw = Math.PI * 0.78
  pitch = 0.05
  diyas = MAX_DIYAS
  // the carved dancer
  s = START.s
  band = START.band
  /** smoothed band height while climbing */
  fy = BANDS[START.band].y
  hop = 0
  hopV = 0
  hopDir = 0
  facing: 1 | -1 = 1
  walking = false
  stone = false
  stun = 0
  /** niche index -> has diya */
  placed: boolean[] = NICHES.map(() => false)
  lotus: boolean[] = LOTUSES.map(() => false)
  patrolS: number[] = PATROLS.map((p) => p.s0)
  patrolDir: number[] = PATROLS.map(() => 1)
  msg: Msg | null = { text: 'Look for the carved dancer on the wall. Walk close and press E to enter the frieze.', t: 7 }
  endingT = 0
  time = 0
  private prev: Controls = IDLE

  constructor() {
    // start facing the sleeping dancer on the wall
    const f = this.figureWorld()
    this.yaw = Math.atan2(-(f.x - this.px), -(f.z - this.pz))
  }

  get light(): LightState {
    return {
      lamps: NICHES.filter((_, i) => this.placed[i]),
      hand: { x: this.px, z: this.pz, on: true },
    }
  }

  get lotusCount() { return this.lotus.filter(Boolean).length }

  figureWorld() {
    const p = pointAt(this.s)
    return { x: p.x + p.nx * 0.02, y: this.fy + this.hop, z: p.z + p.nz * 0.02, nx: p.nx, nz: p.nz, style: p.seg.style }
  }

  say(text: string, t = 3.5) {
    this.msg = { text, t }
  }

  step(dt: number, c: Controls) {
    this.time += dt
    const pressed = (k: 'jump' | 'interact' | 'exit') => c[k] && !this.prev[k]
    if (this.msg) {
      this.msg.t -= dt
      if (this.msg.t <= 0) this.msg = null
    }
    this.updatePatrols(dt)
    if (this.mode === 'explore') this.explore(dt, c, pressed)
    else if (this.mode === 'wall') this.wall(dt, c, pressed)
    else this.endingT += dt
    this.prev = { ...c, look: [0, 0] }
  }

  /* ---------------- explorer ---------------- */

  private explore(dt: number, c: Controls, pressed: (k: 'jump' | 'interact' | 'exit') => boolean) {
    this.yaw -= c.look[0]
    this.pitch = Math.max(-1.2, Math.min(1.2, this.pitch - c.look[1]))
    const fx = -Math.sin(this.yaw)
    const fz = -Math.cos(this.yaw)
    const rx = -fz
    const rz = fx
    const m = Math.min(1, Math.hypot(c.x, c.y))
    if (m > 0.05) {
      const mx = (fx * c.y + rx * c.x) / Math.max(1, Math.hypot(c.x, c.y))
      const mz = (fz * c.y + rz * c.x) / Math.max(1, Math.hypot(c.x, c.y))
      this.moveExplorer(this.px + mx * WALK * dt, this.pz + mz * WALK * dt)
    }
    // the carving still reacts to light while you walk around
    this.stone = !isLit(this.s, this.band, this.light)
    if (pressed('interact')) this.interact()
  }

  private moveExplorer(nx: number, nz: number) {
    const r = 0.35
    nx = Math.max(ROOM.minX + r, Math.min(ROOM.maxX - r, nx))
    nz = Math.max(ROOM.minZ + r, Math.min(ROOM.maxZ - 0.2, nz))
    for (const [cx, cz] of PILLARS) {
      const d = Math.hypot(nx - cx, nz - cz)
      if (d < 0.55 + r) {
        nx = cx + ((nx - cx) / (d || 1)) * (0.55 + r)
        nz = cz + ((nz - cz) / (d || 1)) * (0.55 + r)
      }
    }
    for (const p of PILASTERS) {
      if (nx > p.x - p.w / 2 - r && nx < p.x + p.w / 2 + r && nz < ROOM.minZ + p.d + r) nz = ROOM.minZ + p.d + r
    }
    this.px = nx
    this.pz = nz
  }

  /** The thing you're looking at and close to: the lamp stand, a niche, or the dancer. */
  focus(): { kind: 'stand' | 'niche' | 'figure'; index?: number } | null {
    const fx = -Math.sin(this.yaw)
    const fz = -Math.cos(this.yaw)
    const facing = (x: number, z: number) => {
      const dx = x - this.px
      const dz = z - this.pz
      const d = Math.hypot(dx, dz) || 1
      return (dx * fx + dz * fz) / d
    }
    const near: { kind: 'stand' | 'niche' | 'figure'; index?: number; d: number }[] = []
    const dStand = Math.hypot(LAMP_STAND.x - this.px, LAMP_STAND.z - this.pz)
    if (dStand < 1.8 && facing(LAMP_STAND.x, LAMP_STAND.z) > 0.4) near.push({ kind: 'stand', d: dStand })
    NICHES.forEach((s, i) => {
      const p = pointAt(s)
      const d = Math.hypot(p.x - this.px, p.z - this.pz)
      if (d < 2.0 && facing(p.x, p.z) > 0.5) near.push({ kind: 'niche', index: i, d })
    })
    const f = this.figureWorld()
    const dFig = Math.hypot(f.x - this.px, f.z - this.pz)
    if (dFig < 3.2 && facing(f.x, f.z) > 0.6) near.push({ kind: 'figure', d: dFig - 0.5 })
    return near.sort((a, b) => a.d - b.d)[0] ?? null
  }

  private interact() {
    const f = this.focus()
    if (!f) return
    if (f.kind === 'stand') {
      if (this.diyas < MAX_DIYAS) {
        this.diyas = MAX_DIYAS
        this.say('You light fresh diyas from the lamp stand. 🪔')
      } else this.say('Your hands are full: you can carry three diyas.')
    } else if (f.kind === 'niche') {
      const i = f.index!
      if (this.placed[i]) {
        if (this.diyas >= MAX_DIYAS) return this.say('Your hands are full.')
        this.placed[i] = false
        this.diyas++
        this.say('You take the diya back.')
      } else if (this.diyas > 0) {
        this.placed[i] = true
        this.diyas--
        this.say('The diya lights this stretch of the frieze.')
      } else this.say('No diyas left: take one back from another niche, or refill at the lamp stand.')
    } else {
      this.mode = 'wall'
      this.say(this.stone ? 'It’s too dark here: the carving sleeps as stone. Bring light closer.' : 'You are the dancer now. ← → walk · ↑ ↓ climb bands · Space jump · Q leave', 5)
    }
  }

  /* ---------------- the living frieze ---------------- */

  private wall(dt: number, c: Controls, pressed: (k: 'jump' | 'interact' | 'exit') => boolean) {
    if (pressed('exit')) {
      this.mode = 'explore'
      this.walking = false
      this.say('You step back into the hall.')
      return
    }
    const light = this.light
    this.stone = !isLit(this.s, this.band, light)
    this.stun = Math.max(0, this.stun - dt)
    const airborne = this.hop > 0 || this.hopV > 0

    // finale: dance on the lintel with every lotus
    if (pressed('interact') && Math.abs(this.s - GOAL_S) < 1.2 && this.band === GOAL_BAND && !this.stone) {
      if (this.lotusCount === LOTUSES.length) {
        this.mode = 'ending'
        this.endingT = 0
        this.say('The dancer offers her lotuses. The sanctum doors open…', 8)
        return
      }
      this.say(`The doors stay shut. Gather every lotus first (${this.lotusCount}/${LOTUSES.length}).`)
    }

    if (this.stone && !airborne) {
      this.walking = false
      return
    }

    // climb between bands
    const want = BANDS[this.band].y
    this.fy += Math.sign(want - this.fy) * Math.min(Math.abs(want - this.fy), (dt / BAND_CLIMB) * 1.1)
    const climbing = Math.abs(this.fy - want) > 0.01
    if (!climbing && !airborne && this.stun <= 0 && Math.abs(c.y) > 0.5) {
      const nb = this.band + (c.y > 0 ? 1 : -1)
      if (nb >= 0 && nb < BANDS.length) {
        if (gapAt(this.s, nb)) this.say('That stone is broken.', 1.5)
        else if (!isLit(this.s, nb, light)) this.say('Too dark up there.', 1.5)
        else this.band = nb
      }
    }

    // jump
    if (pressed('jump') && !airborne && !climbing && this.stun <= 0) {
      this.hopV = JUMP_V
      this.hopDir = Math.abs(c.x) > 0.2 ? Math.sign(c.x) : 0
    }
    if (airborne || this.hopV > 0) {
      this.hopV -= GRAV * dt
      this.hop = Math.max(0, this.hop + this.hopV * dt)
      if (this.hop === 0) this.hopV = 0
    }

    // walk along the band
    const dir = airborne ? this.hopDir : this.stun > 0 ? 0 : Math.abs(c.x) > 0.2 ? Math.sign(c.x) : 0
    this.walking = dir !== 0 && !airborne && !climbing
    if (dir !== 0 && !climbing) {
      this.facing = dir as 1 | -1
      const ns = Math.max(0.3, Math.min(TOTAL_S - 0.3, this.s + dir * FIG_SPEED * (airborne ? 1.25 : 1) * dt))
      const gap = gapAt(ns, this.band)
      const lit = isLit(ns, this.band, light)
      if (!lit && !airborne) {
        if (!this.msg) this.say('Darkness ahead: the carving can’t move without light. Place a diya nearby.', 2.5)
      } else if (gap && !airborne) {
        if (!this.msg) this.say(`A gap in the frieze (${gap.why}). Jump with Space, or climb to another band.`, 2.5)
      } else {
        this.s = ns
      }
    }
    // landing inside a gap? slide back to the edge you came from
    if (!airborne && this.hop === 0) {
      const g = gapAt(this.s, this.band)
      if (g) this.s = this.hopDir >= 0 ? Math.min(g.s0, g.s1) - 0.05 : Math.max(g.s0, g.s1) + 0.05
    }

    // lotuses
    LOTUSES.forEach(([ls, lb], i) => {
      if (!this.lotus[i] && lb === this.band && Math.abs(ls - this.s) < 0.45) {
        this.lotus[i] = true
        this.say(`🪷 Lotus ${this.lotusCount}/${LOTUSES.length}${this.lotusCount === LOTUSES.length ? ': now dance on the lintel above the sanctum door (E)!' : ''}`)
      }
    })

    // carved processions knock you back
    PATROLS.forEach((p, i) => {
      if (p.band !== this.band || this.hop > FIGURE_H * 0.6 || this.stun > 0) return
      if (Math.abs(this.patrolS[i] - this.s) < 0.55) {
        this.stun = 0.6
        const away = this.s >= this.patrolS[i] ? 1 : -1
        this.s = Math.max(0.3, Math.min(TOTAL_S - 0.3, this.s + away * 1.0))
        this.say(p.kind === 'elephant' ? 'The elephant procession marches on! Jump or climb out of its way.' : 'Galloping horses! Time your jump.', 2.5)
      }
    })
  }

  private updatePatrols(dt: number) {
    PATROLS.forEach((p, i) => {
      // processions only move where they are lit, like the dancer
      if (!isLit(this.patrolS[i], p.band, this.light)) return
      this.patrolS[i] += this.patrolDir[i] * p.speed * dt
      if (this.patrolS[i] > p.s1) { this.patrolS[i] = p.s1; this.patrolDir[i] = -1 }
      if (this.patrolS[i] < p.s0) { this.patrolS[i] = p.s0; this.patrolDir[i] = 1 }
    })
  }
}

export { BANDS, NICHES, NICHE_Y, LOTUSES, PATROLS, FIGURE_H, MAX_DIYAS }
