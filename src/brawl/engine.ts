import { CLASSES, ENEMIES, TOTAL_WAVES, waveDef, type AttackDef, type ClassId, type EnemyId, type WaveDef } from './data'

/* ---------------- world ---------------- */

export const ARENA = { minX: -12, maxX: 12, minZ: -8, maxZ: 8 }

export interface Box { x0: number; x1: number; z0: number; z1: number; kind: 'stall' | 'table' | 'bench' | 'counter' }

/** Canteen furniture. Fighters collide with these. */
export const OBSTACLES: Box[] = [
  // food stalls along the back wall
  { x0: -11.5, x1: -4, z0: -8, z1: -6.6, kind: 'stall' },
  { x0: 1.5, x1: 8.5, z0: -8, z1: -6.6, kind: 'stall' },
  // drinks counter on the right wall
  { x0: 10.4, x1: 12, z0: -4, z1: 2, kind: 'counter' },
  // dining tables (benches are low; tables block)
  ...[[-7, -1.5], [-7, 3.5], [-0.5, 1], [5.5, -1.5], [5.5, 3.5]].map(([x, z]) => ({ x0: x - 1.5, x1: x + 1.5, z0: z - 0.45, z1: z + 0.45, kind: 'table' as const })),
]

const DOORS: [number, number][] = [[-11.5, 3], [11.5, 4.5], [0, 7.6], [-3, 7.6]]

/** Screen-space stick → world direction for the fixed isometric camera. */
export function screenToWorld(sx: number, sy: number): [number, number] {
  const k = Math.SQRT1_2
  return [(sx - sy) * k, (-sx - sy) * k]
}

/* ---------------- entities ---------------- */

export type Team = 'hero' | 'enemy' | 'civ'
export type State = 'idle' | 'move' | 'attack' | 'hitstun' | 'down' | 'getup' | 'dodge' | 'grab' | 'held' | 'ko' | 'cower'

export interface Fighter {
  id: number
  team: Team
  kind: ClassId | EnemyId | 'civ'
  name: string
  x: number
  z: number
  y: number
  vx: number
  vz: number
  vy: number
  facing: number
  radius: number
  hp: number
  maxHp: number
  speed: number
  state: State
  t: number
  attack?: AttackDef
  hitIds: Set<number>
  comboIdx: number
  queued: 'attack' | 'heavy' | null
  invuln: number
  flash: number
  cooldown: number
  /** for heroes: consecutive hits */
  combo: number
  comboTimer: number
  bestCombo: number
  heldBy?: number
  holding?: number
  revive: number
  scale: number
  player?: 0 | 1
  /** enemy AI: who it's after */
  targetId?: number
  strafe: number
  dead: number
  kos: number
}

export interface Projectile { id: number; x: number; z: number; vx: number; vz: number; owner: number; life: number; damage: number }

export type GameEvent =
  | { type: 'hit'; x: number; y: number; z: number; damage: number; heavy: boolean; team: Team }
  | { type: 'whiff'; x: number; z: number }
  | { type: 'ko'; x: number; z: number; team: Team; name: string }
  | { type: 'dodge'; x: number; z: number }
  | { type: 'land'; x: number; z: number }
  | { type: 'wave'; wave: number; label: string }
  | { type: 'clear'; wave: number }
  | { type: 'revive'; x: number; z: number }
  | { type: 'throw'; x: number; z: number }

export interface Input { x: number; y: number; attack: boolean; heavy: boolean; special: boolean; dodge: boolean }
export const NO_INPUT: Input = { x: 0, y: 0, attack: false, heavy: false, special: false, dodge: false }

export type Phase = 'intro' | 'fight' | 'cleared' | 'won' | 'lost'

export interface PlayerSetup { name: string; cls: ClassId }

const GRAVITY = 26
const FRICTION = 10
const DOWN_TIME = 1.0
const GETUP_TIME = 0.45
const DODGE_TIME = 0.34
const DODGE_SPEED = 10
const HITSTUN = 0.3
const REVIVE_TIME = 2.2
const MAX_ALIVE = 6
const MAX_ATTACKERS = 2

const ang = (dx: number, dz: number) => Math.atan2(dx, dz)
const angDiff = (a: number, b: number) => {
  let d = (a - b) % (Math.PI * 2)
  if (d > Math.PI) d -= Math.PI * 2
  if (d < -Math.PI) d += Math.PI * 2
  return Math.abs(d)
}

export class Brawl {
  fighters: Fighter[] = []
  projectiles: Projectile[] = []
  events: GameEvent[] = []
  wave = 0
  waveDef!: WaveDef
  phase: Phase = 'intro'
  phaseT = 0
  queue: EnemyId[] = []
  spawnT = 0
  surviveT = 0
  hitstop = 0
  shake = 0
  score = 0
  time = 0
  private nextId = 1
  private prev: Input[] = [NO_INPUT, NO_INPUT]
  private rand: () => number

  constructor(players: PlayerSetup[], seed = 7) {
    let s = seed >>> 0
    this.rand = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32)
    players.slice(0, 2).forEach((p, i) => {
      const c = CLASSES[p.cls]
      this.fighters.push(this.make({ team: 'hero', kind: p.cls, name: p.name, x: i ? 1.5 : -1.5, z: 5, hp: c.hp, speed: c.speed, player: i as 0 | 1 }))
    })
    this.startWave(1)
  }

  private make(p: Partial<Fighter> & Pick<Fighter, 'team' | 'kind' | 'name' | 'x' | 'z' | 'hp' | 'speed'>): Fighter {
    return {
      id: this.nextId++, y: 0, vx: 0, vz: 0, vy: 0, facing: Math.PI, radius: 0.42, maxHp: p.hp, state: 'idle', t: 0,
      hitIds: new Set(), comboIdx: 0, queued: null, invuln: 0, flash: 0, cooldown: 1 + this.rand(), combo: 0, comboTimer: 0,
      bestCombo: 0, revive: 0, scale: 1, strafe: this.rand() < 0.5 ? -1 : 1, dead: 0, kos: 0, ...p,
    }
  }

  get heroes() { return this.fighters.filter((f) => f.team === 'hero') }
  get enemies() { return this.fighters.filter((f) => f.team === 'enemy') }
  get civs() { return this.fighters.filter((f) => f.team === 'civ') }
  aliveEnemies() { return this.enemies.filter((f) => f.state !== 'ko') }
  civsLeft() { return this.civs.filter((f) => f.state !== 'ko').length }

  /* ---------------- waves ---------------- */

  startWave(n: number) {
    this.wave = n
    this.waveDef = waveDef(n)
    this.queue = [...this.waveDef.enemies]
    this.spawnT = 0.5
    this.surviveT = this.waveDef.objective === 'survive' ? this.waveDef.amount : 0
    this.phase = 'intro'
    this.phaseT = 2.2
    // clear leftovers from the last wave
    this.fighters = this.fighters.filter((f) => f.team === 'hero')
    this.projectiles = []
    if (this.waveDef.objective === 'protect') {
      const spots: [number, number][] = [[-3.5, -3.5], [2.5, -4.2], [-4, 5.8], [8.5, 1]]
      spots.slice(0, this.waveDef.amount).forEach(([x, z], i) => {
        const civ = this.make({ team: 'civ', kind: 'civ', name: ['Dewi', 'Bima', 'Sari', 'Rian'][i] ?? 'Kid', x, z, hp: 34, speed: 0 })
        civ.state = 'cower'
        this.fighters.push(civ)
      })
    }
    this.events.push({ type: 'wave', wave: n, label: this.waveDef.label })
  }

  private spawnEnemy(id: EnemyId) {
    const d = ENEMIES[id]
    const [x, z] = DOORS[Math.floor(this.rand() * DOORS.length)]
    const e = this.make({ team: 'enemy', kind: id, name: d.name, x, z, hp: d.hp, speed: d.speed, scale: d.scale, radius: 0.42 * d.scale })
    e.cooldown = d.cooldown * (0.6 + this.rand())
    // in protect waves some rivals go straight for the classmates
    const civs = this.civs.filter((c) => c.state !== 'ko')
    if (civs.length && this.rand() < 0.45) e.targetId = civs[Math.floor(this.rand() * civs.length)].id
    this.fighters.push(e)
  }

  /* ---------------- main step ---------------- */

  step(dt: number, inputs: Input[]) {
    this.events = []
    if (this.phase === 'won' || this.phase === 'lost') return
    if (this.hitstop > 0) {
      this.hitstop -= dt
      return
    }
    this.time += dt
    this.shake = Math.max(0, this.shake - dt * 3)

    if (this.phase === 'intro') {
      this.phaseT -= dt
      if (this.phaseT <= 0) this.phase = 'fight'
    } else if (this.phase === 'cleared') {
      this.phaseT -= dt
      if (this.phaseT <= 0) {
        if (this.wave >= TOTAL_WAVES) { this.phase = 'won'; return }
        for (const h of this.heroes) {
          if (h.state === 'ko') { h.state = 'getup'; h.t = GETUP_TIME; h.hp = Math.round(h.maxHp * 0.3) }
          h.hp = Math.min(h.maxHp, h.hp + Math.round(h.maxHp * 0.25))
        }
        this.startWave(this.wave + 1)
      }
    } else {
      this.runSpawns(dt)
    }

    this.heroes.forEach((h) => this.updateHero(h, dt, inputs[h.player ?? 0] ?? NO_INPUT))
    for (const f of this.fighters) {
      if (f.team === 'enemy') this.updateEnemy(f, dt)
      if (f.team === 'civ') this.updateCiv(f, dt)
    }
    for (const f of this.fighters) this.physics(f, dt)
    this.separate()
    this.updateProjectiles(dt)
    this.updateRevives(dt)
    this.fighters = this.fighters.filter((f) => !(f.team === 'enemy' && f.state === 'ko' && f.dead > 2.6))
    this.checkObjective(dt)
    this.prev = inputs.map((i) => ({ ...i }))
  }

  private runSpawns(dt: number) {
    if (this.phase !== 'fight') return
    this.spawnT -= dt
    if (this.spawnT <= 0 && this.queue.length && this.aliveEnemies().length < MAX_ALIVE) {
      this.spawnEnemy(this.queue.shift()!)
      this.spawnT = 0.9 + this.rand() * 0.8
    }
    // survive waves keep the rivals coming until the bell
    if (this.waveDef.objective === 'survive' && !this.queue.length && this.surviveT > 4) {
      this.queue.push(...this.waveDef.enemies.filter((e) => e !== 'boss').slice(0, 3))
    }
  }

  private checkObjective(dt: number) {
    if (this.heroes.every((h) => h.state === 'ko')) { this.phase = 'lost'; return }
    if (this.phase !== 'fight') return
    if (this.waveDef.objective === 'protect' && this.civsLeft() === 0) { this.phase = 'lost'; return }
    let done = false
    if (this.waveDef.objective === 'survive') {
      this.surviveT -= dt
      if (this.surviveT <= 0) {
        done = true
        // the bell rings: everyone left runs away
        for (const e of this.aliveEnemies()) { e.state = 'ko'; e.dead = 2.5 }
      }
    } else {
      done = this.queue.length === 0 && this.aliveEnemies().length === 0
    }
    if (done) {
      this.phase = 'cleared'
      this.phaseT = 2.6
      if (this.waveDef.objective === 'protect') this.score += this.civsLeft() * 500
      this.events.push({ type: 'clear', wave: this.wave })
    }
  }

  /* ---------------- heroes ---------------- */

  private canAct(f: Fighter) {
    return f.state === 'idle' || f.state === 'move'
  }

  private updateHero(h: Fighter, dt: number, inp: Input) {
    const prev = this.prev[h.player ?? 0] ?? NO_INPUT
    const pressed = (k: 'attack' | 'heavy' | 'special' | 'dodge') => inp[k] && !prev[k]
    h.invuln = Math.max(0, h.invuln - dt)
    h.flash = Math.max(0, h.flash - dt)
    h.comboTimer -= dt
    if (h.comboTimer <= 0) h.combo = 0
    if (h.state === 'ko') return

    const [wx, wz] = screenToWorld(inp.x, inp.y)
    const mag = Math.min(1, Math.hypot(wx, wz))
    const cls = CLASSES[h.kind as ClassId]

    // buffer inputs during an attack so combos chain
    if (h.state === 'attack' && pressed('attack')) h.queued = 'attack'
    if (h.state === 'attack' && pressed('heavy')) h.queued = 'heavy'

    if (this.canAct(h)) {
      if (pressed('dodge')) {
        h.state = 'dodge'
        h.t = DODGE_TIME
        h.invuln = DODGE_TIME
        const dir = mag > 0.1 ? ang(wx, wz) : h.facing
        h.facing = dir
        h.vx = Math.sin(dir) * DODGE_SPEED
        h.vz = Math.cos(dir) * DODGE_SPEED
        this.events.push({ type: 'dodge', x: h.x, z: h.z })
        return
      }
      if (pressed('special')) {
        h.facing = this.aim(h, mag > 0.1 ? ang(wx, wz) : h.facing, mag > 0.1)
        return this.doSpecial(h, cls.special)
      }
      if (pressed('heavy')) return this.startAttack(h, cls.heavy, this.aim(h, mag > 0.1 ? ang(wx, wz) : h.facing, mag > 0.1))
      if (pressed('attack')) {
        h.comboIdx = 0
        return this.startAttack(h, cls.combo[0], this.aim(h, mag > 0.1 ? ang(wx, wz) : h.facing, mag > 0.1))
      }
      if (mag > 0.1) {
        h.state = 'move'
        h.facing = ang(wx, wz)
        h.vx = wx / Math.max(1, Math.hypot(wx, wz)) * h.speed
        h.vz = wz / Math.max(1, Math.hypot(wx, wz)) * h.speed
      } else {
        h.state = 'idle'
      }
      h.t += dt
      return
    }
    this.tickAction(h, dt, (next) => {
      // chain the combo if the player pressed again in time
      if (next === 'attack' && h.comboIdx < cls.combo.length - 1 && h.attack === cls.combo[h.comboIdx]) {
        h.comboIdx++
        this.startAttack(h, cls.combo[h.comboIdx], this.aim(h, mag > 0.1 ? ang(wx, wz) : h.facing, mag > 0.1))
        return true
      }
      if (next === 'heavy') {
        this.startAttack(h, cls.heavy, this.aim(h, mag > 0.1 ? ang(wx, wz) : h.facing, mag > 0.1))
        return true
      }
      return false
    })
  }

  /**
   * Soft aim assist: swings snap toward the closest rival roughly in the
   * direction you're pushing (or anyone close by if you aren't pushing).
   */
  aim(h: Fighter, desired: number, steering: boolean): number {
    let best: { score: number; dir: number } | null = null
    for (const e of this.fighters) {
      if (e.team !== 'enemy' || e.state === 'ko') continue
      const dx = e.x - h.x
      const dz = e.z - h.z
      const d = Math.hypot(dx, dz)
      if (d > (steering ? 3.2 : 2.6)) continue
      const dir = ang(dx, dz)
      const off = angDiff(dir, desired)
      if (steering && off > 1.1) continue
      const score = d + off * 1.5
      if (!best || score < best.score) best = { score, dir }
    }
    return best ? best.dir : desired
  }

  private startAttack(f: Fighter, atk: AttackDef, dir: number) {
    f.state = 'attack'
    f.attack = atk
    f.t = 0
    f.facing = dir
    f.hitIds = new Set()
    f.queued = null
    f.vx = 0
    f.vz = 0
  }

  private doSpecial(h: Fighter, sp: AttackDef & { grab?: boolean }) {
    if (!sp.grab) return this.startAttack(h, sp, h.facing)
    const target = this.fighters
      .filter((e) => e.team === 'enemy' && e.state !== 'ko' && e.state !== 'down' && e.kind !== 'boss')
      .filter((e) => Math.hypot(e.x - h.x, e.z - h.z) < 1.4 + e.radius && angDiff(ang(e.x - h.x, e.z - h.z), h.facing) < 1.2)
      .sort((a, b) => Math.hypot(a.x - h.x, a.z - h.z) - Math.hypot(b.x - h.x, b.z - h.z))[0]
    if (!target) {
      this.startAttack(h, { ...sp, damage: 0, recovery: 0.25 }, h.facing)
      this.events.push({ type: 'whiff', x: h.x, z: h.z })
      return
    }
    h.state = 'grab'
    h.t = 0
    h.attack = sp
    h.holding = target.id
    h.facing = ang(target.x - h.x, target.z - h.z)
    target.state = 'held'
    target.heldBy = h.id
    target.t = 0
    target.vx = target.vz = 0
  }

  /** Advances attack / stun / dodge timers. `chain` may start a new action at the end of recovery. */
  private tickAction(f: Fighter, dt: number, chain?: (q: 'attack' | 'heavy') => boolean) {
    f.t += dt
    switch (f.state) {
      case 'attack': {
        const a = f.attack!
        const end = a.startup + a.active + a.recovery
        if (a.lunge && f.t < a.startup + a.active) {
          const v = a.lunge / (a.startup + a.active)
          f.vx = Math.sin(f.facing) * v
          f.vz = Math.cos(f.facing) * v
        }
        if (f.t >= a.startup && f.t <= a.startup + a.active) this.resolveHits(f, a)
        // allow chaining from the start of recovery
        if (f.queued && f.t >= a.startup + a.active && chain && chain(f.queued)) return
        if (f.t >= end) {
          if (f.queued && chain && chain(f.queued)) return
          f.state = 'idle'
          f.attack = undefined
          f.t = 0
        }
        break
      }
      case 'grab': {
        const victim = this.fighters.find((v) => v.id === f.holding)
        if (victim && victim.state === 'held') {
          // hold the victim in front, then throw after a beat
          victim.x = f.x + Math.sin(f.facing) * 0.9
          victim.z = f.z + Math.cos(f.facing) * 0.9
          victim.y = Math.min(1.2, f.t * 3)
        }
        if (f.t >= 0.38) {
          if (victim && victim.state === 'held') this.throwVictim(f, victim)
          f.state = 'idle'
          f.holding = undefined
          f.t = 0
        }
        break
      }
      case 'hitstun':
        if (f.t >= HITSTUN) { f.state = 'idle'; f.t = 0 }
        break
      case 'down':
        if (f.t >= DOWN_TIME && f.y <= 0) { f.state = 'getup'; f.t = 0; f.invuln = GETUP_TIME + 0.2 }
        break
      case 'getup':
        if (f.t >= GETUP_TIME) { f.state = 'idle'; f.t = 0 }
        break
      case 'dodge':
        if (f.t >= DODGE_TIME) { f.state = 'idle'; f.t = 0; f.vx *= 0.2; f.vz *= 0.2 }
        break
    }
  }

  private throwVictim(h: Fighter, v: Fighter) {
    const sp = h.attack!
    v.heldBy = undefined
    const dir = h.facing + Math.PI // over the shoulder
    this.damage(h, v, sp.damage, true, dir, sp.knockback)
    this.events.push({ type: 'throw', x: v.x, z: v.z })
    // the thrown body bowls over anyone it lands near
    for (const e of this.aliveEnemies()) {
      if (e === v) continue
      const lx = h.x + Math.sin(dir) * 2
      const lz = h.z + Math.cos(dir) * 2
      if (Math.hypot(e.x - lx, e.z - lz) < 1.6) this.damage(h, e, 8, true, ang(e.x - lx, e.z - lz), 3)
    }
  }

  /* ---------------- combat ---------------- */

  private resolveHits(att: Fighter, a: AttackDef) {
    if (a.damage <= 0) return
    for (const t of this.fighters) {
      if (t === att || att.hitIds.has(t.id)) continue
      const foe = att.team === 'enemy' ? t.team === 'hero' || t.team === 'civ' : t.team === 'enemy'
      if (!foe || t.state === 'ko' || t.state === 'held' || t.invuln > 0) continue
      if (t.state === 'down' && !a.knockdown) continue
      const dx = t.x - att.x
      const dz = t.z - att.z
      const dist = Math.hypot(dx, dz)
      if (dist > a.range * att.scale + t.radius) continue
      if (dist > 0.3 && angDiff(ang(dx, dz), att.facing) > a.arc) continue
      att.hitIds.add(t.id)
      this.damage(att, t, a.damage, !!a.knockdown, ang(dx, dz), a.knockback)
    }
  }

  /** Applies a hit: damage, stagger/knockdown, knockback, combo, score and juice. */
  damage(att: Fighter, t: Fighter, dmg: number, knockdown: boolean, dir: number, knock: number) {
    const heavyTarget = t.team === 'enemy' && ENEMIES[t.kind as EnemyId]?.heavy
    const armored = t.state === 'attack' && t.attack?.armor
    t.hp = Math.max(0, t.hp - dmg)
    t.flash = 0.12
    const stagger = !armored && (!heavyTarget || knockdown || dmg >= 12)
    if (stagger && t.state !== 'held') {
      t.vx = Math.sin(dir) * knock * 2.2
      t.vz = Math.cos(dir) * knock * 2.2
      if (knockdown || t.hp <= 0) {
        t.state = 'down'
        t.vy = 6
        t.y = Math.max(t.y, 0.01)
      } else if (t.state !== 'down' && t.state !== 'cower') {
        t.state = 'hitstun'
      }
      t.t = 0
      if (t.state === 'hitstun' || t.state === 'down') {
        if (t.holding) {
          const held = this.fighters.find((v) => v.id === t.holding)
          if (held) { held.state = 'down'; held.t = 0; held.heldBy = undefined }
          t.holding = undefined
        }
        t.attack = undefined
      }
    }
    if (t.state === 'held' && t.hp > 0) {
      t.state = 'down'
      t.vy = 7
      t.vx = Math.sin(dir) * knock * 2
      t.vz = Math.cos(dir) * knock * 2
      t.t = 0
    }
    if (t.hp <= 0) this.ko(t, att)
    if (att.team === 'hero') {
      att.combo++
      att.comboTimer = 1.4
      att.bestCombo = Math.max(att.bestCombo, att.combo)
      this.score += Math.round(dmg * 10 * (1 + Math.min(att.combo, 20) * 0.1))
    }
    this.hitstop = knockdown ? 0.085 : 0.045
    this.shake = Math.min(1, this.shake + (knockdown ? 0.5 : 0.22))
    this.events.push({ type: 'hit', x: t.x, y: t.y + 1.1 * t.scale, z: t.z, damage: dmg, heavy: knockdown, team: t.team })
  }

  private ko(t: Fighter, by: Fighter) {
    if (t.state === 'ko') return
    t.state = 'ko'
    t.t = 0
    t.dead = 0
    t.revive = 0
    t.vy = Math.max(t.vy, 5)
    if (t.team === 'enemy') {
      this.score += ENEMIES[t.kind as EnemyId].points
      if (by.team === 'hero') by.kos++
    }
    this.events.push({ type: 'ko', x: t.x, z: t.z, team: t.team, name: t.name })
  }

  /* ---------------- rivals ---------------- */

  private pickTarget(e: Fighter): Fighter | undefined {
    const current = this.fighters.find((f) => f.id === e.targetId && f.state !== 'ko')
    if (current) return current
    const heroes = this.heroes.filter((h) => h.state !== 'ko')
    const t = heroes.sort((a, b) => Math.hypot(a.x - e.x, a.z - e.z) - Math.hypot(b.x - e.x, b.z - e.z))[0]
    e.targetId = t?.id
    return t
  }

  private updateEnemy(e: Fighter, dt: number) {
    e.flash = Math.max(0, e.flash - dt)
    e.invuln = Math.max(0, e.invuln - dt)
    if (e.state === 'ko') { e.dead += dt; return }
    if (e.state === 'held') return
    if (!this.canAct(e)) {
      this.tickAction(e, dt)
      return
    }
    if (this.phase !== 'fight') { e.state = 'idle'; return }
    const def = ENEMIES[e.kind as EnemyId]
    const target = this.pickTarget(e)
    if (!target) { e.state = 'idle'; return }
    e.cooldown -= dt
    const dx = target.x - e.x
    const dz = target.z - e.z
    const dist = Math.hypot(dx, dz)
    const toward = ang(dx, dz)
    const reach = def.attack.range * e.scale + target.radius

    // only a couple of rivals swing at the same hero at once; the rest circle
    const attackers = this.enemies.filter((o) => o !== e && o.targetId === target.id && (o.state === 'attack' || Math.hypot(o.x - target.x, o.z - target.z) < 2)).length
    const waiting = target.team === 'hero' && attackers >= MAX_ATTACKERS && !def.ranged

    let want = def.ranged ? 6 : waiting ? 3 : reach * 0.75
    if (def.ranged && dist < 4) want = 7
    if (e.cooldown <= 0 && dist <= (def.ranged ? 9 : reach) && !waiting) {
      if (def.ranged) {
        this.startAttack(e, def.attack, toward)
        // the eraser leaves the hand at the end of startup
        setTimeoutLike(this, def.attack.startup, () => this.fireProjectile(e, target))
      } else {
        this.startAttack(e, def.attack, toward)
      }
      e.cooldown = def.cooldown * (0.7 + this.rand() * 0.6)
      return
    }
    let mx = 0
    let mz = 0
    if (Math.abs(dist - want) > 0.3) {
      const s = dist > want ? 1 : -0.7
      mx += (dx / (dist || 1)) * s
      mz += (dz / (dist || 1)) * s
    }
    if (waiting || def.ranged) {
      // strafe around the target
      mx += Math.cos(toward) * e.strafe * 0.6
      mz += -Math.sin(toward) * e.strafe * 0.6
      if (this.rand() < dt * 0.4) e.strafe *= -1
    }
    const m = Math.hypot(mx, mz)
    if (m > 0.05) {
      e.state = 'move'
      e.vx = (mx / m) * e.speed * (waiting ? 0.6 : 1)
      e.vz = (mz / m) * e.speed * (waiting ? 0.6 : 1)
    } else {
      e.state = 'idle'
    }
    e.facing = toward
    e.t += dt
  }

  private updateCiv(c: Fighter, dt: number) {
    c.flash = Math.max(0, c.flash - dt)
    if (c.state === 'ko') return
    if (c.state === 'hitstun' || c.state === 'down' || c.state === 'getup') {
      this.tickAction(c, dt)
      if ((c.state as State) === 'idle') c.state = 'cower'
    }
  }

  private fireProjectile(e: Fighter, target: Fighter) {
    if (e.state === 'ko' || e.state === 'hitstun' || e.state === 'down') return
    const dx = target.x - e.x
    const dz = target.z - e.z
    const d = Math.hypot(dx, dz) || 1
    this.projectiles.push({ id: this.nextId++, x: e.x + (dx / d) * 0.6, z: e.z + (dz / d) * 0.6, vx: (dx / d) * 11, vz: (dz / d) * 11, owner: e.id, life: 1.2, damage: ENEMIES.thrower.attack.damage })
  }

  private updateProjectiles(dt: number) {
    for (const p of this.projectiles) {
      p.x += p.vx * dt
      p.z += p.vz * dt
      p.life -= dt
      for (const t of this.fighters) {
        if ((t.team !== 'hero' && t.team !== 'civ') || t.state === 'ko' || t.invuln > 0) continue
        if (Math.hypot(t.x - p.x, t.z - p.z) < t.radius + 0.25) {
          const owner = this.fighters.find((f) => f.id === p.owner) ?? t
          this.damage(owner, t, p.damage, false, ang(p.vx, p.vz), 1)
          p.life = 0
          break
        }
      }
      if (hitsObstacle(p.x, p.z, 0.1)) p.life = 0
    }
    this.projectiles = this.projectiles.filter((p) => p.life > 0)
    this.pending = this.pending.filter((t) => {
      t.at -= dt
      if (t.at <= 0) { t.fn(); return false }
      return true
    })
  }

  pending: { at: number; fn: () => void }[] = []

  /* ---------------- revive (co-op) ---------------- */

  private updateRevives(dt: number) {
    for (const h of this.heroes) {
      if (h.state !== 'ko') continue
      h.dead += dt
      const helper = this.heroes.find((o) => o !== h && o.state !== 'ko' && Math.hypot(o.x - h.x, o.z - h.z) < 1.6)
      h.revive = helper ? h.revive + dt : Math.max(0, h.revive - dt * 0.5)
      if (h.revive >= REVIVE_TIME) {
        h.state = 'getup'
        h.t = 0
        h.hp = Math.round(h.maxHp * 0.35)
        h.invuln = 1.5
        h.revive = 0
        this.events.push({ type: 'revive', x: h.x, z: h.z })
      }
    }
  }

  /* ---------------- physics ---------------- */

  private physics(f: Fighter, dt: number) {
    if (f.state === 'held') return
    if (f.state !== 'move' && f.state !== 'dodge') {
      const k = Math.max(0, 1 - FRICTION * dt * (f.y > 0 ? 0.3 : 1))
      if (!(f.state === 'attack' && f.attack?.lunge && f.t < f.attack.startup + f.attack.active)) {
        f.vx *= k
        f.vz *= k
      }
    }
    f.x += f.vx * dt
    f.z += f.vz * dt
    if (f.y > 0 || f.vy > 0) {
      f.vy -= GRAVITY * dt
      f.y += f.vy * dt
      if (f.y <= 0) {
        f.y = 0
        f.vy = 0
        if (f.state === 'down' || f.state === 'ko') {
          this.events.push({ type: 'land', x: f.x, z: f.z })
          this.shake = Math.min(1, this.shake + 0.15)
        }
      }
    }
    // walking velocity is re-applied from input / AI every frame
    if (f.state === 'move') {
      f.vx = 0
      f.vz = 0
    }
    this.collideWorld(f)
  }

  private collideWorld(f: Fighter) {
    f.x = Math.max(ARENA.minX + f.radius, Math.min(ARENA.maxX - f.radius, f.x))
    f.z = Math.max(ARENA.minZ + f.radius + 1.2, Math.min(ARENA.maxZ - f.radius, f.z))
    for (const b of OBSTACLES) {
      const cx = Math.max(b.x0, Math.min(b.x1, f.x))
      const cz = Math.max(b.z0, Math.min(b.z1, f.z))
      const dx = f.x - cx
      const dz = f.z - cz
      const d = Math.hypot(dx, dz)
      if (d < f.radius) {
        if (d < 1e-6) {
          // centre inside the box: push out along the shallowest side
          const opts = [[b.x0 - f.radius - f.x, 0], [b.x1 + f.radius - f.x, 0], [0, b.z0 - f.radius - f.z], [0, b.z1 + f.radius - f.z]]
          const [ox, oz] = opts.sort((p, q) => Math.abs(p[0] + p[1]) - Math.abs(q[0] + q[1]))[0]
          f.x += ox
          f.z += oz
        } else {
          f.x = cx + (dx / d) * f.radius
          f.z = cz + (dz / d) * f.radius
        }
      }
    }
  }

  private separate() {
    const list = this.fighters.filter((f) => f.state !== 'ko' && f.state !== 'held' && f.state !== 'down')
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i]
        const b = list[j]
        const dx = b.x - a.x
        const dz = b.z - a.z
        const d = Math.hypot(dx, dz)
        const min = a.radius + b.radius
        if (d < min && d > 1e-6) {
          const push = (min - d) / 2
          a.x -= (dx / d) * push
          a.z -= (dz / d) * push
          b.x += (dx / d) * push
          b.z += (dz / d) * push
        }
      }
    }
  }
}

export function hitsObstacle(x: number, z: number, r: number) {
  if (x < ARENA.minX || x > ARENA.maxX || z < ARENA.minZ + 1 || z > ARENA.maxZ) return true
  return OBSTACLES.some((b) => b.kind !== 'table' && x > b.x0 - r && x < b.x1 + r && z > b.z0 - r && z < b.z1 + r)
}

/** Deterministic delayed call inside the simulation (no wall-clock timers). */
function setTimeoutLike(g: Brawl, delay: number, fn: () => void) {
  g.pending.push({ at: delay, fn })
}

export { CLASSES, ENEMIES, TOTAL_WAVES }
