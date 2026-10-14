import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AvatarFace from '../components/AvatarFace'
import { Card } from '../components/ui'
import { levelFromXp, liveStreak, titleForLevel } from '../lib/game'
import type { User } from '../lib/types'
import { useMe, useStore } from '../store'
import Minifig from '../three/Minifig'
import Stage, { Brick } from '../three/Stage'

type SortKey = 'xp' | 'pagesRead' | 'booksFinished'

const PODIUM: { x: number; h: number; color: string }[] = [
  { x: 0, h: 3, color: '#ffd500' },
  { x: -2.2, h: 2, color: '#9aa5b1' },
  { x: 2.2, h: 1, color: '#ff7a00' },
]

const metric = (u: User, k: SortKey) => (k === 'xp' ? u.xp : u.stats[k])

export default function Squad() {
  const me = useMe()!
  const users = useStore((s) => s.users)
  const [sort, setSort] = useState<SortKey>('xp')
  const ranked = useMemo(() => Object.values(users).sort((a, b) => metric(b, sort) - metric(a, sort)), [users, sort])
  const top = ranked.slice(0, 3)

  return (
    <div className="page squad">
      <Card className="podium-card">
        <div className="stage-head">
          <h2>the squad 🏆</h2>
          <p>top readers get the podium. go get your spot.</p>
        </div>
        <Stage camera={[0, 5, 11]} target={[0, 2, 0]} height={400} plate={14} plateColor="#7b2cbf">
          {top.map((u, i) => (
            <group key={u.id}>
              {Array.from({ length: PODIUM[i].h }, (_, k) => (
                <Brick key={k} color={PODIUM[i].color} position={[PODIUM[i].x, k * 0.48, 0]} />
              ))}
              <Minifig
                config={u.avatar}
                position={[PODIUM[i].x, PODIUM[i].h * 0.48 + 0.08, 0]}
                mode={i === 0 ? 'celebrate' : u.id === me.id ? 'dance' : 'wave'}
                seed={i * 2.3}
                scale={0.8}
              />
            </group>
          ))}
        </Stage>
      </Card>

      <div className="tabs">
        <button className={sort === 'xp' ? 'active' : ''} onClick={() => setSort('xp')}>XP</button>
        <button className={sort === 'pagesRead' ? 'active' : ''} onClick={() => setSort('pagesRead')}>pages</button>
        <button className={sort === 'booksFinished' ? 'active' : ''} onClick={() => setSort('booksFinished')}>books</button>
      </div>

      <Card>
        <ol className="leaderboard">
          {ranked.map((u, i) => {
            const lvl = levelFromXp(u.xp)
            return (
              <li key={u.id} className={u.id === me.id ? 'me' : ''}>
                <span className="rank">{i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</span>
                <Link to={`/u/${u.id}`} className="who">
                  <AvatarFace cfg={u.avatar} size={40} />
                  <span>
                    <b>{u.displayName}{u.id === me.id ? ' (you)' : ''}</b>
                    <small>Lv {lvl} · {titleForLevel(lvl)}</small>
                  </span>
                </Link>
                <span className="lb-stats">
                  <span title="XP">{u.xp} XP</span>
                  <span title="pages">📄 {u.stats.pagesRead}</span>
                  <span title="books">🏁 {u.stats.booksFinished}</span>
                  {!u.isBot && <span title="streak">⚡ {liveStreak(u.streak)}</span>}
                </span>
              </li>
            )
          })}
        </ol>
        <p className="fine">Everyone who signs up in this browser shows up here, plus a few NPC bookworms to keep things lively.</p>
      </Card>
    </div>
  )
}
