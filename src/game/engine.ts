import { COLS, GROUND, PROJECTS, ROWS, SOLID, buildLevel, type Level, type Tile } from './level'
import {
  drawBoost, drawBrick, drawCloud, drawFlag, drawFoe, drawHero, drawProtest, drawQuestion, drawVote,
} from './sprites'

export const S = 36
export const VIEW_W = 960
export const VIEW_H = ROWS * S

const GRAVITY = 2300
const JUMP_V = 860
const WALK = 230
const RUN = 330
const ACCEL = 1800
const FOE_SPEED = 55
const START_DAYS = 400

export type Phase = 'title' | 'playing' | 'dying' | 'won' | 'over'

export interface Stats {
  votes: number
  projects: number
  stomps: number
  lives: number
  days: number
  score: number
}

interface Body { x: number; y: number; w: number; h: number; vx: number; vy: number }

interface Hero extends Body { onGround: boolean; facing: 1 | -1; big: boolean; inv: number; phase: number; jumpHeld: boolean }
interface Foe extends Body { kind: 'rahul' | 'kejriwal'; alive: boolean; squash: number; flying: boolean; spin: number; active: boolean; facing: 1 | -1 }
interface Vote { x: number; y: number; taken: boolean }
interface Boost extends Body { rise: number; alive: boolean }
interface Popup { x: number; y: number; text: string; t: number; color: string }
interface Confetti { x: number; y: number; vx: number; vy: number; c: string; r: number }

const STOMP_LINES = ['next time 👋', 'recount?!', 'I’ll be back!', 'not fair!', 'see you in 5 yrs']

export interface Input { left: boolean; right: boolean; jump: boolean; run: boolean }

export class Game {
  level!: Level
  hero!: Hero
  foes: Foe[] = []
  votes: Vote[] = []
  boosts: Boost[] = []
  popups: Popup[] = []
  confetti: Confetti[] = []
  bumps = new Map<string, number>()
  flagX = 0
  flagDrop = 0
  camX = 0
  t = 0
  phase: Phase = 'title'
  stats: Stats = { votes: 0, projects: 0, stomps: 0, lives: 3, days: START_DAYS, score: 0 }
  checkpoint = 2
  deathTimer = 0
  winTimer = 0
  protestCooldown = 0
  onChange: (phase: Phase) => void = () => {}
  sound: (name: 'jump' | 'vote' | 'stomp' | 'bump' | 'boost' | 'hit' | 'win' | 'die') => void = () => {}

  constructor() {
    this.reset(true)
  }

  /** Full restart, or respawn at the last checkpoint keeping progress. */
  reset(full: boolean) {
    if (full) {
      this.level = buildLevel()
      this.stats = { votes: 0, projects: 0, stomps: 0, lives: 3, days: START_DAYS, score: 0 }
      this.checkpoint = this.level.checkpoints[0]
      this.votes = []
      this.foes = []
      for (const s of this.level.spawns) {
        if (s.kind === 'vote') this.votes.push({ x: s.x * S + S / 2, y: s.y * S + S / 2, taken: false })
        else if (s.kind === 'flag') this.flagX = s.x * S + S / 2
        else this.foes.push(this.makeFoe(s.kind, s.x, s.y))
      }
    } else {
      // revive foes ahead of the checkpoint so the section replays fairly
      const fresh = this.level.spawns.filter((s) => (s.kind === 'rahul' || s.kind === 'kejriwal') && s.x > this.checkpoint + 6)
      this.foes = this.foes.filter((f) => f.x < (this.checkpoint + 6) * S)
      for (const s of fresh) this.foes.push(this.makeFoe(s.kind as 'rahul' | 'kejriwal', s.x, s.y))
      this.stats.days = START_DAYS
    }
    this.hero = { x: this.checkpoint * S, y: (GROUND - 2) * S, w: 32, h: 56, vx: 0, vy: 0, onGround: false, facing: 1, big: false, inv: 1, phase: 0, jumpHeld: false }
    this.boosts = []
    this.popups = []
    this.flagDrop = 0
    this.camX = Math.max(0, this.hero.x - VIEW_W * 0.35)
  }

  private makeFoe(kind: 'rahul' | 'kejriwal', tx: number, ty: number): Foe {
    return { kind, x: tx * S + 4, y: ty * S - 20, w: 34, h: 56, vx: -FOE_SPEED, vy: 0, alive: true, squash: 0, flying: false, spin: 0, active: false, facing: -1 }
  }

  start() {
    this.reset(true)
    this.setPhase('playing')
  }

  private setPhase(p: Phase) {
    this.phase = p
    this.onChange(p)
  }

  /* ---------------- tiles ---------------- */

  tileAt(tx: number, ty: number): Tile {
    if (tx < 0 || tx >= COLS) return '#'
    if (ty < 0 || ty >= ROWS) return '.'
    return this.level.tiles[ty][tx]
  }

  private solidAt(px: number, py: number) {
    return SOLID.has(this.tileAt(Math.floor(px / S), Math.floor(py / S)))
  }

  /** Axis-separated tile collision. Returns which sides were hit. */
  private moveBody(b: Body, dt: number) {
    const hit = { left: false, right: false, top: false, bottom: false, headTiles: [] as [number, number][] }
    b.x += b.vx * dt
    if (b.vx > 0) {
      const tx = Math.floor((b.x + b.w) / S)
      for (let ty = Math.floor(b.y / S); ty <= Math.floor((b.y + b.h - 1) / S); ty++) {
        if (SOLID.has(this.tileAt(tx, ty))) { b.x = tx * S - b.w; b.vx = 0; hit.right = true; break }
      }
    } else if (b.vx < 0) {
      const tx = Math.floor(b.x / S)
      for (let ty = Math.floor(b.y / S); ty <= Math.floor((b.y + b.h - 1) / S); ty++) {
        if (SOLID.has(this.tileAt(tx, ty))) { b.x = (tx + 1) * S; b.vx = 0; hit.left = true; break }
      }
    }
    b.y += b.vy * dt
    if (b.vy > 0) {
      const ty = Math.floor((b.y + b.h) / S)
      for (let tx = Math.floor((b.x + 2) / S); tx <= Math.floor((b.x + b.w - 3) / S); tx++) {
        if (SOLID.has(this.tileAt(tx, ty))) { b.y = ty * S - b.h; b.vy = 0; hit.bottom = true; break }
      }
    } else if (b.vy < 0) {
      const ty = Math.floor(b.y / S)
      for (let tx = Math.floor((b.x + 4) / S); tx <= Math.floor((b.x + b.w - 5) / S); tx++) {
        if (SOLID.has(this.tileAt(tx, ty))) { hit.headTiles.push([tx, ty]) }
      }
      if (hit.headTiles.length) { b.y = (ty + 1) * S; b.vy = 0; hit.top = true }
    }
    return hit
  }

  /* ---------------- update ---------------- */

  update(dt: number, input: Input) {
    this.t += dt
    for (const p of this.popups) { p.t += dt; p.y -= 40 * dt }
    this.popups = this.popups.filter((p) => p.t < 1.4)
    for (const [k, v] of this.bumps) { if (v + dt > 0.2) this.bumps.delete(k); else this.bumps.set(k, v + dt) }
    for (const c of this.confetti) { c.x += c.vx * dt; c.y += c.vy * dt; c.vy += 300 * dt }
    this.confetti = this.confetti.filter((c) => c.y < VIEW_H + 20)

    if (this.phase === 'playing') this.updatePlaying(dt, input)
    else if (this.phase === 'dying') this.updateDying(dt)
    else if (this.phase === 'won') this.updateWon(dt)
  }

  private updatePlaying(dt: number, input: Input) {
    const h = this.hero
    const st = this.stats
    st.days = Math.max(0, st.days - dt * 2.5)
    if (st.days <= 0) { this.loseLife('election day came too soon ⏰'); return }

    // horizontal control
    const max = input.run ? RUN : WALK
    const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0)
    if (dir) {
      h.vx += dir * ACCEL * dt * (Math.sign(h.vx) !== dir ? 1.8 : 1)
      h.vx = Math.max(-max, Math.min(max, h.vx))
      h.facing = dir as 1 | -1
    } else {
      const f = ACCEL * 1.2 * dt
      h.vx = Math.abs(h.vx) <= f ? 0 : h.vx - Math.sign(h.vx) * f
    }

    // jump (hold for higher)
    if (input.jump && !h.jumpHeld && h.onGround) {
      h.vy = -JUMP_V
      h.onGround = false
      this.sound('jump')
    }
    if (!input.jump && h.vy < -320) h.vy = -320
    h.jumpHeld = input.jump

    h.vy = Math.min(1400, h.vy + GRAVITY * dt)
    const hit = this.moveBody(h, dt)
    h.onGround = hit.bottom
    h.phase = h.onGround && Math.abs(h.vx) > 10 ? h.phase + Math.abs(h.vx) * dt * 0.05 : h.onGround ? 0 : 0.9
    if (h.inv > 0) h.inv -= dt
    if (h.x < this.camX) { h.x = this.camX; h.vx = Math.max(0, h.vx) }

    // bonk blocks from below
    if (hit.top) {
      // the tile closest to the hero centre gets bumped
      const cx = Math.floor((h.x + h.w / 2) / S)
      const [tx, ty] = hit.headTiles.reduce((a, b) => (Math.abs(b[0] - cx) < Math.abs(a[0] - cx) ? b : a))
      this.bump(tx, ty)
    }

    // protest flavour text when you walk into one
    this.protestCooldown -= dt
    if ((hit.left || hit.right) && this.protestCooldown <= 0) {
      const tx = Math.floor((hit.right ? h.x + h.w + 1 : h.x - 1) / S)
      const ty = Math.floor((h.y + h.h - 4) / S)
      if (this.tileAt(tx, ty) === 'P') {
        this.popup(h.x, h.y - 10, 'blocked by protest 🚧 jump!', '#e3000b')
        this.protestCooldown = 1.5
      }
    }

    // fell into a gap
    if (h.y > VIEW_H + 40) { this.loseLife('fell through a policy gap 🕳️'); return }

    // checkpoints
    for (const c of this.level.checkpoints) if (h.x > c * S && c > this.checkpoint) this.checkpoint = c

    // votes
    for (const v of this.votes) {
      if (v.taken) continue
      if (Math.abs(v.x - (h.x + h.w / 2)) < 20 && Math.abs(v.y - (h.y + h.h / 2)) < h.h / 2 + 10) {
        v.taken = true
        st.votes++
        st.score += 100
        this.sound('vote')
      }
    }

    // boosts
    for (const b of this.boosts) {
      if (!b.alive) continue
      if (b.rise > 0) { b.y -= 40 * dt; b.rise -= 40 * dt; continue }
      b.vy = Math.min(1200, b.vy + GRAVITY * dt)
      const bh = this.moveBody(b, dt)
      if (bh.left || bh.right) b.vx = bh.left ? 90 : -90
      if (b.y > VIEW_H) b.alive = false
      if (overlap(h, b)) {
        b.alive = false
        st.score += 1000
        this.popup(b.x, b.y, 'VIKAS BOOST! 💪', '#ff7a00')
        if (!h.big) { h.big = true; h.y -= 18; h.h = 74; h.w = 38 }
        this.sound('boost')
      }
    }

    // foes
    for (const f of this.foes) {
      if (!f.active && f.x < this.camX + VIEW_W + 60) f.active = true
      if (!f.active) continue
      if (f.flying) {
        f.vy += GRAVITY * dt
        f.x += f.vx * dt
        f.y += f.vy * dt
        f.spin += dt * 8
        continue
      }
      if (!f.alive) continue
      f.vy = Math.min(1200, f.vy + GRAVITY * dt)
      const prevVx = f.vx
      const fh = this.moveBody(f, dt)
      if (fh.left || fh.right) f.vx = -prevVx
      // turn around at ledges
      if (fh.bottom) {
        const aheadX = f.vx < 0 ? f.x - 2 : f.x + f.w + 2
        if (!this.solidAt(aheadX, f.y + f.h + 4)) f.vx = -f.vx
      }
      f.facing = f.vx < 0 ? -1 : 1
      if (f.y > VIEW_H + 40) f.alive = false

      if (overlap(h, f)) {
        const stomp = h.vy > 0 && h.y + h.h - f.y < 22
        if (stomp) {
          f.flying = true
          f.alive = false
          f.vy = -450
          f.vx = h.facing * 160
          h.vy = input.jump ? -JUMP_V * 0.85 : -520
          st.stomps++
          st.score += 200
          this.popup(f.x, f.y - 10, STOMP_LINES[st.stomps % STOMP_LINES.length], '#0055bf')
          this.sound('stomp')
        } else if (h.inv <= 0) {
          this.hurt()
          if (this.phase !== 'playing') return
        }
      }
    }
    this.foes = this.foes.filter((f) => !(f.flying && f.y > VIEW_H + 200))

    // flag
    if (h.x + h.w > this.flagX - 4) {
      st.score += Math.round(st.days) * 10
      this.winTimer = 0
      this.flagDrop = 0
      h.x = this.flagX - h.w
      h.vx = 0
      h.vy = 0
      this.sound('win')
      this.setPhase('won')
    }

    this.updateCamera(dt)
  }

  private updateCamera(dt: number) {
    const target = Math.max(0, Math.min(COLS * S - VIEW_W, this.hero.x - VIEW_W * 0.38))
    // camera only moves forward, like the classics
    if (target > this.camX) this.camX += (target - this.camX) * Math.min(1, dt * 10)
  }

  private bump(tx: number, ty: number) {
    const tile = this.tileAt(tx, ty)
    this.bumps.set(`${tx},${ty}`, 0)
    // knock foes standing on the block
    for (const f of this.foes) {
      if (f.alive && !f.flying && Math.abs(f.x + f.w / 2 - (tx * S + S / 2)) < S && Math.abs(f.y + f.h - ty * S) < 6) {
        f.flying = true; f.alive = false; f.vy = -500; f.vx = 60
        this.stats.stomps++
        this.stats.score += 200
      }
    }
    if (tile !== '?') { this.sound('bump'); return }
    this.level.tiles[ty][tx] = '='
    const giveBoost = !this.hero.big && (tx * 7 + ty) % 3 === 0
    if (giveBoost) {
      this.boosts.push({ x: tx * S + 4, y: ty * S, w: 28, h: 26, vx: 90, vy: 0, rise: 30, alive: true })
      this.popup(tx * S, ty * S - 10, 'Vikas Boost appeared!', '#ff7a00')
    } else {
      const name = PROJECTS[(tx + ty) % PROJECTS.length]
      this.stats.projects++
      this.stats.score += 500
      this.stats.votes += 5
      this.popup(tx * S - 30, ty * S - 10, `${name} +5 votes`, '#00a650')
    }
    this.sound('vote')
  }

  private hurt() {
    const h = this.hero
    if (h.big) {
      h.big = false
      h.h = 56
      h.w = 32
      h.y += 18
      h.inv = 2
      this.popup(h.x, h.y - 10, 'boost lost!', '#e3000b')
      this.sound('hit')
      return
    }
    this.loseLife('lost the debate 😵')
  }

  private loseLife(reason: string) {
    this.stats.lives--
    this.popup(this.hero.x - 40, this.hero.y - 20, reason, '#e3000b')
    this.hero.vy = -650
    this.hero.vx = 0
    this.deathTimer = 0
    this.sound('die')
    this.setPhase('dying')
  }

  private updateDying(dt: number) {
    this.deathTimer += dt
    this.hero.vy += GRAVITY * 0.7 * dt
    this.hero.y += this.hero.vy * dt
    if (this.deathTimer > 1.8) {
      if (this.stats.lives <= 0) this.setPhase('over')
      else {
        this.reset(false)
        this.setPhase('playing')
      }
    }
  }

  private updateWon(dt: number) {
    this.winTimer += dt
    const h = this.hero
    const groundY = GROUND * S
    if (h.y + h.h < groundY) {
      h.y = Math.min(groundY - h.h, h.y + 260 * dt)
      this.flagDrop = Math.min(1, this.flagDrop + dt * 0.8)
    } else if (this.winTimer < 3.2) {
      h.x += 120 * dt
      h.phase += dt * 6
      h.facing = 1
    }
    if (Math.random() < 0.6) {
      const colors = ['#ff9933', '#ffffff', '#138808', '#ffd500', '#e3000b', '#00b4d8']
      for (let i = 0; i < 3; i++) {
        this.confetti.push({ x: Math.random() * VIEW_W, y: -10, vx: (Math.random() - 0.5) * 80, vy: 60 + Math.random() * 120, c: colors[Math.floor(Math.random() * colors.length)], r: 3 + Math.random() * 4 })
      }
    }
  }

  seatsWon(): number {
    const s = this.stats
    return Math.min(543, 180 + s.votes * 2 + s.projects * 8 + s.stomps * 4 + Math.round(s.days / 10))
  }

  private popup(x: number, y: number, text: string, color: string) {
    this.popups.push({ x, y, text, t: 0, color })
  }

  /* ---------------- render ---------------- */

  render(ctx: CanvasRenderingContext2D) {
    const t = this.t
    // sky
    const g = ctx.createLinearGradient(0, 0, 0, VIEW_H)
    g.addColorStop(0, '#6ec6ff')
    g.addColorStop(0.7, '#c9ecff')
    g.addColorStop(1, '#fff3c4')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, VIEW_W, VIEW_H)

    // parallax: clouds and distant brick hills
    for (let i = 0; i < 14; i++) {
      const x = ((i * 380 - this.camX * 0.2) % (14 * 380) + 14 * 380) % (14 * 380) - 200
      drawCloud(ctx, x, 60 + (i % 3) * 40, 1 + (i % 2) * 0.3)
    }
    ctx.fillStyle = '#7fd38f'
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'
    for (let i = 0; i < 20; i++) {
      const x = ((i * 300 - this.camX * 0.45) % 6000 + 6000) % 6000 - 300
      const hh = 70 + (i % 4) * 30
      ctx.beginPath()
      ctx.moveTo(x, GROUND * S)
      ctx.lineTo(x, GROUND * S - hh + 20)
      ctx.quadraticCurveTo(x + 120, GROUND * S - hh - 40, x + 240, GROUND * S - hh + 20)
      ctx.lineTo(x + 240, GROUND * S)
      ctx.fill()
      ctx.stroke()
    }

    ctx.save()
    ctx.translate(-Math.round(this.camX), 0)

    // tiles
    const x0 = Math.max(0, Math.floor(this.camX / S) - 1)
    const x1 = Math.min(COLS - 1, Math.ceil((this.camX + VIEW_W) / S) + 1)
    for (let ty = 0; ty < ROWS; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        const tile = this.level.tiles[ty][tx]
        if (tile === '.') continue
        const bump = this.bumps.get(`${tx},${ty}`)
        const by = ty * S - (bump !== undefined ? Math.sin((bump / 0.2) * Math.PI) * 10 : 0)
        const covered = ty > 0 && SOLID.has(this.level.tiles[ty - 1][tx])
        if (tile === '#') drawBrick(ctx, tx * S, by, S, ty === GROUND ? '#00a650' : '#6d4c41', !covered)
        else if (tile === 'B') drawBrick(ctx, tx * S, by, S, '#e3000b', !covered)
        else if (tile === '?' || tile === '=') drawQuestion(ctx, tx * S, by, S, t, tile === '=')
        else if (tile === 'P') drawProtest(ctx, tx * S, by, S, t, !covered, tx + ty)
      }
    }

    // flag
    const poleH = 9 * S
    drawFlag(ctx, this.flagX, GROUND * S, poleH, GROUND * S - poleH + 4 + this.flagDrop * (poleH - 50), t)
    ctx.fillStyle = '#111'
    ctx.font = 'bold 13px "Space Grotesk", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('ELECTION', this.flagX + 120, GROUND * S - 80)
    ctx.fillText('WIN →', this.flagX + 120, GROUND * S - 62)

    // votes
    for (const v of this.votes) if (!v.taken && v.x > this.camX - 40 && v.x < this.camX + VIEW_W + 40) drawVote(ctx, v.x, v.y, t + v.x * 0.01)

    // boosts
    for (const b of this.boosts) if (b.alive) drawBoost(ctx, b.x, b.y, b.w, b.h)

    // foes
    for (const f of this.foes) {
      if (!f.active && f.x > this.camX + VIEW_W + 60) continue
      if (f.flying) {
        ctx.save()
        ctx.translate(f.x + f.w / 2, f.y + f.h / 2)
        ctx.rotate(f.spin)
        drawFoe(ctx, f.kind, -f.w / 2, -f.h / 2, f.w, f.h, f.facing, 0, t)
        ctx.restore()
      } else if (f.alive) {
        drawFoe(ctx, f.kind, f.x, f.y, f.w, f.h, f.facing, t * 8 + f.x * 0.05, t)
        ctx.fillStyle = 'rgba(17,17,17,0.75)'
        ctx.font = 'bold 10px "Space Grotesk", sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(f.kind === 'rahul' ? 'RaGa' : 'Kejri', f.x + f.w / 2, f.y - 12)
      }
    }

    // hero
    const h = this.hero
    if (this.phase !== 'title') {
      drawHero(ctx, h.x, h.y, h.w, h.h, h.facing, h.phase, t, {
        flash: h.inv > 0 && this.phase === 'playing',
        armsUp: this.phase === 'won' && this.winTimer > 2.4,
      })
    }

    // popups
    ctx.textAlign = 'center'
    for (const p of this.popups) {
      ctx.globalAlpha = Math.max(0, 1 - p.t / 1.4)
      ctx.font = 'bold 15px "Space Grotesk", sans-serif'
      ctx.lineWidth = 4
      ctx.strokeStyle = '#fff'
      ctx.strokeText(p.text, p.x + 20, p.y)
      ctx.fillStyle = p.color
      ctx.fillText(p.text, p.x + 20, p.y)
    }
    ctx.globalAlpha = 1
    ctx.restore()

    for (const c of this.confetti) {
      ctx.fillStyle = c.c
      ctx.fillRect(c.x, c.y, c.r, c.r * 1.6)
    }

    this.renderHud(ctx)
  }

  private renderHud(ctx: CanvasRenderingContext2D) {
    const s = this.stats
    ctx.fillStyle = 'rgba(255,255,255,0.88)'
    ctx.strokeStyle = '#111'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.roundRect(10, 10, VIEW_W - 20, 44, 10)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = '#111'
    ctx.font = '16px Bungee, sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    const items = [
      `🗳️ ${s.votes}`,
      `🏗️ ${s.projects}`,
      `👋 ${s.stomps}`,
      `${'❤️'.repeat(Math.max(0, s.lives))}`,
      `📅 ${Math.ceil(s.days)}`,
      `★ ${s.score}`,
    ]
    items.forEach((txt, i) => ctx.fillText(txt, 26 + i * 155, 33))
    ctx.textBaseline = 'alphabetic'
  }
}

function overlap(a: Body, b: Body) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}
