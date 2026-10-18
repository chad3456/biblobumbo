import * as THREE from 'three'
import type { Face, Gender, Pattern } from '../lib/types'

const cache = new Map<string, THREE.CanvasTexture>()

function make(key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, repeatX = 1) {
  const hit = cache.get(key)
  if (hit) return hit
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  draw(ctx, w, h)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.repeat.set(repeatX, 1)
  tex.anisotropy = 4
  cache.set(key, tex)
  return tex
}

/** Face wraps the head cylinder; front of the face is at u = 0.5. */
export function faceTexture(face: Face, skin: string, gender: Gender, jewellery: boolean): THREE.CanvasTexture {
  return make(`face:${face}:${skin}:${gender}:${jewellery}`, 1024, 256, (ctx, w, h) => {
    ctx.fillStyle = skin
    ctx.fillRect(0, 0, w, h)
    const cx = w / 2
    const ey = h / 2 - 20
    const ex = 44
    ctx.fillStyle = '#111'
    ctx.strokeStyle = '#111'
    ctx.lineCap = 'round'
    ctx.lineWidth = 9
    const eye = (x: number) => {
      ctx.beginPath()
      ctx.ellipse(x, ey, 11, 14, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(x - 3, ey - 5, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#111'
    }
    const happy = (x: number) => {
      ctx.beginPath()
      ctx.arc(x, ey + 6, 13, Math.PI * 1.1, Math.PI * 1.9)
      ctx.stroke()
    }
    if (face === 'joy') { happy(cx - ex); happy(cx + ex) }
    else if (face === 'wink') { eye(cx - ex); happy(cx + ex) }
    else if (face === 'calm') {
      ctx.beginPath()
      ctx.arc(cx - ex, ey - 2, 12, Math.PI * 0.15, Math.PI * 0.85)
      ctx.arc(cx + ex, ey - 2, 12, Math.PI * 0.15, Math.PI * 0.85)
      ctx.stroke()
    } else { eye(cx - ex); eye(cx + ex) }

    // kajal / lashes for female figurines
    if (gender === 'female' && face !== 'calm') {
      ctx.lineWidth = 4
      for (const s of [-1, 1]) {
        ctx.beginPath()
        ctx.moveTo(cx + s * ex + s * 12, ey - 8)
        ctx.lineTo(cx + s * ex + s * 20, ey - 14)
        ctx.stroke()
      }
    }

    // brows
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.moveTo(cx - ex - 16, ey - 30)
    ctx.quadraticCurveTo(cx - ex, ey - 38, cx - ex + 14, ey - 32)
    ctx.moveTo(cx + ex - 14, ey - 32)
    ctx.quadraticCurveTo(cx + ex, ey - 38, cx + ex + 16, ey - 30)
    ctx.stroke()

    // mouth
    const my = h / 2 + 34
    ctx.lineWidth = 8
    if (face === 'joy' || face === 'wink') {
      ctx.fillStyle = '#111'
      ctx.beginPath()
      ctx.moveTo(cx - 40, my - 10)
      ctx.quadraticCurveTo(cx, my + 42, cx + 40, my - 10)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = '#e57373'
      ctx.beginPath()
      ctx.ellipse(cx, my + 12, 16, 8, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.fillRect(cx - 28, my - 8, 56, 8)
    } else {
      ctx.beginPath()
      ctx.arc(cx, my - 22, 34, Math.PI * 0.22, Math.PI * 0.78)
      ctx.stroke()
    }

    if (gender === 'female') {
      // bindi
      ctx.fillStyle = '#d50000'
      ctx.beginPath()
      ctx.arc(cx, ey - 48, 8, 0, Math.PI * 2)
      ctx.fill()
      // lip colour
      if (face !== 'joy' && face !== 'wink') {
        ctx.strokeStyle = '#c2185b'
        ctx.lineWidth = 6
        ctx.beginPath()
        ctx.arc(cx, my - 22, 34, Math.PI * 0.3, Math.PI * 0.7)
        ctx.stroke()
      }
      if (jewellery) {
        // nath (nose ring)
        ctx.strokeStyle = '#ffc400'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.arc(cx + 14, my - 26, 12, -0.5, Math.PI * 1.2)
        ctx.stroke()
      }
    } else {
      // tilak + moustache
      ctx.fillStyle = '#d84315'
      ctx.fillRect(cx - 4, ey - 66, 8, 30)
      ctx.fillStyle = '#ffb300'
      ctx.beginPath()
      ctx.arc(cx, ey - 38, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#1b1b1b'
      ctx.beginPath()
      ctx.moveTo(cx, my - 18)
      ctx.quadraticCurveTo(cx - 30, my - 30, cx - 50, my - 10)
      ctx.quadraticCurveTo(cx - 30, my - 20, cx, my - 10)
      ctx.quadraticCurveTo(cx + 30, my - 20, cx + 50, my - 10)
      ctx.quadraticCurveTo(cx + 30, my - 30, cx, my - 18)
      ctx.fill()
    }

    // blush
    ctx.fillStyle = 'rgba(255,82,82,0.25)'
    ctx.beginPath()
    ctx.ellipse(cx - 74, h / 2 + 14, 18, 10, 0, 0, Math.PI * 2)
    ctx.ellipse(cx + 74, h / 2 + 14, 18, 10, 0, 0, Math.PI * 2)
    ctx.fill()
  })
}

function mirror(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, accent: string) {
  ctx.fillStyle = accent
  ctx.beginPath()
  ctx.arc(x, y, r + 4, 0, Math.PI * 2)
  ctx.fill()
  const g = ctx.createRadialGradient(x - r / 3, y - r / 3, 1, x, y, r)
  g.addColorStop(0, '#ffffff')
  g.addColorStop(0.5, '#cfd8dc')
  g.addColorStop(1, '#78909c')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
}

/**
 * Fabric for the chaniya / kediyu / odhni: body pattern + embroidered border at
 * the bottom edge (v = 0 is the hem on cylinders).
 */
export function fabricTexture(base: string, accent: string, pattern: Pattern, border = true): THREE.CanvasTexture {
  return make(`fabric:${base}:${accent}:${pattern}:${border}`, 512, 256, (ctx, w, h) => {
    ctx.fillStyle = base
    ctx.fillRect(0, 0, w, h)
    const bodyH = border ? h * 0.72 : h
    if (pattern === 'leheriya') {
      ctx.strokeStyle = accent
      ctx.globalAlpha = 0.55
      ctx.lineWidth = 7
      for (let i = -h; i < w + h; i += 26) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i + bodyH, bodyH)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    } else if (pattern === 'bandhani') {
      ctx.fillStyle = '#fff8e1'
      for (let y = 10; y < bodyH - 6; y += 18) {
        for (let x = (y / 18) % 2 ? 10 : 19; x < w; x += 18) {
          ctx.beginPath()
          ctx.arc(x, y, 3, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.fillStyle = accent
      for (let y = 28; y < bodyH - 20; y += 72) {
        for (let x = 36; x < w; x += 72) {
          for (let k = 0; k < 6; k++) {
            const a = (k / 6) * Math.PI * 2
            ctx.beginPath()
            ctx.arc(x + Math.cos(a) * 10, y + Math.sin(a) * 10, 3.5, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }
    } else if (pattern === 'mirror') {
      for (let y = 26; y < bodyH - 10; y += 52) {
        for (let x = (y / 52) % 2 < 1 ? 32 : 6; x < w; x += 52) mirror(ctx, x, y, 7, accent)
      }
      ctx.strokeStyle = accent
      ctx.lineWidth = 3
      ctx.setLineDash([6, 6])
      for (let y = 52; y < bodyH; y += 52) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }
      ctx.setLineDash([])
    }
    if (border) {
      // embroidered hem: accent band + zig-zag + mirrors
      ctx.fillStyle = accent
      ctx.fillRect(0, bodyH, w, h - bodyH)
      ctx.fillStyle = base
      ctx.beginPath()
      for (let x = 0; x <= w; x += 32) {
        ctx.lineTo(x, bodyH + 10)
        ctx.lineTo(x + 16, bodyH + 30)
      }
      ctx.lineTo(w, bodyH + 10)
      ctx.lineTo(w, bodyH)
      ctx.lineTo(0, bodyH)
      ctx.fill()
      for (let x = 16; x < w; x += 32) mirror(ctx, x, h - 20, 7, '#212121')
      ctx.fillStyle = '#212121'
      ctx.fillRect(0, h - 6, w, 6)
    }
  }, 3)
}

/** Striped wooden dandiya stick. */
export function stickTexture(color: string): THREE.CanvasTexture {
  return make(`stick:${color}`, 32, 256, (ctx, w, h) => {
    ctx.fillStyle = color
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#ffd54f'
    for (let y = 8; y < h; y += 40) ctx.fillRect(0, y, w, 10)
    ctx.fillStyle = '#212121'
    for (let y = 22; y < h; y += 40) ctx.fillRect(0, y, w, 4)
  })
}
