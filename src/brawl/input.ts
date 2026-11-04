import { NO_INPUT, type Input } from './engine'

/**
 * Keyboard (two players), gamepads and touch, all folded into one Input per player.
 *  P1: WASD + J punch · K heavy · L special · Space dodge (arrows + Z/X/C/V also work when solo)
 *  P2: arrows + , punch · . heavy · / special · Right Shift dodge (or numpad 1/2/3/0)
 */

const P1: Record<string, keyof Input | 'up' | 'down' | 'left' | 'right'> = {
  KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right',
  KeyJ: 'attack', KeyK: 'heavy', KeyL: 'special', Space: 'dodge',
}
const P2: Record<string, keyof Input | 'up' | 'down' | 'left' | 'right'> = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  Comma: 'attack', Period: 'heavy', Slash: 'special', ShiftRight: 'dodge',
  Numpad1: 'attack', Numpad2: 'heavy', Numpad3: 'special', Numpad0: 'dodge',
}
const SOLO_EXTRA: typeof P1 = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  KeyZ: 'attack', KeyX: 'heavy', KeyC: 'special', KeyV: 'dodge', ShiftLeft: 'dodge',
}

export class Controls {
  private keys = new Set<string>()
  touch: Input = { ...NO_INPUT }
  players = 1
  /** taps shorter than a frame still count: they're held until the game reads them */
  private latched = new Set<'attack' | 'heavy' | 'special' | 'dodge'>()

  tap(key: 'attack' | 'heavy' | 'special' | 'dodge') {
    this.latched.add(key)
  }

  private down = (e: KeyboardEvent) => {
    const known = e.code in P1 || e.code in P2 || e.code in SOLO_EXTRA
    if (known) e.preventDefault()
    this.keys.add(e.code)
  }
  private up = (e: KeyboardEvent) => { this.keys.delete(e.code) }
  private blur = () => { this.keys.clear() }

  attach() {
    window.addEventListener('keydown', this.down)
    window.addEventListener('keyup', this.up)
    window.addEventListener('blur', this.blur)
  }

  detach() {
    window.removeEventListener('keydown', this.down)
    window.removeEventListener('keyup', this.up)
    window.removeEventListener('blur', this.blur)
  }

  private fromKeys(map: typeof P1): Input {
    const inp = { ...NO_INPUT }
    for (const [code, action] of Object.entries(map)) {
      if (!this.keys.has(code)) continue
      if (action === 'up') inp.y += 1
      else if (action === 'down') inp.y -= 1
      else if (action === 'left') inp.x -= 1
      else if (action === 'right') inp.x += 1
      else (inp[action] as boolean) = true
    }
    inp.x = Math.max(-1, Math.min(1, inp.x))
    inp.y = Math.max(-1, Math.min(1, inp.y))
    return inp
  }

  private fromPad(i: number): Input | null {
    const pad = navigator.getGamepads?.()[i]
    if (!pad) return null
    const dz = (v: number) => (Math.abs(v) < 0.2 ? 0 : v)
    const b = (n: number) => !!pad.buttons[n]?.pressed
    let x = dz(pad.axes[0] ?? 0)
    let y = -dz(pad.axes[1] ?? 0)
    if (b(14)) x = -1
    if (b(15)) x = 1
    if (b(12)) y = 1
    if (b(13)) y = -1
    return { x, y, attack: b(0), heavy: b(2), special: b(3), dodge: b(1) || b(4) || b(5) }
  }

  read(): Input[] {
    const merge = (a: Input, b: Input | null): Input => (b ? {
      x: Math.abs(b.x) > Math.abs(a.x) ? b.x : a.x,
      y: Math.abs(b.y) > Math.abs(a.y) ? b.y : a.y,
      attack: a.attack || b.attack, heavy: a.heavy || b.heavy, special: a.special || b.special, dodge: a.dodge || b.dodge,
    } : a)
    const solo = this.players === 1
    let p1 = this.fromKeys(solo ? { ...P1, ...SOLO_EXTRA } : P1)
    p1 = merge(merge(p1, this.fromPad(0)), this.touch)
    for (const k of this.latched) p1[k] = true
    this.latched.clear()
    if (solo) return [p1]
    const p2 = merge(this.fromKeys(P2), this.fromPad(1))
    return [p1, p2]
  }
}
