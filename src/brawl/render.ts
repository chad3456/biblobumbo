import * as THREE from 'three'
import { CLASSES, ENEMIES, type ClassId, type EnemyId } from './data'
import { ARENA, OBSTACLES, type Brawl, type Fighter, type GameEvent } from './engine'

/* ---------------- helpers ---------------- */

const mat = (color: string) => new THREE.MeshLambertMaterial({ color, flatShading: true })

function box(w: number, h: number, d: number, m: THREE.Material, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m)
  mesh.position.set(x, y, z)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

function canvasTex(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, repeat?: [number, number]) {
  const cv = document.createElement('canvas')
  cv.width = w
  cv.height = h
  draw(cv.getContext('2d')!)
  const t = new THREE.CanvasTexture(cv)
  t.colorSpace = THREE.SRGBColorSpace
  t.magFilter = THREE.NearestFilter
  t.minFilter = THREE.NearestFilter
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(...repeat)
  }
  return t
}

const SKINS = ['#e7b48f', '#c98c62', '#a8714a', '#8a5a3a', '#6e452c', '#d9a37a']
const HAIRS = ['#1d1612', '#2b1f17', '#3a2a1e', '#15100c']

/* ---------------- fighter model ---------------- */

interface Limb { upper: THREE.Group; lower: THREE.Group }

class FighterModel {
  root = new THREE.Group()
  body = new THREE.Group()
  torso = new THREE.Group()
  head = new THREE.Group()
  armL: Limb
  armR: Limb
  legL: Limb
  legR: Limb
  mats: THREE.MeshLambertMaterial[] = []
  stars: THREE.Group
  ring?: THREE.Mesh
  prop?: THREE.Group
  phase = Math.random() * 10

  constructor(f: Fighter) {
    const colors = f.team === 'hero'
      ? { ...CLASSES[f.kind as ClassId].colors, band: f.player === 1 ? '#3d7dd8' : CLASSES[f.kind as ClassId].colors.band }
      : f.team === 'enemy' ? ENEMIES[f.kind as EnemyId].colors : { shirt: '#f2efe6', pants: '#7b6a58', band: '#f2efe6' }
    const skin = SKINS[f.id % SKINS.length]
    const hair = HAIRS[f.id % HAIRS.length]
    const m = (c: string) => { const x = mat(c); this.mats.push(x); return x }
    const shirt = m(colors.shirt)
    const pants = m(colors.pants)
    const skinM = m(skin)
    const hairM = m(hair)

    this.root.add(this.body)
    this.body.position.y = 0.9
    // hips + torso
    this.body.add(box(0.46, 0.2, 0.28, pants, 0, 0.02, 0))
    this.body.add(this.torso)
    this.torso.add(box(0.5, 0.62, 0.3, shirt, 0, 0.42, 0))
    // collar / skin at neck
    this.torso.add(box(0.14, 0.08, 0.14, skinM, 0, 0.77, 0))
    // head
    this.head.position.y = 0.95
    this.torso.add(this.head)
    this.head.add(box(0.3, 0.32, 0.3, skinM, 0, 0.0, 0))
    this.head.add(box(0.32, 0.12, 0.32, hairM, 0, 0.17, -0.01))
    this.head.add(box(0.32, 0.22, 0.08, hairM, 0, 0.06, -0.13))
    // eyes facing +z
    const eye = m('#1a1410')
    this.head.add(box(0.05, 0.05, 0.02, eye, -0.07, 0.03, 0.155))
    this.head.add(box(0.05, 0.05, 0.02, eye, 0.07, 0.03, 0.155))
    if (f.team === 'hero' || f.kind === 'boss') this.head.add(box(0.33, 0.06, 0.33, m(colors.band), 0, 0.1, 0))

    const limb = (x: number, y: number, parent: THREE.Group, upperM: THREE.Material, lowerM: THREE.Material, w: number, len: number, handM?: THREE.Material): Limb => {
      const upper = new THREE.Group()
      upper.position.set(x, y, 0)
      parent.add(upper)
      upper.add(box(w, len, w, upperM, 0, -len / 2, 0))
      const lower = new THREE.Group()
      lower.position.y = -len
      upper.add(lower)
      lower.add(box(w * 0.9, len, w * 0.9, lowerM, 0, -len / 2, 0))
      if (handM) lower.add(box(w, w, w, handM, 0, -len - w / 2, 0))
      return { upper, lower }
    }
    this.armL = limb(0.32, 0.68, this.torso, shirt, skinM, 0.13, 0.28, skinM)
    this.armR = limb(-0.32, 0.68, this.torso, shirt, skinM, 0.13, 0.28, skinM)
    this.legL = limb(0.12, 0, this.body, pants, pants, 0.17, 0.43, m(f.team === 'enemy' ? '#2a2a2a' : '#f2efe6'))
    this.legR = limb(-0.12, 0, this.body, pants, pants, 0.17, 0.43, this.mats[this.mats.length - 1])

    // dizzy stars for knocked-down fighters
    this.stars = new THREE.Group()
    const starM = new THREE.MeshBasicMaterial({ color: '#ffe066' })
    for (let i = 0; i < 3; i++) {
      const s = new THREE.Mesh(new THREE.OctahedronGeometry(0.07), starM)
      s.position.set(Math.cos((i / 3) * Math.PI * 2) * 0.28, 0, Math.sin((i / 3) * Math.PI * 2) * 0.28)
      this.stars.add(s)
    }
    this.stars.visible = false
    this.root.add(this.stars)

    if (f.team === 'hero') {
      this.ring = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.58, 24), new THREE.MeshBasicMaterial({ color: f.player === 1 ? '#3d7dd8' : '#e04f2f', transparent: true, opacity: 0.85 }))
      this.ring.rotation.x = -Math.PI / 2
      this.ring.position.y = 0.03
      this.root.add(this.ring)
    }
    if (f.kind === 'boss') {
      // the gang leader carries a canteen chair
      this.prop = new THREE.Group()
      const wood = m('#8a5a34')
      this.prop.add(box(0.5, 0.06, 0.5, wood, 0, 0, 0))
      this.prop.add(box(0.5, 0.5, 0.06, wood, 0, 0.25, -0.22))
      for (const [x, z] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) this.prop.add(box(0.05, 0.45, 0.05, wood, x, -0.24, z))
      this.prop.position.set(0, -0.35, 0.25)
      this.prop.rotation.x = Math.PI / 2
      this.armR.lower.add(this.prop)
    }
    if (f.kind === 'civ') {
      // classmates carry a schoolbag
      this.torso.add(box(0.4, 0.42, 0.16, m('#3f6f9f'), 0, 0.42, -0.24))
    }
    this.root.scale.setScalar(f.scale)
  }

  setFlash(on: boolean) {
    for (const m of this.mats) m.emissive.setHex(on ? 0xffffff : 0x000000)
  }

  setOpacity(o: number) {
    for (const m of this.mats) {
      m.transparent = o < 1
      m.opacity = o
    }
  }

  /** Procedural animation from the fighter's state. */
  pose(f: Fighter, time: number) {
    const L = this.armL
    const R = this.armR
    const LL = this.legL
    const LR = this.legR
    const set = (l: Limb, ux: number, lx: number, uz = 0) => {
      l.upper.rotation.set(ux, 0, uz)
      l.lower.rotation.set(lx, 0, 0)
    }
    // defaults: fighting guard for heroes and rivals
    const guard = f.team !== 'civ'
    set(L, guard ? -0.5 : 0.05, guard ? -1.6 : 0, 0.15)
    set(R, guard ? -0.5 : 0.05, guard ? -1.6 : 0, -0.15)
    set(LL, 0, 0)
    set(LR, 0, 0)
    this.body.rotation.set(0, 0, 0)
    this.body.position.y = 0.9
    this.torso.rotation.set(0, 0, 0)
    this.head.rotation.set(0, 0, 0)
    this.stars.visible = false

    const bounce = Math.sin(time * 6 + this.phase) * 0.02
    switch (f.state) {
      case 'idle':
        this.body.position.y += bounce
        break
      case 'move': {
        this.phase += 0.16 * f.speed / 4
        const s = Math.sin(this.phase * 1.2)
        set(LL, s * 0.7, Math.max(0, -s) * 0.9)
        set(LR, -s * 0.7, Math.max(0, s) * 0.9)
        L.upper.rotation.x += -s * 0.4
        R.upper.rotation.x += s * 0.4
        this.body.position.y += Math.abs(s) * 0.05
        this.torso.rotation.x = 0.12
        break
      }
      case 'attack':
        this.attackPose(f)
        break
      case 'grab':
        set(L, -1.4, -0.3, -0.2)
        set(R, -1.4, -0.3, 0.2)
        this.torso.rotation.x = f.t > 0.2 ? -0.5 : 0.1
        break
      case 'held':
        set(LL, 0.3, 0.6)
        set(LR, -0.2, 0.4)
        set(L, -0.3, -0.4, 0.8)
        set(R, -0.3, -0.4, -0.8)
        break
      case 'hitstun':
        this.torso.rotation.x = -0.4
        this.head.rotation.x = -0.4
        set(L, 0.3, -0.3, 0.6)
        set(R, 0.3, -0.3, -0.6)
        break
      case 'down':
      case 'ko': {
        this.body.rotation.x = -Math.PI / 2
        this.body.position.y = 0.2
        set(L, -2.6, 0, 0.5)
        set(R, -2.8, -0.3, -0.3)
        set(LL, 0.2, 0.3)
        set(LR, -0.1, 0.6)
        this.stars.visible = true
        this.stars.position.set(0, 0.35, -0.9)
        this.stars.rotation.y = time * 5
        break
      }
      case 'getup': {
        const k = Math.min(1, f.t / 0.45)
        this.body.rotation.x = -Math.PI / 2 * (1 - k)
        this.body.position.y = 0.2 + 0.7 * k
        set(LL, -1.2 * (1 - k), 1.8 * (1 - k))
        set(LR, -1.2 * (1 - k), 1.8 * (1 - k))
        break
      }
      case 'dodge': {
        const k = Math.min(1, f.t / 0.34)
        this.body.rotation.x = k * Math.PI * 2
        this.body.position.y = 0.55
        set(LL, -1.6, 2.2)
        set(LR, -1.6, 2.2)
        set(L, -2, -1.5)
        set(R, -2, -1.5)
        break
      }
      case 'cower': {
        const shiver = Math.sin(time * 30 + this.phase) * 0.03
        this.body.position.y = 0.45
        set(LL, -1.6, 2.4)
        set(LR, -1.6, 2.4)
        set(L, -2.7, -1.6, 0.3)
        set(R, -2.7, -1.6, -0.3)
        this.torso.rotation.x = 0.5 + shiver
        break
      }
    }
  }

  private attackPose(f: Fighter) {
    const a = f.attack!
    const total = a.startup + a.active + a.recovery
    const t = f.t
    // extension: 0 → 1 during startup, held while active, back to 0 in recovery
    const ext = t < a.startup ? t / a.startup : t < a.startup + a.active ? 1 : Math.max(0, 1 - (t - a.startup - a.active) / a.recovery)
    const p = Math.min(1, t / total)
    const L = this.armL
    const R = this.armR
    const set = (l: Limb, ux: number, lx: number, uz = 0) => {
      l.upper.rotation.set(ux, 0, uz)
      l.lower.rotation.set(lx, 0, 0)
    }
    const side = f.comboIdx % 2 === 0 ? 1 : -1
    const lead = side === 1 ? L : R
    switch (a.anim) {
      case 'jab':
      case 'cross':
        set(lead, -0.5 - 1.1 * ext, -1.6 + 1.6 * ext)
        this.torso.rotation.y = side * 0.35 * ext
        this.torso.rotation.x = 0.15 * ext
        break
      case 'hook':
        set(lead, -1.4 * ext - 0.4, -1.3, side * 1.1 * ext)
        this.torso.rotation.y = -side * 0.7 * ext
        break
      case 'uppercut':
        set(lead, -0.2 - 2.6 * ext, -1.4 + 0.8 * ext)
        this.torso.rotation.x = -0.25 * ext
        this.body.position.y += 0.15 * ext
        break
      case 'kick':
      case 'teep':
        set(this.legL, -1.55 * ext, 0.3 * (1 - ext))
        this.torso.rotation.x = -0.3 * ext
        break
      case 'roundhouse':
        set(this.legR, -1.3 * ext, 0.2, -0.9 * ext)
        this.torso.rotation.z = 0.3 * ext
        this.torso.rotation.y = 1.0 * ext
        break
      case 'spinkick':
        this.body.rotation.y = p * Math.PI * 2
        set(this.legL, -0.5, 0, 1.3 * ext)
        this.body.position.y += 0.1 * ext
        break
      case 'flyingkick':
        this.body.position.y += Math.sin(p * Math.PI) * 0.7
        set(this.legL, -1.6, 0)
        set(this.legR, 0.3, 1.6)
        this.torso.rotation.x = -0.35
        break
      case 'palm':
        set(L, -1.5 * ext - 0.2, -0.3)
        set(R, -1.5 * ext - 0.2, -0.3)
        break
      case 'slam':
        set(L, t < a.startup ? -2.9 : -2.9 + 2.2 * ext, -0.3)
        set(R, t < a.startup ? -2.9 : -2.9 + 2.2 * ext, -0.3)
        this.torso.rotation.x = 0.4 * ext
        break
      case 'charge':
        this.torso.rotation.x = 0.55
        set(lead, -0.9, -1.0, side * 0.5)
        break
      case 'elbow':
        set(lead, -1.2 * ext - 0.4, -2.4, side * 0.6 * ext)
        this.torso.rotation.y = -side * 0.6 * ext
        break
      case 'knee':
        set(side === 1 ? this.legL : this.legR, -1.9 * ext, 2.2 * ext)
        set(L, -1.6, -1.2, -0.3)
        set(R, -1.6, -1.2, 0.3)
        this.torso.rotation.x = 0.2
        this.body.position.y += 0.12 * ext
        break
      case 'swing':
        set(R, -1.8, -0.2, -2.2 + 3.2 * p)
        set(L, -1.4, -0.4)
        this.torso.rotation.y = -1.0 + 2.0 * p
        break
      case 'throw':
        set(R, -2.8 + 2.4 * ext, -0.4)
        this.torso.rotation.y = -0.4 * ext
        break
    }
  }
}

/* ---------------- effects ---------------- */

interface Fx { obj: THREE.Object3D; life: number; max: number; vy: number; grow: number; mat: THREE.SpriteMaterial }

function starTexture() {
  return canvasTex(32, 32, (c) => {
    c.fillStyle = '#fff6c2'
    c.beginPath()
    for (let i = 0; i < 16; i++) {
      const r = i % 2 ? 6 : 16
      const a = (i / 16) * Math.PI * 2
      c.lineTo(16 + Math.cos(a) * r, 16 + Math.sin(a) * r)
    }
    c.fill()
  })
}

function dustTexture() {
  return canvasTex(32, 32, (c) => {
    c.fillStyle = 'rgba(236, 222, 196, 0.9)'
    for (const [x, y, r] of [[16, 18, 10], [9, 20, 7], [23, 20, 7], [16, 11, 7]]) {
      c.beginPath()
      c.arc(x, y, r, 0, Math.PI * 2)
      c.fill()
    }
  })
}

const textCache = new Map<string, THREE.Texture>()
function textTexture(text: string, color: string) {
  const key = text + color
  const hit = textCache.get(key)
  if (hit) return hit
  const t = canvasTex(128, 48, (c) => {
    c.font = 'bold 30px "Press Start 2P", monospace'
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    c.lineWidth = 6
    c.strokeStyle = '#1a1410'
    c.strokeText(text, 64, 26)
    c.fillStyle = color
    c.fillText(text, 64, 26)
  })
  textCache.set(key, t)
  return t
}

/* ---------------- arena ---------------- */

function buildArena(scene: THREE.Scene) {
  const W = ARENA.maxX - ARENA.minX
  const D = ARENA.maxZ - ARENA.minZ
  const floorTex = canvasTex(64, 64, (c) => {
    c.fillStyle = '#b79c78'
    c.fillRect(0, 0, 64, 64)
    c.fillStyle = '#a88d6a'
    c.fillRect(0, 0, 32, 32)
    c.fillRect(32, 32, 32, 32)
    c.fillStyle = 'rgba(70, 50, 30, 0.35)'
    c.fillRect(0, 0, 64, 1)
    c.fillRect(0, 32, 64, 1)
    c.fillRect(0, 0, 1, 64)
    c.fillRect(32, 0, 1, 64)
    for (let i = 0; i < 40; i++) {
      c.fillStyle = `rgba(60,40,20,${Math.random() * 0.12})`
      c.fillRect(Math.random() * 64, Math.random() * 64, 2, 2)
    }
  }, [W / 2, D / 2])
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshLambertMaterial({ map: floorTex }))
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)
  // outside ground (sunlit yard)
  const yard = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), mat('#d99a4e'))
  yard.rotation.x = -Math.PI / 2
  yard.position.y = -0.02
  yard.receiveShadow = true
  scene.add(yard)

  const wall = mat('#d8c3a0')
  const trim = mat('#7a5a3a')
  // back wall (z = min) and left wall (x = min) — the camera looks at these
  scene.add(box(W + 0.6, 3.2, 0.3, wall, 0, 1.6, ARENA.minZ - 0.15))
  scene.add(box(0.3, 3.2, D, wall, ARENA.minX - 0.15, 1.6, 0))
  scene.add(box(W + 0.6, 0.25, 0.4, trim, 0, 3.25, ARENA.minZ - 0.15))
  scene.add(box(0.4, 0.25, D, trim, ARENA.minX - 0.15, 3.25, 0))
  // low front edges so the floor reads as a room
  scene.add(box(W + 0.6, 0.25, 0.3, trim, 0, 0.12, ARENA.maxZ + 0.15))
  scene.add(box(0.3, 0.25, D, trim, ARENA.maxX + 0.15, 0.12, 0))
  // windows on the back wall
  const glass = new THREE.MeshLambertMaterial({ color: '#f6d98a', emissive: '#7a5a20' })
  for (const x of [-9, -1, 10]) scene.add(box(1.8, 1.0, 0.05, glass, x, 2.4, ARENA.minZ + 0.02))
  // doorway on the left wall
  scene.add(box(0.06, 2.2, 1.6, mat('#3a2a1e'), ARENA.minX + 0.01, 1.1, 3))

  const shutterTex = canvasTex(32, 32, (c) => {
    c.fillStyle = '#8f8f88'
    c.fillRect(0, 0, 32, 32)
    c.fillStyle = '#6f6f68'
    for (let y = 0; y < 32; y += 4) c.fillRect(0, y, 32, 1)
  }, [4, 3])
  const signTex = canvasTex(256, 48, (c) => {
    c.fillStyle = '#2a6f6a'
    c.fillRect(0, 0, 256, 48)
    c.fillStyle = '#f2efe6'
    c.font = 'bold 28px "Press Start 2P", monospace'
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    c.fillText('KANTIN', 128, 26)
  })

  for (const o of OBSTACLES) {
    const w = o.x1 - o.x0
    const d = o.z1 - o.z0
    const cx = (o.x0 + o.x1) / 2
    const cz = (o.z0 + o.z1) / 2
    if (o.kind === 'stall') {
      // food stall: counter, glass jars, shelves and an awning
      scene.add(box(w, 1.0, d, mat('#7a4b2e'), cx, 0.5, cz))
      scene.add(box(w, 0.08, d + 0.1, mat('#c9a36b'), cx, 1.04, cz))
      for (let x = o.x0 + 0.4; x < o.x1 - 0.2; x += 0.7) {
        const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.32, 8), new THREE.MeshLambertMaterial({ color: ['#e0b04a', '#c0563a', '#8fb06a', '#e6dcc8'][Math.round(x * 3) & 3], transparent: true, opacity: 0.9 }))
        jar.position.set(x, 1.24, cz + 0.2)
        jar.castShadow = true
        scene.add(jar)
      }
      scene.add(box(w, 0.1, 1.0, mat('#c84b31'), cx, 2.7, cz + 0.3))
      scene.add(box(w - 0.4, 0.06, 0.4, mat('#f2efe6'), cx, 2.0, cz - 0.4))
    } else if (o.kind === 'counter') {
      // drinks kiosk with a rolling shutter and sign
      scene.add(box(w, 2.6, d, new THREE.MeshLambertMaterial({ map: shutterTex }), cx, 1.3, cz))
      scene.add(box(w + 0.1, 0.12, d + 0.2, mat('#e8dcc6'), cx, 2.66, cz))
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.45), new THREE.MeshBasicMaterial({ map: signTex }))
      sign.position.set(o.x0 - 0.02, 2.2, cz)
      sign.rotation.y = -Math.PI / 2
      scene.add(sign)
    } else if (o.kind === 'table') {
      const wood = mat('#a8743f')
      const dark = mat('#6e4a28')
      scene.add(box(w, 0.08, d + 0.2, wood, cx, 0.78, cz))
      for (const [x, z] of [[o.x0 + 0.15, cz], [o.x1 - 0.15, cz]]) scene.add(box(0.1, 0.74, 0.5, dark, x, 0.37, z))
      // benches on both sides
      for (const s of [-1, 1]) {
        scene.add(box(w, 0.06, 0.32, wood, cx, 0.46, cz + s * 0.85))
        scene.add(box(0.08, 0.44, 0.2, dark, o.x0 + 0.2, 0.22, cz + s * 0.85))
        scene.add(box(0.08, 0.44, 0.2, dark, o.x1 - 0.2, 0.22, cz + s * 0.85))
      }
      // leftover cups and plates
      scene.add(box(0.25, 0.04, 0.25, mat('#f2efe6'), cx - 0.4, 0.84, cz))
      scene.add(box(0.12, 0.2, 0.12, mat('#d9534f'), cx + 0.5, 0.92, cz - 0.1))
    }
  }
}

/* ---------------- renderer ---------------- */

export class BrawlRenderer {
  renderer: THREE.WebGLRenderer
  scene = new THREE.Scene()
  camera: THREE.OrthographicCamera
  models = new Map<number, FighterModel>()
  projectiles = new Map<number, THREE.Mesh>()
  fx: Fx[] = []
  starTex = starTexture()
  dustTex = dustTexture()
  focus = new THREE.Vector3(0, 0, 2)
  pixel: number
  time = 0
  private viewSize = 13

  constructor(private canvas: HTMLCanvasElement, pixel = 3) {
    this.pixel = pixel
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false })
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.BasicShadowMap
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.scene.background = new THREE.Color('#e3a65a')
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200)

    const hemi = new THREE.HemisphereLight('#fff1d6', '#7a5a3a', 1.1)
    this.scene.add(hemi)
    const sun = new THREE.DirectionalLight('#ffe0a8', 2.2)
    sun.position.set(-9, 16, 6)
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 60 })
    this.scene.add(sun)
    buildArena(this.scene)
    this.resize()
  }

  resize() {
    const w = this.canvas.clientWidth || 800
    const h = this.canvas.clientHeight || 600
    // render at low resolution and let CSS upscale with hard pixels
    this.renderer.setPixelRatio(1 / this.pixel)
    this.renderer.setSize(w, h, false)
    const aspect = w / h
    const size = aspect < 1 ? this.viewSize * 1.25 : this.viewSize
    this.camera.left = (-size * aspect) / 2
    this.camera.right = (size * aspect) / 2
    this.camera.top = size / 2
    this.camera.bottom = -size / 2
    this.camera.updateProjectionMatrix()
  }

  private spawnSprite(tex: THREE.Texture, x: number, y: number, z: number, scale: number, life: number, vy = 0, grow = 1) {
    const m = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })
    const s = new THREE.Sprite(m)
    s.position.set(x, y, z)
    s.scale.setScalar(scale)
    s.renderOrder = 10
    this.scene.add(s)
    this.fx.push({ obj: s, life, max: life, vy, grow, mat: m })
  }

  handle(events: GameEvent[]) {
    for (const e of events) {
      switch (e.type) {
        case 'hit':
          this.spawnSprite(this.starTex, e.x + (Math.random() - 0.5) * 0.2, e.y, e.z, e.heavy ? 1.1 : 0.7, 0.18, 0, 2.5)
          this.spawnSprite(textTexture(String(e.damage), e.team === 'enemy' ? '#ffe066' : '#ff6b5b'), e.x, e.y + 0.5, e.z, 0.9, 0.7, 1.6, 0)
          break
        case 'land':
        case 'dodge':
          for (let i = 0; i < 3; i++) this.spawnSprite(this.dustTex, e.x + (Math.random() - 0.5) * 0.8, 0.25, e.z + (Math.random() - 0.5) * 0.8, 0.6, 0.45, 0.6, 1.2)
          break
        case 'ko':
          this.spawnSprite(textTexture('KO!', e.team === 'enemy' ? '#ffffff' : '#ff6b5b'), e.x, 2.4, e.z, 1.4, 1.0, 1.0, 0.2)
          break
        case 'revive':
          this.spawnSprite(textTexture('UP!', '#7ee081'), e.x, 2.4, e.z, 1.2, 1.0, 1.0, 0)
          break
        case 'throw':
          this.spawnSprite(this.starTex, e.x, 0.6, e.z, 1.6, 0.25, 0, 3)
          break
      }
    }
  }

  render(g: Brawl, dt: number) {
    this.time += dt
    // fighters
    const seen = new Set<number>()
    for (const f of g.fighters) {
      seen.add(f.id)
      let m = this.models.get(f.id)
      if (!m) {
        m = new FighterModel(f)
        this.models.set(f.id, m)
        this.scene.add(m.root)
      }
      m.root.position.set(f.x, f.y, f.z)
      m.root.rotation.y = f.facing
      m.pose(f, this.time)
      m.setFlash(f.flash > 0)
      if (f.team === 'enemy' && f.state === 'ko') m.setOpacity(Math.max(0, 1 - Math.max(0, f.dead - 1.6)))
      // invulnerable heroes blink
      m.root.visible = !(f.team === 'hero' && f.invuln > 0 && f.state !== 'dodge' && Math.floor(this.time * 20) % 2 === 0)
      if (m.ring) m.ring.visible = f.state !== 'ko'
    }
    for (const [id, m] of this.models) {
      if (!seen.has(id)) {
        this.scene.remove(m.root)
        this.models.delete(id)
      }
    }
    // projectiles (pink erasers)
    const pSeen = new Set<number>()
    for (const p of g.projectiles) {
      pSeen.add(p.id)
      let mesh = this.projectiles.get(p.id)
      if (!mesh) {
        mesh = box(0.24, 0.12, 0.14, mat('#f08fb0'))
        this.projectiles.set(p.id, mesh)
        this.scene.add(mesh)
      }
      mesh.position.set(p.x, 1.2, p.z)
      mesh.rotation.set(this.time * 20, this.time * 13, 0)
    }
    for (const [id, mesh] of this.projectiles) {
      if (!pSeen.has(id)) {
        this.scene.remove(mesh)
        this.projectiles.delete(id)
      }
    }
    // effects
    this.fx = this.fx.filter((f) => {
      f.life -= dt
      f.obj.position.y += f.vy * dt
      f.obj.scale.multiplyScalar(1 + f.grow * dt)
      f.mat.opacity = Math.max(0, f.life / f.max)
      if (f.life <= 0) {
        this.scene.remove(f.obj)
        f.mat.dispose()
        return false
      }
      return true
    })

    // camera: isometric, following the living heroes
    const heroes = g.heroes.filter((h) => h.state !== 'ko')
    const list = heroes.length ? heroes : g.heroes
    const cx = list.reduce((s, h) => s + h.x, 0) / Math.max(1, list.length)
    const cz = list.reduce((s, h) => s + h.z, 0) / Math.max(1, list.length)
    const tx = Math.max(-5, Math.min(5, cx * 0.6))
    const tz = Math.max(-3, Math.min(4, cz * 0.6))
    this.focus.lerp(new THREE.Vector3(tx, 0, tz), Math.min(1, dt * 3))
    const shake = g.shake * 0.18
    const sx = (Math.random() - 0.5) * shake
    const sy = (Math.random() - 0.5) * shake
    const d = 30
    this.camera.position.set(this.focus.x + d + sx, d * 0.95 + sy, this.focus.z + d)
    this.camera.lookAt(this.focus.x + sx, 0, this.focus.z)
    this.renderer.render(this.scene, this.camera)
  }

  /** Project a world point to CSS pixels (for HTML overlays). */
  toScreen(x: number, y: number, z: number): [number, number] {
    const v = new THREE.Vector3(x, y, z).project(this.camera)
    return [((v.x + 1) / 2) * this.canvas.clientWidth, ((1 - v.y) / 2) * this.canvas.clientHeight]
  }

  dispose() {
    this.renderer.dispose()
  }
}
