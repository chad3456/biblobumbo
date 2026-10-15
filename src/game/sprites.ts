/**
 * Everything is drawn procedurally in a chunky LEGO-minifig style.
 * Characters are cartoon caricatures (no photos), recognisable by signature looks.
 */

type Ctx = CanvasRenderingContext2D

const INK = '#111'

function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16)
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v + amt)))
  return `rgb(${c((n >> 16) & 255)},${c((n >> 8) & 255)},${c(n & 255)})`
}

/* ---------------- tiles ---------------- */

export function drawBrick(ctx: Ctx, x: number, y: number, s: number, color: string, studs = true) {
  ctx.fillStyle = color
  ctx.strokeStyle = INK
  ctx.lineWidth = 2
  rr(ctx, x + 1, y + 1, s - 2, s - 2, 4)
  ctx.fill()
  ctx.fillStyle = shade(color, 35)
  ctx.fillRect(x + 4, y + 4, s - 8, 4)
  ctx.fillStyle = shade(color, -35)
  ctx.fillRect(x + 4, y + s - 8, s - 8, 4)
  rr(ctx, x + 1, y + 1, s - 2, s - 2, 4)
  ctx.stroke()
  if (studs) {
    for (const sx of [0.3, 0.7]) {
      ctx.fillStyle = color
      rr(ctx, x + s * sx - 6, y - 5, 12, 7, 3)
      ctx.fill()
      ctx.stroke()
    }
  }
}

export function drawQuestion(ctx: Ctx, x: number, y: number, s: number, t: number, used: boolean) {
  drawBrick(ctx, x, y, s, used ? '#8d6e63' : '#ffb703')
  if (used) return
  ctx.fillStyle = INK
  ctx.font = `bold ${s * 0.6}px Bungee, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('?', x + s / 2, y + s / 2 + 2 + Math.sin(t * 4) * 1.5)
}

/** A protest barricade with a crowd peeking over and a waving placard. */
export function drawProtest(ctx: Ctx, x: number, y: number, s: number, t: number, top: boolean, seed: number) {
  // barricade body: striped
  ctx.fillStyle = '#f4f4f4'
  rr(ctx, x + 2, y + 2, s - 4, s - 4, 3)
  ctx.fill()
  ctx.save()
  ctx.clip()
  ctx.fillStyle = '#e3000b'
  for (let i = -s; i < s * 2; i += 14) {
    ctx.beginPath()
    ctx.moveTo(x + i, y)
    ctx.lineTo(x + i + 7, y)
    ctx.lineTo(x + i + 7 - s, y + s)
    ctx.lineTo(x + i - s, y + s)
    ctx.fill()
  }
  ctx.restore()
  ctx.strokeStyle = INK
  ctx.lineWidth = 2
  rr(ctx, x + 2, y + 2, s - 4, s - 4, 3)
  ctx.stroke()
  if (!top) return
  // little crowd heads
  const skins = ['#e0ac69', '#c68642', '#8d5524', '#f6d7b0']
  for (let i = 0; i < 2; i++) {
    const hx = x + 10 + i * 16
    const hy = y - 10 + Math.sin(t * 6 + seed + i * 2) * 2
    ctx.fillStyle = skins[(seed + i) % skins.length]
    rr(ctx, hx - 7, hy - 8, 14, 14, 4)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = INK
    ctx.fillRect(hx - 4, hy - 3, 2, 2)
    ctx.fillRect(hx + 2, hy - 3, 2, 2)
    ctx.beginPath()
    ctx.arc(hx, hy + 3, 3, 0, Math.PI)
    ctx.stroke()
  }
  // placard
  const wave = Math.sin(t * 5 + seed) * 0.15
  ctx.save()
  ctx.translate(x + s / 2, y - 16)
  ctx.rotate(wave)
  ctx.fillStyle = '#6d4c41'
  ctx.fillRect(-1.5, -6, 3, 22)
  ctx.fillStyle = '#fff8d6'
  rr(ctx, -22, -26, 44, 20, 3)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#e3000b'
  ctx.font = 'bold 9px "Space Grotesk", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(['PROTEST!', 'DHARNA', 'NO NO NO', 'HAI HAI!'][seed % 4], 0, -16)
  ctx.restore()
}

/* ---------------- collectibles ---------------- */

/** A vote: a mini ballot box with a ticked ballot sticking out. */
export function drawVote(ctx: Ctx, cx: number, cy: number, t: number) {
  const squash = Math.abs(Math.cos(t * 3))
  const w = 22 * (0.35 + 0.65 * squash)
  ctx.save()
  ctx.translate(cx, cy + Math.sin(t * 3) * 2)
  ctx.strokeStyle = INK
  ctx.lineWidth = 2
  ctx.fillStyle = '#fff'
  rr(ctx, -w * 0.3, -16, w * 0.6, 12, 2)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#ffd500'
  rr(ctx, -w / 2, -8, w, 16, 3)
  ctx.fill()
  ctx.stroke()
  if (squash > 0.5) {
    ctx.fillStyle = INK
    ctx.font = 'bold 10px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('✓', 0, 0)
  }
  ctx.restore()
}

/** "Vikas Boost": a little LEGO train power-up. */
export function drawBoost(ctx: Ctx, x: number, y: number, w: number, h: number) {
  ctx.strokeStyle = INK
  ctx.lineWidth = 2
  ctx.fillStyle = '#ff7a00'
  rr(ctx, x, y + 4, w, h - 10, 6)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#f4f4f4'
  ctx.fillRect(x + 4, y + 8, w - 8, 6)
  ctx.fillStyle = '#00b4d8'
  rr(ctx, x + 6, y + 9, 7, 5, 1)
  ctx.fill()
  rr(ctx, x + w - 13, y + 9, 7, 5, 1)
  ctx.fill()
  ctx.fillStyle = '#0055bf'
  ctx.fillRect(x + 2, y + h - 12, w - 4, 3)
  ctx.fillStyle = INK
  for (const wx of [x + 7, x + w - 7]) {
    ctx.beginPath()
    ctx.arc(wx, y + h - 5, 4, 0, Math.PI * 2)
    ctx.fill()
  }
}

/* ---------------- characters ---------------- */

interface FigStyle {
  skin: string
  shirt: string
  vest?: string
  legs: string
  hair: (ctx: Ctx, w: number, hy: number, hh: number) => void
  face: (ctx: Ctx, w: number, hy: number, hh: number, blink: boolean) => void
  scarf?: string
}

/**
 * Draws a minifig standing at (x, y) top-left with size w x h.
 * `phase` animates walking; `facing` flips horizontally.
 */
function drawFig(ctx: Ctx, x: number, y: number, w: number, h: number, facing: 1 | -1, phase: number, st: FigStyle, opts: { squash?: number; armsUp?: boolean; t: number }) {
  ctx.save()
  ctx.translate(x + w / 2, y)
  ctx.scale(facing, 1)
  if (opts.squash) {
    ctx.translate(0, h * (1 - opts.squash))
    ctx.scale(1, opts.squash)
  }
  ctx.translate(-w / 2, 0)
  ctx.strokeStyle = INK
  ctx.lineWidth = 2
  ctx.lineJoin = 'round'

  const headH = h * 0.4
  const torsoY = headH + h * 0.03
  const torsoH = h * 0.3
  const legY = torsoY + torsoH
  const legH = h - legY
  const swing = Math.sin(phase) * legH * 0.35

  // legs
  ctx.fillStyle = st.legs
  for (const [lx, dx] of [[w * 0.18, swing], [w * 0.52, -swing]] as const) {
    ctx.save()
    ctx.translate(lx + w * 0.15, legY)
    ctx.rotate(dx / legH)
    rr(ctx, -w * 0.15, 0, w * 0.3, legH, 3)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }
  // hips
  rr(ctx, w * 0.14, legY - 3, w * 0.72, 7, 2)
  ctx.fill()
  ctx.stroke()

  // back arm
  const armSwing = opts.armsUp ? -2.6 : -Math.sin(phase) * 0.6
  const arm = (ax: number, rot: number, front: boolean) => {
    ctx.save()
    ctx.translate(ax, torsoY + 4)
    ctx.rotate(rot)
    ctx.fillStyle = st.vest && !front ? st.shirt : st.shirt
    rr(ctx, -4, 0, 8, torsoH * 0.85, 4)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = st.skin
    ctx.beginPath()
    ctx.arc(0, torsoH * 0.9, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }
  arm(w * 0.22, armSwing, false)

  // torso trapezoid
  ctx.fillStyle = st.shirt
  ctx.beginPath()
  ctx.moveTo(w * 0.24, torsoY)
  ctx.lineTo(w * 0.76, torsoY)
  ctx.lineTo(w * 0.86, legY)
  ctx.lineTo(w * 0.14, legY)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  if (st.vest) {
    // sleeveless "Nehru jacket"
    ctx.fillStyle = st.vest
    ctx.beginPath()
    ctx.moveTo(w * 0.27, torsoY + 1)
    ctx.lineTo(w * 0.46, torsoY + 1)
    ctx.lineTo(w * 0.5, legY - 1)
    ctx.lineTo(w * 0.17, legY - 1)
    ctx.closePath()
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(w * 0.54, torsoY + 1)
    ctx.lineTo(w * 0.73, torsoY + 1)
    ctx.lineTo(w * 0.83, legY - 1)
    ctx.lineTo(w * 0.5, legY - 1)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#ffd500'
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()
      ctx.arc(w * 0.55, torsoY + 6 + i * (torsoH / 3.4), 1.6, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  if (st.scarf) {
    ctx.fillStyle = st.scarf
    rr(ctx, w * 0.26, torsoY - 3, w * 0.48, 8, 3)
    ctx.fill()
    ctx.stroke()
    rr(ctx, w * 0.56, torsoY + 2, 7, torsoH * 0.55, 2)
    ctx.fill()
    ctx.stroke()
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'
    ctx.beginPath()
    ctx.moveTo(w * 0.58, torsoY + 8)
    ctx.lineTo(w * 0.58 + 5, torsoY + 8)
    ctx.moveTo(w * 0.58, torsoY + 14)
    ctx.lineTo(w * 0.58 + 5, torsoY + 14)
    ctx.stroke()
    ctx.strokeStyle = INK
  }

  // head (cylinder with stud)
  const hw = w * 0.82
  const hx = (w - hw) / 2
  ctx.fillStyle = st.skin
  rr(ctx, w * 0.4, -5, w * 0.2, 7, 2)
  ctx.fill()
  ctx.stroke()
  rr(ctx, hx, 0, hw, headH, 6)
  ctx.fill()
  ctx.stroke()
  ctx.save()
  ctx.translate(hx, 0)
  const blink = Math.sin(opts.t * 1.3 + x * 0.01) > 0.97
  st.face(ctx, hw, 0, headH, blink)
  st.hair(ctx, hw, 0, headH)
  ctx.restore()

  // front arm
  arm(w * 0.78, opts.armsUp ? 2.6 : Math.sin(phase) * 0.6, true)
  ctx.restore()
}

const eyes = (ctx: Ctx, w: number, y: number, blink: boolean, gap = 0.22) => {
  ctx.fillStyle = INK
  for (const ex of [w * (0.5 - gap), w * (0.5 + gap) - 3]) {
    if (blink) ctx.fillRect(ex, y + 1, 4, 1.5)
    else rr(ctx, ex, y - 1, 3.5, 5, 1.5), ctx.fill()
  }
}

const glasses = (ctx: Ctx, w: number, y: number, rimless = false) => {
  ctx.strokeStyle = rimless ? 'rgba(17,17,17,0.55)' : INK
  ctx.lineWidth = rimless ? 1.2 : 1.8
  for (const ex of [w * 0.28, w * 0.72]) {
    rr(ctx, ex - 6, y - 4, 12, 9, 3)
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.moveTo(w * 0.28 + 6, y)
  ctx.lineTo(w * 0.72 - 6, y)
  ctx.stroke()
  ctx.strokeStyle = INK
  ctx.lineWidth = 2
}

/** "NaMo": white hair & neat white beard, rimless glasses, white kurta + saffron jacket. */
export const MODI: FigStyle = {
  skin: '#d9a066',
  shirt: '#fbfbf5',
  vest: '#ff9933',
  legs: '#fbfbf5',
  face: (ctx, w, _y, h, blink) => {
    eyes(ctx, w, h * 0.36, blink)
    glasses(ctx, w, h * 0.38, true)
    // beard
    ctx.fillStyle = '#f2f2f2'
    ctx.beginPath()
    ctx.moveTo(1, h * 0.5)
    ctx.quadraticCurveTo(w * 0.12, h * 1.12, w * 0.5, h * 1.08)
    ctx.quadraticCurveTo(w * 0.88, h * 1.12, w - 1, h * 0.5)
    ctx.lineTo(w - 4, h * 0.66)
    ctx.quadraticCurveTo(w * 0.5, h * 0.6, 4, h * 0.66)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    // moustache + smile
    ctx.fillStyle = '#e8e8e8'
    rr(ctx, w * 0.28, h * 0.58, w * 0.44, 5, 3)
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(w * 0.5, h * 0.72, 4, 0.15 * Math.PI, 0.85 * Math.PI)
    ctx.stroke()
  },
  hair: (ctx, w, _y, h) => {
    ctx.fillStyle = '#f2f2f2'
    ctx.beginPath()
    ctx.moveTo(-2, h * 0.36)
    ctx.quadraticCurveTo(-3, -4, w * 0.5, -3)
    ctx.quadraticCurveTo(w + 3, -4, w + 2, h * 0.36)
    ctx.lineTo(w - 2, h * 0.22)
    ctx.quadraticCurveTo(w * 0.5, h * 0.06, 2, h * 0.22)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  },
}

/** "RaGa": dark tousled hair, salt-and-pepper stubble, signature white tee. */
export const RAHUL: FigStyle = {
  skin: '#e0b07a',
  shirt: '#ffffff',
  legs: '#2b4c7e',
  face: (ctx, w, _y, h, blink) => {
    eyes(ctx, w, h * 0.38, blink)
    ctx.fillStyle = 'rgba(90,90,90,0.55)'
    ctx.beginPath()
    ctx.moveTo(2, h * 0.5)
    ctx.quadraticCurveTo(w * 0.5, h * 1.05, w - 2, h * 0.5)
    ctx.lineTo(w - 2, h * 0.95)
    ctx.lineTo(2, h * 0.95)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = INK
    ctx.beginPath()
    ctx.arc(w * 0.5, h * 0.66, 4.5, 0.1 * Math.PI, 0.9 * Math.PI)
    ctx.fill()
  },
  hair: (ctx, w, _y, h) => {
    ctx.fillStyle = '#2a2420'
    ctx.beginPath()
    ctx.moveTo(-2, h * 0.32)
    ctx.lineTo(-1, h * 0.05)
    ctx.lineTo(w * 0.2, -5)
    ctx.lineTo(w * 0.35, 0)
    ctx.lineTo(w * 0.5, -6)
    ctx.lineTo(w * 0.68, 0)
    ctx.lineTo(w * 0.85, -4)
    ctx.lineTo(w + 2, h * 0.1)
    ctx.lineTo(w + 2, h * 0.32)
    ctx.quadraticCurveTo(w * 0.5, h * 0.12, -2, h * 0.32)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  },
}

/** "Kejri": white cap, moustache, glasses, cosy muffler and sweater. */
export const KEJRIWAL: FigStyle = {
  skin: '#d8a46e',
  shirt: '#3a6ea5',
  legs: '#6d6d6d',
  scarf: '#9aa5b1',
  face: (ctx, w, _y, h, blink) => {
    eyes(ctx, w, h * 0.42, blink)
    glasses(ctx, w, h * 0.44)
    ctx.fillStyle = '#1b1b1b'
    rr(ctx, w * 0.3, h * 0.64, w * 0.4, 4, 2)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(w * 0.4, h * 0.82)
    ctx.lineTo(w * 0.6, h * 0.82)
    ctx.stroke()
  },
  hair: (ctx, w, _y, h) => {
    // white "topi"
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.moveTo(-1, h * 0.24)
    ctx.quadraticCurveTo(w * 0.5, h * 0.3, w + 1, h * 0.24)
    ctx.lineTo(w * 0.88, -3)
    ctx.quadraticCurveTo(w * 0.5, -6, w * 0.12, -3)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(w * 0.2, h * 0.08)
    ctx.quadraticCurveTo(w * 0.5, h * 0.02, w * 0.8, h * 0.08)
    ctx.stroke()
    ctx.lineWidth = 2
  },
}

export function drawHero(ctx: Ctx, x: number, y: number, w: number, h: number, facing: 1 | -1, phase: number, t: number, opts: { armsUp?: boolean; flash?: boolean } = {}) {
  if (opts.flash && Math.floor(t * 12) % 2 === 0) ctx.globalAlpha = 0.35
  drawFig(ctx, x, y, w, h, facing, phase, MODI, { t, armsUp: opts.armsUp })
  ctx.globalAlpha = 1
}

export function drawFoe(ctx: Ctx, kind: 'rahul' | 'kejriwal', x: number, y: number, w: number, h: number, facing: 1 | -1, phase: number, t: number, squash?: number) {
  drawFig(ctx, x, y, w, h, facing, phase, kind === 'rahul' ? RAHUL : KEJRIWAL, { t, squash })
}

export function drawFlag(ctx: Ctx, x: number, groundY: number, poleH: number, flagY: number, t: number) {
  ctx.strokeStyle = INK
  ctx.lineWidth = 2
  ctx.fillStyle = '#9aa5b1'
  rr(ctx, x - 3, groundY - poleH, 6, poleH, 3)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#ffd500'
  ctx.beginPath()
  ctx.arc(x, groundY - poleH - 5, 7, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  // tricolour pennant with chakra
  const wave = Math.sin(t * 4) * 3
  const fw = 54
  const bands = ['#ff9933', '#ffffff', '#138808']
  bands.forEach((c, i) => {
    ctx.fillStyle = c
    ctx.beginPath()
    ctx.moveTo(x + 3, flagY + i * 11)
    ctx.quadraticCurveTo(x + fw / 2, flagY + i * 11 + wave, x + fw, flagY + i * 11)
    ctx.lineTo(x + fw, flagY + (i + 1) * 11)
    ctx.quadraticCurveTo(x + fw / 2, flagY + (i + 1) * 11 + wave, x + 3, flagY + (i + 1) * 11)
    ctx.closePath()
    ctx.fill()
  })
  ctx.strokeRect(x + 3, flagY, fw - 3, 33)
  ctx.strokeStyle = '#000080'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.arc(x + fw / 2, flagY + 16.5 + wave / 2, 4, 0, Math.PI * 2)
  ctx.stroke()
  ctx.lineWidth = 2
}

export function drawCloud(ctx: Ctx, x: number, y: number, s: number) {
  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'
  ctx.lineWidth = 2
  for (const [dx, dy, r] of [[0, 0, 18], [20, -8, 22], [42, 0, 18], [20, 6, 18]]) {
    ctx.beginPath()
    ctx.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2)
    ctx.fill()
  }
}
