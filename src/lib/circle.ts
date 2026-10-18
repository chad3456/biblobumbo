import type { ActiveAction } from './types'

export interface Target {
  x: number
  z: number
  rotY: number
}

export type Formation = 'garba' | 'dandiya' | 'aarti'

const TAU = Math.PI * 2
const at = (r: number, a: number) => ({ x: r * Math.sin(a), z: r * Math.cos(a) })
const smooth = (x: number) => x * x * (3 - 2 * x)

export function ringRadius(n: number): number {
  return Math.max(5.6, (n * 1.75) / TAU)
}

/**
 * Where every dancer should be. Garba: one circle travelling around Maa.
 * Dandiya: two concentric rings facing each other that shift one partner every 8 beats.
 * Aarti: the circle stops and everyone faces the murti.
 */
export function formationTargets(
  ids: string[],
  formation: Formation,
  phase: number,
  beat: number,
  actions: Record<string, ActiveAction> = {},
  now = 0,
): Map<string, Target> {
  const out = new Map<string, Target>()
  const n = ids.length
  if (!n) return out

  if (formation === 'dandiya') {
    const m = Math.ceil(n / 2)
    const spacing = TAU / m
    const r = Math.max(6, (m * 1.9) / TAU + 0.75)
    const cycle = beat / 8
    const frac = cycle - Math.floor(cycle)
    const shift = (Math.floor(cycle) + smooth(Math.min(1, Math.max(0, (frac - 0.75) / 0.25)))) * (spacing / 2)
    ids.forEach((id, i) => {
      const k = Math.floor(i / 2)
      const inner = i % 2 === 0
      const a = k * spacing + (inner ? shift : -shift)
      const p = at(inner ? r - 0.75 : r + 0.75, a)
      out.set(id, { ...p, rotY: inner ? a : a + Math.PI })
    })
  } else {
    const r = ringRadius(n)
    ids.forEach((id, i) => {
      const a = (i / n) * TAU + phase
      const p = at(r, a)
      out.set(id, { ...p, rotY: formation === 'aarti' ? a + Math.PI : a + Math.PI / 2 + 0.3 })
    })
  }

  // fudadi: partners spin around their shared midpoint, facing each other
  const done = new Set<string>()
  for (const id of ids) {
    const act = actions[id]
    if (!act || act.id !== 'fudadi' || !act.partnerId || done.has(id) || act.until < now) continue
    const a = out.get(id)
    const b = out.get(act.partnerId)
    if (!a || !b) continue
    const mx = (a.x + b.x) / 2
    const mz = (a.z + b.z) / 2
    const phi = now * 4
    const pa = { x: mx + Math.sin(phi) * 0.7, z: mz + Math.cos(phi) * 0.7 }
    const pb = { x: mx - Math.sin(phi) * 0.7, z: mz - Math.cos(phi) * 0.7 }
    out.set(id, { ...pa, rotY: Math.atan2(mx - pa.x, mz - pa.z) })
    out.set(act.partnerId, { ...pb, rotY: Math.atan2(mx - pb.x, mz - pb.z) })
    done.add(id).add(act.partnerId)
  }
  return out
}
