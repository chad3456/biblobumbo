import { describe, expect, it } from 'vitest'
import { formationTargets, ringRadius } from './circle'
import { TRACKS, melodyTokens, noteFreq, noteLength } from './music'
import { STEPS, STEP_BY_ID } from './steps'
import type { StepId } from './types'

describe('music ↔ dance sync', () => {
  it('every pattern spans exactly one taal cycle', () => {
    for (const t of TRACKS) {
      for (const pat of [t.dhol, t.manjira, t.clap, t.stick, t.bell]) {
        if (pat) expect(pat.length, `${t.id}`).toBe(t.slots)
      }
      expect(melodyTokens(t).length % t.slots, `${t.id} melody`).toBe(0)
    }
  })

  it("each song's claps land exactly on its step's clap beats", () => {
    for (const t of TRACKS) {
      if (t.step === 'aarti' || t.step === 'dandiya') continue
      const step = STEP_BY_ID[t.step as StepId]
      const beats = t.slots / 2
      expect(beats % step.cycle, `${t.id} cycle`).toBe(0)
      const expected = new Set<number>()
      for (let b = 0; b < beats; b++) if (step.claps.includes(b % step.cycle)) expected.add(b * 2)
      const actual = new Set([...t.clap].flatMap((c, i) => (c === 'c' ? [i] : [])))
      expect([...actual].sort(), t.id).toEqual([...expected].sort())
    }
  })

  it('dandiya sticks strike on every beat', () => {
    const t = TRACKS.find((x) => x.step === 'dandiya')!
    expect([...t.stick!].filter((c, i) => c === 'k' && i % 2 === 0)).toHaveLength(t.slots / 2)
  })

  it('steps report a clap exactly on their clap beats', () => {
    for (const s of STEPS) {
      for (const b of s.claps) expect(s.pose(b + s.cycle * 3).clap, `${s.id}@${b}`).toBe(true)
      expect(s.pose(s.claps[0] + 0.45).clap).toBe(false)
    }
  })

  it('only dandiya raas shows the sticks', () => {
    for (const s of STEPS) expect(s.pose(1.3).sticks).toBe(s.id === 'dandiya')
  })
})

describe('melody notation', () => {
  it('maps sargam to frequencies with octave marks', () => {
    expect(noteFreq('S')).toBeCloseTo(293.66, 1)
    expect(noteFreq("S'")).toBeCloseTo(587.33, 1)
    expect(noteFreq('.P')).toBeCloseTo(220, 0)
    expect(noteFreq('-')).toBe('hold')
    expect(noteFreq('_')).toBeNull()
  })
  it('counts held notes', () => {
    expect(noteLength(['S', '-', '-', 'R'], 0)).toBe(3)
    expect(noteLength(['S', 'R'], 0)).toBe(1)
  })
})

describe('formations', () => {
  const ids = Array.from({ length: 10 }, (_, i) => `d${i}`)

  it('places the garba circle evenly around Maa, clear of the mandap', () => {
    const t = formationTargets(ids, 'garba', 0, 0)
    const r = ringRadius(ids.length)
    for (const p of t.values()) expect(Math.hypot(p.x, p.z)).toBeCloseTo(r, 5)
    expect(r).toBeGreaterThan(4)
  })

  it('aarti turns everyone to face the murti', () => {
    const t = formationTargets(ids, 'aarti', 0.7, 0)
    for (const p of t.values()) {
      const facing = { x: Math.sin(p.rotY), z: Math.cos(p.rotY) }
      const toCentre = { x: -p.x, z: -p.z }
      const dot = (facing.x * toCentre.x + facing.z * toCentre.z) / Math.hypot(toCentre.x, toCentre.z)
      expect(dot).toBeCloseTo(1, 5)
    }
  })

  it('dandiya pairs face each other and rotate to a new partner every 8 beats', () => {
    const at0 = formationTargets(ids, 'dandiya', 0, 0)
    const a = at0.get('d0')!
    const b = at0.get('d1')!
    // partners stand on the same spoke, facing each other
    expect(Math.atan2(a.x, a.z)).toBeCloseTo(Math.atan2(b.x, b.z), 5)
    expect(Math.abs(((a.rotY - b.rotY) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI)).toBeLessThan(1e-6)
    // after one full cycle the inner dancer lines up with the next outer dancer
    const at8 = formationTargets(ids, 'dandiya', 0, 8)
    const a8 = at8.get('d0')!
    const next = at8.get('d3')!
    expect(Math.atan2(a8.x, a8.z)).toBeCloseTo(Math.atan2(next.x, next.z), 5)
  })

  it('fudadi partners circle their midpoint facing each other', () => {
    const now = 10
    const t = formationTargets(ids, 'garba', 0, 0, { d0: { id: 'fudadi', until: now + 3, partnerId: 'd1' }, d1: { id: 'fudadi', until: now + 3, partnerId: 'd0' } }, now)
    const a = t.get('d0')!
    const b = t.get('d1')!
    expect(Math.hypot(a.x - b.x, a.z - b.z)).toBeCloseTo(1.4, 5)
  })
})
