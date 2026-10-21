import { Html, OrbitControls, Stars } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { GHAT, KIND_BY_ID, decorativeSlots, ghatLitCount, messageSlot, type Diya } from '../lib/diwali'
import { aartiPose, namastePose } from '../lib/steps'
import { randomConfig } from '../lib/presets'
import type { FigurineConfig } from '../lib/types'
import Figurine from './Figurine'
import Fireworks from './Fireworks'

const STONE = '#e3ab8c'
const STONE_DARK = '#c98868'
const GOLD = '#ffc400'
const SAFFRON = '#ff7a00'
const PLATEAU_Y = (GHAT.steps + 1) * GHAT.rise
const PLATEAU_FRONT = GHAT.front - GHAT.steps * GHAT.depth

function Gold() {
  return <meshPhysicalMaterial color={GOLD} metalness={0.85} roughness={0.25} />
}

function glowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(255,220,140,0.95)')
  g.addColorStop(0.25, 'rgba(255,170,60,0.45)')
  g.addColorStop(1, 'rgba(255,120,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/* ---------------- ghat steps ---------------- */

function Ghat() {
  const studs = useRef<THREE.InstancedMesh>(null)
  const studPos = useMemo(() => {
    const out: [number, number, number][] = []
    for (let k = 0; k < GHAT.steps; k++) {
      const y = (k + 1) * GHAT.rise
      const z = GHAT.front - k * GHAT.depth - GHAT.depth / 2
      for (let x = -GHAT.width / 2 + 1; x < GHAT.width / 2; x += 2.4) out.push([x, y, z - 0.12])
    }
    return out
  }, [])
  useEffect(() => {
    const m = new THREE.Matrix4()
    studPos.forEach((p, i) => studs.current!.setMatrixAt(i, m.setPosition(...p)))
    studs.current!.instanceMatrix.needsUpdate = true
  }, [studPos])

  return (
    <group>
      {Array.from({ length: GHAT.steps }, (_, k) => {
        const h = (k + 1) * GHAT.rise
        return (
          <mesh key={k} position={[0, h / 2, GHAT.front - k * GHAT.depth - GHAT.depth / 2]} receiveShadow castShadow>
            <boxGeometry args={[GHAT.width, h, GHAT.depth]} />
            <meshStandardMaterial color={k % 2 ? STONE : STONE_DARK} roughness={0.85} />
          </mesh>
        )
      })}
      {/* top terrace where the temple stands */}
      <mesh position={[0, PLATEAU_Y / 2, PLATEAU_FRONT - 18]} receiveShadow>
        <boxGeometry args={[GHAT.width + 30, PLATEAU_Y, 36]} />
        <meshStandardMaterial color={STONE_DARK} roughness={0.9} />
      </mesh>
      <instancedMesh ref={studs} args={[undefined, undefined, studPos.length]}>
        <cylinderGeometry args={[0.16, 0.16, 0.08, 12]} />
        <meshStandardMaterial color={STONE} roughness={0.7} />
      </instancedMesh>
      {/* chhatris (pavilions) at both ends of the ghat */}
      {[-1, 1].map((s) => (
        <Chhatri key={s} position={[s * (GHAT.width / 2 - 2), 0, GHAT.front - 1]} />
      ))}
    </group>
  )
}

function Chhatri({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[3, 0.8, 3]} />
        <meshStandardMaterial color={STONE_DARK} />
      </mesh>
      {[[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]].map(([x, z], i) => (
        <mesh key={i} position={[x, 2, z]}>
          <cylinderGeometry args={[0.14, 0.16, 2.4, 10]} />
          <meshStandardMaterial color={STONE} />
        </mesh>
      ))}
      <mesh position={[0, 3.3, 0]}>
        <boxGeometry args={[3.2, 0.25, 3.2]} />
        <meshStandardMaterial color={STONE_DARK} />
      </mesh>
      <mesh position={[0, 3.45, 0]}>
        <sphereGeometry args={[1.3, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={STONE} />
      </mesh>
      <mesh position={[0, 4.95, 0]}>
        <coneGeometry args={[0.15, 0.5, 10]} />
        <Gold />
      </mesh>
    </group>
  )
}

/* ---------------- decorative diyas (instanced) ---------------- */

function GhatDiyas({ lit }: { lit: number }) {
  const slots = decorativeSlots()
  const bowls = useRef<THREE.InstancedMesh>(null)
  const flames = useRef<THREE.InstancedMesh>(null)
  const litAnim = useRef(0)

  useEffect(() => {
    const m = new THREE.Matrix4()
    slots.forEach((p, i) => bowls.current!.setMatrixAt(i, m.makeTranslation(p[0], p[1] + 0.06, p[2])))
    bowls.current!.instanceMatrix.needsUpdate = true
  }, [slots])

  useFrame(({ clock }, dt) => {
    const f = flames.current
    if (!f) return
    // newly kindled diyas ripple on one after another
    litAnim.current = Math.min(lit, litAnim.current + Math.max(1, (lit - litAnim.current) * dt * 1.5))
    if (litAnim.current > lit) litAnim.current = lit
    const n = Math.floor(litAnim.current)
    const t = clock.elapsedTime
    const m = new THREE.Matrix4()
    const s = new THREE.Vector3()
    const q = new THREE.Quaternion()
    const v = new THREE.Vector3()
    for (let i = 0; i < slots.length; i++) {
      const p = slots[i]
      const on = i < n ? 1 : 0
      const flick = on * (0.85 + Math.sin(t * 11 + i * 1.7) * 0.12 + Math.sin(t * 6.3 + i) * 0.06)
      s.set(on, flick || 0.0001, on)
      v.set(p[0], p[1] + 0.17, p[2])
      f.setMatrixAt(i, m.compose(v, q, s))
    }
    f.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      <instancedMesh ref={bowls} args={[undefined, undefined, slots.length]} frustumCulled={false}>
        <sphereGeometry args={[0.12, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color="#b5562a" side={THREE.DoubleSide} roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={flames} args={[undefined, undefined, slots.length]} frustumCulled={false}>
        <coneGeometry args={[0.05, 0.17, 6]} />
        <meshBasicMaterial color="#ffc640" toneMapped={false} />
      </instancedMesh>
    </group>
  )
}

/* ---------------- message diyas (clickable) ---------------- */

function MessageDiya({ diya, index, selected, fresh, onSelect, glow }: { diya: Diya; index: number; selected: boolean; fresh: boolean; onSelect: () => void; glow: THREE.Texture }) {
  const pos = useMemo(() => messageSlot(index), [index])
  const flame = useRef<THREE.Mesh>(null)
  const halo = useRef<THREE.Sprite>(null)
  const born = useRef(fresh ? -1 : 0)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (born.current < 0) born.current = t
    const grow = Math.min(1, (t - born.current) / 1.2)
    const f = (0.9 + Math.sin(t * 10 + index) * 0.1 + Math.sin(t * 5.7 + index * 2) * 0.06) * grow
    flame.current?.scale.set(grow, f, grow)
    if (halo.current) {
      const pulse = selected ? 2.6 + Math.sin(t * 4) * 0.3 : 1.5 + Math.sin(t * 2 + index) * 0.1
      halo.current.scale.setScalar(pulse * grow)
    }
  })

  return (
    <group position={pos}>
      <group
        onClick={(e) => { e.stopPropagation(); onSelect() }}
        onPointerOver={() => { document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = '' }}
      >
        <mesh position={[0, 0.12, 0]} castShadow>
          <sphereGeometry args={[0.24, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshStandardMaterial color="#b5562a" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.24, 0.035, 8, 24]} />
          <meshStandardMaterial color={diya.color} emissive={diya.color} emissiveIntensity={0.4} />
        </mesh>
        {/* spout */}
        <mesh position={[0.24, 0.12, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.07, 0.14, 8]} />
          <meshStandardMaterial color="#b5562a" />
        </mesh>
        <mesh ref={flame} position={[0.24, 0.3, 0]}>
          <coneGeometry args={[0.07, 0.26, 10]} />
          <meshBasicMaterial color="#ffd36b" toneMapped={false} />
        </mesh>
        <sprite ref={halo} position={[0.24, 0.32, 0]}>
          <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
        {/* invisible, larger hit area */}
        <mesh position={[0.1, 0.3, 0]} visible={false}>
          <boxGeometry args={[0.9, 0.9, 0.9]} />
        </mesh>
      </group>
      {selected && (
        <>
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.45, 0.58, 32]} />
            <meshBasicMaterial color="#ffd54f" toneMapped={false} />
          </mesh>
          <Html position={[0.2, 1.1, 0]} center distanceFactor={9} zIndexRange={[30, 0]}>
            <div className="diya-tag">{KIND_BY_ID[diya.kind].emoji} {diya.name}</div>
          </Html>
        </>
      )}
    </group>
  )
}

/* ---------------- temple ---------------- */

/** Outline lights: a ring of tiny bulbs around a rectangle at height y. */
function bulbRing(w: number, d: number, y: number, step = 0.5): [number, number, number][] {
  const out: [number, number, number][] = []
  for (let x = -w / 2; x <= w / 2; x += step) out.push([x, y, d / 2], [x, y, -d / 2])
  for (let z = -d / 2 + step; z < d / 2; z += step) out.push([w / 2, y, z], [-w / 2, y, z])
  return out
}

function Bulbs({ points, color = '#ffd54f' }: { points: [number, number, number][]; color?: string }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  useEffect(() => {
    const m = new THREE.Matrix4()
    points.forEach((p, i) => ref.current!.setMatrixAt(i, m.makeTranslation(...p)))
    ref.current!.instanceMatrix.needsUpdate = true
  }, [points])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, points.length]} frustumCulled={false}>
      <sphereGeometry args={[0.06, 6, 4]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </instancedMesh>
  )
}

/** A nagara-style shikhara: tapering, ribbed tiers capped by amalaka, kalash and dhwaja. */
function Shikhara({ base, height, tiers = 9 }: { base: number; height: number; tiers?: number }) {
  const flag = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (flag.current) flag.current.rotation.y = Math.sin(clock.elapsedTime * 2) * 0.25
  })
  const th = height / tiers
  const bulbs = useMemo(() => {
    const pts: [number, number, number][] = []
    for (let i = 0; i < tiers; i++) {
      const r = (base / 2) * (1 - (i / tiers) * 0.72) * 1.04
      for (let a = 0; a < 16; a++) {
        const ang = (a / 16) * Math.PI * 2
        pts.push([Math.cos(ang) * r, i * th + th * 0.95, Math.sin(ang) * r])
      }
    }
    return pts
  }, [base, tiers, th])
  return (
    <group>
      {Array.from({ length: tiers }, (_, i) => {
        const k0 = 1 - (i / tiers) * 0.72
        const k1 = 1 - ((i + 1) / tiers) * 0.72
        return (
          <mesh key={i} position={[0, i * th + th / 2, 0]} castShadow>
            <cylinderGeometry args={[(base / 2) * k1, (base / 2) * k0, th * 0.96, 8]} />
            <meshStandardMaterial color={i % 2 ? STONE : '#efbfa2'} roughness={0.75} flatShading />
          </mesh>
        )
      })}
      <Bulbs points={bulbs} />
      <group position={[0, height, 0]}>
        {/* amalaka */}
        <mesh scale={[1, 0.45, 1]}>
          <sphereGeometry args={[base * 0.2, 16, 10]} />
          <meshStandardMaterial color={STONE} flatShading />
        </mesh>
        <mesh position={[0, base * 0.16, 0]}>
          <sphereGeometry args={[base * 0.08, 12, 10]} />
          <Gold />
        </mesh>
        <mesh position={[0, base * 0.27, 0]}>
          <coneGeometry args={[base * 0.05, base * 0.14, 12]} />
          <Gold />
        </mesh>
        <mesh position={[0, base * 0.55, 0]}>
          <cylinderGeometry args={[0.04, 0.04, base * 0.6, 6]} />
          <Gold />
        </mesh>
        <group ref={flag} position={[0, base * 0.72, 0]}>
          <mesh position={[0.55, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.32, 1.1, 3]} />
            <meshStandardMaterial color={SAFFRON} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

function Temple() {
  const plinthW = 18
  const plinthD = 13
  const outline = useMemo(() => [
    ...bulbRing(plinthW, plinthD, 1.62, 0.45),
    ...bulbRing(plinthW - 3, plinthD - 3, 5.0, 0.45),
  ], [])
  return (
    <group position={[0, PLATEAU_Y, PLATEAU_FRONT - 15]}>
      {/* plinth with front stairs */}
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[plinthW, 1.6, plinthD]} />
        <meshStandardMaterial color={STONE_DARK} roughness={0.8} />
      </mesh>
      {Array.from({ length: 4 }, (_, i) => (
        <mesh key={i} position={[0, 0.2 * (i + 1), plinthD / 2 + 1.4 - i * 0.4]} receiveShadow>
          <boxGeometry args={[5, 0.4 * (i + 1), 0.4]} />
          <meshStandardMaterial color={STONE} />
        </mesh>
      ))}
      {/* mandapa: pillared hall */}
      <mesh position={[0, 1.7, 0]}>
        <boxGeometry args={[plinthW - 3, 0.2, plinthD - 3]} />
        <meshStandardMaterial color={STONE} />
      </mesh>
      {Array.from({ length: 7 }, (_, i) =>
        [-1, 1].map((s) => (
          <mesh key={`${i}${s}`} position={[-6.5 + i * 2.17, 3.3, s * 4.6]} castShadow>
            <cylinderGeometry args={[0.28, 0.32, 3.2, 8]} />
            <meshStandardMaterial color={STONE} flatShading />
          </mesh>
        )),
      )}
      <mesh position={[0, 5.0, 0]} castShadow>
        <boxGeometry args={[plinthW - 3, 0.5, plinthD - 3]} />
        <meshStandardMaterial color={STONE_DARK} />
      </mesh>
      <Bulbs points={outline} />
      {/* glowing sanctum doorway */}
      <mesh position={[0, 3.0, 4.75]}>
        <planeGeometry args={[2.2, 2.8]} />
        <meshBasicMaterial color="#ffb347" toneMapped={false} />
      </mesh>
      {/* small shikharas over the mandapas */}
      {[-4.5, 4.5].map((x) => (
        <group key={x} position={[x, 5.25, 1.5]}>
          <Shikhara base={3.4} height={4.2} tiers={6} />
        </group>
      ))}
      {/* main shikhara over the garbhagriha */}
      <group position={[0, 5.25, -1.6]}>
        <Shikhara base={6} height={11} tiers={11} />
      </group>
      <pointLight position={[0, 3, 7]} intensity={40} distance={16} color="#ffb74d" />
    </group>
  )
}

/* ---------------- town, river, sky ---------------- */

function Houses() {
  const houses = useMemo(() => {
    const colors = ['#f7c59f', '#ffd6a5', '#fdffb6', '#caffbf', '#ffadad', '#bdb2ff', '#ffc6ff', '#9bf6ff']
    const out: { x: number; z: number; w: number; h: number; c: string }[] = []
    for (const side of [-1, 1]) {
      for (let i = 0; i < 6; i++) {
        out.push({ x: side * (13 + i * 3.4), z: PLATEAU_FRONT - 5 - (i % 2) * 3, w: 3, h: 3 + ((i * 7) % 4), c: colors[(i + (side > 0 ? 3 : 0)) % colors.length] })
      }
    }
    return out
  }, [])
  const roofDiyas = useMemo(() => houses.flatMap((h) => {
    const pts: [number, number, number][] = []
    for (let x = -h.w / 2 + 0.2; x <= h.w / 2; x += 0.4) pts.push([h.x + x, PLATEAU_Y + h.h + 0.1, h.z + 1.5])
    return pts
  }), [houses])
  return (
    <group>
      {houses.map((h, i) => (
        <group key={i} position={[h.x, PLATEAU_Y, h.z]}>
          <mesh position={[0, h.h / 2, 0]} castShadow>
            <boxGeometry args={[h.w, h.h, 3]} />
            <meshStandardMaterial color={h.c} roughness={0.8} />
          </mesh>
          {/* arched window glowing */}
          <mesh position={[0, h.h * 0.55, 1.51]}>
            <planeGeometry args={[0.8, 1.1]} />
            <meshBasicMaterial color="#ffb74d" toneMapped={false} />
          </mesh>
          {/* hanging toran */}
          <mesh position={[0, h.h - 0.15, 1.52]}>
            <boxGeometry args={[h.w * 0.9, 0.12, 0.05]} />
            <meshStandardMaterial color="#2e7d32" />
          </mesh>
        </group>
      ))}
      <Bulbs points={roofDiyas} color="#ffc640" />
    </group>
  )
}

function reflectionTexture() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 128
  const ctx = c.getContext('2d')!
  // shimmering vertical streaks that fade away from the ghat (top of texture = near the steps)
  for (let x = 0; x < 512; x += 6) {
    const g = ctx.createLinearGradient(0, 0, 0, 128)
    const a = 0.25 + Math.random() * 0.45
    g.addColorStop(0, `rgba(255,170,70,${a})`)
    g.addColorStop(1, 'rgba(255,120,30,0)')
    ctx.fillStyle = g
    ctx.fillRect(x, 0, 2 + Math.random() * 2, 40 + Math.random() * 88)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function River() {
  const reflection = useMemo(reflectionTexture, [])
  const floaters = useRef<THREE.InstancedMesh>(null)
  const flames = useRef<THREE.InstancedMesh>(null)
  const N = 70
  const seeds = useMemo(() => Array.from({ length: N }, (_, i) => ({ x: (Math.random() - 0.5) * 70, z: GHAT.front + 2 + Math.random() * 16, s: 0.3 + Math.random() * 0.5, p: i })), [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const m = new THREE.Matrix4()
    seeds.forEach((d, i) => {
      // the Saryu carries floating diyas gently downstream
      const x = ((d.x + t * d.s + 35) % 70 + 70) % 70 - 35
      const y = 0.08 + Math.sin(t * 1.5 + d.p) * 0.03
      floaters.current?.setMatrixAt(i, m.makeTranslation(x, y, d.z))
      const f = 0.9 + Math.sin(t * 9 + d.p) * 0.12
      flames.current?.setMatrixAt(i, m.makeScale(1, f, 1).setPosition(x, y + 0.16, d.z))
    })
    if (floaters.current) floaters.current.instanceMatrix.needsUpdate = true
    if (flames.current) flames.current.instanceMatrix.needsUpdate = true
  })
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, GHAT.front + 40]} receiveShadow>
        <planeGeometry args={[220, 80]} />
        <meshPhysicalMaterial color="#0b1d3a" roughness={0.35} metalness={0.2} clearcoat={0.6} clearcoatRoughness={0.4} />
      </mesh>
      <instancedMesh ref={floaters} args={[undefined, undefined, N]} frustumCulled={false}>
        <sphereGeometry args={[0.14, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color="#b5562a" side={THREE.DoubleSide} />
      </instancedMesh>
      <instancedMesh ref={flames} args={[undefined, undefined, N]} frustumCulled={false}>
        <coneGeometry args={[0.05, 0.17, 6]} />
        <meshBasicMaterial color="#ffc640" toneMapped={false} />
      </instancedMesh>
      {/* warm glow of the ghat reflected along the near water */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, GHAT.front + 3.5]}>
        <planeGeometry args={[GHAT.width, 7]} />
        <meshBasicMaterial map={reflection} transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}

/** Akash kandils (sky lanterns) drifting up into the new-moon sky. */
function Lanterns() {
  const group = useRef<THREE.Group>(null)
  const data = useMemo(() => Array.from({ length: 14 }, (_, i) => ({ x: (Math.random() - 0.5) * 50, z: -4 - Math.random() * 30, speed: 0.4 + Math.random() * 0.4, phase: Math.random() * 30, c: ['#ff7043', '#ffca28', '#ec407a', '#ab47bc'][i % 4] })), [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    group.current?.children.forEach((c, i) => {
      const d = data[i]
      const y = 6 + ((t * d.speed + d.phase) % 30)
      c.position.set(d.x + Math.sin(t * 0.3 + i) * 1.5, y, d.z)
      c.rotation.y = t * 0.3 + i
    })
  })
  return (
    <group ref={group}>
      {data.map((d, i) => (
        <mesh key={i}>
          <cylinderGeometry args={[0.35, 0.25, 0.7, 6]} />
          <meshStandardMaterial color={d.c} emissive={d.c} emissiveIntensity={1.4} transparent opacity={0.92} />
        </mesh>
      ))}
    </group>
  )
}

function Rangoli() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 512
    const ctx = c.getContext('2d')!
    const ring = (r: number, col: string) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(256, 256, r, 0, Math.PI * 2); ctx.fill() }
    const petals = (r: number, n: number, len: number, wid: number, col: string) => {
      ctx.fillStyle = col
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2
        ctx.save(); ctx.translate(256 + Math.cos(a) * r, 256 + Math.sin(a) * r); ctx.rotate(a)
        ctx.beginPath(); ctx.ellipse(0, 0, len, wid, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore()
      }
    }
    ring(250, '#e91e63'); petals(220, 16, 34, 16, '#ffeb3b'); ring(180, '#7b1fa2'); petals(160, 12, 30, 14, '#00e5ff')
    ring(110, '#ff9800'); petals(100, 8, 26, 12, '#ffffff'); ring(55, '#d50000'); ring(30, '#ffeb3b')
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, PLATEAU_Y + 0.01, PLATEAU_FRONT - 4]}>
      <circleGeometry args={[2.6, 48]} />
      <meshStandardMaterial map={tex} transparent />
    </mesh>
  )
}

/** Devotees on the ghat: some fold hands, one performs the Saryu aarti. */
function Devotees({ figs }: { figs: FigurineConfig[] }) {
  // they stand along the top of the ghat, facing the Saryu
  const spots = useMemo(() => [-5, 5, -9, 9, -13, 13].map((x, i) => ({ x, y: PLATEAU_Y, z: PLATEAU_FRONT - 1.4, aarti: i < 2 })), [])
  const poses = useMemo(() => spots.map((s) => (t: number) => (s.aarti ? aartiPose(t, true) : namastePose())), [spots])
  return (
    <group>
      {spots.slice(0, figs.length).map((s, i) => (
        <group key={i} position={[s.x, s.y, s.z]} rotation={[0, 0, 0]} scale={0.7}>
          <Figurine config={figs[i]} pose={poses[i]} />
          {s.aarti && (
            // aarti thali with a flame
            <group position={[0, 2.0, 0.9]}>
              <mesh>
                <cylinderGeometry args={[0.32, 0.3, 0.05, 20]} />
                <Gold />
              </mesh>
              <mesh position={[0, 0.16, 0]}>
                <coneGeometry args={[0.08, 0.28, 8]} />
                <meshBasicMaterial color="#ffd36b" toneMapped={false} />
              </mesh>
            </group>
          )}
        </group>
      ))}
    </group>
  )
}

function FocusRig({ target }: { target: [number, number, number] | null }) {
  const { camera } = useThree()
  const controls = useRef<React.ComponentRef<typeof OrbitControls>>(null)
  const flying = useRef(0)
  const goal = useRef(new THREE.Vector3(0, 3, -4))
  const camGoal = useRef(new THREE.Vector3(0, 9, 26))

  useEffect(() => {
    if (!target) return
    goal.current.set(target[0], target[1] + 0.4, target[2])
    camGoal.current.set(target[0] * 0.85, target[1] + 3.2, target[2] + 8)
    flying.current = 1.4
  }, [target])

  useFrame((_, dt) => {
    if (flying.current <= 0 || !controls.current) return
    flying.current -= dt
    const k = 1 - Math.pow(0.02, dt)
    controls.current.target.lerp(goal.current, k)
    camera.position.lerp(camGoal.current, k)
    controls.current.update()
  })

  return (
    <OrbitControls
      ref={controls}
      target={[0, 4, -6]}
      enablePan
      minDistance={3}
      maxDistance={60}
      maxPolarAngle={Math.PI / 2.05}
      onStart={() => { flying.current = 0 }}
    />
  )
}

export default function Ayodhya({ diyas, selectedId, freshId, onSelect, fireworksNonce, devotees, onBurst }: {
  diyas: Diya[]
  selectedId: string | null
  freshId: string | null
  onSelect: (id: string | null) => void
  fireworksNonce: number
  devotees: FigurineConfig[]
  onBurst?: () => void
}) {
  const glow = useMemo(glowTexture, [])
  const lit = ghatLitCount(diyas.length)
  const selectedIndex = diyas.findIndex((d) => d.id === selectedId)
  const focus = useMemo(() => (selectedIndex >= 0 ? messageSlot(selectedIndex) : null), [selectedIndex])
  const crowd = useMemo(() => (devotees.length ? devotees : Array.from({ length: 6 }, (_, i) => randomConfig(i % 2 ? 'male' : 'female', 77 + i * 13))).slice(0, 6), [devotees])

  return (
    <Canvas shadows dpr={[1, 1.75]} camera={{ position: [0, 9, 26], fov: 45 }} onPointerMissed={() => onSelect(null)}>
      <color attach="background" args={['#050821']} />
      <fog attach="fog" args={['#050821', 45, 110]} />
      <Stars radius={100} depth={40} count={4000} factor={3.5} fade speed={0.4} />
      <hemisphereLight args={['#3949ab', '#3e2723', 0.55]} />
      <ambientLight intensity={0.18} color="#ffcc80" />
      <directionalLight position={[-10, 18, 14]} intensity={0.45} color="#9fa8da" castShadow shadow-mapSize={[1024, 1024]} />
      {/* the ghats glow warm from thousands of flames */}
      {[-18, -6, 6, 18].map((x) => (
        <pointLight key={x} position={[x, 3, GHAT.front - 3]} intensity={30 + lit / 40} distance={18} color="#ff9f43" />
      ))}

      <River />
      <Ghat />
      <GhatDiyas lit={lit} />
      <Temple />
      <Houses />
      <Rangoli />
      <Lanterns />
      <Devotees figs={crowd} />
      {diyas.map((d, i) => (
        <MessageDiya key={d.id} diya={d} index={i} selected={d.id === selectedId} fresh={d.id === freshId} glow={glow} onSelect={() => onSelect(d.id === selectedId ? null : d.id)} />
      ))}
      <Fireworks nonce={fireworksNonce} onBurst={onBurst} />
      <FocusRig target={focus} />
    </Canvas>
  )
}
