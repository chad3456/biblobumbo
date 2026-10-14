import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BADGES, QUESTS, dayKey, liveStreak, rollQuestDay } from '../lib/game'
import { useMe, useStore } from '../store'
import { Card, Progress, Stat, XPBar } from '../components/ui'
import Minifig, { type MinifigMode } from '../three/Minifig'
import Stage, { Brick } from '../three/Stage'
import type { Book } from '../lib/types'

const MODES: MinifigMode[] = ['wave', 'dance', 'read', 'celebrate', 'walk', 'idle']

/** Finished books stack into a tower; currently-reading ones lie on the plate. */
function BookTower({ finished, reading }: { finished: Book[]; reading: Book[] }) {
  return (
    <group>
      <group position={[2.4, 0, -0.8]}>
        {finished.map((b, i) => (
          <Brick key={b.id} color={b.color} position={[0, i * 0.48, 0]} rotationY={(i % 2) * Math.PI / 2 + Math.sin(i) * 0.08} />
        ))}
      </group>
      {reading.slice(0, 4).map((b, i) => (
        <Brick key={b.id} color={b.color} width={2} length={2} height={0.24} position={[-2.6 + (i % 2) * 1.1, 0, -1.2 + Math.floor(i / 2) * 1.1]} rotationY={i * 0.3} />
      ))}
    </group>
  )
}

export default function Home() {
  const me = useMe()!
  const allBooks = useStore((s) => s.books)
  const claimQuest = useStore((s) => s.claimQuest)
  const [mode, setMode] = useState<MinifigMode>('wave')
  const books = useMemo(() => Object.values(allBooks).filter((b) => b.ownerId === me.id), [allBooks, me.id])
  const finished = books.filter((b) => b.status === 'finished').sort((a, b) => (a.finishedAt ?? 0) - (b.finishedAt ?? 0))
  const reading = books.filter((b) => b.status === 'reading')
  const today = rollQuestDay(me, dayKey())
  const streak = liveStreak(me.streak)
  const current = reading[0]

  return (
    <div className="page home">
      <div className="home-grid">
        <Card className="hero-stage">
          <div className="stage-head">
            <h2>Brick City</h2>
            <p>hey {me.displayName} 👋 tap your fig to switch moves</p>
          </div>
          <Stage camera={[1.5, 4, 9]} target={[0, 1.6, 0]} height={440}>
            <Minifig
              config={me.avatar}
              mode={mode}
              bookColor={current?.color}
              onClick={() => setMode(MODES[(MODES.indexOf(mode) + 1) % MODES.length])}
            />
            <BookTower finished={finished} reading={reading} />
          </Stage>
          <div className="pose-row">
            {MODES.map((m) => (
              <button key={m} className={`chip ${m === mode ? 'on' : ''}`} onClick={() => setMode(m)}>{m}</button>
            ))}
          </div>
          <p className="caption">🗼 your tower has {finished.length} brick{finished.length === 1 ? '' : 's'} — every finished book adds one.</p>
        </Card>

        <div className="side-col">
          <Card>
            <XPBar xp={me.xp} />
            <div className="stats">
              <Stat icon="⚡" label="day streak" value={streak} />
              <Stat icon="🟡" label="studs" value={me.studs} />
              <Stat icon="📄" label="pages" value={me.stats.pagesRead} />
              <Stat icon="🏁" label="finished" value={me.stats.booksFinished} />
            </div>
          </Card>

          <Card color="#ff5fa2">
            <h3>daily quests 🎯</h3>
            <ul className="quests">
              {QUESTS.map((q) => {
                const prog = Math.min(q.goal, today.questProgress[q.stat] ?? 0)
                const claimed = today.questsClaimed.includes(q.id)
                const done = prog >= q.goal
                return (
                  <li key={q.id} className={claimed ? 'claimed' : ''}>
                    <div className="quest-top">
                      <span>{q.label}</span>
                      <small>+{q.xp} XP · +{q.studs} 🟡</small>
                    </div>
                    <Progress value={prog} max={q.goal} color={done ? '#00a650' : '#ffd500'} />
                    <div className="quest-bottom">
                      <small>{prog}/{q.goal}</small>
                      {claimed ? <span className="tag">claimed ✅</span> : (
                        <button className="btn small primary" disabled={!done} onClick={() => claimQuest(q.id)}>claim</button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </Card>
        </div>
      </div>

      <div className="home-grid lower">
        <Card color="#00b4d8">
          <h3>currently reading 📖</h3>
          {reading.length === 0 ? (
            <p className="empty">nothing on the go rn. <Link to="/library">grab a book</Link> and start your era.</p>
          ) : (
            <ul className="mini-books">
              {reading.map((b) => (
                <li key={b.id}>
                  <span className="spine" style={{ background: b.color }} />
                  <div>
                    <strong>{b.title}</strong>
                    <small>{b.author} · p.{b.currentPage}/{b.totalPages}</small>
                    <Progress value={b.currentPage} max={b.totalPages} color={b.color} />
                  </div>
                  <Link className="btn small" to={`/read/${b.id}`}>{b.textSource ? 'read' : 'lock in'}</Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card color="#ffd500">
          <h3>badges 🏅 <small>{me.badges.length}/{BADGES.length}</small></h3>
          <div className="badges">
            {BADGES.map((b) => (
              <div key={b.id} className={`badge ${me.badges.includes(b.id) ? 'earned' : ''}`} title={b.desc}>
                <span>{b.emoji}</span>
                <small>{b.name}</small>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
