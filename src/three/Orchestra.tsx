import { Html } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import { orchestra, type Track } from '../lib/music'
import type { FigurineConfig, Pose } from '../lib/types'
import Figurine from './Figurine'

const GOLD = '#ffc400'

const base = (): Pose => ({
  armL: { x: 0, z: 0.15 }, armR: { x: 0, z: -0.15 }, legL: 0, legR: 0, bob: 0, turn: 0, lean: 0, clap: false, sticks: false, flare: 0.1,
})

/** Exponential decay pulse right after each hit in a pattern string. */
function hitEnvelope(pattern: string, beat: number) {
  const half = beat * 2
  const slot = Math.floor(half)
  const i = ((slot % pattern.length) + pattern.length) % pattern.length
  if (pattern[i] === '.') return 0
  return Math.exp(-(half - slot) * 5)
}

type Role = 'dhol' | 'tabla' | 'harmonium' | 'shehnai' | 'singer'

function musicianPose(role: Role, track: Track): (t: number) => Pose {
  return () => {
    const b = orchestra.beat()
    const p = base()
    const sway = Math.sin(b * Math.PI) * 0.06
    p.turn = sway
    switch (role) {
      case 'dhol': {
        const h = hitEnvelope(track.dhol, b)
        const left = Math.floor(b * 2) % 2 === 0
        p.armL = { x: -1.0 + (left ? h * 0.7 : 0), z: 0.35 }
        p.armR = { x: -1.0 + (!left ? h * 0.7 : 0), z: -0.35 }
        p.bob = Math.abs(Math.sin(b * Math.PI)) * 0.05
        break
      }
      case 'tabla': {
        const fast = Math.abs(Math.sin(b * Math.PI * 2))
        p.armL = { x: -0.8 - fast * 0.25, z: 0.1 }
        p.armR = { x: -0.8 - (1 - fast) * 0.25, z: -0.1 }
        p.lean = 0.15
        break
      }
      case 'harmonium':
        p.armL = { x: -1.05, z: 0.05 + Math.sin(b * Math.PI) * 0.15 }
        p.armR = { x: -0.9, z: -0.05 }
        p.lean = 0.12
        break
      case 'shehnai':
        p.armL = { x: -1.5, z: -0.25 }
        p.armR = { x: -1.35, z: 0.25 }
        p.lean = -0.05 + Math.sin(b * Math.PI * 0.5) * 0.08
        break
      case 'singer':
        p.armR = { x: -1.6, z: 0.15 }
        p.armL = { x: -0.4 + Math.sin(b * Math.PI) * 0.3, z: 0.9 + Math.sin(b * Math.PI * 0.5) * 0.4 }
        p.bob = Math.abs(Math.sin(b * Math.PI)) * 0.04
        break
    }
    return p
  }
}

const MUSICIANS: { role: Role; label: string; config: FigurineConfig; x: number; z: number }[] = [
  { role: 'dhol', label: 'Dholi', x: -3.2, z: 0.4, config: { gender: 'male', skin: '#b97a45', hairColor: '#1b1b1b', face: 'joy', main: '#e3000b', accent: '#ffd54f', second: '#fafafa', drape: '#ff6f00', pattern: 'mirror', femaleHair: 'braid', maleHead: 'pagdi', jewellery: false, dandiyaColor: '#ffb300' } },
  { role: 'tabla', label: 'Tabla', x: -1.6, z: -0.6, config: { gender: 'male', skin: '#d9a066', hairColor: '#1b1b1b', face: 'calm', main: '#1565c0', accent: '#fafafa', second: '#fafafa', drape: '#ffb300', pattern: 'plain', femaleHair: 'braid', maleHead: 'topi', jewellery: false, dandiyaColor: '#ffb300' } },
  { role: 'singer', label: 'Gayika', x: 0, z: 0.5, config: { gender: 'female', skin: '#e8b98a', hairColor: '#1b1b1b', face: 'smile', main: '#6a1b9a', accent: '#ffd54f', second: '#ff2d87', drape: '#ffb300', pattern: 'mirror', femaleHair: 'bun', maleHead: 'pagdi', jewellery: true, dandiyaColor: '#e3000b' } },
  { role: 'harmonium', label: 'Harmonium', x: 1.6, z: -0.6, config: { gender: 'male', skin: '#8d5524', hairColor: '#3b2416', face: 'smile', main: '#2e7d32', accent: '#ffd54f', second: '#fafafa', drape: '#c2185b', pattern: 'bandhani', femaleHair: 'braid', maleHead: 'safa', jewellery: false, dandiyaColor: '#ffb300' } },
  { role: 'shehnai', label: 'Shehnai', x: 3.2, z: 0.4, config: { gender: 'male', skin: '#e8b98a', hairColor: '#b0b0b0', face: 'calm', main: '#ffb300', accent: '#e3000b', second: '#fafafa', drape: '#e3000b', pattern: 'mirror', femaleHair: 'braid', maleHead: 'pagdi', jewellery: true, dandiyaColor: '#ffb300' } },
]

function Instrument({ role }: { role: Role }) {
  switch (role) {
    case 'dhol':
      return (
        <group position={[0, 1.55, 0.75]} rotation={[0, 0, Math.PI / 2]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.42, 0.42, 1.1, 24]} />
            <meshPhysicalMaterial color="#c62828" roughness={0.4} clearcoat={0.5} />
          </mesh>
          {[-0.56, 0.56].map((y) => (
            <mesh key={y} position={[0, y, 0]}>
              <cylinderGeometry args={[0.44, 0.44, 0.04, 24]} />
              <meshStandardMaterial color="#f5deb3" />
            </mesh>
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <mesh key={i} rotation={[0, (i / 8) * Math.PI, 0]}>
              <boxGeometry args={[0.02, 1.1, 0.88]} />
              <meshStandardMaterial color={GOLD} wireframe />
            </mesh>
          ))}
        </group>
      )
    case 'tabla':
      return (
        <group position={[0, 0, 1.0]}>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[1.2, 1.0, 0.6]} />
            <meshStandardMaterial color="#6d4c41" />
          </mesh>
          {[[-0.25, 0.22, 0.3], [0.25, 0.18, 0.26]].map(([x, r, h], i) => (
            <group key={i} position={[x, 1.0 + h / 2, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[r, r * 0.9, h, 20]} />
                <meshStandardMaterial color={i ? '#8d6e63' : '#cfd8dc'} metalness={i ? 0 : 0.7} roughness={0.3} />
              </mesh>
              <mesh position={[0, h / 2 + 0.01, 0]}>
                <cylinderGeometry args={[r * 0.95, r * 0.95, 0.02, 20]} />
                <meshStandardMaterial color="#f5deb3" />
              </mesh>
              <mesh position={[0, h / 2 + 0.02, 0]}>
                <cylinderGeometry args={[r * 0.4, r * 0.4, 0.02, 20]} />
                <meshStandardMaterial color="#212121" />
              </mesh>
            </group>
          ))}
        </group>
      )
    case 'harmonium':
      return (
        <group position={[0, 0, 1.0]}>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[1.2, 1.0, 0.6]} />
            <meshStandardMaterial color="#6d4c41" />
          </mesh>
          <mesh position={[0, 1.2, 0]} castShadow>
            <boxGeometry args={[1.1, 0.4, 0.6]} />
            <meshPhysicalMaterial color="#5d4037" roughness={0.3} clearcoat={0.6} />
          </mesh>
          <mesh position={[0, 1.41, 0.12]}>
            <boxGeometry args={[0.95, 0.03, 0.22]} />
            <meshStandardMaterial color="#fafafa" />
          </mesh>
          {Array.from({ length: 10 }, (_, i) => (
            <mesh key={i} position={[-0.42 + i * 0.094, 1.43, 0.07]}>
              <boxGeometry args={[0.04, 0.03, 0.12]} />
              <meshStandardMaterial color="#111" />
            </mesh>
          ))}
        </group>
      )
    case 'shehnai':
      return (
        <mesh position={[0, 2.95, 0.75]} rotation={[Math.PI / 2 + 0.5, 0, 0]}>
          <coneGeometry args={[0.13, 0.8, 16, 1, true]} />
          <meshPhysicalMaterial color="#8d6e63" roughness={0.4} side={THREE.DoubleSide} />
        </mesh>
      )
    case 'singer':
      return (
        <group position={[0, 0, 0.9]}>
          <mesh position={[0, 1.4, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 2.8, 8]} />
            <meshStandardMaterial color="#424242" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 2.85, -0.1]} rotation={[0.6, 0, 0]}>
            <capsuleGeometry args={[0.07, 0.18, 6, 12]} />
            <meshStandardMaterial color="#212121" />
          </mesh>
        </group>
      )
    default:
      return null
  }
}

function Speaker({ x }: { x: number }) {
  return (
    <group position={[x, 0, -1.2]}>
      <mesh position={[0, 1.3, 0]} castShadow>
        <boxGeometry args={[1.0, 2.6, 0.9]} />
        <meshStandardMaterial color="#212121" />
      </mesh>
      {[0.8, 1.9].map((y) => (
        <mesh key={y} position={[0, y, 0.46]}>
          <circleGeometry args={[y < 1 ? 0.36 : 0.22, 24]} />
          <meshStandardMaterial color="#424242" />
        </mesh>
      ))}
    </group>
  )
}

function bannerTexture() {
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 192
  const ctx = c.getContext('2d')!
  const g = ctx.createLinearGradient(0, 0, 1024, 0)
  g.addColorStop(0, '#c2185b')
  g.addColorStop(0.5, '#ff6f00')
  g.addColorStop(1, '#c2185b')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 1024, 192)
  ctx.fillStyle = '#ffd54f'
  for (let x = 16; x < 1024; x += 32) {
    ctx.beginPath()
    ctx.arc(x, 14, 6, 0, Math.PI * 2)
    ctx.arc(x, 178, 6, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 84px "Baloo 2", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('🪔 Navratri Garba Night 🪔', 512, 100)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** The orchestra stage: musicians animate in time with whatever track is playing. */
export default function Orchestra({ track, position, rotationY }: { track: Track; position: [number, number, number]; rotationY: number }) {
  const banner = useMemo(bannerTexture, [])
  const poses = useMemo(() => MUSICIANS.map((m) => musicianPose(m.role, track)), [track])
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* stage */}
      <mesh position={[0, 0.3, 0]} receiveShadow castShadow>
        <boxGeometry args={[9, 0.6, 3.8]} />
        <meshPhysicalMaterial color="#6a1b9a" roughness={0.5} clearcoat={0.3} />
      </mesh>
      <mesh position={[0, 0.61, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8.8, 3.6]} />
        <meshStandardMaterial color="#8e24aa" />
      </mesh>
      {/* backdrop */}
      <mesh position={[0, 3.2, -1.8]}>
        <boxGeometry args={[9, 5.2, 0.15]} />
        <meshStandardMaterial color="#311b92" />
      </mesh>
      <mesh position={[0, 4.9, -1.7]}>
        <planeGeometry args={[8.4, 1.6]} />
        <meshBasicMaterial map={banner} toneMapped={false} />
      </mesh>
      <Speaker x={-4.0} />
      <Speaker x={4.0} />
      {MUSICIANS.map((m, i) => (
        <group key={m.role} position={[m.x, 0.6, m.z]}>
          <Figurine config={m.config} pose={poses[i]} />
          <Instrument role={m.role} />
          <Html position={[0, 4.2, 0]} center distanceFactor={14} zIndexRange={[10, 0]}>
            <div className="label musician">{m.label}</div>
          </Html>
        </group>
      ))}
      <spotLight position={[0, 7, 5]} angle={0.7} penumbra={0.6} intensity={60} distance={18} color="#ffe0b2" />
    </group>
  )
}
