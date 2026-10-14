import type { ReactNode } from 'react'
import { levelProgress, titleForLevel } from '../lib/game'

export function XPBar({ xp, compact = false }: { xp: number; compact?: boolean }) {
  const p = levelProgress(xp)
  return (
    <div className={`xpbar ${compact ? 'compact' : ''}`}>
      {!compact && (
        <div className="xpbar-head">
          <strong>Level {p.level}</strong>
          <span>{titleForLevel(p.level)}</span>
        </div>
      )}
      <div className="xpbar-track" aria-label={`${p.into} of ${p.needed} XP to next level`}>
        <div className="xpbar-fill" style={{ width: `${p.pct}%` }} />
        {Array.from({ length: 10 }, (_, i) => <span key={i} className="xpbar-stud" />)}
      </div>
      {!compact && <small>{p.into} / {p.needed} XP to level {p.level + 1}</small>}
    </div>
  )
}

export function Card({ children, className = '', color }: { children: ReactNode; className?: string; color?: string }) {
  return (
    <section className={`card ${className}`} style={color ? { ['--card-accent' as string]: color } : undefined}>
      {children}
    </section>
  )
}

export function Stat({ label, value, icon }: { label: string; value: ReactNode; icon: string }) {
  return (
    <div className="stat">
      <span className="stat-icon" aria-hidden>{icon}</span>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

export function Progress({ value, max, color = '#00a650' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="progress" aria-label={`${pct}%`}>
      <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

export function BrickRating({ value, onChange, size = 'md' }: { value: number; onChange?: (n: number) => void; size?: 'sm' | 'md' }) {
  return (
    <div className={`brick-rating ${size}`} role={onChange ? 'radiogroup' : undefined} aria-label={`${value} of 5 bricks`}>
      {[1, 2, 3, 4, 5].map((n) =>
        onChange ? (
          <button key={n} type="button" className={`rb ${n <= value ? 'on' : ''}`} onClick={() => onChange(n === value ? 0 : n)} aria-label={`${n} bricks`} />
        ) : (
          <span key={n} className={`rb ${n <= value ? 'on' : ''}`} />
        ),
      )}
    </div>
  )
}
