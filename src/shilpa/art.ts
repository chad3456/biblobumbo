import * as THREE from 'three'
import { BANDS, DOOR, ROOM, type Segment } from './level'

/**
 * Procedural temple art. Every frieze is drawn twice: once in colour and once
 * as a height map (white = raised) that becomes the bump map, so the lamp
 * light rakes across the carving like real relief.
 *
 * Bands follow the Hoysala order (Halebidu): elephants, scrolls, horses,
 * scrolls, epic scenes, swans. The painted wall uses the Kerala panchavarna
 * palette: red, yellow, green, black and white.
 */

export const PX = 96 // pixels per metre
const H = ROOM.height

type Mode = 'color' | 'height'
interface Pen { ctx: CanvasRenderingContext2D; mode: Mode; mural: boolean }

export const STONE = { base: '#c4a074', light: '#d9bb8f', dark: '#7d5c3c' }
export const MURAL = { red: '#9b2d1f', yellow: '#d9a33a', green: '#3f7a46', black: '#1a1410', white: '#f3e6c8', blue: '#2f4f7a' }

const yPx = (m: number) => (H - m) * PX

/** Fill for a carved shape: raised in the height map, toned stone or a mural colour in colour. */
function fill(p: Pen, muralColor: string, raise = 1) {
  if (p.mode === 'height') {
    const v = Math.round(110 + 140 * raise)
    p.ctx.fillStyle = `rgb(${v},${v},${v})`
    p.ctx.strokeStyle = 'rgba(0,0,0,0)'
  } else if (p.mural) {
    p.ctx.fillStyle = muralColor
    p.ctx.strokeStyle = MURAL.black
    p.ctx.lineWidth = 2
  } else {
    p.ctx.fillStyle = raise > 0.8 ? STONE.light : STONE.base
    p.ctx.strokeStyle = 'rgba(90, 62, 38, 0.55)'
    p.ctx.lineWidth = 1.2
  }
}

function shape(p: Pen, muralColor: string, draw: (c: CanvasRenderingContext2D) => void, raise = 1) {
  fill(p, muralColor, raise)
  p.ctx.beginPath()
  draw(p.ctx)
  p.ctx.fill()
  if (p.mode === 'color') p.ctx.stroke()
}

const ell = (c: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, rot = 0) => {
  c.moveTo(x + rx * Math.cos(rot), y + rx * Math.sin(rot))
  c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2)
}
const rect = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => c.rect(x, y, w, h)

/* ---------------- motifs (x = left edge px, yb = baseline px, k = px per metre) ---------------- */

export function elephant(p: Pen, x: number, yb: number, k: number) {
  const u = (m: number) => m * k
  // legs
  for (const lx of [0.2, 0.32, 0.56, 0.68]) shape(p, MURAL.white, (c) => rect(c, x + u(lx), yb - u(0.3), u(0.1), u(0.3)), 0.8)
  // body
  shape(p, MURAL.white, (c) => ell(c, x + u(0.45), yb - u(0.42), u(0.38), u(0.24)))
  // saddle cloth (jhool) with fringe
  shape(p, MURAL.red, (c) => rect(c, x + u(0.28), yb - u(0.62), u(0.3), u(0.3)), 1.15)
  for (let i = 0; i < 5; i++) shape(p, MURAL.yellow, (c) => ell(c, x + u(0.31 + i * 0.06), yb - u(0.3), u(0.02), u(0.03)), 1.2)
  // head, ear, trunk, tusk
  shape(p, MURAL.white, (c) => ell(c, x + u(0.82), yb - u(0.5), u(0.16), u(0.17)))
  shape(p, MURAL.white, (c) => ell(c, x + u(0.74), yb - u(0.5), u(0.08), u(0.13)), 1.15)
  shape(p, MURAL.white, (c) => {
    c.moveTo(x + u(0.9), yb - u(0.45))
    c.quadraticCurveTo(x + u(1.02), yb - u(0.25), x + u(0.96), yb - u(0.05))
    c.lineTo(x + u(0.9), yb - u(0.05))
    c.quadraticCurveTo(x + u(0.94), yb - u(0.25), x + u(0.84), yb - u(0.4))
    c.closePath()
  })
  shape(p, MURAL.white, (c) => ell(c, x + u(0.93), yb - u(0.36), u(0.06), u(0.015), 0.5), 1.2)
  // forehead ornament
  shape(p, MURAL.yellow, (c) => ell(c, x + u(0.86), yb - u(0.62), u(0.04), u(0.04)), 1.25)
}

export function horse(p: Pen, x: number, yb: number, k: number) {
  const u = (m: number) => m * k
  // legs: front leg raised in a prance
  shape(p, MURAL.yellow, (c) => rect(c, x + u(0.22), yb - u(0.32), u(0.06), u(0.32)), 0.8)
  shape(p, MURAL.yellow, (c) => rect(c, x + u(0.32), yb - u(0.32), u(0.06), u(0.32)), 0.8)
  shape(p, MURAL.yellow, (c) => rect(c, x + u(0.6), yb - u(0.32), u(0.06), u(0.3)), 0.8)
  shape(p, MURAL.yellow, (c) => { c.moveTo(x + u(0.68), yb - u(0.38)); c.lineTo(x + u(0.86), yb - u(0.26)); c.lineTo(x + u(0.82), yb - u(0.22)); c.lineTo(x + u(0.66), yb - u(0.3)); c.closePath() }, 0.8)
  // body, neck, head, tail
  shape(p, MURAL.yellow, (c) => ell(c, x + u(0.45), yb - u(0.42), u(0.3), u(0.14)))
  shape(p, MURAL.yellow, (c) => { c.moveTo(x + u(0.62), yb - u(0.5)); c.lineTo(x + u(0.8), yb - u(0.74)); c.lineTo(x + u(0.88), yb - u(0.66)); c.lineTo(x + u(0.74), yb - u(0.4)); c.closePath() })
  shape(p, MURAL.yellow, (c) => ell(c, x + u(0.9), yb - u(0.66), u(0.1), u(0.05), 0.45))
  shape(p, MURAL.black, (c) => { c.moveTo(x + u(0.16), yb - u(0.46)); c.quadraticCurveTo(x + u(0.02), yb - u(0.42), x + u(0.06), yb - u(0.2)); c.lineTo(x + u(0.12), yb - u(0.22)); c.quadraticCurveTo(x + u(0.1), yb - u(0.38), x + u(0.18), yb - u(0.4)); c.closePath() }, 0.9)
  // rider with spear
  shape(p, MURAL.green, (c) => rect(c, x + u(0.4), yb - u(0.78), u(0.12), u(0.24)), 1.1)
  shape(p, MURAL.green, (c) => ell(c, x + u(0.46), yb - u(0.84), u(0.055), u(0.06)), 1.15)
  shape(p, MURAL.red, (c) => ell(c, x + u(0.46), yb - u(0.9), u(0.06), u(0.03)), 1.2)
  shape(p, MURAL.black, (c) => rect(c, x + u(0.5), yb - u(0.96), u(0.42), u(0.018)), 1.2)
}

function scroll(p: Pen, x0: number, x1: number, yTop: number, yBot: number, phase: number) {
  const mid = (yTop + yBot) / 2
  const amp = (yBot - yTop) * 0.32
  const ctx = p.ctx
  ctx.lineWidth = p.mode === 'height' ? 5 : 3
  ctx.strokeStyle = p.mode === 'height' ? '#dcdcdc' : p.mural ? MURAL.green : STONE.dark
  ctx.beginPath()
  for (let x = x0; x <= x1; x += 4) {
    const y = mid + Math.sin((x + phase) / 22) * amp
    if (x === x0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()
  // curls and leaves
  for (let x = x0 + ((44 - ((phase % 44) + 44) % 44) % 44); x < x1; x += 44) {
    const y = mid + Math.sin((x + phase) / 22) * amp
    shape(p, MURAL.green, (c) => ell(c, x, y - amp * 0.9, amp * 0.55, amp * 0.3, 0.6), 0.9)
  }
}

function hamsa(p: Pen, x: number, yb: number, k: number) {
  const u = (m: number) => m * k
  shape(p, MURAL.white, (c) => {
    c.moveTo(x, yb - u(0.08))
    c.quadraticCurveTo(x + u(0.12), yb, x + u(0.24), yb - u(0.07))
    c.quadraticCurveTo(x + u(0.2), yb - u(0.16), x + u(0.08), yb - u(0.14))
    c.closePath()
  })
  shape(p, MURAL.white, (c) => {
    c.moveTo(x + u(0.2), yb - u(0.1))
    c.quadraticCurveTo(x + u(0.3), yb - u(0.22), x + u(0.26), yb - u(0.28))
    c.lineTo(x + u(0.3), yb - u(0.29))
    c.quadraticCurveTo(x + u(0.34), yb - u(0.2), x + u(0.23), yb - u(0.07))
    c.closePath()
  }, 1.05)
  shape(p, MURAL.red, (c) => ell(c, x + u(0.33), yb - u(0.28), u(0.03), u(0.012)), 1.1)
}

/** A human figure in relief: dancers, musicians and epic heroes share one body plan. */
export function person(p: Pen, x: number, yb: number, k: number, pose: 'dance' | 'drum' | 'bow' | 'monkey' | 'stand', skin: string) {
  const u = (m: number) => m * k
  const hip = yb - u(0.36)
  // legs: bent in dance, straight standing
  if (pose === 'dance') {
    shape(p, skin, (c) => { c.moveTo(x - u(0.04), hip); c.lineTo(x - u(0.14), yb - u(0.16)); c.lineTo(x - u(0.06), yb); c.lineTo(x + u(0.0), yb); c.lineTo(x - u(0.06), yb - u(0.16)); c.lineTo(x + u(0.03), hip); c.closePath() }, 0.85)
    shape(p, skin, (c) => { c.moveTo(x + u(0.02), hip); c.lineTo(x + u(0.16), yb - u(0.12)); c.lineTo(x + u(0.1), yb); c.lineTo(x + u(0.16), yb); c.lineTo(x + u(0.22), yb - u(0.12)); c.lineTo(x + u(0.08), hip); c.closePath() }, 0.85)
  } else {
    shape(p, skin, (c) => rect(c, x - u(0.06), hip, u(0.05), u(0.36)), 0.85)
    shape(p, skin, (c) => rect(c, x + u(0.02), hip, u(0.05), u(0.36)), 0.85)
  }
  // dhoti / skirt
  shape(p, MURAL.red, (c) => { c.moveTo(x - u(0.08), hip - u(0.08)); c.lineTo(x + u(0.09), hip - u(0.08)); c.lineTo(x + u(0.13), hip + u(0.1)); c.lineTo(x - u(0.12), hip + u(0.1)); c.closePath() }, 1.05)
  // torso with a hip sway (tribhanga) for dancers
  const sway = pose === 'dance' ? u(0.03) : 0
  shape(p, skin, (c) => { c.moveTo(x - u(0.07), hip - u(0.08)); c.lineTo(x - u(0.09) + sway, hip - u(0.34)); c.lineTo(x + u(0.09) + sway, hip - u(0.34)); c.lineTo(x + u(0.07), hip - u(0.08)); c.closePath() })
  // necklace
  shape(p, MURAL.yellow, (c) => ell(c, x + sway, hip - u(0.31), u(0.06), u(0.025)), 1.15)
  // head + kirita (crown)
  shape(p, skin, (c) => ell(c, x + sway, hip - u(0.42), u(0.06), u(0.07)))
  shape(p, MURAL.yellow, (c) => { c.moveTo(x - u(0.06) + sway, hip - u(0.47)); c.lineTo(x + sway, hip - u(0.6)); c.lineTo(x + u(0.06) + sway, hip - u(0.47)); c.closePath() }, 1.2)
  // arms by pose
  const arm = (ax: number, ay: number, bx: number, by: number) => shape(p, skin, (c) => {
    c.moveTo(ax, ay); c.lineTo(bx, by); c.lineTo(bx + u(0.03), by + u(0.03)); c.lineTo(ax + u(0.03), ay + u(0.03)); c.closePath()
  }, 0.95)
  const sh = hip - u(0.32)
  if (pose === 'dance') {
    arm(x + u(0.08) + sway, sh, x + u(0.22), sh - u(0.12))
    arm(x - u(0.08) + sway, sh, x - u(0.16), sh + u(0.14))
  } else if (pose === 'drum') {
    shape(p, MURAL.yellow, (c) => ell(c, x, hip - u(0.12), u(0.14), u(0.06)), 1.25)
    arm(x + u(0.08), sh, x + u(0.14), hip - u(0.12))
    arm(x - u(0.08), sh, x - u(0.14), hip - u(0.12))
  } else if (pose === 'bow') {
    // Rama drawing his bow
    p.ctx.lineWidth = p.mode === 'height' ? 5 : 3
    p.ctx.strokeStyle = p.mode === 'height' ? '#e6e6e6' : p.mural ? MURAL.black : STONE.dark
    p.ctx.beginPath()
    p.ctx.arc(x + u(0.12), sh - u(0.02), u(0.22), -Math.PI / 2.2, Math.PI / 2.2)
    p.ctx.stroke()
    arm(x + u(0.08), sh, x + u(0.3), sh - u(0.02))
    arm(x - u(0.08), sh, x + u(0.0), sh - u(0.02))
  } else if (pose === 'monkey') {
    // Hanuman with his mace, tail curling up
    p.ctx.lineWidth = p.mode === 'height' ? 6 : 4
    p.ctx.strokeStyle = p.mode === 'height' ? '#e0e0e0' : p.mural ? MURAL.yellow : STONE.dark
    p.ctx.beginPath()
    p.ctx.moveTo(x - u(0.08), hip)
    p.ctx.bezierCurveTo(x - u(0.3), hip + u(0.05), x - u(0.32), hip - u(0.45), x - u(0.15), hip - u(0.5))
    p.ctx.stroke()
    arm(x + u(0.08), sh, x + u(0.18), sh - u(0.18))
    shape(p, MURAL.yellow, (c) => ell(c, x + u(0.2), sh - u(0.26), u(0.07), u(0.07)), 1.25)
  } else {
    arm(x + u(0.08), sh, x + u(0.12), hip - u(0.04))
    arm(x - u(0.08), sh, x - u(0.12), hip - u(0.04))
  }
}

function deer(p: Pen, x: number, yb: number, k: number) {
  const u = (m: number) => m * k
  // the golden deer (Maricha) leaping
  for (const lx of [0.08, 0.14, 0.34, 0.4]) shape(p, MURAL.yellow, (c) => rect(c, x + u(lx), yb - u(0.22), u(0.03), u(0.22)), 0.8)
  shape(p, MURAL.yellow, (c) => ell(c, x + u(0.25), yb - u(0.28), u(0.2), u(0.08)))
  shape(p, MURAL.yellow, (c) => ell(c, x + u(0.47), yb - u(0.42), u(0.06), u(0.04), -0.4))
  p.ctx.lineWidth = 2
  p.ctx.strokeStyle = p.mode === 'height' ? '#e0e0e0' : p.mural ? MURAL.black : STONE.dark
  p.ctx.beginPath()
  p.ctx.moveTo(x + u(0.47), yb - u(0.46)); p.ctx.lineTo(x + u(0.43), yb - u(0.56)); p.ctx.lineTo(x + u(0.4), yb - u(0.6))
  p.ctx.moveTo(x + u(0.43), yb - u(0.56)); p.ctx.lineTo(x + u(0.49), yb - u(0.6))
  p.ctx.stroke()
}

/* ---------------- whole wall ---------------- */

function moldings(p: Pen, w: number, yTop: number, yBot: number, n: number) {
  const step = (yBot - yTop) / n
  for (let i = 0; i < n; i++) {
    shape(p, i % 2 ? MURAL.yellow : MURAL.red, (c) => rect(c, 0, yTop + i * step + step * 0.15, w, step * 0.7), i % 2 ? 0.7 : 1)
  }
}

function drawWall(p: Pen, seg: Segment, w: number) {
  const ctx = p.ctx
  const g0 = seg.s0 * PX // global offset keeps motifs in step across walls
  const k = PX
  // background
  if (p.mode === 'height') {
    ctx.fillStyle = 'rgb(100,100,100)'
    ctx.fillRect(0, 0, w, H * PX)
  } else if (p.mural) {
    ctx.fillStyle = MURAL.yellow
    ctx.fillRect(0, 0, w, H * PX)
    ctx.fillStyle = MURAL.red
    ctx.fillRect(0, yPx(3.68), w, yPx(2.72) - yPx(3.68))
    ctx.fillStyle = MURAL.green
    ctx.fillRect(0, yPx(1.5), w, yPx(1.42) - yPx(1.5))
  } else {
    ctx.fillStyle = STONE.base
    ctx.fillRect(0, 0, w, H * PX)
    // weathering
    for (let i = 0; i < w * 0.6; i++) {
      ctx.fillStyle = `rgba(${Math.random() < 0.5 ? '90,64,40' : '230,205,160'},${Math.random() * 0.12})`
      const r = 2 + Math.random() * 10
      ctx.fillRect(Math.random() * w, Math.random() * H * PX, r, r)
    }
  }
  // plinth mouldings 0 – 0.5 m
  moldings(p, w, yPx(0.5), yPx(0), 4)
  // Gaja band 0.55 – 1.4
  for (let gx = -((g0 % (1.15 * k)) + 1.15 * k) % (1.15 * k); gx < w; gx += 1.15 * k) elephant(p, gx + 0.08 * k, yPx(BANDS[0].y), k)
  // scroll 1.42 – 1.58
  scroll(p, 0, w, yPx(1.58), yPx(1.42), g0)
  // Ashva band
  for (let gx = -((g0 % (1.05 * k)) + 1.05 * k) % (1.05 * k); gx < w; gx += 1.05 * k) horse(p, gx + 0.05 * k, yPx(BANDS[1].y), k)
  // scroll 2.5 – 2.7
  scroll(p, 0, w, yPx(2.7), yPx(2.5), g0 + 300)
  // Katha band: panels framed by little pilasters and arches
  const panel = 1.3 * k
  const scenes: ('dance' | 'drum' | 'bow' | 'monkey' | 'deer')[] = ['dance', 'drum', 'bow', 'monkey', 'deer', 'dance']
  const start = -((g0 % panel) + panel) % panel
  for (let px = start, i = Math.floor((g0 + start) / panel); px < w; px += panel, i++) {
    shape(p, MURAL.yellow, (c) => rect(c, px, yPx(3.62), 0.06 * k, yPx(BANDS[2].y) - yPx(3.62)), 1.1)
    shape(p, MURAL.yellow, (c) => { c.moveTo(px + 0.06 * k, yPx(3.5)); c.quadraticCurveTo(px + panel / 2, yPx(3.75), px + panel, yPx(3.5)); c.lineTo(px + panel, yPx(3.56)); c.quadraticCurveTo(px + panel / 2, yPx(3.68), px + 0.06 * k, yPx(3.56)); c.closePath() }, 1.1)
    const scene = scenes[((i % scenes.length) + scenes.length) % scenes.length]
    const cx = px + panel / 2
    const skin = p.mural ? (scene === 'bow' ? MURAL.green : scene === 'monkey' ? MURAL.yellow : MURAL.green) : MURAL.white
    if (scene === 'deer') {
      deer(p, cx - 0.4 * k, yPx(BANDS[2].y) - 0.1 * k, k)
      person(p, cx + 0.35 * k, yPx(BANDS[2].y), k * 0.85, 'bow', skin)
    } else {
      person(p, cx - 0.22 * k, yPx(BANDS[2].y), k, scene, skin)
      person(p, cx + 0.25 * k, yPx(BANDS[2].y), k * 0.9, scene === 'dance' ? 'drum' : 'stand', skin)
    }
  }
  // hamsa band 3.72 – 4.05
  for (let gx = -((g0 % (0.45 * k)) + 0.45 * k) % (0.45 * k); gx < w; gx += 0.45 * k) hamsa(p, gx, yPx(3.74), k)
  // cornice
  moldings(p, w, yPx(4.5), yPx(4.08), 3)
}

/** Paints the sanctum door frame onto the back wall texture (dark doorway, carved jambs). */
function drawDoor(p: Pen, seg: Segment) {
  // door centre in this segment's local x
  const local = (x: number) => (x - seg.ax) * PX
  const x0 = local(DOOR.x0)
  const x1 = local(DOOR.x1)
  const ctx = p.ctx
  ctx.fillStyle = p.mode === 'height' ? 'rgb(30,30,30)' : '#1b120c'
  ctx.fillRect(x0, yPx(DOOR.height), x1 - x0, yPx(0) - yPx(DOOR.height))
  // jambs with dvarapalas (door guardians)
  for (const [jx, dir] of [[x0 - 0.36 * PX, 1], [x1 + 0.06 * PX, -1]] as const) {
    shape(p, MURAL.yellow, (c) => rect(c, jx, yPx(DOOR.height + 0.1), 0.3 * PX, yPx(0) - yPx(DOOR.height + 0.1)), 1.1)
    person(p, jx + 0.15 * PX + dir * 0.02 * PX, yPx(0.25), PX * 1.6, 'stand', p.mural ? MURAL.green : MURAL.white)
  }
  shape(p, MURAL.yellow, (c) => rect(c, x0 - 0.36 * PX, yPx(DOOR.height + 0.12), x1 - x0 + 0.72 * PX, 0.12 * PX), 1.2)
}

export interface WallArt { map: THREE.CanvasTexture; bump: THREE.CanvasTexture }

export function wallTextures(seg: Segment, hasDoor: boolean): WallArt {
  const w = Math.max(16, Math.round(seg.len * PX))
  const make = (mode: Mode) => {
    const c = document.createElement('canvas')
    c.width = w
    c.height = H * PX
    const pen: Pen = { ctx: c.getContext('2d')!, mode, mural: seg.style === 'mural' }
    drawWall(pen, seg, w)
    if (hasDoor) drawDoor(pen, seg)
    if (mode === 'height') {
      // soften the relief so light rolls over rounded edges
      const soft = document.createElement('canvas')
      soft.width = w
      soft.height = c.height
      const sctx = soft.getContext('2d')!
      sctx.filter = 'blur(1.5px)'
      sctx.drawImage(c, 0, 0)
      return soft
    }
    return c
  }
  const color = make('color')
  const height = make('height')
  if (seg.style === 'stone') emboss(color, height)
  const map = new THREE.CanvasTexture(color)
  map.colorSpace = THREE.SRGBColorSpace
  map.anisotropy = 8
  const bump = new THREE.CanvasTexture(height)
  return { map, bump }
}

/**
 * Bakes soft raking light from the upper left into the stone colour, using the
 * height map's slope, so carvings read as relief even in flat lamplight.
 */
function emboss(color: HTMLCanvasElement, height: HTMLCanvasElement) {
  const w = color.width
  const h = color.height
  const cctx = color.getContext('2d')!
  const img = cctx.getImageData(0, 0, w, h)
  const hd = height.getContext('2d')!.getImageData(0, 0, w, h).data
  const c = img.data
  const at = (x: number, y: number) => hd[(Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))) * 4]
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const slope = (at(x - 2, y - 2) - at(x + 2, y + 2)) / 255
      const raised = (at(x, y) - 100) / 155
      const k = 1 + slope * 1.6 + raised * 0.12
      const i = (y * w + x) * 4
      c[i] = Math.min(255, c[i] * k)
      c[i + 1] = Math.min(255, c[i + 1] * k)
      c[i + 2] = Math.min(255, c[i + 2] * k)
    }
  }
  cctx.putImageData(img, 0, 0)
}

/* ---------------- sprites ---------------- */

const spriteCache = new Map<string, THREE.CanvasTexture>()

/** The playable dancer: frames idle / walkA / walkB / jump / stone, in carved or painted style. */
export function dancerTexture(frame: 'idle' | 'walkA' | 'walkB' | 'jump', mural: boolean, stone: boolean): THREE.CanvasTexture {
  const key = `${frame}:${mural}:${stone}`
  const hit = spriteCache.get(key)
  if (hit) return hit
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 192
  const ctx = c.getContext('2d')!
  const k = 150
  const x = 60
  const yb = 186
  const pal = stone
    ? { skin: '#9b8b78', cloth: '#8a7a68', gold: '#a89880', line: '#4a3e32' }
    : mural
      ? { skin: MURAL.green, cloth: MURAL.red, gold: MURAL.yellow, line: MURAL.black }
      : { skin: '#e2c194', cloth: '#b5462e', gold: '#f0c24b', line: '#5a3a22' }
  const u = (m: number) => m * k
  ctx.lineJoin = 'round'
  ctx.lineWidth = 3
  ctx.strokeStyle = pal.line
  const part = (col: string, draw: () => void) => { ctx.fillStyle = col; ctx.beginPath(); draw(); ctx.fill(); ctx.stroke() }
  const hip = yb - u(0.42)
  const step = frame === 'walkA' ? 1 : frame === 'walkB' ? -1 : 0
  const jump = frame === 'jump'
  // legs
  const leg = (fx: number, kx: number, ky: number) => part(pal.skin, () => {
    ctx.moveTo(x - u(0.03), hip); ctx.lineTo(x + kx, hip + ky); ctx.lineTo(x + fx, yb - (jump ? u(0.08) : 0)); ctx.lineTo(x + fx + u(0.05), yb - (jump ? u(0.08) : 0)); ctx.lineTo(x + kx + u(0.05), hip + ky); ctx.lineTo(x + u(0.04), hip); ctx.closePath()
  })
  leg(jump ? -u(0.18) : -u(0.08) - step * u(0.08), -u(0.06), u(0.22))
  leg(jump ? u(0.14) : u(0.06) + step * u(0.08), u(0.1), u(jump ? 0.12 : 0.2))
  // anklets
  ctx.fillStyle = pal.gold
  // flared dance skirt
  part(pal.cloth, () => { ctx.moveTo(x - u(0.08), hip - u(0.1)); ctx.lineTo(x + u(0.1), hip - u(0.1)); ctx.lineTo(x + u(0.2), hip + u(0.12)); ctx.lineTo(x - u(0.18), hip + u(0.12)); ctx.closePath() })
  part(pal.gold, () => ctx.rect(x - u(0.17), hip + u(0.1), u(0.36), u(0.025)))
  // torso in tribhanga sway
  const sw = u(0.035)
  part(pal.skin, () => { ctx.moveTo(x - u(0.07), hip - u(0.1)); ctx.lineTo(x - u(0.09) + sw, hip - u(0.36)); ctx.lineTo(x + u(0.09) + sw, hip - u(0.36)); ctx.lineTo(x + u(0.08), hip - u(0.1)); ctx.closePath() })
  part(pal.gold, () => ctx.ellipse(x + sw, hip - u(0.33), u(0.07), u(0.03), 0, 0, Math.PI * 2))
  // arms: one in pataka mudra up, one sweeping down (swapped on steps)
  const arm = (ax: number, ay: number, bx: number, by: number) => part(pal.skin, () => {
    ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(bx + u(0.03), by + u(0.035)); ctx.lineTo(ax + u(0.035), ay + u(0.035)); ctx.closePath()
  })
  const sh = hip - u(0.34)
  const up = jump ? -0.3 : step === 1 ? -0.16 : -0.1
  arm(x + u(0.08) + sw, sh, x + u(0.24), sh + u(up))
  arm(x - u(0.08) + sw, sh, x - u(0.2), sh + u(jump ? -0.24 : step === -1 ? -0.1 : 0.14))
  // head, bun, crown, earring
  part(pal.skin, () => ctx.ellipse(x + sw, hip - u(0.45), u(0.065), u(0.075), 0, 0, Math.PI * 2))
  part(stone ? pal.line : '#1a1410', () => ctx.ellipse(x + sw - u(0.06), hip - u(0.47), u(0.04), u(0.045), 0, 0, Math.PI * 2))
  part(pal.gold, () => { ctx.moveTo(x + sw - u(0.06), hip - u(0.5)); ctx.lineTo(x + sw, hip - u(0.6)); ctx.lineTo(x + sw + u(0.06), hip - u(0.5)); ctx.closePath() })
  part(pal.gold, () => ctx.ellipse(x + sw + u(0.0), hip - u(0.4), u(0.015), u(0.02), 0, 0, Math.PI * 2))
  // eye (profile facing right)
  ctx.fillStyle = pal.line
  ctx.beginPath()
  ctx.ellipse(x + sw + u(0.035), hip - u(0.46), u(0.014), u(0.007), 0, 0, Math.PI * 2)
  ctx.fill()
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  spriteCache.set(key, t)
  return t
}

/** A single elephant or horse carving that walks along its band. */
export function beastTexture(kind: 'elephant' | 'horse', mural: boolean): THREE.CanvasTexture {
  const key = `${kind}:${mural}`
  const hit = spriteCache.get(key)
  if (hit) return hit
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 128
  const ctx = c.getContext('2d')!
  const pen: Pen = { ctx, mode: 'color', mural }
  if (kind === 'elephant') elephant(pen, 6, 124, 112)
  else horse(pen, 8, 124, 110)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  spriteCache.set(key, t)
  return t
}

export function lotusTexture(): THREE.CanvasTexture {
  const hit = spriteCache.get('lotus')
  if (hit) return hit
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(64, 70, 4, 64, 70, 62)
  g.addColorStop(0, 'rgba(255,220,150,0.9)')
  g.addColorStop(1, 'rgba(255,180,90,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  ctx.strokeStyle = '#7a2a3a'
  ctx.lineWidth = 2
  for (const [a, col] of [[-0.9, '#f48fb1'], [0.9, '#f48fb1'], [-0.45, '#f8bbd0'], [0.45, '#f8bbd0'], [0, '#fce4ec']] as const) {
    ctx.save()
    ctx.translate(64, 90)
    ctx.rotate(a)
    ctx.fillStyle = col
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.quadraticCurveTo(-16, -28, 0, -52)
    ctx.quadraticCurveTo(16, -28, 0, 0)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }
  ctx.fillStyle = '#3f7a46'
  ctx.fillRect(40, 92, 48, 6)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  spriteCache.set('lotus', t)
  return t
}

/** Warm radial glow behind the awake dancer. */
export function haloTexture(): THREE.CanvasTexture {
  const hit = spriteCache.get('halo')
  if (hit) return hit
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 62)
  g.addColorStop(0, 'rgba(255,214,140,0.9)')
  g.addColorStop(0.5, 'rgba(255,170,80,0.35)')
  g.addColorStop(1, 'rgba(255,140,40,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  spriteCache.set('halo', t)
  return t
}

export function floorTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#8a6f52'
  ctx.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    const v = 120 + Math.random() * 30
    ctx.fillStyle = `rgb(${v + 20},${v},${v - 25})`
    ctx.fillRect(i * 64 + 2, j * 64 + 2, 60, 60)
  }
  for (let n = 0; n < 500; n++) {
    ctx.fillStyle = `rgba(40,25,10,${Math.random() * 0.15})`
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(6, 4)
  return t
}
