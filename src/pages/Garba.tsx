import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FigChip from '../components/FigChip'
import { orchestra, TRACKS, TRACK_BY_ID } from '../lib/music'
import { GREETINGS, NPCS } from '../lib/presets'
import { STEPS, STEP_BY_ID } from '../lib/steps'
import type { ActionId, Figurine } from '../lib/types'
import { circleOrder, useStore } from '../store'
import GarbaScene, { type CameraMode } from '../three/GarbaScene'

const ACTIONS: { id: ActionId; label: string }[] = [
  { id: 'namaste', label: '🙏 Namaste' },
  { id: 'jai', label: '🔱 Jai Mata Di' },
  { id: 'wave', label: '👋 Wave' },
  { id: 'clap', label: '👏 Clap' },
  { id: 'spin', label: '🌀 Spin' },
]

export default function Garba() {
  const mine = useStore((s) => s.mine)
  const showNpcs = useStore((s) => s.showNpcs)
  const setShowNpcs = useStore((s) => s.setShowNpcs)
  const order = useStore((s) => s.order)
  const trackId = useStore((s) => s.trackId)
  const setTrack = useStore((s) => s.setTrack)
  const stepMode = useStore((s) => s.stepMode)
  const setStepMode = useStore((s) => s.setStepMode)
  const selectedId = useStore((s) => s.selectedId)
  const select = useStore((s) => s.select)
  const act = useStore((s) => s.act)
  const say = useStore((s) => s.say)

  const [playing, setPlaying] = useState(orchestra.playing)
  const [volume, setVolume] = useState(orchestra.volume)
  const [camera, setCamera] = useState<CameraMode>('orbit')
  const [partner, setPartner] = useState('')
  const [panel, setPanel] = useState<'music' | 'steps' | null>(() => (window.innerWidth > 760 ? 'music' : null))

  const dancers: Figurine[] = useMemo(() => [...mine, ...(showNpcs ? NPCS : [])], [mine, showNpcs])
  const byId = useMemo(() => new Map(dancers.map((d) => [d.id, d])), [dancers])

  // keep a stable circle order as figurines join or leave
  useEffect(() => {
    const next = circleOrder(useStore.getState().order, dancers.map((d) => d.id))
    if (next.join() !== useStore.getState().order.join()) useStore.setState({ order: next })
  }, [dancers])

  useEffect(() => { orchestra.setTrack(trackId) }, [trackId])
  useEffect(() => () => orchestra.stop(), [])

  // the crowd chats now and then
  useEffect(() => {
    if (!showNpcs) return
    const t = setInterval(() => {
      const npc = NPCS[Math.floor(Math.random() * NPCS.length)]
      say(npc.id, GREETINGS[Math.floor(Math.random() * GREETINGS.length)], 2.5)
    }, 4500)
    return () => clearInterval(t)
  }, [showNpcs, say])

  const toggleMusic = () => {
    if (orchestra.playing) orchestra.stop()
    else orchestra.play()
    setPlaying(orchestra.playing)
  }

  const track = TRACK_BY_ID[trackId]
  const aarti = track.step === 'aarti'
  const activeStep = stepMode === 'auto' ? (aarti ? null : STEP_BY_ID[track.step as keyof typeof STEP_BY_ID]) : STEP_BY_ID[stepMode]
  const selected = selectedId ? byId.get(selectedId) : undefined
  const others = dancers.filter((d) => d.id !== selectedId)
  const partnerId = partner && byId.has(partner) ? partner : (mine.find((m) => m.id !== selectedId)?.id ?? others[0]?.id ?? '')

  const greet = () => {
    if (!selected) return
    say(selected.id, GREETINGS[Math.floor(Math.random() * GREETINGS.length)])
    // someone nearby answers
    const idx = order.indexOf(selected.id)
    const neighbour = order[(idx + 1) % order.length]
    if (neighbour && neighbour !== selected.id) setTimeout(() => say(neighbour, GREETINGS[Math.floor(Math.random() * GREETINGS.length)]), 1200)
  }

  return (
    <div className="garba">
      <GarbaScene dancers={dancers} order={order} camera={camera} />

      {!playing && (
        <button className="start-music" onClick={toggleMusic}>
          🪘 Start the orchestra
          <small>tap for sound — the garba is already on!</small>
        </button>
      )}

      <div className="hud top-left">
        <div className="hud-tabs">
          <button className={panel === 'music' ? 'on' : ''} onClick={() => setPanel(panel === 'music' ? null : 'music')}>🎶 Orchestra</button>
          <button className={panel === 'steps' ? 'on' : ''} onClick={() => setPanel(panel === 'steps' ? null : 'steps')}>💃 Steps</button>
        </div>
        {panel === 'music' && (
          <div className="hud-card">
            <div className="row">
              <button className="btn small primary" onClick={toggleMusic}>{playing ? '⏸ Pause' : '▶ Play'}</button>
              <label className="vol">🔊<input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => { const v = Number(e.target.value); setVolume(v); orchestra.setVolume(v) }} /></label>
            </div>
            <ul className="tracks">
              {TRACKS.map((t) => (
                <li key={t.id}>
                  <button className={t.id === trackId ? 'on' : ''} onClick={() => setTrack(t.id)}>
                    <b>{t.name}</b>
                    <small>{t.gujarati} · {t.bpm} bpm · {t.mood}</small>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {panel === 'steps' && (
          <div className="hud-card">
            <ul className="tracks">
              <li>
                <button className={stepMode === 'auto' ? 'on' : ''} onClick={() => setStepMode('auto')}>
                  <b>✨ Follow the music</b>
                  <small>each song picks its own step</small>
                </button>
              </li>
              {STEPS.map((s) => (
                <li key={s.id}>
                  <button className={stepMode === s.id ? 'on' : ''} onClick={() => setStepMode(s.id)}>
                    <b>{s.name} <span className="guj">{s.gujarati}</span></b>
                    <small>{s.desc}</small>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="hud top-right">
        <div className="now">
          <span className="eq" aria-hidden><i /><i /><i /><i /></span>
          <div>
            <b>{track.name}</b>
            <small>{aarti ? '🪔 Aarti — everyone faces Maa' : `step: ${activeStep?.name} ${activeStep?.gujarati}`}</small>
          </div>
        </div>
        <div className="cams">
          {(['orbit', 'top', 'follow'] as CameraMode[]).map((c) => (
            <button key={c} className={camera === c ? 'on' : ''} onClick={() => setCamera(c)} disabled={c === 'follow' && !selected && mine.length === 0}>
              {c === 'orbit' ? '🎥' : c === 'top' ? '🛰️' : '🎯'}<span className="cam-label"> {c === 'orbit' ? 'Orbit' : c === 'top' ? 'Top' : 'Follow'}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="hud bottom">
        <div className="roster">
          {mine.length === 0 && (
            <Link to="/" className="btn primary small">➕ Create your figurine to join</Link>
          )}
          {dancers.map((d) => (
            <button key={d.id} className={`dancer ${d.id === selectedId ? 'on' : ''} ${d.mine ? 'mine' : ''}`} onClick={() => select(d.id === selectedId ? null : d.id)}>
              <FigChip config={d.config} size={28} />
              <span>{d.name}</span>
            </button>
          ))}
          <label className="npc-toggle">
            <input type="checkbox" checked={showNpcs} onChange={(e) => setShowNpcs(e.target.checked)} />
            neighbourhood dancers
          </label>
        </div>

        {selected && (
          <div className="hud-card interact">
            <div className="interact-head">
              <FigChip config={selected.config} size={40} />
              <div>
                <b>{selected.mine && '⭐ '}{selected.name}</b>
                <small>{selected.config.gender === 'female' ? 'chaniya choli' : 'kediyu'} · tap actions to interact</small>
              </div>
              {selected.mine && <Link className="btn small ghost" to={`/?edit=${selected.id}`}>✏️ Edit</Link>}
              <button className="icon" onClick={() => select(null)} aria-label="close">✕</button>
            </div>
            <div className="row wrap">
              {ACTIONS.map((a) => (
                <button key={a.id} className="btn small" onClick={() => act(selected.id, a.id)}>{a.label}</button>
              ))}
              <button className="btn small" onClick={greet}>💬 Kem cho!</button>
            </div>
            {others.length > 0 && (
              <div className="row wrap">
                <span className="muted">Pair up with</span>
                <select value={partnerId} onChange={(e) => setPartner(e.target.value)}>
                  {others.map((o) => <option key={o.id} value={o.id}>{o.mine ? '⭐ ' : ''}{o.name}</option>)}
                </select>
                <button className="btn small primary" onClick={() => partnerId && act(selected.id, 'fudadi', partnerId)}>🌀 Fudadi together</button>
                <button className="btn small" onClick={() => { if (partnerId) { act(selected.id, 'namaste'); act(partnerId, 'namaste') } }}>🙏 Greet each other</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
