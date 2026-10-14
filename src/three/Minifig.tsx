import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { MinifigConfig } from '../lib/types'
import { faceTexture, printTexture } from './textures'

export type MinifigMode = 'idle' | 'wave' | 'dance' | 'read' | 'walk' | 'celebrate'

function Plastic({ color, side }: { color: string; side?: THREE.Side }) {
  return <meshPhysicalMaterial color={color} roughness={0.32} clearcoat={0.7} clearcoatRoughness={0.25} side={side} />
}

/* Torso is a trapezoid extruded front-to-back, like the real brick. */
function useTorsoGeometry() {
  return useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-0.56, 0)
    s.lineTo(0.56, 0)
    s.lineTo(0.42, 1.15)
    s.lineTo(-0.42, 1.15)
    s.closePath()
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.52, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 })
    g.translate(0, 0, -0.26)
    return g
  }, [])
}

const BACK_ONLY: [number, number] = [Math.PI * 0.28, Math.PI * 1.44]

function Hair({ cfg }: { cfg: MinifigConfig }) {
  const c = cfg.hairColor
  const dome = (
    <mesh position={[0, 0.5, 0]} scale={[1, 0.85, 1]} castShadow>
      <sphereGeometry args={[0.47, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <Plastic color={c} />
    </mesh>
  )
  const sides = (h = 0.32, y = 0.36) => (
    <mesh position={[0, y, 0]} castShadow>
      <cylinderGeometry args={[0.47, 0.47, h, 32, 1, true, BACK_ONLY[0], BACK_ONLY[1]]} />
      <Plastic color={c} side={THREE.DoubleSide} />
    </mesh>
  )
  switch (cfg.hair) {
    case 'bald':
      return null
    case 'bowl':
      return <group>{dome}{sides()}</group>
    case 'long':
      return (
        <group>
          {dome}
          {sides(0.5, 0.27)}
          <mesh position={[0, -0.15, -0.3]} rotation={[0.12, 0, 0]} castShadow>
            <boxGeometry args={[0.9, 0.95, 0.2]} />
            <Plastic color={c} />
          </mesh>
          {[-1, 1].map((x) => (
            <mesh key={x} position={[x * 0.4, 0.0, 0.05]} castShadow>
              <boxGeometry args={[0.16, 0.8, 0.4]} />
              <Plastic color={c} />
            </mesh>
          ))}
        </group>
      )
    case 'spiky':
      return (
        <group>
          {dome}
          {sides(0.22, 0.4)}
          {Array.from({ length: 7 }, (_, i) => {
            const a = (i / 7) * Math.PI * 2
            return (
              <mesh key={i} position={[Math.sin(a) * 0.26, 0.82, Math.cos(a) * 0.26 - 0.04]} rotation={[Math.cos(a) * 0.6, 0, -Math.sin(a) * 0.6]} castShadow>
                <coneGeometry args={[0.12, 0.38, 8]} />
                <Plastic color={c} />
              </mesh>
            )
          })}
        </group>
      )
    case 'bun':
      return (
        <group>
          {dome}
          {sides()}
          <mesh position={[0, 0.92, -0.12]} castShadow>
            <sphereGeometry args={[0.22, 24, 16]} />
            <Plastic color={c} />
          </mesh>
        </group>
      )
    case 'cap':
      return (
        <group>
          {dome}
          <mesh position={[0, 0.55, 0.38]} scale={[1, 1, 0.9]} castShadow>
            <cylinderGeometry args={[0.36, 0.36, 0.05, 32, 1, false, -Math.PI / 2, Math.PI]} />
            <Plastic color={c} />
          </mesh>
          <mesh position={[0, 0.94, 0]}>
            <sphereGeometry args={[0.06, 12, 8]} />
            <Plastic color={c} />
          </mesh>
        </group>
      )
    case 'beanie':
      return (
        <group>
          <mesh position={[0, 0.5, 0]} scale={[1, 1.15, 1]} castShadow>
            <sphereGeometry args={[0.47, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <Plastic color={c} />
          </mesh>
          <mesh position={[0, 0.52, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.46, 0.08, 12, 32]} />
            <Plastic color={c} />
          </mesh>
          <mesh position={[0, 1.08, 0]} castShadow>
            <sphereGeometry args={[0.13, 16, 12]} />
            <Plastic color="#f4f4f4" />
          </mesh>
        </group>
      )
    case 'crown':
      return (
        <group position={[0, 0.78, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.4, 0.36, 0.24, 32, 1, true]} />
            <meshPhysicalMaterial color="#ffc300" metalness={0.8} roughness={0.25} side={THREE.DoubleSide} />
          </mesh>
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2
            return (
              <mesh key={i} position={[Math.sin(a) * 0.38, 0.22, Math.cos(a) * 0.38]} castShadow>
                <coneGeometry args={[0.07, 0.22, 6]} />
                <meshPhysicalMaterial color="#ffc300" metalness={0.8} roughness={0.25} />
              </mesh>
            )
          })}
          <mesh position={[0, 0.02, 0.39]}>
            <sphereGeometry args={[0.05, 12, 8]} />
            <meshPhysicalMaterial color="#e3000b" roughness={0.1} clearcoat={1} />
          </mesh>
        </group>
      )
  }
}

function BookProp({ color = '#0055bf' }: { color?: string }) {
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[0.55, 0.7, 0.12]} />
        <Plastic color={color} />
      </mesh>
      <mesh position={[0.02, 0, 0]}>
        <boxGeometry args={[0.53, 0.66, 0.13]} />
        <meshStandardMaterial color="#fffaf0" />
      </mesh>
    </group>
  )
}

export interface MinifigProps {
  config: MinifigConfig
  mode?: MinifigMode
  position?: [number, number, number]
  rotationY?: number
  scale?: number
  onClick?: () => void
  /** phase offset so a crowd doesn't move in lockstep */
  seed?: number
  bookColor?: string
}

export default function Minifig({ config: cfg, mode = 'idle', position = [0, 0, 0], rotationY = 0, scale = 1, onClick, seed = 0, bookColor }: MinifigProps) {
  const root = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const armL = useRef<THREE.Group>(null)
  const armR = useRef<THREE.Group>(null)
  const legL = useRef<THREE.Group>(null)
  const legR = useRef<THREE.Group>(null)
  const torsoGeo = useTorsoGeometry()
  const faceTex = useMemo(() => faceTexture(cfg.face, cfg.skin), [cfg.face, cfg.skin])
  const printTex = useMemo(() => printTexture(cfg.print, cfg.torso), [cfg.print, cfg.torso])

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime + seed
    const k = 1 - Math.pow(0.0008, dt) // frame-rate independent easing
    const ease = (obj: THREE.Object3D | null, axis: 'x' | 'y' | 'z', target: number) => {
      if (obj) obj.rotation[axis] += (target - obj.rotation[axis]) * k
    }
    let bob = Math.sin(t * 2) * 0.02
    let lA = { x: Math.sin(t * 1.5) * 0.06, z: 0.12 }
    let rA = { x: -Math.sin(t * 1.5) * 0.06, z: -0.12 }
    let lL = 0
    let rL = 0
    let hY = Math.sin(t * 0.7) * 0.35
    let hX = 0
    let spin = 0

    switch (mode) {
      case 'wave':
        rA = { x: 0, z: -2.5 + Math.sin(t * 9) * 0.35 }
        hY = 0.15
        break
      case 'dance':
        bob = Math.abs(Math.sin(t * 5)) * 0.25
        lA = { x: Math.sin(t * 5) * 0.3, z: 1.2 + Math.sin(t * 5) * 1.1 }
        rA = { x: -Math.sin(t * 5) * 0.3, z: -1.2 + Math.sin(t * 5) * 1.1 }
        lL = Math.sin(t * 5) * 0.4
        rL = -Math.sin(t * 5) * 0.4
        hY = Math.sin(t * 2.5) * 0.5
        spin = Math.sin(t * 1.2) * 0.6
        break
      case 'read':
        lA = { x: -1.25, z: -0.15 }
        rA = { x: -1.25, z: 0.15 }
        hX = 0.3 + Math.sin(t * 0.8) * 0.04
        hY = Math.sin(t * 0.5) * 0.12
        bob = Math.sin(t * 1.2) * 0.01
        break
      case 'walk':
        lA = { x: Math.sin(t * 6) * 0.7, z: 0.1 }
        rA = { x: -Math.sin(t * 6) * 0.7, z: -0.1 }
        lL = -Math.sin(t * 6) * 0.6
        rL = Math.sin(t * 6) * 0.6
        bob = Math.abs(Math.sin(t * 6)) * 0.06
        hY = 0
        break
      case 'celebrate':
        bob = Math.abs(Math.sin(t * 6)) * 0.45
        lA = { x: 0, z: 2.7 + Math.sin(t * 12) * 0.2 }
        rA = { x: 0, z: -2.7 - Math.sin(t * 12) * 0.2 }
        hX = -0.2
        hY = 0
        break
    }

    if (root.current) {
      root.current.position.y = position[1] + bob
      root.current.rotation.y += (rotationY + spin - root.current.rotation.y) * k
    }
    ease(armL.current, 'x', lA.x)
    ease(armL.current, 'z', lA.z)
    ease(armR.current, 'x', rA.x)
    ease(armR.current, 'z', rA.z)
    ease(legL.current, 'x', lL)
    ease(legR.current, 'x', rL)
    ease(head.current, 'y', hY)
    ease(head.current, 'x', hX)
  })

  const holdsBook = cfg.accessory === 'book' || mode === 'read'

  const arm = (side: 1 | -1, ref: React.RefObject<THREE.Group | null>) => (
    <group ref={ref} position={[side * 0.5, 2.48, 0]} rotation={[0, 0, side * 0.12]}>
      <mesh position={[side * 0.07, -0.08, 0]} castShadow>
        <sphereGeometry args={[0.17, 16, 12]} />
        <Plastic color={cfg.torso} />
      </mesh>
      <mesh position={[side * 0.1, -0.42, 0.04]} rotation={[0.15, 0, side * 0.12]} castShadow>
        <cylinderGeometry args={[0.15, 0.14, 0.72, 16]} />
        <Plastic color={cfg.torso} />
      </mesh>
      <mesh position={[side * 0.15, -0.82, 0.1]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.12, 12]} />
        <Plastic color={cfg.skin} />
      </mesh>
      <mesh position={[side * 0.15, -0.96, 0.12]} rotation={[0, side * Math.PI / 2, Math.PI / 2]} castShadow>
        <torusGeometry args={[0.1, 0.055, 10, 20, Math.PI * 1.55]} />
        <Plastic color={cfg.skin} />
      </mesh>
      {side === -1 && holdsBook && mode !== 'read' && (
        <group position={[-0.15, -1.05, 0.2]} rotation={[0.3, 0.6, 0]}>
          <BookProp color={bookColor} />
        </group>
      )}
      {side === -1 && cfg.accessory === 'coffee' && !holdsBook && (
        <group position={[-0.15, -0.98, 0.14]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.12, 0.1, 0.32, 16]} />
            <meshPhysicalMaterial color="#c8a27a" roughness={0.1} transmission={0.4} transparent opacity={0.85} />
          </mesh>
          <mesh position={[0, 0.17, 0]}>
            <cylinderGeometry args={[0.125, 0.125, 0.04, 16]} />
            <Plastic color="#f4f4f4" />
          </mesh>
          <mesh position={[0.03, 0.3, 0]} rotation={[0, 0, -0.15]}>
            <cylinderGeometry args={[0.02, 0.02, 0.28, 8]} />
            <Plastic color="#00a650" />
          </mesh>
        </group>
      )}
    </group>
  )

  const leg = (side: 1 | -1, ref: React.RefObject<THREE.Group | null>) => (
    <group ref={ref} position={[side * 0.28, 1.28, 0]}>
      <mesh position={[0, -0.55, 0]} castShadow>
        <boxGeometry args={[0.52, 1.0, 0.56]} />
        <Plastic color={cfg.legs} />
      </mesh>
      <mesh position={[0, -1.15, 0.06]} castShadow receiveShadow>
        <boxGeometry args={[0.52, 0.22, 0.7]} />
        <Plastic color={cfg.legs} />
      </mesh>
    </group>
  )

  return (
    <group
      ref={root}
      position={position}
      rotation={[0, rotationY, 0]}
      scale={scale}
      onClick={onClick ? (e) => { e.stopPropagation(); onClick() } : undefined}
      onPointerOver={onClick ? () => { document.body.style.cursor = 'pointer' } : undefined}
      onPointerOut={onClick ? () => { document.body.style.cursor = '' } : undefined}
    >
      <group position={[0, 0.02, 0]}>
        {leg(1, legL)}
        {leg(-1, legR)}

        {/* hips */}
        <mesh position={[0, 1.36, 0]} castShadow>
          <boxGeometry args={[1.1, 0.2, 0.58]} />
          <Plastic color={cfg.legs} />
        </mesh>

        {/* torso */}
        <mesh geometry={torsoGeo} position={[0, 1.46, 0]} castShadow>
          <Plastic color={cfg.torso} />
        </mesh>
        <mesh position={[0, 2.02, 0.295]}>
          <planeGeometry args={[0.86, 0.86]} />
          <meshStandardMaterial map={printTex} transparent roughness={0.4} polygonOffset polygonOffsetFactor={-2} />
        </mesh>

        {cfg.accessory === 'cape' && (
          <mesh position={[0, 1.78, -0.36]} rotation={[0.14, 0, 0]} castShadow>
            <boxGeometry args={[1.12, 1.55, 0.04]} />
            <Plastic color="#e3000b" />
          </mesh>
        )}

        {arm(1, armL)}
        {arm(-1, armR)}

        {mode === 'read' && (
          <group position={[0, 1.95, 0.85]} rotation={[-0.9, 0, 0]}>
            <group rotation={[0, 0, 0]}>
              <mesh position={[-0.3, 0, 0]} rotation={[0, 0.25, 0]} castShadow>
                <boxGeometry args={[0.58, 0.04, 0.72]} />
                <Plastic color={bookColor ?? '#0055bf'} />
              </mesh>
              <mesh position={[0.3, 0, 0]} rotation={[0, -0.25, 0]} castShadow>
                <boxGeometry args={[0.58, 0.04, 0.72]} />
                <Plastic color={bookColor ?? '#0055bf'} />
              </mesh>
              <mesh position={[-0.28, 0.03, 0]} rotation={[0, 0.25, 0]}>
                <boxGeometry args={[0.54, 0.04, 0.68]} />
                <meshStandardMaterial color="#fffaf0" />
              </mesh>
              <mesh position={[0.28, 0.03, 0]} rotation={[0, -0.25, 0]}>
                <boxGeometry args={[0.54, 0.04, 0.68]} />
                <meshStandardMaterial color="#fffaf0" />
              </mesh>
            </group>
          </group>
        )}

        {/* neck */}
        <mesh position={[0, 2.66, 0]}>
          <cylinderGeometry args={[0.17, 0.17, 0.12, 16]} />
          <Plastic color={cfg.skin} />
        </mesh>

        {/* head */}
        <group ref={head} position={[0, 2.71, 0]}>
          <mesh position={[0, 0.32, 0]} castShadow>
            <cylinderGeometry args={[0.42, 0.42, 0.64, 48, 1, false, -Math.PI, Math.PI * 2]} />
            <meshPhysicalMaterial attach="material-0" map={faceTex} roughness={0.3} clearcoat={0.6} />
            <meshPhysicalMaterial attach="material-1" color={cfg.skin} roughness={0.3} clearcoat={0.6} />
            <meshPhysicalMaterial attach="material-2" color={cfg.skin} roughness={0.3} clearcoat={0.6} />
          </mesh>
          {/* stud */}
          <mesh position={[0, 0.72, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.16, 24]} />
            <Plastic color={cfg.skin} />
          </mesh>
          <Hair cfg={cfg} />
          {cfg.accessory === 'glasses' && (
            <group position={[0, 0.37, 0.43]}>
              {[-1, 1].map((x) => (
                <mesh key={x} position={[x * 0.12, 0, 0]}>
                  <torusGeometry args={[0.09, 0.022, 8, 24]} />
                  <meshStandardMaterial color="#1b1b1b" />
                </mesh>
              ))}
              <mesh>
                <boxGeometry args={[0.08, 0.025, 0.02]} />
                <meshStandardMaterial color="#1b1b1b" />
              </mesh>
            </group>
          )}
          {cfg.accessory === 'headphones' && (
            <group position={[0, 0.35, 0]}>
              <mesh>
                <torusGeometry args={[0.52, 0.05, 10, 40, Math.PI]} />
                <Plastic color="#1b1b1b" />
              </mesh>
              {[-1, 1].map((x) => (
                <mesh key={x} position={[x * 0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                  <cylinderGeometry args={[0.17, 0.17, 0.14, 20]} />
                  <Plastic color="#ff5fa2" />
                </mesh>
              ))}
            </group>
          )}
        </group>
      </group>
    </group>
  )
}
