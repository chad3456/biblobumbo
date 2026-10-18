import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { FigurineConfig, Pose } from '../lib/types'
import { fabricTexture, faceTexture, stickTexture } from './textures'

const GOLD = '#ffc400'

function Plastic({ color, side, map }: { color?: string; side?: THREE.Side; map?: THREE.Texture }) {
  return <meshPhysicalMaterial color={map ? '#ffffff' : color} map={map} roughness={0.38} clearcoat={0.6} clearcoatRoughness={0.3} side={side} />
}

function Gold() {
  return <meshPhysicalMaterial color={GOLD} metalness={0.85} roughness={0.25} />
}

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

/** A flared, open cylinder whose hem radius can be animated (chaniya / kediyu frill). */
function useFlareGeometry(top: number, bottom: number, height: number) {
  return useMemo(() => {
    const g = new THREE.CylinderGeometry(top, bottom, height, 40, 4, true, -Math.PI, Math.PI * 2)
    const base = Float32Array.from(g.attributes.position.array as Float32Array)
    return { g, base, top, bottom, height }
  }, [top, bottom, height])
}

function applyFlare(f: ReturnType<typeof useFlareGeometry>, amount: number) {
  const pos = f.g.attributes.position as THREE.BufferAttribute
  const arr = pos.array as Float32Array
  for (let i = 0; i < arr.length; i += 3) {
    const y = f.base[i + 1]
    const k = (f.height / 2 - y) / f.height // 0 at waist, 1 at hem
    const scale = 1 + amount * k * k
    arr[i] = f.base[i] * scale
    arr[i + 2] = f.base[i + 2] * scale
    arr[i + 1] = y + amount * k * k * 0.12
  }
  pos.needsUpdate = true
}

function DandiyaStick({ color }: { color: string }) {
  const tex = stickTexture(color)
  return (
    <group rotation={[Math.PI / 2 - 0.35, 0, 0]} position={[0, -0.05, 0.12]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.045, 0.045, 1.0, 10]} />
        <meshStandardMaterial map={tex} roughness={0.5} />
      </mesh>
      {[-0.5, 0.5].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <sphereGeometry args={[0.06, 10, 8]} />
          <Gold />
        </mesh>
      ))}
      {/* little tassel ghungroo */}
      <mesh position={[0, 0.5, 0]}>
        <coneGeometry args={[0.07, 0.14, 8]} />
        <meshStandardMaterial color="#e3000b" />
      </mesh>
    </group>
  )
}

function FemaleHair({ cfg }: { cfg: FigurineConfig }) {
  const c = cfg.hairColor
  const cap = (
    <mesh position={[0, 0.5, -0.02]} scale={[1, 0.85, 1]} castShadow>
      <sphereGeometry args={[0.46, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <Plastic color={c} />
    </mesh>
  )
  const sides = (
    <mesh position={[0, 0.34, 0]} castShadow>
      <cylinderGeometry args={[0.46, 0.46, 0.34, 32, 1, true, Math.PI * 0.32, Math.PI * 1.36]} />
      <Plastic color={c} side={THREE.DoubleSide} />
    </mesh>
  )
  return (
    <group>
      {cap}
      {sides}
      {cfg.femaleHair === 'braid' && (
        <group position={[0, 0.25, -0.42]}>
          {Array.from({ length: 7 }, (_, i) => (
            <mesh key={i} position={[Math.sin(i * 1.3) * 0.03, -i * 0.2, -0.02 * i]} castShadow>
              <sphereGeometry args={[0.13 - i * 0.008, 14, 10]} />
              <Plastic color={c} />
            </mesh>
          ))}
          {/* parandi tassel */}
          <mesh position={[0, -1.48, -0.14]}>
            <coneGeometry args={[0.1, 0.26, 10]} />
            <Plastic color={cfg.accent} />
          </mesh>
        </group>
      )}
      {cfg.femaleHair === 'bun' && (
        <group position={[0, 0.5, -0.42]}>
          <mesh castShadow>
            <sphereGeometry args={[0.24, 20, 14]} />
            <Plastic color={c} />
          </mesh>
          {/* gajra (jasmine) */}
          {Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2
            return (
              <mesh key={i} position={[Math.cos(a) * 0.25, Math.sin(a) * 0.25, 0.02]}>
                <sphereGeometry args={[0.055, 8, 6]} />
                <meshStandardMaterial color="#fffdf5" />
              </mesh>
            )
          })}
        </group>
      )}
      {cfg.femaleHair === 'open' && (
        <mesh position={[0, -0.12, -0.33]} rotation={[0.12, 0, 0]} castShadow>
          <boxGeometry args={[0.88, 1.05, 0.18]} />
          <Plastic color={c} />
        </mesh>
      )}
      {cfg.jewellery && (
        <>
          {/* maang tikka */}
          <mesh position={[0, 0.5, 0.44]}>
            <sphereGeometry args={[0.055, 12, 8]} />
            <Gold />
          </mesh>
          {/* jhumka earrings */}
          {[-1, 1].map((s) => (
            <group key={s} position={[s * 0.44, 0.16, 0.02]}>
              <mesh>
                <sphereGeometry args={[0.04, 8, 6]} />
                <Gold />
              </mesh>
              <mesh position={[0, -0.1, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.07, 0.12, 12]} />
                <Gold />
              </mesh>
            </group>
          ))}
        </>
      )}
    </group>
  )
}

function MaleHead({ cfg }: { cfg: FigurineConfig }) {
  const d = cfg.drape
  switch (cfg.maleHead) {
    case 'none':
      return (
        <group>
          <mesh position={[0, 0.5, 0]} scale={[1, 0.8, 1]} castShadow>
            <sphereGeometry args={[0.46, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <Plastic color={cfg.hairColor} />
          </mesh>
          <mesh position={[0, 0.36, 0]}>
            <cylinderGeometry args={[0.46, 0.46, 0.28, 32, 1, true, Math.PI * 0.3, Math.PI * 1.4]} />
            <Plastic color={cfg.hairColor} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )
    case 'topi':
      return (
        <group position={[0, 0.62, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.44, 0.47, 0.28, 32]} />
            <Plastic color={d} />
          </mesh>
          <mesh position={[0, -0.12, 0]}>
            <cylinderGeometry args={[0.48, 0.48, 0.06, 32]} />
            <Plastic color={cfg.accent} />
          </mesh>
        </group>
      )
    case 'safa':
    case 'pagdi':
      return (
        <group position={[0, 0.48, 0]}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[0, i * 0.12, 0]} rotation={[Math.PI / 2 + (i % 2 ? 0.12 : -0.12), 0, 0]} castShadow>
              <torusGeometry args={[0.42 - i * 0.04, 0.1, 10, 28]} />
              <Plastic color={i === 1 ? cfg.accent : d} />
            </mesh>
          ))}
          <mesh position={[0, 0.26, 0]} scale={[1, 0.6, 1]} castShadow>
            <sphereGeometry args={[0.4, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <Plastic color={d} />
          </mesh>
          {cfg.maleHead === 'pagdi' ? (
            // turra: a little fan on top
            <group position={[0.12, 0.42, 0.1]} rotation={[0, 0, -0.35]}>
              {Array.from({ length: 5 }, (_, i) => (
                <mesh key={i} rotation={[0, 0, (i - 2) * 0.22]} position={[0, 0.12, 0]}>
                  <boxGeometry args={[0.04, 0.26, 0.02]} />
                  <Gold />
                </mesh>
              ))}
            </group>
          ) : (
            // safa tail hanging behind
            <mesh position={[0.12, -0.45, -0.42]} rotation={[0.15, 0, 0.05]} castShadow>
              <boxGeometry args={[0.24, 0.9, 0.05]} />
              <Plastic color={d} />
            </mesh>
          )}
        </group>
      )
  }
}

export interface FigurineProps {
  config: FigurineConfig
  /** called every frame with elapsed seconds; return the pose to ease towards */
  pose: (t: number) => Pose
  onClick?: () => void
  selected?: boolean
}

/** A LEGO-style minifig in Gujarati garba attire. */
export default function Figurine({ config: cfg, pose, onClick, selected }: FigurineProps) {
  const body = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const armL = useRef<THREE.Group>(null)
  const armR = useRef<THREE.Group>(null)
  const legL = useRef<THREE.Group>(null)
  const legR = useRef<THREE.Group>(null)
  const sticks = useRef<THREE.Group[]>([])
  const torsoGeo = useTorsoGeometry()
  const female = cfg.gender === 'female'
  const skirt = useFlareGeometry(0.56, female ? 1.0 : 0.74, female ? 1.32 : 0.5)
  const faceTex = useMemo(() => faceTexture(cfg.face, cfg.skin, cfg.gender, cfg.jewellery), [cfg.face, cfg.skin, cfg.gender, cfg.jewellery])
  const skirtTex = useMemo(() => fabricTexture(cfg.main, cfg.accent, cfg.pattern), [cfg.main, cfg.accent, cfg.pattern])
  const frontTex = useMemo(() => fabricTexture(female ? cfg.second : cfg.main, cfg.accent, cfg.pattern, false), [female, cfg.second, cfg.main, cfg.accent, cfg.pattern])
  const drapeTex = useMemo(() => fabricTexture(cfg.drape, cfg.accent, cfg.pattern === 'plain' ? 'plain' : 'bandhani'), [cfg.drape, cfg.accent, cfg.pattern])
  const flare = useRef(0.2)

  useFrame(({ clock }, dt) => {
    const p = pose(clock.elapsedTime)
    const k = 1 - Math.pow(0.0005, dt)
    const ease = (o: THREE.Object3D | null, axis: 'x' | 'y' | 'z', v: number) => {
      if (o) o.rotation[axis] += (v - o.rotation[axis]) * k
    }
    ease(armL.current, 'x', p.armL.x)
    ease(armL.current, 'z', p.armL.z)
    ease(armR.current, 'x', p.armR.x)
    ease(armR.current, 'z', p.armR.z)
    ease(legL.current, 'x', p.legL)
    ease(legR.current, 'x', p.legR)
    if (body.current) {
      body.current.position.y += (p.bob - body.current.position.y) * k
      // turn can be large (spins), so don't ease it the short way
      let d = (p.turn - body.current.rotation.y) % (Math.PI * 2)
      if (d > Math.PI) d -= Math.PI * 2
      if (d < -Math.PI) d += Math.PI * 2
      body.current.rotation.y += d * Math.min(1, k * 1.5)
      body.current.rotation.x += (p.lean - body.current.rotation.x) * k
    }
    if (head.current) head.current.rotation.x += (-p.lean * 0.6 - head.current.rotation.x) * k
    for (const s of sticks.current) if (s) s.visible = p.sticks
    flare.current += (p.flare - flare.current) * Math.min(1, dt * 4)
    applyFlare(skirt, flare.current * (female ? 0.55 : 0.4))
  })

  const sleeve = female ? cfg.second : cfg.main

  const arm = (side: 1 | -1, ref: React.RefObject<THREE.Group | null>) => (
    <group ref={ref} position={[side * 0.5, 2.48, 0]} rotation={[0, 0, side * 0.15]}>
      <mesh position={[side * 0.07, -0.08, 0]} castShadow>
        <sphereGeometry args={[0.17, 16, 12]} />
        <Plastic color={sleeve} />
      </mesh>
      <mesh position={[side * 0.1, -0.42, 0.04]} rotation={[0.15, 0, side * 0.12]} castShadow>
        <cylinderGeometry args={[0.15, 0.14, 0.72, 16]} />
        <Plastic color={female ? cfg.skin : sleeve} />
      </mesh>
      {female && (
        <mesh position={[side * 0.08, -0.2, 0.02]} rotation={[0.15, 0, side * 0.12]}>
          <cylinderGeometry args={[0.165, 0.165, 0.26, 16]} />
          <Plastic color={sleeve} />
        </mesh>
      )}
      {/* bangles */}
      {(female || cfg.jewellery) && (
        <mesh position={[side * 0.15, -0.76, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.12, 0.03, 8, 20]} />
          {female ? <meshPhysicalMaterial color={cfg.accent === GOLD ? '#e3000b' : cfg.accent} clearcoat={1} roughness={0.2} /> : <Gold />}
        </mesh>
      )}
      <mesh position={[side * 0.15, -0.82, 0.1]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.12, 12]} />
        <Plastic color={cfg.skin} />
      </mesh>
      <group position={[side * 0.15, -0.96, 0.12]}>
        <mesh rotation={[0, side * Math.PI / 2, Math.PI / 2]} castShadow>
          <torusGeometry args={[0.1, 0.055, 10, 20, Math.PI * 1.55]} />
          <Plastic color={cfg.skin} />
        </mesh>
        <group ref={(g) => { if (g) sticks.current[side === 1 ? 0 : 1] = g }} visible={false}>
          <DandiyaStick color={cfg.dandiyaColor} />
        </group>
      </group>
    </group>
  )

  const leg = (side: 1 | -1, ref: React.RefObject<THREE.Group | null>) => (
    <group ref={ref} position={[side * 0.28, 1.28, 0]}>
      {female ? (
        <mesh position={[0, -0.55, 0]} castShadow>
          <boxGeometry args={[0.46, 1.0, 0.5]} />
          <Plastic color={cfg.main} />
        </mesh>
      ) : (
        <>
          {/* chorno: puffy trousers gathered at the ankle */}
          <mesh position={[0, -0.45, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.24, 0.8, 16]} />
            <Plastic color={cfg.second} />
          </mesh>
          <mesh position={[0, -0.92, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.2, 0.2, 16]} />
            <Plastic color={cfg.second} />
          </mesh>
        </>
      )}
      {/* mojari / juttis */}
      <mesh position={[0, -1.15, 0.08]} castShadow receiveShadow>
        <boxGeometry args={[0.46, 0.22, 0.72]} />
        <Plastic color={female ? '#b71c1c' : '#8d6e63'} />
      </mesh>
      <mesh position={[0, -1.08, 0.44]} rotation={[-0.6, 0, 0]}>
        <coneGeometry args={[0.08, 0.2, 8]} />
        <Gold />
      </mesh>
    </group>
  )

  return (
    <group
      onClick={onClick ? (e) => { e.stopPropagation(); onClick() } : undefined}
      onPointerOver={onClick ? () => { document.body.style.cursor = 'pointer' } : undefined}
      onPointerOut={onClick ? () => { document.body.style.cursor = '' } : undefined}
    >
      {selected && (
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.1, 1.3, 40]} />
          <meshBasicMaterial color="#ffd54f" transparent opacity={0.9} />
        </mesh>
      )}
      <group ref={body}>
        {leg(1, legL)}
        {leg(-1, legR)}

        {/* hips */}
        <mesh position={[0, 1.36, 0]} castShadow>
          <boxGeometry args={[1.1, 0.2, 0.58]} />
          <Plastic color={female ? cfg.main : cfg.second} />
        </mesh>

        {/* chaniya (female) / kediyu frill (male) */}
        <mesh geometry={skirt.g} position={[0, female ? 0.8 : 1.55, 0]} castShadow>
          <Plastic map={skirtTex} side={THREE.DoubleSide} />
        </mesh>
        {female && (
          <mesh position={[0, 1.44, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.57, 0.06, 8, 32]} />
            <Plastic color={cfg.accent} />
          </mesh>
        )}

        {/* torso: choli / kediyu */}
        <mesh geometry={torsoGeo} position={[0, 1.46, 0]} castShadow>
          <Plastic color={female ? cfg.second : cfg.main} />
        </mesh>
        <mesh position={[0, 2.0, 0.295]}>
          <planeGeometry args={[0.84, 1.0]} />
          <meshStandardMaterial map={frontTex} roughness={0.5} polygonOffset polygonOffsetFactor={-2} />
        </mesh>
        {/* neckline embroidery */}
        <mesh position={[0, 2.5, 0.3]} rotation={[0, 0, Math.PI]}>
          <circleGeometry args={[0.2, 20, 0, Math.PI]} />
          <meshStandardMaterial color={cfg.accent} polygonOffset polygonOffsetFactor={-3} />
        </mesh>
        {female && (
          // midriff
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.5, 0.56, 0.12, 24]} />
            <Plastic color={cfg.skin} />
          </mesh>
        )}

        {female ? (
          // odhni: across the front from shoulder to hip, then down the back
          <group>
            <mesh position={[0.05, 1.95, 0.33]} rotation={[0, 0, -0.75]}>
              <boxGeometry args={[0.26, 1.35, 0.04]} />
              <Plastic map={drapeTex} />
            </mesh>
            <mesh position={[0, 1.55, -0.36]} rotation={[0.12, 0, 0]} castShadow>
              <boxGeometry args={[1.05, 1.6, 0.04]} />
              <Plastic map={drapeTex} />
            </mesh>
          </group>
        ) : (
          // kamarband (waist sash) with hanging ends
          <group>
            <mesh position={[0, 1.78, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.55, 0.07, 8, 28]} />
              <Plastic color={cfg.drape} />
            </mesh>
            <mesh position={[0.32, 1.45, 0.34]} rotation={[0, 0, 0.1]}>
              <boxGeometry args={[0.14, 0.6, 0.04]} />
              <Plastic color={cfg.drape} />
            </mesh>
          </group>
        )}

        {cfg.jewellery && (
          // necklace
          <mesh position={[0, 2.5, 0.12]} rotation={[Math.PI / 2 - 0.35, 0, 0]}>
            <torusGeometry args={[0.24, 0.035, 8, 24, Math.PI]} />
            <Gold />
          </mesh>
        )}

        {arm(1, armL)}
        {arm(-1, armR)}

        <mesh position={[0, 2.66, 0]}>
          <cylinderGeometry args={[0.17, 0.17, 0.12, 16]} />
          <Plastic color={cfg.skin} />
        </mesh>

        <group ref={head} position={[0, 2.71, 0]}>
          <mesh position={[0, 0.32, 0]} castShadow>
            <cylinderGeometry args={[0.42, 0.42, 0.64, 48, 1, false, -Math.PI, Math.PI * 2]} />
            <meshPhysicalMaterial attach="material-0" map={faceTex} roughness={0.32} clearcoat={0.6} />
            <meshPhysicalMaterial attach="material-1" color={cfg.skin} roughness={0.32} clearcoat={0.6} />
            <meshPhysicalMaterial attach="material-2" color={cfg.skin} roughness={0.32} clearcoat={0.6} />
          </mesh>
          <mesh position={[0, 0.72, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.16, 24]} />
            <Plastic color={cfg.skin} />
          </mesh>
          {female ? <FemaleHair cfg={cfg} /> : <MaleHead cfg={cfg} />}
        </group>
      </group>
    </group>
  )
}
