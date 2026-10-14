import { useState, type FormEvent } from 'react'
import { SEED_USERS } from '../lib/seed'
import { useStore } from '../store'
import Minifig from '../three/Minifig'
import Stage from '../three/Stage'

export default function Login() {
  const [mode, setMode] = useState<'login' | 'signup'>('signup')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const signup = useStore((s) => s.signup)
  const login = useStore((s) => s.login)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(await (mode === 'signup' ? signup(username, password) : login(username, password)))
    setBusy(false)
  }

  return (
    <div className="landing">
      <div className="landing-copy">
        <div className="logo big">
          <span className="logo-brick" aria-hidden />
          Biblobumbo
        </div>
        <h1>
          build your <span className="hl">reading era</span>, one brick at a time 🧱📚
        </h1>
        <ul className="pitch">
          <li><b>🧑‍🎤 be a 3D minifig</b> — customise your fit, unlock drip with studs</li>
          <li><b>📖 read in-app</b> or log pages from your IRL books</li>
          <li><b>⚡ XP, streaks, quests &amp; badges</b> — reading but make it a game</li>
          <li><b>💬 the Hangout</b> — drop book takes, hype your squad</li>
        </ul>

        <form className="card auth" onSubmit={submit}>
          <div className="tabs">
            <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => { setMode('signup'); setError(null) }}>new here</button>
            <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(null) }}>log in</button>
          </div>
          <label>
            username
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="booktok.bestie" autoComplete="username" required />
          </label>
          <label>
            password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="btn primary big" disabled={busy}>
            {mode === 'signup' ? 'spawn my minifig ✨' : 'let me in 🔑'}
          </button>
          <p className="fine">Accounts are saved in this browser only — no email, no tracking.</p>
        </form>
      </div>
      <div className="landing-stage">
        <Stage camera={[0, 4, 12.5]} target={[0, 1.8, 0]} height="100%" autoRotate zoom={false}>
          {SEED_USERS.slice(0, 3).map((u, i) => (
            <Minifig key={u.id} config={u.avatar} position={[(i - 1) * 2.1, 0, i === 1 ? 0.6 : 0]} mode={(['wave', 'dance', 'read'] as const)[i]} seed={i * 1.7} rotationY={(1 - i) * 0.25} />
          ))}
        </Stage>
      </div>
    </div>
  )
}
