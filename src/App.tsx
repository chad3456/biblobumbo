import { lazy, Suspense } from 'react'
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'

const Studio = lazy(() => import('./pages/Studio'))
const Garba = lazy(() => import('./pages/Garba'))

function Loading() {
  return (
    <div className="loading">
      <div className="diya-loader">🪔</div>
      <p>decorating the garba ground…</p>
    </div>
  )
}

export default function App() {
  const { pathname } = useLocation()
  return (
    <div className={`shell ${pathname === '/garba' ? 'fullscreen' : ''}`}>
      <header className="topbar">
        <NavLink to="/" className="logo">
          <span className="logo-mark" aria-hidden>🪔</span>
          Garba Night
        </NavLink>
        <nav>
          <NavLink to="/" end>🧵<span className="nav-long"> Figurine</span> Studio</NavLink>
          <NavLink to="/garba">💃 Garba<span className="nav-long"> Ground</span></NavLink>
        </nav>
      </header>
      <main>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Studio />} />
            <Route path="/garba" element={<Garba />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}
