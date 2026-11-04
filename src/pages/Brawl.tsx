import { useCallback, useEffect, useRef, useState } from 'react'
import { BrawlAudio } from '../brawl/audio'
import { CLASSES, TOTAL_WAVES, type ClassId } from '../brawl/data'
import { Brawl as Game, type GameEvent, type PlayerSetup } from '../brawl/engine'
import { Controls } from '../brawl/input'
import { BrawlRenderer } from '../brawl/render'

const CLASS_IDS = Object.keys(CLASSES) as ClassId[]
const BEST_KEY = 'kantin-clash-best'
const STEP = 1 / 60

interface HeroHud { name: string; cls: string; hp: number; max: number; combo: number; ko: boolean; revive: number; player: number }
interface Hud {
  wave: number
  phase: Game['phase']
  label: string
  objective: string
  heroes: HeroHud[]
  score: number
}

function readBest(): { score: number; wave: number } {
  try { return JSON.parse(localStorage.getItem(BEST_KEY) ?? '') } catch { return { score: 0, wave: 0 } }
}

function snapshot(g: Game): Hud {
  const left = g.queue.length + g.aliveEnemies().length
  const obj = g.waveDef.objective
  const objective = obj === 'protect' ? `${g.civsLeft()} LEFT · ${left} rivals` : obj === 'survive' ? `${Math.max(0, Math.ceil(g.surviveT))}s TO THE BELL` : `${left} LEFT`
  return {
    wave: g.wave,
    phase: g.phase,
    label: g.waveDef.label,
    objective,
    score: g.score,
    heroes: g.heroes.map((h) => ({ name: h.name, cls: CLASSES[h.kind as ClassId].name, hp: h.hp, max: h.maxHp, combo: h.combo, ko: h.state === 'ko', revive: h.revive / 2.2, player: h.player ?? 0 })),
  }
}

function ClassPicker({ value, onChange, accent }: { value: ClassId; onChange: (c: ClassId) => void; accent: string }) {
  return (
    <div className="kc-classes">
      {CLASS_IDS.map((id) => {
        const c = CLASSES[id]
        return (
          <button key={id} className={`kc-class ${value === id ? 'on' : ''}`} style={{ ['--accent' as string]: accent }} onClick={() => onChange(id)}>
            <span className="kc-swatch" style={{ background: c.colors.shirt, borderColor: c.colors.band }} />
            <b>{c.name.toUpperCase()}</b>
            <small>HP {c.hp} · SPD {c.speed}</small>
            <em>{c.blurb}</em>
          </button>
        )
      })}
    </div>
  )
}

function TouchPad({ controls }: { controls: Controls }) {
  const stick = useRef<HTMLDivElement>(null)
  const [knob, setKnob] = useState<[number, number]>([0, 0])
  const pointer = useRef<number | null>(null)
  const move = (e: React.PointerEvent) => {
    if (pointer.current !== e.pointerId || !stick.current) return
    const r = stick.current.getBoundingClientRect()
    let x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
    let y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
    const m = Math.hypot(x, y)
    if (m > 1) { x /= m; y /= m }
    setKnob([x, y])
    controls.touch.x = x
    controls.touch.y = -y
  }
  const end = () => {
    pointer.current = null
    setKnob([0, 0])
    controls.touch.x = 0
    controls.touch.y = 0
  }
  const btn = (key: 'attack' | 'heavy' | 'special' | 'dodge', label: string, cls: string) => (
    <button
      className={`kc-tbtn ${cls}`}
      onPointerDown={(e) => { e.preventDefault(); controls.touch[key] = true; controls.tap(key) }}
      onPointerUp={() => { controls.touch[key] = false }}
      onPointerLeave={() => { controls.touch[key] = false }}
      onPointerCancel={() => { controls.touch[key] = false }}
    >{label}</button>
  )
  return (
    <div className="kc-touch">
      <div
        ref={stick}
        className="kc-stick"
        onPointerDown={(e) => { pointer.current = e.pointerId; (e.target as HTMLElement).setPointerCapture(e.pointerId); move(e) }}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
      >
        <span style={{ transform: `translate(${knob[0] * 34}px, ${knob[1] * 34}px)` }} />
      </div>
      <div className="kc-tbtns">
        {btn('attack', 'PUNCH', 'a')}
        {btn('heavy', 'HEAVY', 'b')}
        {btn('special', 'GRAB', 'c')}
        {btn('dodge', 'DODGE', 'd')}
      </div>
    </div>
  )
}

export default function Brawl() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const game = useRef<Game | null>(null)
  const controls = useRef(new Controls())
  const audio = useRef(new BrawlAudio())
  const [screen, setScreen] = useState<'select' | 'play'>('select')
  const [p1, setP1] = useState<PlayerSetup>({ name: 'LAUDA', cls: 'brawler' })
  const [p2, setP2] = useState<PlayerSetup>({ name: 'SAKTI', cls: 'kicker' })
  const [twoP, setTwoP] = useState(false)
  const [hud, setHud] = useState<Hud | null>(null)
  const [paused, setPaused] = useState(false)
  const [music, setMusic] = useState(true)
  const [best, setBest] = useState(readBest)
  const [banner, setBanner] = useState<string | null>(null)
  const [touch] = useState(() => window.matchMedia?.('(pointer: coarse)').matches ?? false)
  const pausedRef = useRef(false)
  pausedRef.current = paused

  const start = useCallback(() => {
    const players = twoP ? [p1, p2] : [p1]
    controls.current.players = players.length
    game.current = new Game(players.map((p) => ({ ...p, name: p.name.trim().toUpperCase().slice(0, 10) || 'PLAYER' })), Date.now() & 0xffff)
    audio.current.setMusic(music)
    audio.current.start()
    setPaused(false)
    setScreen('play')
  }, [twoP, p1, p2, music])

  // the game loop
  useEffect(() => {
    if (screen !== 'play' || !canvas.current) return
    const renderer = new BrawlRenderer(canvas.current, window.innerWidth < 700 ? 2 : 3)
    const ctl = controls.current
    ctl.attach()
    const onResize = () => renderer.resize()
    window.addEventListener('resize', onResize)
    let raf = 0
    let last = performance.now()
    let acc = 0
    let hudT = 0
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      const g = game.current!
      const events: GameEvent[] = []
      if (!pausedRef.current) {
        acc += dt
        while (acc >= STEP) {
          g.step(STEP, ctl.read())
          events.push(...g.events)
          acc -= STEP
        }
      }
      renderer.handle(events)
      audio.current.play(events)
      for (const e of events) {
        if (e.type === 'wave') setBanner(`WAVE ${e.wave}/${TOTAL_WAVES}\n${e.label}`)
        if (e.type === 'clear') setBanner(e.wave >= TOTAL_WAVES ? 'SCHOOL CHAMPIONS!' : `WAVE ${e.wave} CLEARED`)
      }
      renderer.render(g, pausedRef.current ? 0 : dt)
      hudT -= dt
      if (hudT <= 0) {
        hudT = 0.08
        setHud(snapshot(g))
        if (g.phase === 'fight') setBanner(null)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      ctl.detach()
      window.removeEventListener('resize', onResize)
      renderer.dispose()
    }
  }, [screen])

  // pause with Esc / P, and remember the best run when a game ends
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (screen === 'play' && (e.code === 'Escape' || e.code === 'KeyP')) setPaused((p) => !p)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [screen])

  useEffect(() => {
    if (!hud || (hud.phase !== 'won' && hud.phase !== 'lost')) return
    const prev = readBest()
    if (hud.score > (prev?.score ?? 0)) {
      const next = { score: hud.score, wave: hud.wave }
      try { localStorage.setItem(BEST_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      setBest(next)
    }
  }, [hud?.phase]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => audio.current.stop(), [])

  if (screen === 'select') {
    return (
      <div className="kc kc-select">
        <div className="kc-title">
          <h1>KANTIN<br />CLASH</h1>
          <p>The canteen is under siege by the rival school. Pick your fighter, protect your classmates and survive {TOTAL_WAVES} waves.</p>
          {best?.score > 0 && <p className="kc-best">BEST · {best.score.toLocaleString()} PTS · WAVE {best.wave}</p>}
        </div>

        <div className="kc-players">
          <section className="kc-player p1">
            <header><span className="kc-tag">P1</span><input value={p1.name} maxLength={10} onChange={(e) => setP1({ ...p1, name: e.target.value })} /></header>
            <ClassPicker value={p1.cls} onChange={(cls) => setP1({ ...p1, cls })} accent="#e04f2f" />
            <p className="kc-keys">WASD move · J punch · K heavy · L grab/special · SPACE dodge{!twoP && ' · arrows + Z X C V also work'}</p>
          </section>

          {twoP ? (
            <section className="kc-player p2">
              <header><span className="kc-tag blue">P2</span><input value={p2.name} maxLength={10} onChange={(e) => setP2({ ...p2, name: e.target.value })} /><button className="kc-x" onClick={() => setTwoP(false)}>✕</button></header>
              <ClassPicker value={p2.cls} onChange={(cls) => setP2({ ...p2, cls })} accent="#3d7dd8" />
              <p className="kc-keys">ARROWS move · , punch · . heavy · / grab · RIGHT SHIFT dodge (or numpad 1 2 3 0) · gamepads work too</p>
            </section>
          ) : (
            <button className="kc-join" onClick={() => setTwoP(true)}>
              <b>+ P2 JOIN</b>
              <small>local co-op on one keyboard or two gamepads</small>
            </button>
          )}
        </div>

        <div className="kc-start-row">
          <label className="kc-check"><input type="checkbox" checked={music} onChange={(e) => setMusic(e.target.checked)} /> MUSIC</label>
          <button className="kc-start" onClick={start}>START BRAWL ▶</button>
        </div>
        <p className="kc-note">Cartoon fighting only: hits throw sparks and stars, knocked-out rivals see stars and run home.</p>
      </div>
    )
  }

  return (
    <div className="kc kc-play">
      <canvas ref={canvas} className="kc-canvas" />

      {hud && (
        <div className="kc-hud">
          {hud.heroes.map((h) => (
            <div key={h.player} className={`kc-plate ${h.player === 1 ? 'right' : ''}`}>
              <div className="kc-plate-name"><span className={`kc-dot ${h.player === 1 ? 'blue' : ''}`} />{h.name}</div>
              <div className="kc-bar"><span style={{ width: `${(h.hp / h.max) * 100}%` }} /></div>
              <div className="kc-plate-sub">
                <span className="kc-cls">{h.cls.toUpperCase()}</span>
                {h.combo >= 2 && <span className="kc-combo">{h.combo} HITS</span>}
                {h.ko && <span className="kc-down">{h.revive > 0 ? `REVIVING ${Math.round(h.revive * 100)}%` : hud.heroes.length > 1 ? 'DOWN · stand next to revive' : 'DOWN'}</span>}
              </div>
            </div>
          ))}
          <div className="kc-wave">
            <b>{hud.wave}/{TOTAL_WAVES}</b>
            <small>{hud.label.toUpperCase()} · {hud.objective}</small>
            <span className="kc-score">{hud.score.toLocaleString()} PTS</span>
          </div>
        </div>
      )}

      <div className="kc-corner">
        <button onClick={() => setPaused((p) => !p)}>{paused ? '▶' : '❚❚'}</button>
        <button onClick={() => { const on = !music; setMusic(on); audio.current.setMusic(on) }}>{music ? '♪' : '✕♪'}</button>
      </div>

      {banner && hud?.phase !== 'won' && hud?.phase !== 'lost' && (
        <div className="kc-banner">{banner.split('\n').map((l, i) => <div key={i} className={i ? 'sub' : ''}>{l}</div>)}</div>
      )}

      {paused && (
        <div className="kc-overlay">
          <div className="kc-panel">
            <h2>PAUSED</h2>
            <button className="kc-start" onClick={() => setPaused(false)}>RESUME</button>
            <button className="kc-ghost" onClick={() => setScreen('select')}>QUIT TO MENU</button>
          </div>
        </div>
      )}

      {hud && (hud.phase === 'won' || hud.phase === 'lost') && game.current && (
        <div className="kc-overlay">
          <div className="kc-panel">
            <h2>{hud.phase === 'won' ? 'SCHOOL CHAMPIONS!' : 'KNOCKED OUT'}</h2>
            <p>{hud.phase === 'won' ? 'The rival school runs home. The canteen is yours.' : game.current.waveDef.objective === 'protect' && game.current.civsLeft() === 0 ? 'Your classmates got hurt. Protect them next time!' : `You held the canteen until wave ${hud.wave}.`}</p>
            <ul className="kc-stats">
              <li><b>{hud.score.toLocaleString()}</b> points</li>
              <li><b>{hud.wave}</b> / {TOTAL_WAVES} waves</li>
              {game.current.heroes.map((h) => (
                <li key={h.id}><b>{h.name}</b> · {h.kos} KOs · best combo {h.bestCombo}</li>
              ))}
            </ul>
            <button className="kc-start" onClick={start}>FIGHT AGAIN ↻</button>
            <button className="kc-ghost" onClick={() => setScreen('select')}>CHANGE FIGHTERS</button>
          </div>
        </div>
      )}

      {touch && <TouchPad controls={controls.current} />}
    </div>
  )
}
