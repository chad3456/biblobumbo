import { ContactShadows, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { orchestra } from '../lib/music'
import { ACCENT, FABRIC, HAIR, SKIN, defaultConfig, randomConfig } from '../lib/presets'
import { STEP_BY_ID, namastePose, spinPose } from '../lib/steps'
import type { Face, FemaleHair, FigurineConfig, Gender, MaleHead, Pattern, Pose } from '../lib/types'
import { MAX_MINE, useStore } from '../store'
import Figurine from '../three/Figurine'
import FigChip from '../components/FigChip'

type Preview = 'pose' | 'be-taali' | 'dodhiyu' | 'hinch' | 'dandiya' | 'spin' | 'namaste'

const PREVIEWS: { id: Preview; label: string }[] = [
  { id: 'pose', label: '🧍 pose' },
  { id: 'be-taali', label: '👏 be taali' },
  { id: 'dodhiyu', label: '⚡ dodhiyu' },
  { id: 'hinch', label: '🌊 hinch' },
  { id: 'dandiya', label: '🥢 dandiya' },
  { id: 'spin', label: '🌀 spin' },
  { id: 'namaste', label: '🙏 namaste' },
]

function previewPose(p: Preview) {
  return (t: number): Pose => {
    switch (p) {
      case 'spin': return spinPose(t)
      case 'namaste': return namastePose()
      case 'pose': {
        const pose = STEP_BY_ID['hinch'].pose(t * 0.6)
        pose.armL = { x: -0.2, z: 0.35 + Math.sin(t) * 0.05 }
        pose.armR = { x: -0.2, z: -0.35 - Math.sin(t) * 0.05 }
        pose.legL = pose.legR = 0
        pose.turn = Math.sin(t * 0.5) * 0.15
        return pose
      }
      default: return STEP_BY_ID[p].pose(orchestra.beat())
    }
  }
}

function Swatches({ colors, value, onChange }: { colors: string[]; value: string; onChange: (c: string) => void }) {
  return (
    <div className="swatches">
      {colors.map((c) => (
        <button key={c} type="button" className={`swatch ${value === c ? 'on' : ''}`} style={{ background: c }} onClick={() => onChange(c)} aria-label={c} />
      ))}
      <label className="swatch custom" title="pick any colour">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
        🎨
      </label>
    </div>
  )
}

function Options<T extends string>({ values, value, onChange, labels }: { values: T[]; value: T; onChange: (v: T) => void; labels?: Partial<Record<T, string>> }) {
  return (
    <div className="opts">
      {values.map((v) => (
        <button key={v} type="button" className={`opt ${value === v ? 'on' : ''}`} onClick={() => onChange(v)}>
          {labels?.[v] ?? v}
        </button>
      ))}
    </div>
  )
}

export default function Studio() {
  const mine = useStore((s) => s.mine)
  const saveFigurine = useStore((s) => s.saveFigurine)
  const deleteFigurine = useStore((s) => s.deleteFigurine)
  const select = useStore((s) => s.select)
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const editing = mine.find((f) => f.id === params.get('edit'))

  const [editId, setEditId] = useState<string | undefined>(editing?.id)
  const [name, setName] = useState(editing?.name ?? '')
  const [cfg, setCfg] = useState<FigurineConfig>(editing?.config ?? defaultConfig('female'))
  const [preview, setPreview] = useState<Preview>('pose')
  const pose = useMemo(() => previewPose(preview), [preview])
  const female = cfg.gender === 'female'

  const set = <K extends keyof FigurineConfig>(k: K, v: FigurineConfig[K]) => setCfg((c) => ({ ...c, [k]: v }))
  const setGender = (g: Gender) => setCfg((c) => (c.gender === g ? c : { ...defaultConfig(g), skin: c.skin, face: c.face }))

  const load = (id: string) => {
    const f = mine.find((x) => x.id === id)
    if (!f) return
    setEditId(f.id)
    setName(f.name)
    setCfg(f.config)
    setParams({ edit: f.id })
  }
  const fresh = () => {
    setEditId(undefined)
    setName('')
    setCfg(defaultConfig(cfg.gender))
    setParams({})
  }

  const save = (go: boolean) => {
    const id = saveFigurine({ id: editId, name: name || (female ? 'Rangili' : 'Rangilo'), config: cfg })
    setEditId(id)
    if (go) {
      select(id)
      navigate('/garba')
    }
  }

  return (
    <div className="studio">
      <section className="studio-stage card">
        <div className="stage-head">
          <h2>{editId ? `Editing ${name || 'figurine'}` : 'Create your garba figurine'}</h2>
          <span className="muted">drag to spin · scroll to zoom</span>
        </div>
        <div className="canvas-box">
          <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 2.4, 8.4], fov: 40 }}>
            <color attach="background" args={['#2a0a3d']} />
            <hemisphereLight args={['#ffe0b2', '#4a148c', 1.0]} />
            <directionalLight position={[4, 8, 6]} intensity={2} castShadow shadow-mapSize={[1024, 1024]} />
            <pointLight position={[-4, 3, 2]} intensity={20} color="#ff80ab" />
            <pointLight position={[4, 3, -2]} intensity={20} color="#80d8ff" />
            <Figurine config={cfg} pose={pose} />
            <mesh position={[0, -0.12, 0]} receiveShadow>
              <cylinderGeometry args={[2.4, 2.5, 0.24, 48]} />
              <meshPhysicalMaterial color="#ff6f00" roughness={0.4} clearcoat={0.5} />
            </mesh>
            <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.6, 2.3, 48]} />
              <meshStandardMaterial color="#c2185b" />
            </mesh>
            <ContactShadows position={[0, 0.01, 0]} opacity={0.4} scale={6} blur={2} />
            <OrbitControls target={[0, 1.75, 0]} enablePan={false} minDistance={4} maxDistance={12} maxPolarAngle={Math.PI / 1.95} />
          </Canvas>
        </div>
        <div className="chips">
          {PREVIEWS.map((p) => (
            <button key={p.id} className={`chip ${preview === p.id ? 'on' : ''}`} onClick={() => setPreview(p.id)}>{p.label}</button>
          ))}
        </div>
      </section>

      <section className="studio-panel card">
        <label className="field">
          <span>Name your figurine</span>
          <input value={name} maxLength={18} placeholder={female ? 'e.g. Hetal' : 'e.g. Jignesh'} onChange={(e) => setName(e.target.value)} />
        </label>

        <div className="gender">
          <button className={female ? 'on' : ''} onClick={() => setGender('female')}>💃 Chaniya choli</button>
          <button className={!female ? 'on' : ''} onClick={() => setGender('male')}>🕺 Kediyu</button>
        </div>

        <h4>Skin</h4>
        <Swatches colors={SKIN} value={cfg.skin} onChange={(c) => set('skin', c)} />
        <h4>Face</h4>
        <Options<Face> values={['smile', 'joy', 'wink', 'calm']} value={cfg.face} onChange={(v) => set('face', v)} labels={{ smile: '🙂 smile', joy: '😄 joy', wink: '😉 wink', calm: '😌 calm' }} />

        <h4>{female ? 'Chaniya (skirt)' : 'Kediyu (frilled jacket)'}</h4>
        <Swatches colors={FABRIC} value={cfg.main} onChange={(c) => set('main', c)} />
        <h4>Work / pattern</h4>
        <Options<Pattern> values={['mirror', 'bandhani', 'leheriya', 'plain']} value={cfg.pattern} onChange={(v) => set('pattern', v)} labels={{ mirror: '🪞 mirror work', bandhani: '🔴 bandhani', leheriya: '〰️ leheriya', plain: 'plain' }} />
        <h4>Border & embroidery</h4>
        <Swatches colors={ACCENT} value={cfg.accent} onChange={(c) => set('accent', c)} />
        <h4>{female ? 'Choli (blouse)' : 'Chorno (trousers)'}</h4>
        <Swatches colors={FABRIC} value={cfg.second} onChange={(c) => set('second', c)} />
        <h4>{female ? 'Odhni (dupatta)' : 'Pagdi & kamarbandh'}</h4>
        <Swatches colors={FABRIC} value={cfg.drape} onChange={(c) => set('drape', c)} />

        {female ? (
          <>
            <h4>Hair</h4>
            <Options<FemaleHair> values={['braid', 'bun', 'open']} value={cfg.femaleHair} onChange={(v) => set('femaleHair', v)} labels={{ braid: 'choti (braid)', bun: 'ambodo + gajra', open: 'open hair' }} />
          </>
        ) : (
          <>
            <h4>Headwear</h4>
            <Options<MaleHead> values={['pagdi', 'safa', 'topi', 'none']} value={cfg.maleHead} onChange={(v) => set('maleHead', v)} labels={{ pagdi: 'pagdi', safa: 'safo', topi: 'topi', none: 'none' }} />
          </>
        )}
        <h4>Hair colour</h4>
        <Swatches colors={HAIR} value={cfg.hairColor} onChange={(c) => set('hairColor', c)} />

        <h4>Dandiya sticks</h4>
        <Swatches colors={['#e3000b', '#ffb300', '#00acc1', '#76c043', '#ff2d87', '#6a1b9a']} value={cfg.dandiyaColor} onChange={(c) => set('dandiyaColor', c)} />

        <label className="toggle">
          <input type="checkbox" checked={cfg.jewellery} onChange={(e) => set('jewellery', e.target.checked)} />
          {female ? 'Jewellery (maang tikka, jhumka, nath, haar)' : 'Jewellery (haar & kada)'}
        </label>

        <div className="actions">
          <button className="btn" onClick={() => setCfg(randomConfig(cfg.gender))}>🎲 Surprise me</button>
          <button className="btn" onClick={() => save(false)} disabled={!editId && mine.length >= MAX_MINE}>💾 Save</button>
          <button className="btn primary" onClick={() => save(true)} disabled={!editId && mine.length >= MAX_MINE}>💃 Save & join the garba</button>
        </div>
        {!editId && mine.length >= MAX_MINE && <p className="muted">You have {MAX_MINE} figurines — delete one to make another.</p>}

        {mine.length > 0 && (
          <>
            <h4>My figurines <span className="muted">({mine.length}/{MAX_MINE})</span></h4>
            <ul className="my-figs">
              {mine.map((f) => (
                <li key={f.id} className={f.id === editId ? 'on' : ''}>
                  <button className="fig-pick" onClick={() => load(f.id)}>
                    <FigChip config={f.config} />
                    <span>{f.name}</span>
                  </button>
                  <button className="icon" title="delete" onClick={() => { if (confirm(`Delete ${f.name}?`)) { deleteFigurine(f.id); if (f.id === editId) fresh() } }}>🗑️</button>
                </li>
              ))}
            </ul>
            {editId && <button className="btn ghost" onClick={fresh}>➕ Make a new figurine</button>}
          </>
        )}
      </section>
    </div>
  )
}
