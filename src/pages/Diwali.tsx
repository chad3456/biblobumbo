import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  DIYAS_PER_LIGHT, DIYA_COLORS, KINDS, KIND_BY_ID, MAX_NAME, MAX_TEXT, REACTIONS, decodeDiya, deepotsavGoal, ghatLitCount, shareText, shareUrl,
  type Diya, type DiyaKind,
} from '../lib/diwali'
import { chime, pop } from '../lib/sfx'
import { useDiwali } from '../diwaliStore'
import { useStore } from '../store'
import Ayodhya from '../three/Ayodhya'

type Filter = 'all' | 'mine' | DiyaKind

function timeAgo(ts: number) {
  const m = Math.round((Date.now() - ts) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

function DiyaCard({ d, onFocus, onShare, selected }: { d: Diya; onFocus: () => void; onShare: () => void; selected: boolean }) {
  const react = useDiwali((s) => s.react)
  const mineReactions = useDiwali((s) => s.myReactions)
  const remove = useDiwali((s) => s.remove)
  const k = KIND_BY_ID[d.kind]
  return (
    <li className={`diya-card ${selected ? 'on' : ''}`} style={{ ['--rim' as string]: d.color }}>
      <button className="diya-card-main" onClick={onFocus}>
        <span className="kind">{k.emoji} {k.label}</span>
        <p>“{d.text}”</p>
        <small>
          🪔 {d.name}{d.mine ? ' (you)' : ''}{d.received ? ' · shared with you' : ''} · {timeAgo(d.createdAt)}
        </small>
      </button>
      <div className="diya-card-actions">
        {REACTIONS.map((e) => {
          const on = mineReactions.includes(`${d.id}:${e}`)
          return (
            <button key={e} className={`react ${on ? 'on' : ''}`} onClick={() => react(d.id, e)} aria-pressed={on}>
              {e} {d.reactions[e] ? <b>{d.reactions[e]}</b> : null}
            </button>
          )
        })}
        <button className="react share" onClick={onShare}>📤 Share</button>
        {(d.mine || d.received) && (
          <button className="icon" title="remove" onClick={() => { if (confirm('Remove this diya?')) remove(d.id) }}>🗑️</button>
        )}
      </div>
    </li>
  )
}

export default function Diwali() {
  const diyas = useDiwali((s) => s.diyas)
  const selectedId = useDiwali((s) => s.selectedId)
  const select = useDiwali((s) => s.select)
  const lightDiya = useDiwali((s) => s.lightDiya)
  const receive = useDiwali((s) => s.receive)
  const lastName = useDiwali((s) => s.lastName)
  const myFigs = useStore((s) => s.mine)

  const [params, setParams] = useSearchParams()
  const [name, setName] = useState(lastName)
  const [kind, setKind] = useState<DiyaKind>('wish')
  const [text, setText] = useState('')
  const [color, setColor] = useState(DIYA_COLORS[1])
  const [freshId, setFreshId] = useState<string | null>(null)
  const [fireworks, setFireworks] = useState(0)
  const [sound, setSound] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const [panel, setPanel] = useState<'light' | 'wall' | null>(() => (window.innerWidth > 760 ? 'light' : null))
  const [toast, setToast] = useState<string | null>(null)
  const [arrived, setArrived] = useState<Diya | null>(null)
  const soundRef = useRef(sound)
  soundRef.current = sound

  const flash = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 2600)
  }

  // a diya shared through a link lands here
  useEffect(() => {
    const code = params.get('d')
    if (!code) return
    const incoming = decodeDiya(code)
    setParams({}, { replace: true })
    if (!incoming) { flash('That diya link looks broken 😕'); return }
    const id = receive(incoming)
    setFreshId(id)
    setArrived(useDiwali.getState().diyas.find((d) => d.id === id) ?? null)
  }, [params, setParams, receive])

  const lit = ghatLitCount(diyas.length)
  const goal = deepotsavGoal()
  const pct = Math.round((lit / goal) * 100)
  const mineCount = diyas.filter((d) => d.mine).length
  const selected = diyas.find((d) => d.id === selectedId) ?? null
  const shown = useMemo(() => {
    const list = filter === 'all' ? diyas : filter === 'mine' ? diyas.filter((d) => d.mine || d.received) : diyas.filter((d) => d.kind === filter)
    return [...list].sort((a, b) => b.createdAt - a.createdAt)
  }, [diyas, filter])
  const devotees = useMemo(() => myFigs.map((f) => f.config), [myFigs])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const id = lightDiya({ name, kind, text, color })
    if (!id) return
    setFreshId(id)
    setText('')
    setFireworks((n) => n + 1)
    chime()
    flash(`🪔 Your diya is lit — and ${DIYAS_PER_LIGHT} more glow along the ghats!`)
    if (window.innerWidth <= 760) setPanel(null)
  }

  const share = async (d: Diya) => {
    const url = shareUrl(d)
    const text = shareText(d)
    try {
      if (navigator.share) {
        await navigator.share({ title: 'A diya from Ayodhya', text, url })
        return
      }
      await navigator.clipboard.writeText(`${text}\n${url}`)
      flash('Link copied — send it to someone special 💌')
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        window.prompt('Copy this link to share your diya:', url)
      }
    }
  }

  return (
    <div className="diwali">
      <Ayodhya
        diyas={diyas}
        selectedId={selectedId}
        freshId={freshId}
        onSelect={select}
        fireworksNonce={fireworks}
        devotees={devotees}
        onBurst={() => { if (soundRef.current) pop() }}
      />

      <div className="dhud top-center">
        <div className="deepotsav">
          <div>
            <b>Ayodhya Deepotsav</b>
            <small>{lit.toLocaleString()} of {goal.toLocaleString()} diyas glowing on the Saryu ghats</small>
          </div>
          <div className="meter" aria-label={`${pct}% lit`}><span style={{ width: `${pct}%` }} /></div>
        </div>
      </div>

      <div className="dhud top-left">
        <div className="hud-tabs">
          <button className={panel === 'light' ? 'on' : ''} onClick={() => setPanel(panel === 'light' ? null : 'light')}>🪔 Light a diya</button>
          <button className={panel === 'wall' ? 'on' : ''} onClick={() => setPanel(panel === 'wall' ? null : 'wall')}>✨ Wall of light <span className="count">{diyas.length}</span></button>
        </div>

        {panel === 'light' && (
          <form className="hud-card light-form" onSubmit={submit}>
            <label className="field">
              <span>Your name</span>
              <input value={name} maxLength={MAX_NAME} onChange={(e) => setName(e.target.value)} placeholder="e.g. Riya" required />
            </label>
            <div className="kinds" role="radiogroup" aria-label="What is your diya for?">
              {KINDS.map((k) => (
                <button key={k.id} type="button" role="radio" aria-checked={kind === k.id} className={`opt ${kind === k.id ? 'on' : ''}`} onClick={() => setKind(k.id)}>
                  {k.emoji} {k.label}
                </button>
              ))}
            </div>
            <label className="field">
              <span>{KIND_BY_ID[kind].label}</span>
              <textarea value={text} maxLength={MAX_TEXT} rows={3} onChange={(e) => setText(e.target.value)} placeholder={KIND_BY_ID[kind].prompt} required />
              <small className="muted right">{text.length}/{MAX_TEXT}</small>
            </label>
            <div className="row">
              <span className="muted">Diya colour</span>
              <div className="swatches">
                {DIYA_COLORS.map((c) => (
                  <button key={c} type="button" className={`swatch round ${c === color ? 'on' : ''}`} style={{ background: c }} onClick={() => setColor(c)} aria-label={c} />
                ))}
              </div>
            </div>
            <button className="btn primary light-btn" disabled={!name.trim() || !text.trim()}>🪔 Light my diya</button>
            {mineCount > 0 && <p className="muted center">You’ve lit {mineCount} diya{mineCount > 1 ? 's' : ''} this Diwali 🙏</p>}
          </form>
        )}

        {panel === 'wall' && (
          <div className="hud-card wall">
            <div className="filters">
              {(['all', 'mine', ...KINDS.map((k) => k.id)] as Filter[]).map((f) => (
                <button key={f} className={`chip ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>
                  {f === 'all' ? 'All' : f === 'mine' ? '⭐ Mine & shared' : `${KIND_BY_ID[f].emoji} ${KIND_BY_ID[f].label}`}
                </button>
              ))}
            </div>
            <ul className="diya-list">
              {shown.map((d) => (
                <DiyaCard key={d.id} d={d} selected={d.id === selectedId} onFocus={() => select(d.id)} onShare={() => share(d)} />
              ))}
              {shown.length === 0 && <p className="muted">No diyas here yet — light the first one!</p>}
            </ul>
          </div>
        )}
      </div>

      <div className="dhud top-right">
        <button className="round-btn" onClick={() => { setFireworks((n) => n + 1) }} title="Fireworks">🎆</button>
        <button className="round-btn" onClick={() => setSound((s) => !s)} title="Sound">{sound ? '🔔' : '🔕'}</button>
      </div>

      {selected && (
        <div className="dhud bottom-center">
          <ul className="diya-list single">
            <DiyaCard d={selected} selected onFocus={() => {}} onShare={() => share(selected)} />
          </ul>
          <button className="icon close" onClick={() => select(null)} aria-label="close">✕</button>
        </div>
      )}

      {arrived && (
        <div className="arrival" role="dialog" aria-label="A diya was shared with you">
          <div className="arrival-card">
            <div className="big-diya">🪔</div>
            <h2>{arrived.name} lit a diya for you</h2>
            <p className="kind">{KIND_BY_ID[arrived.kind].emoji} {KIND_BY_ID[arrived.kind].label}</p>
            <blockquote>“{arrived.text}”</blockquote>
            <p className="muted">It now glows on the ghats of your Ayodhya.</p>
            <div className="row center">
              <button className="btn" onClick={() => { setArrived(null); select(arrived.id) }}>See it on the ghat</button>
              <button className="btn primary" onClick={() => { setArrived(null); setKind('message'); setPanel('light') }}>🪔 Light one back</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="dtoast">{toast}</div>}
    </div>
  )
}
