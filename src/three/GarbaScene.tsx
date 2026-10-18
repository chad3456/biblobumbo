import { Html, OrbitControls, Stars } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { formationTargets, type Formation, type Target } from '../lib/circle'
import { orchestra, TRACK_BY_ID } from '../lib/music'
import { STEP_BY_ID, aartiPose, clapPose, fudadiPose, jaiPose, namastePose, spinPose, wavePose } from '../lib/steps'
import type { Figurine as Fig, Pose, StepId } from '../lib/types'
import { useStore } from '../store'
import Figurine from './Figurine'
import { Ground } from './Ground'
import { Mandap } from './Mandap'
import Orchestra from './Orchestra'

export type CameraMode = 'orbit' | 'top' | 'follow'

const ORCH_POS: [number, number, number] = [-11, 0, -11]

interface Shared {
  targets: Map<string, Target>
  formation: Formation
  step: StepId
}

function Dancer({ fig, shared, selected, index }: { fig: Fig; shared: React.RefObject<Shared>; selected: boolean; index: number }) {
  const group = useRef<THREE.Group>(null)
  const select = useStore((s) => s.select)
  const bubble = useStore((s) => s.bubbles[fig.id])
  const placed = useRef(false)

  const pose = useMemo(() => (t: number): Pose => {
    const now = performance.now() / 1000
    const act = useStore.getState().actions[fig.id]
    if (act && act.until > now) {
      switch (act.id) {
        case 'namaste': return namastePose()
        case 'wave': return wavePose(t)
        case 'spin': return spinPose(t)
        case 'jai': return jaiPose(t)
        case 'clap': return clapPose(t)
        case 'fudadi': return fudadiPose(t)
      }
    }
    const sh = shared.current
    if (sh.formation === 'aarti') return aartiPose(t, false)
    // a tiny per-dancer lag makes the crowd feel human, not robotic
    return STEP_BY_ID[sh.step].pose(orchestra.beat() - (index % 3) * 0.03)
  }, [fig.id, shared, index])

  useFrame((_, dt) => {
    const g = group.current
    const tgt = shared.current.targets.get(fig.id)
    if (!g || !tgt) return
    if (!placed.current) {
      g.position.set(tgt.x, 0, tgt.z)
      g.rotation.y = tgt.rotY
      placed.current = true
      return
    }
    const k = 1 - Math.pow(0.02, dt)
    g.position.x += (tgt.x - g.position.x) * k
    g.position.z += (tgt.z - g.position.z) * k
    let d = (tgt.rotY - g.rotation.y) % (Math.PI * 2)
    if (d > Math.PI) d -= Math.PI * 2
    if (d < -Math.PI) d += Math.PI * 2
    g.rotation.y += d * k
  })

  return (
    <group ref={group} name={fig.id}>
      <Figurine config={fig.config} pose={pose} selected={selected} onClick={() => select(selected ? null : fig.id)} />
      <Html position={[0, 4.15, 0]} center distanceFactor={16} zIndexRange={[20, 0]}>
        <div className={`label ${fig.mine ? 'mine' : ''} ${selected ? 'sel' : ''}`} onClick={() => select(fig.id)}>
          {fig.mine && '⭐ '}{fig.name}
        </div>
        {bubble && bubble.until > performance.now() / 1000 && (
          <div key={bubble.until} className="bubble">{bubble.text}</div>
        )}
      </Html>
    </group>
  )
}

/** Advances the shared formation (circle travel, dandiya shifts) once per frame. */
function Choreographer({ ids, shared }: { ids: string[]; shared: React.RefObject<Shared> }) {
  const trackId = useStore((s) => s.trackId)
  const stepMode = useStore((s) => s.stepMode)
  const phase = useRef(0)
  const lastBeat = useRef(orchestra.beat())

  useFrame(() => {
    const track = TRACK_BY_ID[trackId]
    const aarti = track.step === 'aarti'
    const step: StepId = stepMode === 'auto' ? (aarti ? 'be-taali' : (track.step as StepId)) : stepMode
    const formation: Formation = aarti ? 'aarti' : step === 'dandiya' ? 'dandiya' : 'garba'
    const beat = orchestra.beat()
    let db = beat - lastBeat.current
    if (db < 0 || db > 1) db = 0 // track switched or tab was hidden
    lastBeat.current = beat
    if (!aarti) phase.current += db * STEP_BY_ID[step].travel
    const sh = shared.current
    sh.step = step
    sh.formation = formation
    sh.targets = formationTargets(ids, formation, phase.current, beat, useStore.getState().actions, performance.now() / 1000)
  })
  return null
}

function CameraRig({ mode, followId }: { mode: CameraMode; followId: string | null }) {
  const { camera, scene } = useThree()
  const controls = useRef<React.ComponentRef<typeof OrbitControls>>(null)

  useEffect(() => {
    if (mode === 'top') camera.position.set(0.01, 30, 6)
    if (mode === 'orbit') camera.position.set(0, 12, 24)
    controls.current?.target.set(0, 1.8, 0)
    controls.current?.update()
  }, [mode, camera])

  useFrame((_, dt) => {
    if (mode !== 'follow' || !followId) return
    const obj = scene.getObjectByName(followId)
    if (!obj) return
    const p = obj.position
    // behind-and-above, looking past the dancer towards Maa
    const out = new THREE.Vector3(p.x, 0, p.z).normalize()
    const want = new THREE.Vector3(p.x + out.x * 8.5, 6.2, p.z + out.z * 8.5)
    camera.position.lerp(want, 1 - Math.pow(0.05, dt))
    camera.lookAt(p.x * 0.4, 2.2, p.z * 0.4)
  })

  return mode === 'follow' && followId ? null : (
    <OrbitControls
      ref={controls}
      target={[0, 1.8, 0]}
      enablePan={false}
      minDistance={6}
      maxDistance={38}
      maxPolarAngle={Math.PI / 2.08}
      autoRotate={mode === 'orbit'}
      autoRotateSpeed={0.35}
    />
  )
}

export default function GarbaScene({ dancers, order, camera }: { dancers: Fig[]; order: string[]; camera: CameraMode }) {
  const selectedId = useStore((s) => s.selectedId)
  const trackId = useStore((s) => s.trackId)
  const select = useStore((s) => s.select)
  const shared = useRef<Shared>({ targets: new Map(), formation: 'garba', step: 'be-taali' })
  const byId = useMemo(() => new Map(dancers.map((d) => [d.id, d])), [dancers])
  const ids = useMemo(() => order.filter((id) => byId.has(id)), [order, byId])
  const followId = selectedId ?? dancers.find((d) => d.mine)?.id ?? null

  return (
    <Canvas shadows dpr={[1, 1.75]} camera={{ position: [0, 12, 24], fov: 45 }} onPointerMissed={() => select(null)}>
      <color attach="background" args={['#12051f']} />
      <fog attach="fog" args={['#12051f', 30, 70]} />
      <Stars radius={80} depth={30} count={2500} factor={3} fade speed={0.5} />
      <hemisphereLight args={['#b39ddb', '#3e2723', 0.7]} />
      <ambientLight intensity={0.25} color="#ffcc80" />
      <directionalLight
        position={[8, 16, 10]}
        intensity={1.3}
        color="#ffe0b2"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
      />
      <pointLight position={[0, 8, 9]} intensity={30} distance={22} color="#ff80ab" />
      <pointLight position={[0, 8, -9]} intensity={30} distance={22} color="#80d8ff" />

      <Ground />
      <Mandap />
      <Orchestra track={TRACK_BY_ID[trackId]} position={ORCH_POS} rotationY={Math.atan2(-ORCH_POS[0], -ORCH_POS[2])} />

      <Choreographer ids={ids} shared={shared} />
      {ids.map((id, i) => (
        <Dancer key={id} fig={byId.get(id)!} shared={shared} selected={id === selectedId} index={i} />
      ))}

      <CameraRig mode={camera} followId={followId} />
    </Canvas>
  )
}
