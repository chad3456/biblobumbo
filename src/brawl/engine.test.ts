import { describe, expect, it } from 'vitest'
import { CLASSES, TOTAL_WAVES, waveDef } from './data'
import { Brawl, NO_INPUT, screenToWorld, type Fighter, type Input } from './engine'

const press = (k: keyof Input, extra: Partial<Input> = {}): Input => ({ ...NO_INPUT, [k]: true, ...extra })

function run(g: Brawl, secs: number, inputs: Input[] = [NO_INPUT]) {
  for (let t = 0; t < secs; t += 1 / 60) g.step(1 / 60, inputs)
}

/** A fresh fight with one rival standing right in front of the hero. */
function duel(cls: keyof typeof CLASSES = 'brawler') {
  const g = new Brawl([{ name: 'P1', cls }])
  g.phase = 'fight'
  g.queue = []
  const hero = g.heroes[0]
  hero.x = 0; hero.z = 3; hero.facing = Math.PI
  const e = (g as unknown as { make: (p: Partial<Fighter>) => Fighter }).make({ team: 'enemy', kind: 'thug', name: 'Rival', x: 0, z: 2, hp: 200, speed: 0 })
  e.cooldown = 99
  g.fighters.push(e)
  return { g, hero, e }
}

describe('controls', () => {
  it('maps screen-up to the far corner of the isometric arena', () => {
    const [x, z] = screenToWorld(0, 1)
    expect(x).toBeLessThan(0)
    expect(z).toBeLessThan(0)
  })
})

describe('combat', () => {
  it('a jab hits a rival in front, not one behind', () => {
    const { g, e } = duel()
    const behind = (g as unknown as { make: (p: Partial<Fighter>) => Fighter }).make({ team: 'enemy', kind: 'thug', name: 'B', x: 0, z: 4, hp: 50, speed: 0 })
    behind.cooldown = 99
    g.fighters.push(behind)
    g.step(1 / 60, [press('attack')])
    run(g, 0.3)
    expect(e.hp).toBe(200 - CLASSES.brawler.combo[0].damage)
    expect(behind.hp).toBe(50)
  })

  it('pressing again chains the full combo and counts hits', () => {
    const { g, hero, e } = duel()
    for (let i = 0; i < 40; i++) g.step(1 / 60, [i % 6 === 0 ? press('attack') : NO_INPUT])
    run(g, 0.6)
    const total = CLASSES.brawler.combo.reduce((s, a) => s + a.damage, 0)
    expect(200 - e.hp).toBe(total)
    expect(hero.bestCombo).toBe(3)
  })

  it('a heavy attack knocks the rival down', () => {
    const { g, e } = duel()
    g.step(1 / 60, [press('heavy')])
    run(g, 0.3)
    expect(e.state).toBe('down')
  })

  it('dodging makes the hero untouchable for a moment', () => {
    const { g, hero, e } = duel()
    g.step(1 / 60, [press('dodge', { x: 1 })])
    expect(hero.state).toBe('dodge')
    expect(hero.invuln).toBeGreaterThan(0)
    const hp = hero.hp
    // a rival swing during the roll misses
    e.facing = 0
    e.state = 'attack'
    e.attack = { ...CLASSES.brawler.combo[0], startup: 0, active: 0.2 }
    e.t = 0
    e.cooldown = 99
    run(g, 0.1)
    expect(hero.hp).toBe(hp)
  })

  it('the grappler suplexes a grabbed rival for big damage', () => {
    const { g, e } = duel('grappler')
    g.step(1 / 60, [press('special')])
    expect(e.state).toBe('held')
    run(g, 0.6)
    expect(e.hp).toBe(200 - (CLASSES.grappler.special.damage))
    expect(e.state).toBe('down')
  })
})

describe('waves', () => {
  it('ramps up to a final boss wave with protect waves in between', () => {
    expect(waveDef(1).objective).toBe('clear')
    expect(waveDef(2).objective).toBe('protect')
    expect(waveDef(TOTAL_WAVES).enemies).toContain('boss')
    expect(waveDef(10).enemies.length).toBeGreaterThan(waveDef(1).enemies.length)
  })

  it('clearing every rival advances to the next wave', () => {
    const g = new Brawl([{ name: 'P1', cls: 'brawler' }])
    run(g, 2.5)
    expect(g.phase).toBe('fight')
    g.queue = []
    for (const e of g.enemies) e.hp = 0, e.state = 'ko'
    run(g, 0.1)
    expect(g.phase).toBe('cleared')
    run(g, 3)
    expect(g.wave).toBe(2)
    expect(g.civs).toHaveLength(4)
  })

  it('loses a protect wave if every classmate is knocked out', () => {
    const g = new Brawl([{ name: 'P1', cls: 'brawler' }])
    g.startWave(2)
    g.phase = 'fight'
    for (const c of g.civs) c.state = 'ko'
    run(g, 0.05)
    expect(g.phase).toBe('lost')
  })

  it('a partner standing over a downed hero revives them', () => {
    const g = new Brawl([{ name: 'P1', cls: 'brawler' }, { name: 'P2', cls: 'kicker' }])
    g.phase = 'fight'
    g.queue = []
    const [a, b] = g.heroes
    a.state = 'ko'; a.hp = 0
    b.x = a.x + 0.8; b.z = a.z
    run(g, 2.6, [NO_INPUT, NO_INPUT])
    expect(['getup', 'idle']).toContain(a.state as string)
    expect(a.hp).toBeGreaterThan(0)
  })
})

describe('aim assist', () => {
  it('turns a slightly-off swing toward the nearby rival', () => {
    const { g, hero, e } = duel()
    hero.facing = Math.PI / 2 // looking sideways
    g.step(1 / 60, [press('attack')])
    run(g, 0.3)
    expect(e.hp).toBeLessThan(200)
  })
})
