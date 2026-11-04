import { useEffect, useRef, useState } from 'react'
import { IDLE, LOTUSES, MAX_DIYAS, Shilpa as Game, type Controls } from '../shilpa/game'
import { BANDS } from '../shilpa/level'
import { ShilpaScene } from '../shilpa/scene'

const STEP = 1 / 60

interface Hud { mode: Game['mode']; lotus: number; diyas: number; band: number; stone: boolean; msg: string | null; focus: string | null; endingT: number }

const NOTES = [
  {
    title: 'Hoysala friezes · Halebidu & Belur (12th c.)',
    body: 'The outer walls of the Hoysaleswara temple run in stacked horizontal bands, from the bottom up: elephants (strength and stability), lions, scrolls with tiny dancers, horses (speed), more scrolls, scenes from the Ramayana, Mahabharata and Puranas, then makaras and hamsas (swans). No two lions are alike along more than 200 m of frieze. In this game those bands are the platforming lanes.',
  },
  {
    title: 'Hazara Rama temple · Hampi (15th c.)',
    body: 'The enclosure walls carry processions: marching elephants at the bottom, then horses, soldiers, and dancers and musicians, linked to the Mahanavami (Dasara) festival. The temple also carries the Ramayana in relief panels. That is the source of the procession hazards and the Rama-with-bow, Hanuman and golden-deer panels in the Katha band.',
  },
  {
    title: 'Kerala murals · panchavarna',
    body: 'Temple murals in Kerala are painted in five colours: red ochre, yellow ochre, green, black and white (often the bare lime ground). Green marks sattvic heroes, and outlines are black. When the dancer steps onto the painted right wall she changes from carved stone into a mural figure.',
  },
  {
    title: 'Light as the core mechanic',
    body: 'Temple sanctums were lit by oil lamps, and carvings were meant to be seen moving in flickering diya light. Here the carving can only move where light falls: sunlight from the roof openings, diyas you set in niches, or the lamp in your hand. In darkness she turns back to stone.',
  },
  {
    title: 'Architecture used',
    body: 'A mandapa (pillared hall) with lathe-turned, bell-shaped pillars in the Hoysala manner, pilasters that the frieze wraps around, a brass deepa-stambha (lamp stand), and a garbhagriha (sanctum) door flanked by dvarapalas (door guardians). The only band that continues over the door lintel is the story band.',
  },
]

export default function Shilpa() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const game = useRef<Game | null>(null)
  const keys = useRef(new Set<string>())
  /** keys pressed since the last game step, so quick taps are never lost */
  const tapped = useRef(new Set<string>())
  const look = useRef<[number, number]>([0, 0])
  const touch = useRef<Controls>({ ...IDLE, look: [0, 0] })
  const [started, setStarted] = useState(false)
  const [hud, setHud] = useState<Hud | null>(null)
  const [notes, setNotes] = useState(false)
  const [locked, setLocked] = useState(false)
  const [isTouch] = useState(() => window.matchMedia?.('(pointer: coarse)').matches ?? false)

  useEffect(() => {
    if (!started || !canvas.current) return
    const g = new Game()
    game.current = g
    if (import.meta.env.DEV) (window as unknown as { __shilpa: Game }).__shilpa = g
    const scene = new ShilpaScene(canvas.current)
    const cv = canvas.current

    const down = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault()
      keys.current.add(e.code)
      if (!e.repeat) tapped.current.add(e.code)
    }
    const up = (e: KeyboardEvent) => keys.current.delete(e.code)
    const move = (e: MouseEvent) => {
      if (document.pointerLockElement !== cv) return
      look.current[0] += e.movementX * 0.0022
      look.current[1] += e.movementY * 0.0022
    }
    const lockChange = () => setLocked(document.pointerLockElement === cv)
    const click = () => {
      if (!isTouch && g.mode === 'explore' && document.pointerLockElement !== cv) cv.requestPointerLock?.()
    }
    const resize = () => scene.resize()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('mousemove', move)
    window.addEventListener('resize', resize)
    document.addEventListener('pointerlockchange', lockChange)
    cv.addEventListener('click', click)

    let raf = 0
    let last = performance.now()
    let acc = 0
    let hudT = 0
    const read = (): Controls => {
      const k = keys.current
      const t0 = tapped.current
      const has = (...c: string[]) => c.some((x) => k.has(x) || t0.has(x))
      const c: Controls = {
        x: (has('KeyD', 'ArrowRight') ? 1 : 0) - (has('KeyA', 'ArrowLeft') ? 1 : 0),
        y: (has('KeyW', 'ArrowUp') ? 1 : 0) - (has('KeyS', 'ArrowDown') ? 1 : 0),
        jump: has('Space'),
        interact: has('KeyE', 'Enter'),
        exit: has('KeyQ', 'Escape', 'Backspace'),
        look: [look.current[0], look.current[1]],
      }
      t0.clear()
      const t = touch.current
      if (Math.abs(t.x) > Math.abs(c.x)) c.x = t.x
      if (Math.abs(t.y) > Math.abs(c.y)) c.y = t.y
      c.jump ||= t.jump
      c.interact ||= t.interact
      c.exit ||= t.exit
      c.look[0] += t.look[0]
      c.look[1] += t.look[1]
      t.look = [0, 0]
      look.current = [0, 0]
      return c
    }
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      acc += dt
      let first = true
      while (acc >= STEP) {
        const c = read()
        // mouse look only applies once per frame
        if (!first) c.look = [0, 0]
        g.step(STEP, c)
        first = false
        acc -= STEP
      }
      if (g.mode !== 'explore' && document.pointerLockElement === cv) document.exitPointerLock()
      scene.render(g, dt)
      hudT -= dt
      if (hudT <= 0) {
        hudT = 0.1
        const f = g.mode === 'explore' ? g.focus() : null
        setHud({
          mode: g.mode, lotus: g.lotusCount, diyas: g.diyas, band: g.band, stone: g.stone, msg: g.msg?.text ?? null, endingT: g.endingT,
          focus: f ? f.kind === 'stand' ? 'E · light diyas at the lamp stand' : f.kind === 'niche' ? (g.placed[f.index!] ? 'E · take the diya back' : 'E · place a diya in the niche') : 'E · become the dancer' : null,
        })
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('mousemove', move)
      window.removeEventListener('resize', resize)
      document.removeEventListener('pointerlockchange', lockChange)
      cv.removeEventListener('click', click)
      if (document.pointerLockElement === cv) document.exitPointerLock()
      scene.dispose()
    }
  }, [started, isTouch])

  // touch: left half drags = move/joystick, right half drags = look
  const tStart = useRef<Record<number, { x: number; y: number; side: 'move' | 'look' }>>({})
  const onTouch = (e: React.PointerEvent) => {
    if (!isTouch) return
    const w = (e.currentTarget as HTMLElement).clientWidth
    if (e.type === 'pointerdown') {
      tStart.current[e.pointerId] = { x: e.clientX, y: e.clientY, side: e.clientX < w / 2 ? 'move' : 'look' }
    } else if (e.type === 'pointermove') {
      const s = tStart.current[e.pointerId]
      if (!s) return
      if (s.side === 'move') {
        touch.current.x = Math.max(-1, Math.min(1, (e.clientX - s.x) / 50))
        touch.current.y = Math.max(-1, Math.min(1, -(e.clientY - s.y) / 50))
      } else {
        touch.current.look[0] += (e.clientX - s.x) * 0.005
        touch.current.look[1] += (e.clientY - s.y) * 0.005
        s.x = e.clientX
        s.y = e.clientY
      }
    } else {
      const s = tStart.current[e.pointerId]
      if (s?.side === 'move') { touch.current.x = 0; touch.current.y = 0 }
      delete tStart.current[e.pointerId]
    }
  }
  const tap = (k: 'jump' | 'interact' | 'exit') => ({
    onPointerDown: (e: React.PointerEvent) => { e.stopPropagation(); touch.current[k] = true; setTimeout(() => { touch.current[k] = false }, 120) },
  })

  if (!started) {
    return (
      <div className="sh sh-intro">
        <div className="sh-card">
          <p className="sh-kicker">a game about temple walls that come alive</p>
          <h1>Shilpa</h1>
          <h2>The Living Frieze</h2>
          <p>In a sandstone mandapa, a carved dancer wakes up wherever light touches the wall. Carry diyas through the dark hall, set them in the niches, then <b>step into the frieze</b> and become her. Run along the elephant, horse and story bands, wrap around pilasters, leap broken stone, dodge the marching processions, and gather five lotuses to open the sanctum doors.</p>
          <ul className="sh-keys">
            <li><b>Explore:</b> WASD · mouse to look (click to capture) · E interact</li>
            <li><b>In the wall:</b> ← → walk · ↑ ↓ climb bands · Space jump · Q step out</li>
            <li><b>Phone:</b> left thumb moves, right thumb looks, buttons for E / jump / out</li>
          </ul>
          <div className="sh-row">
            <button className="sh-btn" onClick={() => setStarted(true)}>Enter the temple 🪔</button>
            <button className="sh-btn ghost" onClick={() => setNotes(true)}>Art notes 📜</button>
          </div>
          <p className="sh-fine">Inspired by Hoysala friezes (Halebidu, Belur), Hampi’s Hazara Rama reliefs and Kerala temple murals. All art is drawn procedurally in code.</p>
        </div>
        {notes && <Notes onClose={() => setNotes(false)} />}
      </div>
    )
  }

  const done = hud?.mode === 'ending' && hud.endingT > 3
  return (
    <div className="sh sh-play" onPointerDown={onTouch} onPointerMove={onTouch} onPointerUp={onTouch} onPointerCancel={onTouch}>
      <canvas ref={canvas} className="sh-canvas" />
      {hud && (
        <>
          <div className="sh-hud">
            <div className="sh-pill">🪷 {hud.lotus}/{LOTUSES.length}</div>
            <div className="sh-pill">🪔 {hud.diyas}/{MAX_DIYAS}</div>
            <div className={`sh-pill ${hud.mode === 'wall' ? 'on' : ''}`}>
              {hud.mode === 'wall' ? `In the frieze · ${BANDS[hud.band].name} band` : hud.mode === 'ending' ? 'The sanctum opens' : 'Exploring'}
              {hud.stone && hud.mode !== 'ending' && ' · the carving sleeps (dark)'}
            </div>
            <button className="sh-pill btn" onClick={(e) => { e.stopPropagation(); setNotes(true) }}>📜 Art notes</button>
          </div>
          {hud.mode === 'explore' && !isTouch && <div className="sh-cross" />}
          {hud.focus && <div className="sh-focus">{hud.focus}</div>}
          {hud.msg && <div className="sh-msg">{hud.msg}</div>}
          {hud.mode === 'explore' && !locked && !isTouch && <div className="sh-hint">Click to look around · WASD to walk</div>}
          {hud.mode === 'wall' && <div className="sh-band-legend">{BANDS[hud.band].name}: {BANDS[hud.band].meaning}</div>}
        </>
      )}
      {isTouch && hud?.mode !== 'ending' && (
        <div className="sh-tbtns">
          <button {...tap('interact')}>E</button>
          {hud?.mode === 'wall' && <button {...tap('jump')}>Jump</button>}
          {hud?.mode === 'wall' && <button {...tap('exit')}>Out</button>}
        </div>
      )}
      {done && (
        <div className="sh-overlay">
          <div className="sh-card">
            <h1>Shubham</h1>
            <p>The dancer offered five lotuses on the lintel, and the garbhagriha doors swung open. Lamplight and petals fill the hall, and the frieze goes still again until the next visitor brings a diya.</p>
            <button className="sh-btn" onClick={() => { setStarted(false); setTimeout(() => setStarted(true), 0) }}>Play again</button>
          </div>
        </div>
      )}
      {notes && <Notes onClose={() => setNotes(false)} />}
    </div>
  )
}

function Notes({ onClose }: { onClose: () => void }) {
  return (
    <div className="sh-overlay" onClick={onClose} onPointerDown={(e) => e.stopPropagation()}>
      <div className="sh-card notes" onClick={(e) => e.stopPropagation()}>
        <h2>Art notes for the dev 📜</h2>
        {NOTES.map((n) => (
          <section key={n.title}>
            <h3>{n.title}</h3>
            <p>{n.body}</p>
          </section>
        ))}
        <button className="sh-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
