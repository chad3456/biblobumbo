/**
 * Kantin Clash: fighters, rivals and waves. Times are in seconds, distances in
 * world units (a fighter is ~1.8 units tall).
 */

export type ClassId = 'brawler' | 'kicker' | 'grappler' | 'muaythai'
export type EnemyId = 'thug' | 'rusher' | 'bruiser' | 'thrower' | 'boss'
export type Anim = 'jab' | 'cross' | 'hook' | 'uppercut' | 'kick' | 'roundhouse' | 'spinkick' | 'flyingkick' | 'palm' | 'slam' | 'charge' | 'elbow' | 'knee' | 'teep' | 'swing' | 'throw'

export interface AttackDef {
  name: string
  anim: Anim
  startup: number
  active: number
  recovery: number
  damage: number
  /** reach in front of the attacker */
  range: number
  /** half-angle of the hit cone, radians */
  arc: number
  knockback: number
  knockdown?: boolean
  /** attacker lunges forward this far during startup+active */
  lunge?: number
  /** ignore light hits while doing this */
  armor?: boolean
}

export interface ClassDef {
  id: ClassId
  name: string
  blurb: string
  hp: number
  speed: number
  combo: AttackDef[]
  heavy: AttackDef
  /** what L / special does */
  special: AttackDef & { grab?: boolean }
  colors: { shirt: string; pants: string; band: string }
}

const a = (name: string, anim: Anim, d: Partial<AttackDef> & Pick<AttackDef, 'damage'>): AttackDef => ({
  name, anim, startup: 0.08, active: 0.08, recovery: 0.16, range: 1.25, arc: 0.9, knockback: 1.5, ...d,
})

export const CLASSES: Record<ClassId, ClassDef> = {
  brawler: {
    id: 'brawler',
    name: 'Brawler',
    blurb: 'Balanced fists. Fast jab-cross-hook combo and a launching uppercut.',
    hp: 120,
    speed: 4.4,
    combo: [
      a('Jab', 'jab', { damage: 6, startup: 0.06, recovery: 0.12 }),
      a('Cross', 'cross', { damage: 8, startup: 0.07 }),
      a('Hook', 'hook', { damage: 12, startup: 0.1, recovery: 0.24, knockback: 3, arc: 1.2 }),
    ],
    heavy: a('Uppercut', 'uppercut', { damage: 16, startup: 0.16, recovery: 0.3, knockback: 2.5, knockdown: true, lunge: 0.5 }),
    special: { ...a('Shoulder Throw', 'throw', { damage: 18, startup: 0.1, recovery: 0.3, knockback: 5, knockdown: true }), grab: true },
    colors: { shirt: '#f2efe6', pants: '#3b4a5a', band: '#d64933' },
  },
  kicker: {
    id: 'kicker',
    name: 'Kicker',
    blurb: 'Long legs, long reach. Keeps rivals at a distance; flying kick closes gaps.',
    hp: 100,
    speed: 4.8,
    combo: [
      a('Front Kick', 'kick', { damage: 8, range: 1.6, startup: 0.09 }),
      a('Roundhouse', 'roundhouse', { damage: 10, range: 1.6, arc: 1.4, startup: 0.1 }),
      a('Spin Kick', 'spinkick', { damage: 14, range: 1.7, arc: Math.PI, startup: 0.14, recovery: 0.28, knockback: 3.5, knockdown: true }),
    ],
    heavy: a('Flying Kick', 'flyingkick', { damage: 18, range: 1.5, startup: 0.14, active: 0.2, recovery: 0.3, knockback: 4, knockdown: true, lunge: 3.2 }),
    special: a('Push Kick', 'kick', { damage: 6, range: 1.8, knockback: 6, startup: 0.08 }),
    colors: { shirt: '#2f6f8f', pants: '#1f2a33', band: '#f2c14e' },
  },
  grappler: {
    id: 'grappler',
    name: 'Grappler',
    blurb: 'Tough and heavy. Grab anyone and suplex them into the crowd.',
    hp: 160,
    speed: 3.7,
    combo: [
      a('Palm', 'palm', { damage: 8, startup: 0.09, range: 1.2 }),
      a('Hammer', 'slam', { damage: 13, startup: 0.14, recovery: 0.26, knockback: 2.5, arc: 1.1 }),
    ],
    heavy: a('Charge', 'charge', { damage: 15, startup: 0.12, active: 0.25, recovery: 0.35, range: 1.3, knockback: 5, knockdown: true, lunge: 2.6, armor: true }),
    special: { ...a('Suplex', 'throw', { damage: 26, startup: 0.12, recovery: 0.35, knockback: 3, knockdown: true }), grab: true },
    colors: { shirt: '#8a5a3c', pants: '#2e2a26', band: '#f2efe6' },
  },
  muaythai: {
    id: 'muaythai',
    name: 'Muay Thai',
    blurb: 'Elbows and knees at close range. The fastest four-hit combo in school.',
    hp: 110,
    speed: 4.5,
    combo: [
      a('Elbow', 'elbow', { damage: 7, startup: 0.05, recovery: 0.1, range: 1.05 }),
      a('Knee', 'knee', { damage: 9, startup: 0.06, recovery: 0.12, range: 1.05 }),
      a('Elbow', 'elbow', { damage: 9, startup: 0.05, recovery: 0.12, range: 1.05 }),
      a('Flying Knee', 'knee', { damage: 15, startup: 0.1, recovery: 0.26, range: 1.2, knockback: 3, knockdown: true, lunge: 0.8 }),
    ],
    heavy: a('Teep', 'teep', { damage: 10, startup: 0.1, recovery: 0.24, range: 1.5, knockback: 7 }),
    special: { ...a('Clinch Knees', 'knee', { damage: 20, startup: 0.08, recovery: 0.3, knockback: 3, knockdown: true }), grab: true },
    colors: { shirt: '#c43c3c', pants: '#f2efe6', band: '#1f1f1f' },
  },
}

export interface EnemyDef {
  id: EnemyId
  name: string
  hp: number
  speed: number
  attack: AttackDef
  /** seconds between attack attempts */
  cooldown: number
  /** light hits don't stagger it */
  heavy?: boolean
  ranged?: boolean
  colors: { shirt: string; pants: string; band: string }
  scale: number
  points: number
}

export const ENEMIES: Record<EnemyId, EnemyDef> = {
  thug: { id: 'thug', name: 'Rival', hp: 40, speed: 3.0, cooldown: 1.2, scale: 1, points: 100,
    attack: a('Punch', 'jab', { damage: 6, startup: 0.28, recovery: 0.35 }), colors: { shirt: '#d9d2c3', pants: '#4b5563', band: '#d9d2c3' } },
  rusher: { id: 'rusher', name: 'Rusher', hp: 30, speed: 5.2, cooldown: 0.9, scale: 0.95, points: 120,
    attack: a('Dash Punch', 'cross', { damage: 5, startup: 0.2, recovery: 0.3, lunge: 1.2 }), colors: { shirt: '#5b7f4a', pants: '#2b2b2b', band: '#5b7f4a' } },
  bruiser: { id: 'bruiser', name: 'Bruiser', hp: 110, speed: 2.4, cooldown: 1.8, heavy: true, scale: 1.25, points: 300,
    attack: a('Haymaker', 'hook', { damage: 14, startup: 0.45, recovery: 0.5, range: 1.5, arc: 1.3, knockback: 4, knockdown: true }), colors: { shirt: '#7a4a6e', pants: '#2f2f3a', band: '#7a4a6e' } },
  thrower: { id: 'thrower', name: 'Eraser Thrower', hp: 30, speed: 3.2, cooldown: 1.6, ranged: true, scale: 0.95, points: 150,
    attack: a('Eraser', 'throw', { damage: 5, startup: 0.35, recovery: 0.4, range: 9, knockback: 1 }), colors: { shirt: '#c9a227', pants: '#3a3a3a', band: '#c9a227' } },
  boss: { id: 'boss', name: 'Senior Gang Leader', hp: 320, speed: 3.0, cooldown: 1.1, heavy: true, scale: 1.4, points: 2000,
    attack: a('Chair Swing', 'swing', { damage: 16, startup: 0.4, recovery: 0.45, range: 1.9, arc: 1.6, knockback: 5, knockdown: true }), colors: { shirt: '#1f1f1f', pants: '#1f1f1f', band: '#e04f2f' } },
}

export type Objective = 'clear' | 'protect' | 'survive'

export interface WaveDef {
  objective: Objective
  enemies: EnemyId[]
  /** protect: classmates to keep safe; survive: seconds */
  amount: number
  label: string
}

export const TOTAL_WAVES = 12

/** Waves ramp up: more rivals, then tougher ones; every third wave has a twist. */
export function waveDef(n: number): WaveDef {
  const count = Math.min(14, 3 + Math.floor(n * 1.1))
  const enemies: EnemyId[] = []
  for (let i = 0; i < count; i++) {
    const r = (i * 7 + n * 3) % 10
    if (n >= 3 && r === 0) enemies.push('bruiser')
    else if (n >= 2 && r < 3) enemies.push('rusher')
    else if (n >= 4 && r === 3) enemies.push('thrower')
    else enemies.push('thug')
  }
  if (n === 6 || n === TOTAL_WAVES) enemies.push('boss')
  if (n % 3 === 2) return { objective: 'protect', enemies, amount: 4, label: 'PROTECT · keep them safe' }
  if (n % 4 === 3) return { objective: 'survive', enemies: [...enemies, ...enemies.slice(0, 3)], amount: 40, label: 'SURVIVE · hold the canteen' }
  return { objective: 'clear', enemies, amount: 0, label: n === TOTAL_WAVES ? 'FINAL · beat the gang leader' : 'CLEAR · beat every rival' }
}
