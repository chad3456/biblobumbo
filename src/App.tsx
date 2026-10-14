import { lazy, Suspense, useEffect } from 'react'
import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import AvatarFace from './components/AvatarFace'
import Toasts from './components/Toasts'
import { levelFromXp } from './lib/game'
import { useMe, useStore } from './store'

const Login = lazy(() => import('./pages/Login'))
const Home = lazy(() => import('./pages/Home'))
const Customize = lazy(() => import('./pages/Customize'))
const Library = lazy(() => import('./pages/Library'))
const Reader = lazy(() => import('./pages/Reader'))
const Hangout = lazy(() => import('./pages/Hangout'))
const Squad = lazy(() => import('./pages/Squad'))
const Profile = lazy(() => import('./pages/Profile'))

const NAV = [
  { to: '/', label: 'Brick City', icon: '🏙️' },
  { to: '/library', label: 'Library', icon: '📚' },
  { to: '/hangout', label: 'Hangout', icon: '💬' },
  { to: '/squad', label: 'Squad', icon: '🏆' },
  { to: '/fig', label: 'My Fig', icon: '🧑‍🎤' },
]

function Loading() {
  return (
    <div className="loading">
      <div className="loading-brick" />
      <p>stacking bricks…</p>
    </div>
  )
}

export default function App() {
  const me = useMe()
  const ensureSeed = useStore((s) => s.ensureSeed)
  const logout = useStore((s) => s.logout)
  useEffect(() => ensureSeed(), [ensureSeed])

  if (!me) {
    return (
      <>
        <Suspense fallback={<Loading />}>
          <Login />
        </Suspense>
        <Toasts />
      </>
    )
  }

  return (
    <div className="shell">
      <header className="topbar">
        <NavLink to="/" className="logo">
          <span className="logo-brick" aria-hidden />
          Biblobumbo
        </NavLink>
        <nav className="nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} className="nav-link">
              <span aria-hidden>{n.icon}</span>
              <span className="nav-label">{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="me-chip">
          <span className="studs" title="studs (spend them in My Fig)">🟡 {me.studs}</span>
          <NavLink to={`/u/${me.id}`} className="me-link" title="your profile">
            <AvatarFace cfg={me.avatar} size={34} />
            <span className="lvl">Lv {levelFromXp(me.xp)}</span>
          </NavLink>
          <button className="btn ghost small" onClick={logout}>log out</button>
        </div>
      </header>
      <main className="main">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/library" element={<Library />} />
            <Route path="/read/:id" element={<Reader />} />
            <Route path="/hangout" element={<Hangout />} />
            <Route path="/squad" element={<Squad />} />
            <Route path="/fig" element={<Customize />} />
            <Route path="/u/:id" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Toasts />
    </div>
  )
}
