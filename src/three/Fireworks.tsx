import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const PER_BURST = 140
const MAX_BURSTS = 8
const COLORS = ['#ffd54f', '#ff5252', '#ff80ab', '#69f0ae', '#40c4ff', '#e040fb', '#ffab40', '#ffffff']

interface Burst { origin: THREE.Vector3; color: THREE.Color; age: number; vel: Float32Array; alive: boolean; rocket: number }

/**
 * Pooled particle fireworks. A rocket climbs, then bursts into a sphere of
 * sparks that fall and fade. `nonce` changes => launch an extra burst now.
 */
export default function Fireworks({ nonce, auto = true, onBurst }: { nonce: number; auto?: boolean; onBurst?: () => void }) {
  const points = useRef<THREE.Points>(null)
  const bursts = useRef<Burst[]>([])
  const lastNonce = useRef(nonce)
  const nextAuto = useRef(1.5)

  const { geometry, positions, colors } = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(PER_BURST * MAX_BURSTS * 3).fill(-999)
    const col = new Float32Array(PER_BURST * MAX_BURSTS * 3)
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    return { geometry: g, positions: pos, colors: col }
  }, [])

  const sprite = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.3, 'rgba(255,255,255,0.8)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 64, 64)
    return new THREE.CanvasTexture(c)
  }, [])

  const launch = () => {
    const free = bursts.current.length < MAX_BURSTS ? null : bursts.current.find((b) => !b.alive)
    const vel = free?.vel ?? new Float32Array(PER_BURST * 3)
    for (let i = 0; i < PER_BURST; i++) {
      // even-ish sphere of directions
      const u = Math.random() * 2 - 1
      const th = Math.random() * Math.PI * 2
      const s = Math.sqrt(1 - u * u)
      const sp = 5 + Math.random() * 2.5
      vel[i * 3] = s * Math.cos(th) * sp
      vel[i * 3 + 1] = u * sp
      vel[i * 3 + 2] = s * Math.sin(th) * sp
    }
    const b: Burst = {
      origin: new THREE.Vector3((Math.random() - 0.5) * 44, 11 + Math.random() * 6, -18 - Math.random() * 12),
      color: new THREE.Color(COLORS[Math.floor(Math.random() * COLORS.length)]),
      age: 0,
      vel,
      alive: true,
      rocket: 0.9,
    }
    if (free) Object.assign(free, b)
    else bursts.current.push(b)
  }

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 20)
    if (nonce !== lastNonce.current) {
      lastNonce.current = nonce
      launch()
      setTimeout(launch, 250)
    }
    if (auto) {
      nextAuto.current -= dt
      if (nextAuto.current <= 0) {
        launch()
        nextAuto.current = 1.8 + Math.random() * 2.5
      }
    }
    bursts.current.forEach((b, bi) => {
      const off = bi * PER_BURST * 3
      if (!b.alive) return
      b.age += dt
      if (b.rocket > 0) {
        // climbing rocket: a single bright spark trailing upward
        b.rocket -= dt
        const y = b.origin.y - b.rocket * 11
        for (let i = 0; i < PER_BURST; i++) {
          const trail = i < 6
          positions[off + i * 3] = trail ? b.origin.x : -999
          positions[off + i * 3 + 1] = trail ? y - i * 0.3 : -999
          positions[off + i * 3 + 2] = trail ? b.origin.z : -999
          colors[off + i * 3] = 1
          colors[off + i * 3 + 1] = 0.85
          colors[off + i * 3 + 2] = 0.5
        }
        if (b.rocket <= 0) { b.age = 0; onBurst?.() }
        return
      }
      const t = b.age
      const fade = Math.max(0, 1 - t / 2.4)
      const twinkle = 0.75 + Math.random() * 0.25
      for (let i = 0; i < PER_BURST; i++) {
        const drag = (1 - Math.exp(-t * 1.6)) / 1.6
        positions[off + i * 3] = b.origin.x + b.vel[i * 3] * drag
        positions[off + i * 3 + 1] = b.origin.y + b.vel[i * 3 + 1] * drag - 2.2 * t * t
        positions[off + i * 3 + 2] = b.origin.z + b.vel[i * 3 + 2] * drag
        colors[off + i * 3] = b.color.r * fade * twinkle
        colors[off + i * 3 + 1] = b.color.g * fade * twinkle
        colors[off + i * 3 + 2] = b.color.b * fade * twinkle
      }
      if (t > 2.5) {
        b.alive = false
        for (let i = 0; i < PER_BURST * 3; i++) positions[off + i] = -999
      }
    })
    geometry.attributes.position.needsUpdate = true
    geometry.attributes.color.needsUpdate = true
  })

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <pointsMaterial size={1.1} map={sprite} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation toneMapped={false} />
    </points>
  )
}
