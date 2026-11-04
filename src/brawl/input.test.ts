import { describe, expect, it } from 'vitest'
import { Controls } from './input'

describe('touch controls', () => {
  it('a tap that ends before the next frame still registers once', () => {
    const c = new Controls()
    c.touch.attack = true
    c.tap('attack')
    c.touch.attack = false // finger already lifted
    expect(c.read()[0].attack).toBe(true)
    expect(c.read()[0].attack).toBe(false)
  })
})
