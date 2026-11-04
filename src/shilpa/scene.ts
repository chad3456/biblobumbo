import * as THREE from 'three'
import { beastTexture, dancerTexture, floorTexture, haloTexture, lotusTexture, wallTextures } from './art'
import { FIGURE_H, LOTUSES, NICHES, NICHE_Y, PATROLS, type Shilpa } from './game'
import { BANDS, DOOR, LAMP_STAND, PILASTERS, PILLARS, ROOM, SEGMENTS, pointAt } from './level'

const SANDSTONE = '#c4a074'

/** Lathe profile of a Hoysala-style turned pillar: stacked bells, discs and a bracket capital. */
function pillarGeometry() {
  const pts: THREE.Vector2[] = []
  const prof: [number, number][] = [
    [0.55, 0], [0.55, 0.35], [0.42, 0.4], [0.42, 0.9], [0.5, 0.95], [0.5, 1.05], [0.36, 1.12],
    [0.46, 1.4], [0.5, 1.6], [0.38, 1.75], [0.3, 2.0], [0.44, 2.2], [0.44, 2.3], [0.28, 2.4],
    [0.32, 2.9], [0.45, 3.2], [0.48, 3.35], [0.3, 3.45], [0.3, 4.2], [0.62, 4.35], [0.62, 4.6], [0.7, 4.65], [0.7, ROOM.height],
  ]
  for (const [r, y] of prof) pts.push(new THREE.Vector2(r, y))
  return new THREE.LatheGeometry(pts, 24)
}

function deepaStand() {
  const g = new THREE.Group()
  const brass = new THREE.MeshStandardMaterial({ color: '#c8962e', metalness: 0.85, roughness: 0.3 })
  const prof: [number, number][] = [[0.35, 0], [0.35, 0.08], [0.12, 0.15], [0.06, 0.5], [0.09, 0.6], [0.05, 0.7], [0.05, 1.3], [0.22, 1.36], [0.3, 1.42], [0.05, 1.46], [0.04, 1.7], [0.14, 1.72], [0.02, 1.9]]
  g.add(new THREE.Mesh(new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 20), brass))
  const flameM = new THREE.MeshBasicMaterial({ color: '#ffcc55', toneMapped: false })
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.12, 8), flameM)
    f.position.set(Math.cos(a) * 0.25, 1.48, Math.sin(a) * 0.25)
    g.add(f)
  }
  return g
}

function diyaMesh() {
  const g = new THREE.Group()
  const clay = new THREE.MeshStandardMaterial({ color: '#a8502a', roughness: 0.9, side: THREE.DoubleSide })
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), clay)
  g.add(bowl)
  const spout = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.07, 8), clay)
  spout.rotation.z = -Math.PI / 2
  spout.position.set(0.09, 0, 0)
  g.add(spout)
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.11, 8), new THREE.MeshBasicMaterial({ color: '#ffd36b', toneMapped: false }))
  flame.position.set(0.1, 0.07, 0)
  flame.name = 'flame'
  g.add(flame)
  return g
}

export class ShilpaScene {
  renderer: THREE.WebGLRenderer
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(65, 1, 0.05, 120)
  figure: THREE.Mesh
  figureGlow: THREE.Mesh
  beasts: THREE.Mesh[] = []
  lotuses: THREE.Mesh[] = []
  nicheDiyas: THREE.Group[] = []
  nicheLights: THREE.PointLight[] = []
  handLamp: THREE.Group
  handLight: THREE.PointLight
  bodyLamp: THREE.Group
  doors: THREE.Mesh[] = []
  sanctumLight: THREE.PointLight
  sanctumGlow: THREE.Mesh
  dust: THREE.Points
  petals: THREE.Points
  camPos = new THREE.Vector3()
  camLook = new THREE.Vector3()
  private t = 0

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.05
    this.scene.background = new THREE.Color('#0d0806')
    this.scene.fog = new THREE.Fog('#0d0806', 22, 45)

    this.scene.add(new THREE.HemisphereLight('#7d6a58', '#2a1c12', 0.7))
    this.buildRoom()

    // the playable carving
    this.figure = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.93), new THREE.MeshStandardMaterial({ transparent: true, alphaTest: 0.4, roughness: 0.85, side: THREE.DoubleSide }))
    this.scene.add(this.figure)
    this.figureGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.5), new THREE.MeshBasicMaterial({ map: haloTexture(), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }))
    this.scene.add(this.figureGlow)

    for (const p of PATROLS) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(p.kind === 'elephant' ? 0.95 : 0.9, p.kind === 'elephant' ? 0.95 : 0.95), new THREE.MeshStandardMaterial({ transparent: true, alphaTest: 0.4, roughness: 0.85, side: THREE.DoubleSide }))
      this.beasts.push(m)
      this.scene.add(m)
    }
    for (let i = 0; i < LOTUSES.length; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.45), new THREE.MeshBasicMaterial({ map: lotusTexture(), transparent: true, depthWrite: false, toneMapped: false }))
      this.lotuses.push(m)
      this.scene.add(m)
    }

    // niches with optional diyas
    NICHES.forEach((s) => {
      const p = pointAt(s)
      const niche = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 0.05), new THREE.MeshStandardMaterial({ color: '#3a2618', roughness: 1 }))
      niche.position.set(p.x + p.nx * 0.005, NICHE_Y + 0.2, p.z + p.nz * 0.005)
      niche.lookAt(niche.position.x + p.nx, niche.position.y, niche.position.z + p.nz)
      this.scene.add(niche)
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.22), new THREE.MeshStandardMaterial({ color: SANDSTONE }))
      shelf.position.set(p.x + p.nx * 0.11, NICHE_Y - 0.03, p.z + p.nz * 0.11)
      shelf.lookAt(shelf.position.x + p.nx, shelf.position.y, shelf.position.z + p.nz)
      this.scene.add(shelf)
      const d = diyaMesh()
      d.position.set(p.x + p.nx * 0.14, NICHE_Y + 0.05, p.z + p.nz * 0.14)
      d.visible = false
      this.scene.add(d)
      this.nicheDiyas.push(d)
      const l = new THREE.PointLight('#ffae4a', 0, 7, 1.6)
      l.position.set(p.x + p.nx * 0.6, NICHE_Y + 0.3, p.z + p.nz * 0.6)
      this.scene.add(l)
      this.nicheLights.push(l)
    })

    // the explorer's diya: held in hand while exploring, left standing while you are the dancer
    this.handLamp = diyaMesh()
    this.handLamp.scale.setScalar(0.75)
    this.camera.add(this.handLamp)
    this.handLamp.position.set(0.3, -0.27, -0.62)
    this.handLamp.rotation.y = -0.4
    this.scene.add(this.camera)
    this.handLight = new THREE.PointLight('#ffb35c', 6, 9, 1.4)
    this.scene.add(this.handLight)
    this.bodyLamp = diyaMesh()
    this.bodyLamp.scale.setScalar(1.6)
    this.scene.add(this.bodyLamp)

    // sanctum glow for the ending
    this.sanctumLight = new THREE.PointLight('#ffcf70', 0, 14, 1.2)
    this.sanctumLight.position.set(0, 1.5, ROOM.minZ + 0.8)
    this.scene.add(this.sanctumLight)
    this.sanctumGlow = new THREE.Mesh(new THREE.PlaneGeometry(DOOR.x1 - DOOR.x0, DOOR.height), new THREE.MeshBasicMaterial({ color: '#ffd27a', transparent: true, opacity: 0, toneMapped: false }))
    this.sanctumGlow.position.set(0, DOOR.height / 2, ROOM.minZ + 0.01)
    this.scene.add(this.sanctumGlow)

    // dust motes drifting in the light shafts, and petals for the finale
    const dg = new THREE.BufferGeometry()
    const dp = new Float32Array(600 * 3)
    for (let i = 0; i < 600; i++) {
      const shaft = [[-8.1, -5.6], [0, -5.6], [-9.5, 5.5], [9.5, 5.5]][i % 4]
      dp[i * 3] = shaft[0] + (Math.random() - 0.5) * 2.4
      dp[i * 3 + 1] = Math.random() * ROOM.height
      dp[i * 3 + 2] = shaft[1] + (Math.random() - 0.5) * 2.4
    }
    dg.setAttribute('position', new THREE.BufferAttribute(dp, 3))
    this.dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: '#ffe2a8', size: 0.025, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }))
    this.scene.add(this.dust)
    const pg = new THREE.BufferGeometry()
    const pp = new Float32Array(400 * 3)
    for (let i = 0; i < 400; i++) { pp[i * 3] = (Math.random() - 0.5) * 8; pp[i * 3 + 1] = 5 + Math.random() * 6; pp[i * 3 + 2] = ROOM.minZ + 1 + Math.random() * 6 }
    pg.setAttribute('position', new THREE.BufferAttribute(pp, 3))
    this.petals = new THREE.Points(pg, new THREE.PointsMaterial({ color: '#ff8fb1', size: 0.08 }))
    this.petals.visible = false
    this.scene.add(this.petals)

    this.resize()
  }

  private buildRoom() {
    const s = this.scene
    const W = ROOM.maxX - ROOM.minX
    const D = ROOM.maxZ - ROOM.minZ
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(W + 10, D + 10), new THREE.MeshStandardMaterial({ map: floorTexture(), roughness: 0.95 }))
    floor.rotation.x = -Math.PI / 2
    s.add(floor)

    // ceiling with two roof openings (skylights)
    const ceilM = new THREE.MeshStandardMaterial({ color: '#4a3524', roughness: 1, side: THREE.DoubleSide })
    const holes: [number, number][] = [[-8.1, -5.4], [0, -5.4]]
    const ceil = new THREE.Shape()
    ceil.moveTo(ROOM.minX, ROOM.minZ); ceil.lineTo(ROOM.maxX, ROOM.minZ); ceil.lineTo(ROOM.maxX, ROOM.maxZ); ceil.lineTo(ROOM.minX, ROOM.maxZ); ceil.closePath()
    for (const [hx, hz] of holes) {
      const h = new THREE.Path()
      h.moveTo(hx - 1, hz - 1); h.lineTo(hx + 1, hz - 1); h.lineTo(hx + 1, hz + 1); h.lineTo(hx - 1, hz + 1); h.closePath()
      ceil.holes.push(h)
    }
    const ceilMesh = new THREE.Mesh(new THREE.ShapeGeometry(ceil), ceilM)
    ceilMesh.rotation.x = Math.PI / 2
    ceilMesh.position.y = ROOM.height
    s.add(ceilMesh)

    // sunbeams: spotlights through the openings onto the back wall + visible shafts
    for (const [hx, hz] of holes) {
      const spot = new THREE.SpotLight('#ffd9a0', 40, 14, 0.42, 0.5, 1.2)
      spot.position.set(hx, ROOM.height + 2.5, hz + 3.2)
      spot.target.position.set(hx, 1.6, ROOM.minZ)
      s.add(spot, spot.target)
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.3, 6.2, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#ffd9a0', transparent: true, opacity: 0.03, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }))
      shaft.position.set(hx, ROOM.height / 2 + 0.5, hz - 0.6)
      shaft.rotation.x = -0.35
      s.add(shaft)
    }
    // low afternoon sun through the open entrance, grazing the front of both side walls
    for (const sx of [-1, 1]) {
      const spot = new THREE.SpotLight('#ffcf8a', 55, 16, 0.5, 0.6, 1.1)
      spot.position.set(sx * 4, 3.5, ROOM.maxZ + 6)
      spot.target.position.set(sx * ROOM.maxX, 1.8, ROOM.maxZ - 2)
      s.add(spot, spot.target)
    }
    // outside: bright courtyard through the colonnade
    const yard = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), new THREE.MeshBasicMaterial({ color: '#f3c27a' }))
    yard.rotation.x = -Math.PI / 2
    yard.position.set(0, -0.01, ROOM.maxZ + 10)
    s.add(yard)
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(60, 20), new THREE.MeshBasicMaterial({ color: '#f7d9a0' }))
    sky.position.set(0, 8, ROOM.maxZ + 18)
    sky.rotation.y = Math.PI
    s.add(sky)

    // walls carrying the frieze
    SEGMENTS.forEach((seg) => {
      const hasDoor = seg.ax < DOOR.x0 && seg.bx > DOOR.x1 && seg.az === ROOM.minZ && seg.bz === ROOM.minZ
      const { map, bump } = wallTextures(seg, hasDoor)
      const m = new THREE.Mesh(new THREE.PlaneGeometry(seg.len, ROOM.height), new THREE.MeshStandardMaterial({ map, bumpMap: bump, bumpScale: 3, roughness: 0.92 }))
      m.position.set((seg.ax + seg.bx) / 2, ROOM.height / 2, (seg.az + seg.bz) / 2)
      m.lookAt(m.position.x + seg.nx, m.position.y, m.position.z + seg.nz)
      s.add(m)
    })
    // tops of the pilasters
    for (const p of PILASTERS) {
      const top = new THREE.Mesh(new THREE.BoxGeometry(p.w, 0.02, p.d), new THREE.MeshStandardMaterial({ color: '#4a3524' }))
      top.position.set(p.x, ROOM.height - 0.01, ROOM.minZ + p.d / 2)
      s.add(top)
    }
    // short return walls at the entrance
    const ret = new THREE.MeshStandardMaterial({ color: SANDSTONE, roughness: 0.95 })
    for (const sx of [-1, 1]) {
      const w = new THREE.Mesh(new THREE.BoxGeometry(1.4, ROOM.height, 0.4), ret)
      w.position.set(sx * (ROOM.maxX - 0.7), ROOM.height / 2, ROOM.maxZ - 0.6)
      s.add(w)
    }

    // turned pillars: hall interior and the open front colonnade
    const pg = pillarGeometry()
    const pm = new THREE.MeshStandardMaterial({ color: '#b48f66', roughness: 0.6, metalness: 0.05 })
    for (const [x, z] of [...PILLARS, ...[-7.5, -2.5, 2.5, 7.5].map((x) => [x, ROOM.maxZ - 0.4] as [number, number])]) {
      const p = new THREE.Mesh(pg, pm)
      p.position.set(x, 0, z)
      s.add(p)
    }

    // sanctum doors (two brass-studded leaves)
    const doorM = new THREE.MeshStandardMaterial({ color: '#5a3a1e', roughness: 0.6, metalness: 0.2 })
    const half = (DOOR.x1 - DOOR.x0) / 2
    for (const side of [-1, 1]) {
      const pivot = new THREE.Mesh(new THREE.BoxGeometry(half, DOOR.height, 0.08), doorM)
      pivot.geometry.translate(-side * half / 2, 0, 0)
      pivot.position.set(side * (DOOR.x1), DOOR.height / 2, ROOM.minZ + 0.06)
      for (let i = 0; i < 12; i++) {
        const stud = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), new THREE.MeshStandardMaterial({ color: '#d4a53a', metalness: 0.9, roughness: 0.3 }))
        stud.position.set(-side * (0.2 + (i % 3) * 0.4), -1.0 + Math.floor(i / 3) * 0.65, 0.05)
        pivot.add(stud)
      }
      s.add(pivot)
      this.doors.push(pivot)
    }

    const stand = deepaStand()
    stand.position.set(LAMP_STAND.x, 0, LAMP_STAND.z)
    s.add(stand)
    const sl = new THREE.PointLight('#ffb050', 5, 6, 1.5)
    sl.position.set(LAMP_STAND.x, 1.7, LAMP_STAND.z)
    s.add(sl)
  }

  resize() {
    const w = this.canvas.clientWidth || 800
    const h = this.canvas.clientHeight || 600
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.fov = w < h ? 80 : 65
    this.camera.updateProjectionMatrix()
  }

  /** Place a flat carving on the wall at path distance s, facing out, optionally mirrored. */
  private onWall(m: THREE.Object3D, s: number, y: number, flip = false, lift = 0.012) {
    const p = pointAt(s)
    m.position.set(p.x + p.nx * lift, y, p.z + p.nz * lift)
    m.lookAt(m.position.x + p.nx, y, m.position.z + p.nz)
    m.scale.x = flip ? -1 : 1
  }

  render(g: Shilpa, dt: number) {
    this.t += dt
    const t = this.t

    // the dancer
    const fw = g.figureWorld()
    const mural = fw.style === 'mural'
    const frame = g.hop > 0.02 ? 'jump' : g.walking ? (Math.floor(t * 8) % 2 ? 'walkA' : 'walkB') : 'idle'
    const mat = this.figure.material as THREE.MeshStandardMaterial
    const tex = dancerTexture(frame, mural, g.stone)
    if (mat.map !== tex) { mat.map = tex; mat.needsUpdate = true }
    this.onWall(this.figure, g.s, fw.y + 0.465, g.facing < 0)
    // a soft halo shows where she is when she's awake and you're inside the wall
    const glowM = this.figureGlow.material as THREE.MeshBasicMaterial
    glowM.opacity = g.mode === 'wall' && !g.stone ? 0.25 + Math.sin(t * 3) * 0.05 : 0
    this.onWall(this.figureGlow, g.s, fw.y + 0.45, false, 0.006)

    PATROLS.forEach((p, i) => {
      const m = this.beasts[i]
      const pm = m.material as THREE.MeshStandardMaterial
      const bt = beastTexture(p.kind, pointAt(g.patrolS[i]).seg.style === 'mural')
      if (pm.map !== bt) { pm.map = bt; pm.needsUpdate = true }
      const bob = p.kind === 'horse' ? Math.abs(Math.sin(t * 9)) * 0.04 : Math.abs(Math.sin(t * 3)) * 0.02
      this.onWall(m, g.patrolS[i], BANDS[p.band].y + 0.47 + bob, g.patrolDir[i] < 0, 0.016)
    })

    LOTUSES.forEach(([s, b], i) => {
      const m = this.lotuses[i]
      m.visible = !g.lotus[i]
      this.onWall(m, s, BANDS[b].y + 0.42 + Math.sin(t * 2 + i) * 0.04, false, 0.03)
    })

    NICHES.forEach((_, i) => {
      this.nicheDiyas[i].visible = g.placed[i]
      const flick = 1 + Math.sin(t * 13 + i) * 0.08 + Math.sin(t * 7 + i * 3) * 0.05
      this.nicheLights[i].intensity = g.placed[i] ? 9 * flick : 0
      const fl = this.nicheDiyas[i].getObjectByName('flame')
      if (fl) fl.scale.y = flick
    })

    // explorer lamp
    const exploring = g.mode === 'explore'
    this.handLamp.visible = exploring
    this.bodyLamp.visible = !exploring
    this.bodyLamp.position.set(g.px, 1.25, g.pz)
    const flick = 1 + Math.sin(t * 11) * 0.06 + Math.sin(t * 5.3) * 0.05
    this.handLight.intensity = 6 * flick
    this.handLight.position.set(g.px, 1.35, g.pz)

    // dust drift
    const dp = this.dust.geometry.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < dp.count; i++) {
      let y = dp.getY(i) + dt * 0.05
      if (y > ROOM.height) y = 0
      dp.setY(i, y)
      dp.setX(i, dp.getX(i) + Math.sin(t * 0.5 + i) * dt * 0.02)
    }
    dp.needsUpdate = true

    // ending: doors swing open, golden light, petals
    if (g.mode === 'ending') {
      const k = Math.min(1, g.endingT / 3)
      this.doors[0].rotation.y = k * 1.7
      this.doors[1].rotation.y = -k * 1.7
      this.sanctumLight.intensity = k * 30
      ;(this.sanctumGlow.material as THREE.MeshBasicMaterial).opacity = k * 0.85
      this.petals.visible = true
      const pp = this.petals.geometry.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < pp.count; i++) {
        let y = pp.getY(i) - dt * (0.6 + (i % 5) * 0.1)
        if (y < 0) y = 6 + Math.random() * 3
        pp.setY(i, y)
        pp.setX(i, pp.getX(i) + Math.sin(t + i) * dt * 0.3)
      }
      pp.needsUpdate = true
    }

    this.updateCamera(g, dt)
    this.renderer.render(this.scene, this.camera)
  }

  private updateCamera(g: Shilpa, dt: number) {
    const k = 1 - Math.pow(0.004, dt)
    if (g.mode === 'explore') {
      this.camPos.set(g.px, 1.65, g.pz)
      this.camera.position.lerp(this.camPos, Math.min(1, k * 3))
      this.camera.rotation.set(g.pitch, g.yaw, 0, 'YXZ')
      this.camLook.copy(this.camera.position).add(new THREE.Vector3(0, 0, -1).applyEuler(this.camera.rotation))
      return
    }
    let pos: THREE.Vector3
    let look: THREE.Vector3
    if (g.mode === 'ending') {
      pos = new THREE.Vector3(0, 1.9, ROOM.minZ + 3.6)
      look = new THREE.Vector3(0, 2.3, ROOM.minZ)
    } else {
      // side-on view of the frieze, swinging round corners and pilasters with her
      const f = g.figureWorld()
      const ahead = pointAt(g.s + g.facing * 0.6)
      pos = new THREE.Vector3(f.x + f.nx * 2.7 + (ahead.nx - f.nx) * 0.8, f.y + 0.75, f.z + f.nz * 2.7 + (ahead.nz - f.nz) * 0.8)
      look = new THREE.Vector3(f.x, f.y + FIGURE_H * 0.55, f.z)
    }
    this.camera.position.lerp(pos, k)
    this.camLook.lerp(look, k)
    this.camera.lookAt(this.camLook)
  }

  dispose() {
    this.renderer.dispose()
  }
}
