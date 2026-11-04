/**
 * Shilpa: the temple layout. The carved dancer lives on a single continuous
 * frieze that runs along the inner faces of the walls, measured by `s`
 * (metres travelled along the wall). Three walkable bands follow the Hoysala
 * order, bottom to top: Gaja (elephants), Ashva (horses), Katha (epic scenes).
 */

export const ROOM = { minX: -11, maxX: 11, minZ: -7, maxZ: 7, height: 5 }

/** Feet height of each walkable band, and the band's name. */
export const BANDS = [
  { y: 0.58, name: 'Gaja', meaning: 'the elephant band — strength and stability' },
  { y: 1.62, name: 'Ashva', meaning: 'the horse band — speed' },
  { y: 2.78, name: 'Katha', meaning: 'the story band — scenes from the Ramayana' },
] as const
export const FIGURE_H = 0.8

export type Style = 'stone' | 'mural'

export interface Segment {
  ax: number
  az: number
  bx: number
  bz: number
  /** cumulative s at the start */
  s0: number
  len: number
  /** inner normal (points into the hall) */
  nx: number
  nz: number
  style: Style
}

/** The frieze path: left wall (front → back), back wall with two pilasters, right wall (back → front). */
const PATH: [number, number][] = [
  [-11, 6.2], [-11, -7],
  [-6.4, -7], [-6.4, -6.3], [-5.6, -6.3], [-5.6, -7],
  [5.6, -7], [5.6, -6.3], [6.4, -6.3], [6.4, -7],
  [11, -7], [11, 6.2],
]

function build(): Segment[] {
  const out: Segment[] = []
  let s = 0
  for (let i = 0; i < PATH.length - 1; i++) {
    const [ax, az] = PATH[i]
    const [bx, bz] = PATH[i + 1]
    const len = Math.hypot(bx - ax, bz - az)
    const dx = (bx - ax) / len
    const dz = (bz - az) / len
    // the right wall is painted in the Kerala mural style; everything else is carved stone
    out.push({ ax, az, bx, bz, s0: s, len, nx: -dz, nz: dx, style: i === PATH.length - 2 ? 'mural' : 'stone' })
    s += len
  }
  return out
}

export const SEGMENTS = build()
export const TOTAL_S = SEGMENTS.reduce((t, g) => t + g.len, 0)

export function segmentAt(s: number): Segment {
  const c = Math.max(0, Math.min(TOTAL_S - 1e-6, s))
  return SEGMENTS.find((g) => c >= g.s0 && c < g.s0 + g.len) ?? SEGMENTS[SEGMENTS.length - 1]
}

/** World position on the wall face for a path distance. */
export function pointAt(s: number): { x: number; z: number; nx: number; nz: number; seg: Segment } {
  const seg = segmentAt(s)
  const k = (Math.max(0, Math.min(TOTAL_S, s)) - seg.s0) / seg.len
  return { x: seg.ax + (seg.bx - seg.ax) * k, z: seg.az + (seg.bz - seg.az) * k, nx: seg.nx, nz: seg.nz, seg }
}

/** s of the point on the path closest to a world position (for placing things). */
export function sAtX(x: number, z: number): number {
  let best = { d: Infinity, s: 0 }
  for (const g of SEGMENTS) {
    const dx = g.bx - g.ax
    const dz = g.bz - g.az
    const k = Math.max(0, Math.min(1, ((x - g.ax) * dx + (z - g.az) * dz) / (g.len * g.len)))
    const px = g.ax + dx * k
    const pz = g.az + dz * k
    const d = Math.hypot(x - px, z - pz)
    if (d < best.d) best = { d, s: g.s0 + k * g.len }
  }
  return best.s
}

/* ---------------- level features (in s along the frieze) ---------------- */

const sBack = (x: number) => sAtX(x, -7)
const sRight = (z: number) => sAtX(11, z)
const sLeft = (z: number) => sAtX(-11, z)

/** The sanctum doorway breaks the two lower bands; only the Katha band runs over the lintel. */
export const DOOR = { x0: -1.4, x1: 1.4, height: 2.6 }

export interface Gap { band: number; s0: number; s1: number; why: string }
export const GAPS: Gap[] = [
  { band: 0, s0: sBack(DOOR.x0), s1: sBack(DOOR.x1), why: 'doorway' },
  { band: 1, s0: sBack(DOOR.x0), s1: sBack(DOOR.x1), why: 'doorway' },
  { band: 1, s0: sLeft(-0.6), s1: sLeft(-2.0), why: 'broken stone' },
  { band: 0, s0: sBack(-8.6), s1: sBack(-7.4), why: 'broken stone' },
  { band: 2, s0: sBack(3.2), s1: sBack(4.3), why: 'broken stone' },
  { band: 2, s0: sRight(-1.2), s1: sRight(-2.4), why: 'broken stone' },
]

/** Niches where a diya can be set; each lights the frieze around it. */
export const NICHES: number[] = [sLeft(1.5), sLeft(-4.5), sBack(-3.5), sBack(3.5), sRight(-3.8), sRight(0.8)]
export const NICHE_Y = 2.25
export const NICHE_RADIUS = 3.1

/** Patches of sunlight falling through the entrance and the roof openings. */
export interface Sun { s0: number; s1: number }
export const SUN: Sun[] = [
  { s0: 0, s1: sLeft(3.8) },
  { s0: sBack(-9.2), s1: sBack(-7.0) },
  { s0: sBack(-0.9), s1: sBack(0.9) },
  { s0: sRight(3.6), s1: TOTAL_S },
]

/** Lotus carvings to collect: (s, band). */
export const LOTUSES: [number, number][] = [
  [sLeft(-1.3), 2],
  [sBack(-8.0), 1],
  [sBack(-6.0), 0],
  [sBack(2.4), 2],
  [sRight(-1.8), 1],
]

/** Carved processions that walk their band back and forth. */
export interface Patrol { band: number; s0: number; s1: number; speed: number; kind: 'elephant' | 'horse' }
export const PATROLS: Patrol[] = [
  { band: 0, s0: sBack(-4.8), s1: sBack(-1.6), speed: 0.9, kind: 'elephant' },
  { band: 1, s0: sBack(1.8), s1: sBack(5.0), speed: 2.4, kind: 'horse' },
  { band: 0, s0: sRight(-6.5), s1: sRight(-1.0), speed: 1.0, kind: 'elephant' },
]

export const START: { s: number; band: number } = { s: 1.2, band: 0 }
/** Dance here (centre of the lintel, Katha band) with all lotuses to open the sanctum. */
export const GOAL_S = sBack(0)
export const GOAL_BAND = 2

export const LAMP_STAND = { x: -8.6, z: 6.1 }
export const PILLARS: [number, number][] = [[-6, -1.5], [0, -1.5], [6, -1.5], [-6, 3], [0, 3], [6, 3]]
export const PILASTERS = [{ x: -6, w: 0.8, d: 0.7 }, { x: 6, w: 0.8, d: 0.7 }]

/* ---------------- light ---------------- */

export interface LightState {
  /** s positions of niches holding a lit diya */
  lamps: number[]
  /** explorer standing in the hall with a diya in hand */
  hand: { x: number; z: number; on: boolean }
}

export const HAND_RADIUS = 3.4

/** Is this point of the frieze lit (sun, a niche diya, or the explorer's hand lamp)? */
export function isLit(s: number, band: number, light: LightState): boolean {
  if (SUN.some((p) => s >= p.s0 && s <= p.s1)) return true
  if (light.lamps.some((l) => Math.abs(l - s) <= NICHE_RADIUS)) return true
  if (light.hand.on) {
    const p = pointAt(s)
    const y = BANDS[band].y + FIGURE_H / 2
    const d = Math.hypot(p.x - light.hand.x, p.z - light.hand.z, y - 1.3)
    if (d <= HAND_RADIUS) return true
  }
  return false
}

export function gapAt(s: number, band: number): Gap | undefined {
  return GAPS.find((g) => g.band === band && s > Math.min(g.s0, g.s1) && s < Math.max(g.s0, g.s1))
}
