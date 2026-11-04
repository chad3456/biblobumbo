import { describe, expect, it } from 'vitest'
import { IDLE, Shilpa, type Controls } from './game'
import { BANDS, GAPS, GOAL_S, LOTUSES, NICHES, SEGMENTS, TOTAL_S, gapAt, isLit, pointAt, sAtX } from './level'

const ctl = (p: Partial<Controls>): Controls => ({ ...IDLE, ...p })
function run(g: Shilpa, secs: number, c: Controls = IDLE) {
  for (let t = 0; t < secs; t += 1 / 60) g.step(1 / 60, c)
}
const dark = { lamps: [], hand: { x: 0, z: 0, on: false } }

describe('frieze path', () => {
  it('is one continuous line along the walls, wrapping round the pilasters', () => {
    for (let i = 1; i < SEGMENTS.length; i++) {
      expect(SEGMENTS[i].ax).toBeCloseTo(SEGMENTS[i - 1].bx)
      expect(SEGMENTS[i].az).toBeCloseTo(SEGMENTS[i - 1].bz)
    }
    expect(SEGMENTS.length).toBe(11)
    expect(TOTAL_S).toBeGreaterThan(45)
  })

  it('normals point into the hall', () => {
    for (const g of SEGMENTS) {
      const mx = (g.ax + g.bx) / 2 + g.nx * 0.5
      const mz = (g.az + g.bz) / 2 + g.nz * 0.5
      expect(Math.abs(mx)).toBeLessThan(11)
      expect(Math.abs(mz)).toBeLessThan(7)
    }
  })

  it('maps world positions back to s', () => {
    const s = 20.3
    const p = pointAt(s)
    expect(sAtX(p.x, p.z)).toBeCloseTo(s, 4)
  })

  it('the doorway cuts the lower bands but the story band runs over the lintel', () => {
    expect(gapAt(GOAL_S, 0)).toBeDefined()
    expect(gapAt(GOAL_S, 1)).toBeDefined()
    expect(gapAt(GOAL_S, 2)).toBeUndefined()
    expect(GAPS.every((g) => g.band >= 0 && g.band < BANDS.length)).toBe(true)
  })
})

describe('light', () => {
  it('sunlight at the entrance, darkness deeper in, diyas push it back', () => {
    expect(isLit(1, 0, dark)).toBe(true)
    expect(isLit(35, 0, dark)).toBe(false)
    expect(isLit(NICHES[4] + 1, 0, { ...dark, lamps: [NICHES[4]] })).toBe(true)
  })

  it('the explorer’s hand lamp lights the wall nearby', () => {
    const p = pointAt(35)
    expect(isLit(35, 0, { lamps: [], hand: { x: p.x + p.nx * 1.5, z: p.z + p.nz * 1.5, on: true } })).toBe(true)
  })
})

describe('playing', () => {
  function inWall() {
    const g = new Shilpa()
    const f = g.figureWorld()
    g.px = f.x + f.nx * 2
    g.pz = f.z + f.nz * 2
    g.yaw = Math.atan2(f.nx, f.nz) // look at the wall
    g.step(1 / 60, ctl({ interact: true }))
    return g
  }

  it('walking up to the dancer and pressing E enters the frieze', () => {
    expect(inWall().mode).toBe('wall')
  })

  it('the dancer walks along the band and stops at darkness', () => {
    const g = inWall()
    const s0 = g.s
    run(g, 1, ctl({ x: 1 }))
    expect(g.s).toBeGreaterThan(s0 + 1.5)
    // move the explorer away so only sun + diyas light the wall, then keep walking
    g.px = 8; g.pz = 5
    run(g, 20, ctl({ x: 1 }))
    expect(isLit(g.s + 0.1, g.band, g.light)).toBe(false)
  })

  it('placing a diya in a niche lights the way', () => {
    const g = new Shilpa()
    const p = pointAt(NICHES[0])
    g.px = p.x + p.nx * 1.2; g.pz = p.z + p.nz * 1.2
    g.yaw = Math.atan2(p.nx, p.nz)
    g.step(1 / 60, ctl({ interact: true }))
    expect(g.placed[0]).toBe(true)
    expect(g.diyas).toBe(2)
  })

  it('climbs bands and collects a lotus', () => {
    const g = inWall()
    const [ls, lb] = LOTUSES[0]
    g.s = ls - 0.3
    g.band = lb
    g.fy = BANDS[lb].y
    g.placed = g.placed.map(() => true)
    run(g, 0.5, ctl({ x: 1 }))
    expect(g.lotus[0]).toBe(true)
  })

  it('dancing on the lintel with every lotus opens the sanctum', () => {
    const g = inWall()
    g.lotus = g.lotus.map(() => true)
    g.s = GOAL_S
    g.band = 2
    g.fy = BANDS[2].y
    g.placed = g.placed.map(() => true)
    g.step(1 / 60, IDLE)
    g.step(1 / 60, ctl({ interact: true }))
    expect(g.mode).toBe('ending')
  })
})
