import * as THREE from 'three'
import type { FaceStyle, TorsoPrint } from '../lib/types'

const cache = new Map<string, THREE.CanvasTexture>()

function cached(key: string, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, w: number, h: number) {
  const hit = cache.get(key)
  if (hit) return hit
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  draw(ctx, w, h)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  cache.set(key, tex)
  return tex
}

/** Wraps around the head cylinder; the face is drawn at u = 0.5 (front). */
export function faceTexture(face: FaceStyle, skin: string): THREE.CanvasTexture {
  return cached(`face:${face}:${skin}`, (ctx, w, h) => {
    ctx.fillStyle = skin
    ctx.fillRect(0, 0, w, h)
    const cx = w / 2
    const cy = h / 2
    ctx.fillStyle = '#111'
    ctx.strokeStyle = '#111'
    ctx.lineCap = 'round'
    ctx.lineWidth = 9

    const eye = (x: number, y: number, r = 13) => {
      ctx.beginPath()
      ctx.ellipse(x, y, r * 0.8, r, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(x - 3, y - 4, r * 0.3, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#111'
    }
    const closedEye = (x: number, y: number) => {
      ctx.beginPath()
      ctx.arc(x, y + 4, 12, Math.PI * 1.1, Math.PI * 1.9)
      ctx.stroke()
    }
    const ex = 42
    const ey = cy - 22

    switch (face) {
      case 'wink':
        eye(cx - ex, ey)
        closedEye(cx + ex, ey)
        break
      case 'sleepy':
        ctx.beginPath()
        ctx.moveTo(cx - ex - 14, ey + 2)
        ctx.lineTo(cx - ex + 14, ey + 2)
        ctx.moveTo(cx + ex - 14, ey + 2)
        ctx.lineTo(cx + ex + 14, ey + 2)
        ctx.stroke()
        break
      case 'shook':
        eye(cx - ex, ey, 17)
        eye(cx + ex, ey, 17)
        break
      default:
        eye(cx - ex, ey)
        eye(cx + ex, ey)
    }

    // brows
    ctx.lineWidth = 6
    ctx.beginPath()
    if (face === 'smirk') {
      ctx.moveTo(cx - ex - 14, ey - 30); ctx.lineTo(cx - ex + 12, ey - 26)
      ctx.moveTo(cx + ex - 12, ey - 30); ctx.lineTo(cx + ex + 14, ey - 38)
    } else if (face === 'shook') {
      ctx.moveTo(cx - ex - 14, ey - 38); ctx.quadraticCurveTo(cx - ex, ey - 46, cx - ex + 14, ey - 38)
      ctx.moveTo(cx + ex - 14, ey - 38); ctx.quadraticCurveTo(cx + ex, ey - 46, cx + ex + 14, ey - 38)
    } else {
      ctx.moveTo(cx - ex - 14, ey - 30); ctx.lineTo(cx - ex + 12, ey - 32)
      ctx.moveTo(cx + ex - 12, ey - 32); ctx.lineTo(cx + ex + 14, ey - 30)
    }
    ctx.stroke()

    // mouth
    ctx.lineWidth = 9
    const my = cy + 30
    ctx.beginPath()
    switch (face) {
      case 'grin':
        ctx.fillStyle = '#111'
        ctx.moveTo(cx - 48, my - 8)
        ctx.quadraticCurveTo(cx, my + 50, cx + 48, my - 8)
        ctx.closePath()
        ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.fillRect(cx - 34, my - 5, 68, 10)
        break
      case 'smirk':
        ctx.moveTo(cx - 30, my + 6)
        ctx.quadraticCurveTo(cx + 10, my + 18, cx + 38, my - 8)
        ctx.stroke()
        break
      case 'shook':
        ctx.ellipse(cx, my + 8, 16, 22, 0, 0, Math.PI * 2)
        ctx.fill()
        break
      case 'sleepy':
        ctx.moveTo(cx - 20, my + 8)
        ctx.lineTo(cx + 20, my + 8)
        ctx.stroke()
        ctx.font = 'bold 34px sans-serif'
        ctx.fillText('z', cx + 70, ey - 20)
        ctx.font = 'bold 24px sans-serif'
        ctx.fillText('z', cx + 96, ey - 44)
        break
      default:
        ctx.arc(cx, my - 20, 40, Math.PI * 0.2, Math.PI * 0.8)
        ctx.stroke()
    }

    // blush
    ctx.fillStyle = 'rgba(255,95,162,0.35)'
    ctx.beginPath()
    ctx.ellipse(cx - 70, cy + 14, 16, 9, 0, 0, Math.PI * 2)
    ctx.ellipse(cx + 70, cy + 14, 16, 9, 0, 0, Math.PI * 2)
    ctx.fill()
  }, 1024, 256)
}

function star(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 ? r * 0.45 : r
    const a = (Math.PI / 5) * i - Math.PI / 2
    ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad)
  }
  ctx.closePath()
  ctx.fill()
}

/** Transparent decal laid over the front of the torso. */
export function printTexture(print: TorsoPrint, torso: string): THREE.CanvasTexture {
  return cached(`print:${print}:${torso}`, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    const light = isLight(torso)
    const ink = light ? '#1b1b1b' : '#ffffff'
    const cx = w / 2
    const cy = h / 2 + 10
    ctx.fillStyle = ink
    ctx.strokeStyle = ink
    ctx.lineWidth = 10
    switch (print) {
      case 'stripe':
        ctx.fillStyle = light ? '#e3000b' : '#ffd500'
        ctx.fillRect(0, cy - 30, w, 26)
        ctx.fillStyle = ink
        ctx.fillRect(0, cy + 14, w, 14)
        break
      case 'heart':
        ctx.fillStyle = '#ff2d55'
        ctx.beginPath()
        ctx.moveTo(cx, cy + 50)
        ctx.bezierCurveTo(cx - 90, cy - 10, cx - 40, cy - 80, cx, cy - 30)
        ctx.bezierCurveTo(cx + 40, cy - 80, cx + 90, cy - 10, cx, cy + 50)
        ctx.fill()
        break
      case 'star':
        ctx.fillStyle = '#ffd500'
        star(ctx, cx, cy, 64)
        ctx.strokeStyle = '#1b1b1b'
        ctx.lineWidth = 4
        ctx.stroke()
        break
      case 'bolt':
        ctx.fillStyle = '#ffd500'
        ctx.beginPath()
        ctx.moveTo(cx + 20, cy - 80)
        ctx.lineTo(cx - 40, cy + 8)
        ctx.lineTo(cx, cy + 8)
        ctx.lineTo(cx - 20, cy + 80)
        ctx.lineTo(cx + 44, cy - 12)
        ctx.lineTo(cx + 4, cy - 12)
        ctx.closePath()
        ctx.fill()
        break
      case 'book':
        ctx.fillStyle = '#fff'
        ctx.strokeStyle = '#1b1b1b'
        ctx.lineWidth = 5
        ctx.beginPath()
        ctx.moveTo(cx, cy - 34)
        ctx.quadraticCurveTo(cx - 40, cy - 52, cx - 80, cy - 40)
        ctx.lineTo(cx - 80, cy + 40)
        ctx.quadraticCurveTo(cx - 40, cy + 28, cx, cy + 46)
        ctx.quadraticCurveTo(cx + 40, cy + 28, cx + 80, cy + 40)
        ctx.lineTo(cx + 80, cy - 40)
        ctx.quadraticCurveTo(cx + 40, cy - 52, cx, cy - 34)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(cx, cy - 34)
        ctx.lineTo(cx, cy + 46)
        ctx.stroke()
        break
      default:
        // plain: tiny collar "V"
        ctx.lineWidth = 6
        ctx.beginPath()
        ctx.moveTo(cx - 30, 20)
        ctx.lineTo(cx, 56)
        ctx.lineTo(cx + 30, 20)
        ctx.stroke()
    }
  }, 256, 256)
}

export function isLight(hex: string): boolean {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return 0.299 * r + 0.587 * g + 0.114 * b > 160
}
