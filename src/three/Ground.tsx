import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

function rangoliTexture() {
  const s = 1024
  const c = document.createElement('canvas')
  c.width = c.height = s
  const ctx = c.getContext('2d')!
  const cx = s / 2
  ctx.fillStyle = '#5d2e1a'
  ctx.fillRect(0, 0, s, s)
  // dance floor ring
  const ring = (r: number, color: string) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(cx, cx, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ring(512, '#7a3b1d')
  ring(470, '#c2185b')
  ring(458, '#8d4a24')
  // petals around the inner circle
  const petals = (r: number, n: number, len: number, color: string, wid: number) => {
    ctx.fillStyle = color
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      ctx.save()
      ctx.translate(cx + Math.cos(a) * r, cx + Math.sin(a) * r)
      ctx.rotate(a)
      ctx.beginPath()
      ctx.ellipse(0, 0, len, wid, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }
  petals(456, 64, 14, '#ffb300', 6)
  ring(200, '#ff6f00')
  petals(200, 24, 40, '#ffd54f', 14)
  petals(200, 24, 26, '#e3000b', 8)
  ring(160, '#ab47bc')
  petals(160, 16, 30, '#00acc1', 12)
  ring(120, '#fafafa')
  ring(110, '#c2185b')
  petals(110, 12, 22, '#ffd54f', 10)
  ring(70, '#2e7d32')
  ring(40, '#ffb300')
  // dotted circles marking the garba path
  ctx.fillStyle = 'rgba(255,248,225,0.6)'
  for (const r of [260, 330, 400]) {
    for (let i = 0; i < 120; i++) {
      const a = (i / 120) * Math.PI * 2
      ctx.beginPath()
      ctx.arc(cx + Math.cos(a) * r, cx + Math.sin(a) * r, 3, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

/** Circular garba ground with a rangoli floor, string lights and lanterns. */
export function Ground() {
  const tex = useMemo(rangoliTexture, [])
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[60, 64]} />
        <meshStandardMaterial color="#2b1a12" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[11, 96]} />
        <meshStandardMaterial map={tex} roughness={0.9} />
      </mesh>
      {/* raised brick edge */}
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[11, 11.5, 96]} />
        <meshStandardMaterial color="#ffb300" />
      </mesh>
      <StringLights />
    </group>
  )
}

const BULB_COLORS = ['#ffeb3b', '#ff5252', '#40c4ff', '#69f0ae', '#ff80ab', '#ffab40']

/** Poles around the ground with sagging strings of coloured bulbs + hanging lanterns. */
function StringLights() {
  const poles = 12
  const R = 12.4
  const bulbs = useRef<THREE.InstancedMesh>(null)
  const { matrices, colors, count } = useMemo(() => {
    const per = 14
    const m: THREE.Matrix4[] = []
    const cols: THREE.Color[] = []
    for (let p = 0; p < poles; p++) {
      const a0 = (p / poles) * Math.PI * 2
      const a1 = ((p + 1) / poles) * Math.PI * 2
      for (let i = 1; i < per; i++) {
        const k = i / per
        const a = a0 + (a1 - a0) * k
        const sag = Math.sin(k * Math.PI) * 0.9
        m.push(new THREE.Matrix4().setPosition(Math.cos(a) * R, 5.6 - sag, Math.sin(a) * R))
        cols.push(new THREE.Color(BULB_COLORS[(p * per + i) % BULB_COLORS.length]))
      }
      // strings to the centre mandap top
      for (let i = 1; i < 18; i++) {
        const k = i / 18
        const r = R * (1 - k) + 2.6 * k
        const y = 5.6 * (1 - k) + 7.2 * k - Math.sin(k * Math.PI) * 1.2
        m.push(new THREE.Matrix4().setPosition(Math.cos(a0) * r, y, Math.sin(a0) * r))
        cols.push(new THREE.Color(BULB_COLORS[(i + p) % BULB_COLORS.length]))
      }
    }
    return { matrices: m, colors: cols, count: m.length }
  }, [])

  useFrame(({ clock }) => {
    const mesh = bulbs.current
    if (!mesh) return
    if (!mesh.userData.init) {
      matrices.forEach((m, i) => { mesh.setMatrixAt(i, m); mesh.setColorAt(i, colors[i]) })
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
      mesh.userData.init = true
    }
    // gentle twinkle: chase pattern
    const t = clock.elapsedTime
    const c = new THREE.Color()
    for (let i = 0; i < count; i += 1) {
      const on = 0.65 + 0.35 * Math.sin(t * 3 - i * 0.5)
      c.copy(colors[i]).multiplyScalar(on)
      mesh.setColorAt(i, c)
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  })

  return (
    <group>
      <instancedMesh ref={bulbs} args={[undefined, undefined, count]}>
        <sphereGeometry args={[0.09, 8, 6]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      {Array.from({ length: poles }, (_, p) => {
        const a = (p / poles) * Math.PI * 2
        return (
          <group key={p} position={[Math.cos(a) * R, 0, Math.sin(a) * R]}>
            <mesh position={[0, 2.85, 0]} castShadow>
              <cylinderGeometry args={[0.09, 0.12, 5.7, 8]} />
              <meshStandardMaterial color="#6d4c41" />
            </mesh>
            {/* lantern (fanas) */}
            <group position={[0, 4.3, 0]}>
              <mesh>
                <cylinderGeometry args={[0.28, 0.28, 0.5, 8]} />
                <meshStandardMaterial color={BULB_COLORS[p % BULB_COLORS.length]} emissive={BULB_COLORS[p % BULB_COLORS.length]} emissiveIntensity={0.9} transparent opacity={0.9} />
              </mesh>
              <mesh position={[0, 0.3, 0]}>
                <coneGeometry args={[0.32, 0.18, 8]} />
                <meshStandardMaterial color="#ffc400" metalness={0.7} roughness={0.3} />
              </mesh>
            </group>
          </group>
        )
      })}
    </group>
  )
}
