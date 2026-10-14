import { ContactShadows, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useLayoutEffect, useRef, type ReactNode } from 'react'
import * as THREE from 'three'

/** A green LEGO baseplate with instanced studs. */
export function Baseplate({ size = 12, color = '#00a650', y = 0 }: { size?: number; color?: string; y?: number }) {
  const studs = useRef<THREE.InstancedMesh>(null)
  const n = size * size
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    let i = 0
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        m.setPosition((x - size / 2 + 0.5) * 0.8, y + 0.05, (z - size / 2 + 0.5) * 0.8)
        studs.current!.setMatrixAt(i++, m)
      }
    }
    studs.current!.instanceMatrix.needsUpdate = true
  }, [size, y])
  return (
    <group>
      <mesh position={[0, y - 0.1, 0]} receiveShadow>
        <boxGeometry args={[size * 0.8, 0.2, size * 0.8]} />
        <meshPhysicalMaterial color={color} roughness={0.4} clearcoat={0.4} />
      </mesh>
      <instancedMesh ref={studs} args={[undefined, undefined, n]} castShadow receiveShadow>
        <cylinderGeometry args={[0.24, 0.24, 0.1, 16]} />
        <meshPhysicalMaterial color={color} roughness={0.4} clearcoat={0.4} />
      </instancedMesh>
    </group>
  )
}

/** A 2x4 brick (with studs) — used for books in the tower. */
export function Brick({ color, position, rotationY = 0, width = 2, length = 4, height = 0.48 }: {
  color: string
  position: [number, number, number]
  rotationY?: number
  width?: number
  length?: number
  height?: number
}) {
  const u = 0.4
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[length * u, height, width * u]} />
        <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={0.7} />
      </mesh>
      {Array.from({ length: length * width }, (_, i) => {
        const x = (i % length) - length / 2 + 0.5
        const z = Math.floor(i / length) - width / 2 + 0.5
        return (
          <mesh key={i} position={[x * u, height + 0.04, z * u]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
            <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={0.7} />
          </mesh>
        )
      })}
    </group>
  )
}

export default function Stage({
  children,
  camera = [0, 3.2, 8],
  target = [0, 1.8, 0],
  height = 420,
  autoRotate = false,
  plate = 12,
  plateColor,
  zoom = true,
}: {
  children: ReactNode
  camera?: [number, number, number]
  target?: [number, number, number]
  height?: number | string
  autoRotate?: boolean
  plate?: number
  plateColor?: string
  zoom?: boolean
}) {
  return (
    <div className="stage" style={{ height }}>
      <Canvas shadows dpr={[1, 2]} camera={{ position: camera, fov: 40 }}>
        <hemisphereLight args={['#fff8e7', '#5b6b8c', 0.9]} />
        <directionalLight
          position={[5, 9, 6]}
          intensity={2.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={8}
          shadow-camera-bottom={-8}
        />
        <directionalLight position={[-6, 4, -4]} intensity={0.6} color="#9ecbff" />
        {children}
        <Baseplate size={plate} color={plateColor} />
        <ContactShadows position={[0, 0.01, 0]} opacity={0.35} scale={14} blur={2.4} far={5} />
        <OrbitControls
          target={target}
          enablePan={false}
          enableZoom={zoom}
          minDistance={4}
          maxDistance={16}
          minPolarAngle={0.3}
          maxPolarAngle={Math.PI / 2.05}
          autoRotate={autoRotate}
          autoRotateSpeed={1.2}
        />
      </Canvas>
    </div>
  )
}
