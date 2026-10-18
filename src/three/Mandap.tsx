import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { fabricTexture } from './textures'

const GOLD = '#ffc400'
const RED = '#c62828'
const SKIN = '#f3c48e'

function Gold({ rough = 0.25 }: { rough?: number }) {
  return <meshPhysicalMaterial color={GOLD} metalness={0.9} roughness={rough} />
}

function deviFaceTexture() {
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 256
  const ctx = c.getContext('2d')!
  ctx.fillStyle = SKIN
  ctx.fillRect(0, 0, 1024, 256)
  const cx = 512
  const ey = 112
  // large almond eyes with kajal
  for (const s of [-1, 1]) {
    const x = cx + s * 50
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.moveTo(x - 30, ey)
    ctx.quadraticCurveTo(x, ey - 22, x + 30, ey)
    ctx.quadraticCurveTo(x, ey + 18, x - 30, ey)
    ctx.fill()
    ctx.strokeStyle = '#111'
    ctx.lineWidth = 6
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + s * 30, ey)
    ctx.lineTo(x + s * 44, ey - 8)
    ctx.stroke()
    ctx.fillStyle = '#111'
    ctx.beginPath()
    ctx.arc(x, ey - 1, 11, 0, Math.PI * 2)
    ctx.fill()
    // brows
    ctx.lineWidth = 7
    ctx.beginPath()
    ctx.moveTo(x - 34, ey - 30)
    ctx.quadraticCurveTo(x, ey - 46, x + 34, ey - 32)
    ctx.stroke()
  }
  // third eye
  ctx.fillStyle = '#fff'
  ctx.strokeStyle = '#111'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.ellipse(cx, ey - 52, 8, 16, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#111'
  ctx.beginPath()
  ctx.arc(cx, ey - 52, 5, 0, Math.PI * 2)
  ctx.fill()
  // red tilak/bindi below it
  ctx.fillStyle = '#d50000'
  ctx.beginPath()
  ctx.arc(cx, ey - 26, 7, 0, Math.PI * 2)
  ctx.fill()
  // nose + gentle smile + lips
  ctx.strokeStyle = '#a0522d'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(cx - 6, ey + 34)
  ctx.quadraticCurveTo(cx, ey + 40, cx + 6, ey + 34)
  ctx.stroke()
  ctx.fillStyle = '#c62828'
  ctx.beginPath()
  ctx.moveTo(cx - 26, ey + 62)
  ctx.quadraticCurveTo(cx, ey + 80, cx + 26, ey + 62)
  ctx.quadraticCurveTo(cx, ey + 66, cx - 26, ey + 62)
  ctx.fill()
  // nath
  ctx.strokeStyle = GOLD
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.arc(cx + 20, ey + 46, 16, -0.4, Math.PI * 1.3)
  ctx.stroke()
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/** Marigold garland: a ring of orange & yellow flower balls. */
function Garland({ radius, y, count = 24, tilt = 0 }: { radius: number; y: number; count?: number; tilt?: number }) {
  return (
    <group position={[0, y, 0]} rotation={[tilt, 0, 0]}>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * radius, 0, Math.sin(a) * radius]}>
            <icosahedronGeometry args={[0.1, 0]} />
            <meshStandardMaterial color={i % 2 ? '#ff8f00' : '#ffd600'} roughness={0.9} />
          </mesh>
        )
      })}
    </group>
  )
}

/** A swag of marigolds hanging between two points. */
function Swag({ from, to, sag = 0.6, n = 14 }: { from: [number, number, number]; to: [number, number, number]; sag?: number; n?: number }) {
  return (
    <group>
      {Array.from({ length: n + 1 }, (_, i) => {
        const k = i / n
        const p: [number, number, number] = [
          from[0] + (to[0] - from[0]) * k,
          from[1] + (to[1] - from[1]) * k - Math.sin(k * Math.PI) * sag,
          from[2] + (to[2] - from[2]) * k,
        ]
        return (
          <mesh key={i} position={p}>
            <icosahedronGeometry args={[0.09, 0]} />
            <meshStandardMaterial color={i % 2 ? '#ff8f00' : '#ffd600'} roughness={0.9} />
          </mesh>
        )
      })}
    </group>
  )
}

function Diya({ position, seed }: { position: [number, number, number]; seed: number }) {
  const flame = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (flame.current) {
      const f = 1 + Math.sin(clock.elapsedTime * 13 + seed) * 0.12 + Math.sin(clock.elapsedTime * 7.3 + seed * 2) * 0.08
      flame.current.scale.set(1, f, 1)
    }
  })
  return (
    <group position={position}>
      <mesh castShadow>
        <sphereGeometry args={[0.13, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color="#bf5b25" side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={flame} position={[0, 0.1, 0]}>
        <coneGeometry args={[0.045, 0.16, 10]} />
        <meshBasicMaterial color="#ffcc33" toneMapped={false} />
      </mesh>
    </group>
  )
}

/** Weapons & symbols held in Maa's eight hands. */
function Symbol({ kind }: { kind: string }) {
  switch (kind) {
    case 'trishul':
      return (
        <group position={[0, 0.5, 0]}>
          <mesh><cylinderGeometry args={[0.03, 0.03, 1.6, 8]} /><Gold /></mesh>
          {[-0.14, 0, 0.14].map((x) => (
            <mesh key={x} position={[x, 0.86, 0]}><coneGeometry args={[0.05, x ? 0.22 : 0.32, 6]} /><Gold /></mesh>
          ))}
          <mesh position={[0, 0.72, 0]}><boxGeometry args={[0.34, 0.05, 0.05]} /><Gold /></mesh>
        </group>
      )
    case 'chakra':
      return (
        <group position={[0, 0.25, 0]}>
          <mesh><torusGeometry args={[0.2, 0.05, 8, 24]} /><Gold /></mesh>
          {Array.from({ length: 8 }, (_, i) => (
            <mesh key={i} rotation={[0, 0, (i / 8) * Math.PI]}><boxGeometry args={[0.38, 0.02, 0.02]} /><Gold /></mesh>
          ))}
        </group>
      )
    case 'sword':
      return (
        <group position={[0, 0.45, 0]}>
          <mesh><boxGeometry args={[0.08, 0.9, 0.02]} /><meshPhysicalMaterial color="#cfd8dc" metalness={0.9} roughness={0.2} /></mesh>
          <mesh position={[0, -0.47, 0]}><boxGeometry args={[0.24, 0.05, 0.05]} /><Gold /></mesh>
        </group>
      )
    case 'lotus':
      return (
        <group position={[0, 0.18, 0]}>
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2
            return (
              <mesh key={i} position={[Math.cos(a) * 0.08, 0.05, Math.sin(a) * 0.08]} rotation={[Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6]}>
                <sphereGeometry args={[0.07, 8, 6]} />
                <meshStandardMaterial color="#f48fb1" />
              </mesh>
            )
          })}
          <mesh position={[0, 0.08, 0]}><sphereGeometry args={[0.06, 8, 6]} /><meshStandardMaterial color="#ffd54f" /></mesh>
        </group>
      )
    case 'shankh':
      return (
        <mesh position={[0, 0.15, 0]} rotation={[0, 0, 0.6]}>
          <coneGeometry args={[0.11, 0.36, 12]} />
          <meshStandardMaterial color="#fffdf5" />
        </mesh>
      )
    case 'gada':
      return (
        <group position={[0, 0.4, 0]}>
          <mesh><cylinderGeometry args={[0.03, 0.03, 0.8, 8]} /><Gold /></mesh>
          <mesh position={[0, 0.45, 0]}><sphereGeometry args={[0.13, 12, 10]} /><Gold /></mesh>
        </group>
      )
    case 'bow':
      return (
        <group position={[0, 0.2, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.45, 0.025, 6, 24, Math.PI]} /><meshStandardMaterial color="#6d4c41" /></mesh>
          <mesh position={[0, 0, 0]}><boxGeometry args={[0.01, 0.9, 0.01]} /><meshStandardMaterial color="#fff" /></mesh>
        </group>
      )
    default:
      return null
  }
}

/** Ambe Maa / Durga: a stylised brick murti with eight arms, mukut and prabhavali. */
function Durga() {
  const face = useMemo(deviFaceTexture, [])
  const saree = useMemo(() => fabricTexture(RED, GOLD, 'mirror'), [])
  const halo = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (halo.current) halo.current.rotation.z = clock.elapsedTime * 0.15
  })

  // 4 arms on each side, fanned out
  const arms: { side: 1 | -1; angle: number; symbol: string }[] = [
    { side: -1, angle: 0.5, symbol: 'trishul' },
    { side: -1, angle: 1.1, symbol: 'chakra' },
    { side: -1, angle: 1.7, symbol: 'sword' },
    { side: -1, angle: 2.3, symbol: 'lotus' },
    { side: 1, angle: 0.5, symbol: 'shankh' },
    { side: 1, angle: 1.1, symbol: 'gada' },
    { side: 1, angle: 1.7, symbol: 'bow' },
    { side: 1, angle: 2.3, symbol: 'abhaya' },
  ]

  return (
    <group>
      {/* prabhavali (halo) */}
      <group position={[0, 3.3, -0.55]}>
        <mesh>
          <circleGeometry args={[1.55, 48]} />
          <meshStandardMaterial color="#ff8f00" emissive="#ff6f00" emissiveIntensity={0.35} />
        </mesh>
        <group ref={halo}>
          {Array.from({ length: 24 }, (_, i) => (
            <mesh key={i} rotation={[0, 0, (i / 24) * Math.PI * 2]} position={[0, 0, 0.01]}>
              <boxGeometry args={[0.05, 3.5, 0.02]} />
              <meshStandardMaterial color="#ffd54f" emissive="#ffb300" emissiveIntensity={0.4} />
            </mesh>
          ))}
        </group>
        <mesh position={[0, 0, 0.02]}>
          <torusGeometry args={[1.6, 0.09, 10, 48]} />
          <Gold />
        </mesh>
      </group>

      {/* saree skirt */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <cylinderGeometry args={[0.62, 1.05, 1.7, 40, 1, true, -Math.PI, Math.PI * 2]} />
        <meshPhysicalMaterial map={saree} roughness={0.4} clearcoat={0.5} side={THREE.DoubleSide} />
      </mesh>
      {/* torso */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.62, 1.1, 8]} />
        <meshPhysicalMaterial color={RED} roughness={0.35} clearcoat={0.5} />
      </mesh>
      {/* pallu across the chest */}
      <mesh position={[0.05, 2.25, 0.42]} rotation={[0.15, 0, -0.6]}>
        <boxGeometry args={[0.3, 1.25, 0.05]} />
        <meshPhysicalMaterial map={saree} roughness={0.4} />
      </mesh>
      {/* chunari behind the head */}
      <mesh position={[0, 2.85, -0.42]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[1.2, 1.5, 0.05]} />
        <meshPhysicalMaterial color="#d32f2f" roughness={0.4} />
      </mesh>

      {/* necklaces & garland */}
      <mesh position={[0, 2.65, 0.1]} rotation={[Math.PI / 2 - 0.3, 0, 0]}>
        <torusGeometry args={[0.36, 0.05, 8, 28, Math.PI]} />
        <Gold />
      </mesh>
      <Garland radius={0.55} y={2.45} count={22} tilt={0.35} />

      {/* arms */}
      {arms.map((a, i) => (
        <group key={i} position={[a.side * 0.5, 2.6, -0.05 - i * 0.01]} rotation={[0, 0, a.side * a.angle]}>
          <mesh position={[0, -0.45, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.09, 0.9, 12]} />
            <meshPhysicalMaterial color={SKIN} roughness={0.35} clearcoat={0.5} />
          </mesh>
          <mesh position={[0, -0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.11, 0.025, 6, 16]} />
            <Gold />
          </mesh>
          <group position={[0, -0.95, 0.04]} rotation={[0, 0, -a.side * a.angle]}>
            <mesh>
              <sphereGeometry args={[0.1, 12, 10]} />
              <meshPhysicalMaterial color={SKIN} roughness={0.35} />
            </mesh>
            <Symbol kind={a.symbol} />
          </group>
        </group>
      ))}

      {/* head */}
      <group position={[0, 2.85, 0]}>
        <mesh position={[0, 0.38, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.76, 48, 1, false, -Math.PI, Math.PI * 2]} />
          <meshPhysicalMaterial attach="material-0" map={face} roughness={0.3} clearcoat={0.5} />
          <meshPhysicalMaterial attach="material-1" color={SKIN} roughness={0.3} />
          <meshPhysicalMaterial attach="material-2" color={SKIN} roughness={0.3} />
        </mesh>
        {/* hair */}
        <mesh position={[0, 0.25, -0.2]} scale={[1.05, 1.1, 0.9]}>
          <sphereGeometry args={[0.52, 24, 16, Math.PI * 0.6, Math.PI * 1.8]} />
          <meshStandardMaterial color="#111" side={THREE.DoubleSide} />
        </mesh>
        {/* jhumkas */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.52, 0.2, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.09, 0.18, 12]} />
            <Gold />
          </mesh>
        ))}
        {/* mukut (crown) */}
        <group position={[0, 0.78, 0]}>
          <mesh>
            <cylinderGeometry args={[0.5, 0.52, 0.25, 32]} />
            <Gold />
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.22, 0.46, 0.5, 32]} />
            <Gold />
          </mesh>
          <mesh position={[0, 0.75, 0]}>
            <coneGeometry args={[0.2, 0.4, 24]} />
            <Gold />
          </mesh>
          {Array.from({ length: 7 }, (_, i) => {
            const a = (i / 7) * Math.PI * 2
            return (
              <mesh key={i} position={[Math.sin(a) * 0.51, 0, Math.cos(a) * 0.51]}>
                <sphereGeometry args={[0.055, 10, 8]} />
                <meshPhysicalMaterial color={i % 2 ? '#e53935' : '#00c853'} roughness={0.1} clearcoat={1} />
              </mesh>
            )
          })}
          <mesh position={[0, 0.35, 0.36]}>
            <sphereGeometry args={[0.08, 12, 10]} />
            <meshPhysicalMaterial color="#e53935" roughness={0.1} clearcoat={1} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

/** Maa's vahan: a friendly brick lion resting at her feet. */
function Lion() {
  const mane = '#8d4a12'
  const body = '#e0a030'
  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.8, 0.6, 1.5]} />
        <meshPhysicalMaterial color={body} roughness={0.4} clearcoat={0.5} />
      </mesh>
      {[[-0.28, 0.5], [0.28, 0.5], [-0.28, -0.5], [0.28, -0.5]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.2, z]} castShadow>
          <boxGeometry args={[0.24, 0.4, 0.3]} />
          <meshPhysicalMaterial color={body} roughness={0.4} />
        </mesh>
      ))}
      <group position={[0, 0.95, 0.75]}>
        <mesh castShadow>
          <icosahedronGeometry args={[0.48, 1]} />
          <meshStandardMaterial color={mane} roughness={0.9} flatShading />
        </mesh>
        <mesh position={[0, -0.02, 0.25]} castShadow>
          <boxGeometry args={[0.5, 0.45, 0.4]} />
          <meshPhysicalMaterial color={body} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.08, 0.47]}>
          <boxGeometry args={[0.26, 0.18, 0.1]} />
          <meshStandardMaterial color="#f5deb3" />
        </mesh>
        <mesh position={[0, 0.02, 0.53]}>
          <boxGeometry args={[0.1, 0.07, 0.04]} />
          <meshStandardMaterial color="#3e2723" />
        </mesh>
        {[-0.12, 0.12].map((x) => (
          <mesh key={x} position={[x, 0.1, 0.46]}>
            <sphereGeometry args={[0.04, 8, 6]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        ))}
      </group>
      <mesh position={[0.1, 0.7, -0.9]} rotation={[0.9, 0, 0.3]}>
        <cylinderGeometry args={[0.04, 0.04, 0.7, 6]} />
        <meshStandardMaterial color={body} />
      </mesh>
    </group>
  )
}

/** The centrepiece: decorated mandap with Maa on a tiered pedestal, diyas all around. */
export function Mandap() {
  const pillarR = 2.3
  const pillars = Array.from({ length: 4 }, (_, i) => {
    const a = Math.PI / 4 + (i / 4) * Math.PI * 2
    return [Math.cos(a) * pillarR, Math.sin(a) * pillarR] as const
  })
  return (
    <group>
      {/* tiered pedestal */}
      {[[2.0, 0.3, '#8e1b1b'], [1.65, 0.3, GOLD], [1.35, 0.3, '#b71c1c']].map(([r, h, c], i) => (
        <mesh key={i} position={[0, (i + 0.5) * 0.3, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[r as number, r as number, h as number, 8]} />
          {c === GOLD ? <Gold rough={0.35} /> : <meshPhysicalMaterial color={c as string} roughness={0.4} clearcoat={0.4} />}
        </mesh>
      ))}
      <Garland radius={2.02} y={0.32} count={40} />
      <Garland radius={1.67} y={0.62} count={34} />

      <group position={[0, 0.9, 0]}>
        <Durga />
      </group>
      <group position={[1.15, 0.9, 0.55]} rotation={[0, -0.5, 0]} scale={0.8}>
        <Lion />
      </group>

      {/* pillars, dome and kalash */}
      {pillars.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 3.3, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.2, 6.6, 12]} />
            <meshPhysicalMaterial color="#c62828" roughness={0.4} clearcoat={0.5} />
          </mesh>
          {[1.2, 3.3, 5.4].map((y) => (
            <mesh key={y} position={[0, y, 0]}>
              <torusGeometry args={[0.2, 0.05, 8, 16]} />
              <Gold />
            </mesh>
          ))}
        </group>
      ))}
      {pillars.map(([x, z], i) => {
        const [nx, nz] = pillars[(i + 1) % 4]
        return <Swag key={i} from={[x, 6.3, z]} to={[nx, 6.3, nz]} sag={0.8} />
      })}
      {/* toran of mango leaves around the canopy */}
      {Array.from({ length: 32 }, (_, i) => {
        const a = (i / 32) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 2.75, 6.45, Math.sin(a) * 2.75]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.1, 0.4, 4]} />
            <meshStandardMaterial color="#2e7d32" />
          </mesh>
        )
      })}
      <mesh position={[0, 6.7, 0]} castShadow>
        <cylinderGeometry args={[2.6, 2.9, 0.3, 8]} />
        <meshPhysicalMaterial color="#b71c1c" roughness={0.4} />
      </mesh>
      <mesh position={[0, 6.85, 0]} castShadow>
        <sphereGeometry args={[2.3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Gold rough={0.3} />
      </mesh>
      <group position={[0, 9.25, 0]}>
        <mesh>
          <sphereGeometry args={[0.32, 16, 12]} />
          <Gold />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <coneGeometry args={[0.18, 0.5, 12]} />
          <Gold />
        </mesh>
        {/* dhaja (flag) */}
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1.0, 6]} />
          <Gold />
        </mesh>
        <mesh position={[0.25, 1.2, 0]}>
          <coneGeometry args={[0.18, 0.5, 3]} />
          <meshStandardMaterial color="#ff6f00" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* ring of diyas */}
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2
        return <Diya key={i} seed={i} position={[Math.cos(a) * 2.25, 0.02, Math.sin(a) * 2.25]} />
      })}
      <pointLight position={[0, 2.5, 2.5]} intensity={18} distance={9} color="#ffb74d" />
      <pointLight position={[0, 5.5, 0]} intensity={14} distance={10} color="#ffcc80" />
    </group>
  )
}
