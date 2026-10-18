import type { Pose, StepId } from './types'

/**
 * Garba steps as pure functions of the musical beat. Each returns joint angles
 * (radians) so the figurine, the tests and the music all agree on timing.
 *
 * Arm z: positive swings the left arm outwards/up (mirrored for the right).
 * Arm x: negative brings hands forward/up in front.
 */

export interface StepDef {
  id: StepId
  name: string
  gujarati: string
  desc: string
  /** beats per cycle */
  cycle: number
  /** beats (within cycle) on which hands clap */
  claps: number[]
  /** how fast the circle travels (radians per beat) */
  travel: number
  pose: (beat: number) => Pose
}

const TAU = Math.PI * 2

const base = (): Pose => ({
  armL: { x: 0, z: 0.15 },
  armR: { x: 0, z: -0.15 },
  legL: 0,
  legR: 0,
  bob: 0,
  turn: 0,
  lean: 0,
  clap: false,
  sticks: false,
  flare: 0.2,
})

/** Smoothly move arms from open (sides, raised) to a front clap. 0 = open, 1 = clap. */
function clapArms(p: Pose, amount: number, height = 0.9) {
  const open = { x: -0.3, z: 1.25 }
  const shut = { x: -height - 0.3, z: -0.25 }
  p.armL = { x: open.x + (shut.x - open.x) * amount, z: open.z + (shut.z - open.z) * amount }
  p.armR = { x: p.armL.x, z: -p.armL.z }
}

/** 0..1 pulse that peaks exactly on integer beats listed in `on`. */
function pulseAt(beatInCycle: number, on: number[], width = 0.35) {
  let best = 0
  for (const b of on) {
    const d = Math.abs(beatInCycle - b)
    if (d < width) best = Math.max(best, 1 - d / width)
  }
  return best
}

function walk(p: Pose, beat: number, stride = 0.45) {
  const s = Math.sin(beat * Math.PI)
  p.legL = s * stride
  p.legR = -s * stride
  p.bob = Math.abs(Math.cos(beat * Math.PI)) * 0.08
}

export const STEPS: StepDef[] = [
  {
    id: 'be-taali',
    name: 'Be Taali',
    gujarati: 'બે તાળી',
    desc: 'the classic two-clap step: step, step, clap-clap while circling',
    cycle: 4,
    claps: [2, 3],
    travel: 0.035,
    pose(beat) {
      const p = base()
      const b = beat % 4
      walk(p, beat)
      clapArms(p, pulseAt(b, [2, 3], 0.5))
      p.turn = Math.sin((b / 4) * TAU) * 0.35
      p.lean = 0.08
      p.clap = pulseAt(b, [2, 3], 0.08) > 0
      p.flare = 0.35
      return p
    },
  },
  {
    id: 'tran-taali',
    name: 'Tran Taali',
    gujarati: 'ત્રણ તાળી',
    desc: 'three claps — a bend-and-turn followed by clap, clap, clap',
    cycle: 6,
    claps: [3, 4, 5],
    travel: 0.03,
    pose(beat) {
      const p = base()
      const b = beat % 6
      walk(p, beat, 0.4)
      if (b < 3) {
        // bend and swing arms low to one side
        const k = Math.sin((b / 3) * Math.PI)
        p.lean = 0.3 * k
        p.armL = { x: 0.2, z: 0.5 + k * 0.6 }
        p.armR = { x: 0.2, z: -0.2 - k * 0.2 }
        p.turn = -0.5 * k
      } else {
        clapArms(p, pulseAt(b, [3, 4, 5], 0.5), 1.1)
        p.turn = 0.3 * Math.sin(((b - 3) / 3) * Math.PI)
      }
      p.clap = pulseAt(b, [3, 4, 5], 0.08) > 0
      p.flare = 0.45
      return p
    },
  },
  {
    id: 'dodhiyu',
    name: 'Dodhiyu',
    gujarati: 'દોઢિયું',
    desc: 'the fast “one-and-a-half” hop-step with swinging arms — high energy',
    cycle: 4,
    claps: [3],
    travel: 0.06,
    pose(beat) {
      const p = base()
      const b = beat % 4
      const hop = Math.abs(Math.sin(beat * Math.PI))
      p.bob = hop * 0.28
      p.legL = Math.sin(beat * Math.PI) * 0.7
      p.legR = -Math.sin(beat * Math.PI * 1.5) * 0.5
      const sw = Math.sin((b / 4) * TAU)
      p.armL = { x: -0.4 - sw * 0.6, z: 0.9 + sw * 0.6 }
      p.armR = { x: -0.4 + sw * 0.6, z: -0.9 + sw * 0.6 }
      if (b > 2.6) clapArms(p, pulseAt(b, [3], 0.4))
      p.turn = sw * 0.6
      p.lean = 0.15
      p.clap = pulseAt(b, [3], 0.08) > 0
      p.flare = 0.75
      return p
    },
  },
  {
    id: 'hinch',
    name: 'Hinch',
    gujarati: 'હીંચ',
    desc: 'a graceful 6/8 sway — arms float up and over, side to side',
    cycle: 6,
    claps: [5],
    travel: 0.025,
    pose(beat) {
      const p = base()
      const b = beat % 6
      const sway = Math.sin((b / 6) * TAU)
      p.legL = Math.max(0, sway) * 0.4
      p.legR = Math.max(0, -sway) * 0.4
      p.bob = (1 - Math.abs(sway)) * 0.06
      p.armL = { x: -0.3, z: 1.5 + sway * 1.0 }
      p.armR = { x: -0.3, z: -1.5 + sway * 1.0 }
      if (b > 4.4) clapArms(p, pulseAt(b, [5], 0.6), 1.3)
      p.turn = sway * 0.7
      p.lean = -sway * 0.12
      p.clap = pulseAt(b, [5], 0.08) > 0
      p.flare = 0.5
      return p
    },
  },
  {
    id: 'popatiyu',
    name: 'Popatiyu',
    gujarati: 'પોપટિયું',
    desc: 'the playful “parrot” step: dip low, flap, pop up and clap',
    cycle: 4,
    claps: [1, 3],
    travel: 0.03,
    pose(beat) {
      const p = base()
      const b = beat % 4
      walk(p, beat, 0.35)
      const dip = Math.max(0, Math.sin((b / 2) * Math.PI))
      p.lean = 0.35 * dip
      p.bob = -0.15 * dip + 0.05
      const flap = Math.sin(beat * Math.PI * 2) * 0.4
      p.armL = { x: 0.1, z: 0.8 + flap }
      p.armR = { x: 0.1, z: -0.8 - flap }
      if (b >= 0.6 && b < 1.4) clapArms(p, pulseAt(b, [1], 0.4), 0.6)
      if (b >= 2.6) clapArms(p, pulseAt(b, [3], 0.4), 1.2)
      p.clap = pulseAt(b, [1, 3], 0.08) > 0
      p.flare = 0.4
      return p
    },
  },
  {
    id: 'dandiya',
    name: 'Dandiya Raas',
    gujarati: 'દાંડિયા રાસ',
    desc: 'partners face each other — tap your own sticks, then strike your partner’s',
    cycle: 4,
    claps: [0, 1, 2, 3],
    travel: 0.03,
    pose(beat) {
      const p = base()
      const b = beat % 4
      p.sticks = true
      walk(p, beat, 0.3)
      const own = pulseAt(b, [0, 2], 0.5)
      const strike = pulseAt(b, [1, 3], 0.5)
      // own sticks tap in front of the chest
      p.armL = { x: -0.5 - own * 0.5, z: 0.6 - own * 0.75 }
      p.armR = { x: -0.5 - own * 0.5, z: -0.6 + own * 0.75 }
      // strike forward towards the partner, alternating high-left / high-right
      if (strike > 0) {
        const left = Math.floor(b) === 1
        const arm = { x: -1.3 - strike * 0.6, z: (left ? 0.3 : -0.3) }
        if (left) p.armL = arm
        else p.armR = arm
      }
      p.lean = 0.1 + strike * 0.1
      p.clap = pulseAt(b, [0, 1, 2, 3], 0.08) > 0
      p.flare = 0.45
      return p
    },
  },
]

export const STEP_BY_ID = Object.fromEntries(STEPS.map((s) => [s.id, s])) as Record<StepId, StepDef>

/* ---------- interaction poses (override the step) ---------- */

export function namastePose(): Pose {
  const p = base()
  p.armL = { x: -1.25, z: -0.55 }
  p.armR = { x: -1.25, z: 0.55 }
  p.lean = 0.12
  return p
}

export function wavePose(t: number): Pose {
  const p = base()
  p.armR = { x: 0, z: -2.6 + Math.sin(t * 10) * 0.35 }
  return p
}

export function jaiPose(t: number): Pose {
  const p = base()
  const up = 2.8 + Math.sin(t * 6) * 0.1
  p.armL = { x: 0, z: up }
  p.armR = { x: 0, z: -up }
  p.bob = Math.abs(Math.sin(t * 6)) * 0.12
  return p
}

export function spinPose(t: number): Pose {
  const p = base()
  p.armL = { x: 0, z: 1.6 }
  p.armR = { x: 0, z: -1.6 }
  p.turn = t * 9
  p.bob = 0.05
  p.flare = 1
  return p
}

/** Fudadi: two partners hold crossed hands and spin together. */
export function fudadiPose(t: number): Pose {
  const p = base()
  p.armL = { x: -1.3, z: -0.2 }
  p.armR = { x: -1.3, z: 0.2 }
  p.lean = -0.2
  p.flare = 1
  p.bob = Math.abs(Math.sin(t * 8)) * 0.05
  return p
}

export function clapPose(t: number): Pose {
  const p = base()
  const k = (Math.sin(t * 12) + 1) / 2
  clapArms(p, k, 1.0)
  p.clap = k > 0.95
  return p
}

export function aartiPose(t: number, holdsThali: boolean): Pose {
  const p = namastePose()
  if (holdsThali) {
    // circle the aarti plate clockwise in front of the murti
    const a = t * 2.2
    p.armR = { x: -1.2 + Math.sin(a) * 0.35, z: 0.2 + Math.cos(a) * 0.35 }
    p.armL = { x: -1.2 + Math.sin(a) * 0.35, z: -0.2 + Math.cos(a) * 0.35 }
  }
  return p
}
