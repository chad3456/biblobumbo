import { describe, expect, it } from 'vitest'
import { Game, S } from './engine'
import { GROUND } from './level'

const idle = { left: false, right: false, jump: false, run: false }

function step(g: Game, secs: number, input = idle) {
  for (let t = 0; t < secs; t += 1 / 60) g.update(1 / 60, input)
}

describe('NaMo Bricks engine', () => {
  it('builds a level with a flag, foes and votes', () => {
    const g = new Game()
    expect(g.flagX).toBeGreaterThan(200 * S)
    expect(g.foes.length).toBeGreaterThan(10)
    expect(g.votes.length).toBeGreaterThan(20)
  })

  it('lands the hero on the ground and lets them walk right', () => {
    const g = new Game()
    g.start()
    step(g, 1)
    expect(g.hero.onGround).toBe(true)
    expect(g.hero.y + g.hero.h).toBe(GROUND * S)
    const x0 = g.hero.x
    step(g, 0.5, { ...idle, right: true })
    expect(g.hero.x).toBeGreaterThan(x0 + 50)
  })

  it('stomping a foe from above outplays it and bounces the hero', () => {
    const g = new Game()
    g.start()
    step(g, 0.5)
    const f = g.foes[0]
    f.active = true
    f.vx = 0
    f.x = g.hero.x
    f.y = GROUND * S - f.h
    g.hero.y = f.y - g.hero.h - 4
    g.hero.vy = 400
    g.hero.inv = 0
    step(g, 1 / 30)
    expect(f.alive).toBe(false)
    expect(g.stats.stomps).toBe(1)
    expect(g.hero.vy).toBeLessThan(0)
  })

  it('touching a foe from the side costs a life', () => {
    const g = new Game()
    g.start()
    step(g, 1.2)
    const f = g.foes[0]
    f.active = true
    f.x = g.hero.x + 10
    f.y = g.hero.y + g.hero.h - f.h
    step(g, 1 / 60)
    expect(g.phase).toBe('dying')
    expect(g.stats.lives).toBe(2)
  })

  it('reaching the flag wins the election', () => {
    const g = new Game()
    g.start()
    g.foes = []
    g.hero.x = g.flagX - 3 * S
    g.camX = g.hero.x - 300
    step(g, 2, { ...idle, right: true })
    expect(g.phase).toBe('won')
    expect(g.seatsWon()).toBeGreaterThan(0)
  })
})
