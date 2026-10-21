import { lazy, Suspense } from 'react'
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'

const Home = lazy(() => import('./pages/Home'))
const Studio = lazy(() => import('./pages/Studio'))
const Garba = lazy(() => import('./pages/Garba'))
const Diwali = lazy(() => import('./pages/Diwali'))

function Loading() {
  return (
    <div className="loading">
      <div className="diya-loader">🪔</div>
      <p>lighting the diyas…</p>
    </div>
  )
}

const FULLSCREEN = new Set(['/garba', '/diwali'])

export default function App() {
  const { pathname } = useLocation()
  return (
    <div className={`shell ${FULLSCREEN.has(pathname) ? 'fullscreen' : ''}`}>
      <header className="topbar">
        <NavLink to="/" className="logo">
          <span className="logo-mark" aria-hidden>🪔</span>
          Utsav<span className="nav-long"> Bricks</span>
        </NavLink>
        <nav>
          <NavLink to="/" end>🏠<span className="nav-long"> Home</span></NavLink>
          <NavLink to="/studio">🧵<span className="nav-long"> Studio</span></NavLink>
          <NavLink to="/garba">💃<span className="nav-long"> Garba</span></NavLink>
          <NavLink to="/diwali">🪔<span className="nav-long"> Diwali</span></NavLink>
        </nav>
      </header>
      <main>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/garba" element={<Garba />} />
            <Route path="/diwali" element={<Diwali />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}
