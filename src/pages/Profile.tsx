import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BADGES, levelFromXp, liveStreak, titleForLevel } from '../lib/game'
import { useMe, useStore } from '../store'
import { BrickRating, Card, Stat, XPBar } from '../components/ui'
import Minifig from '../three/Minifig'
import Stage, { Brick } from '../three/Stage'

export default function Profile() {
  const { id = '' } = useParams()
  const me = useMe()!
  const user = useStore((s) => s.users[id])
  const allBooks = useStore((s) => s.books)
  const posts = useStore((s) => s.posts)
  const logout = useStore((s) => s.logout)
  const finished = useMemo(
    () => Object.values(allBooks).filter((b) => b.ownerId === id && b.status === 'finished').sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0)),
    [allBooks, id],
  )
  const theirPosts = posts.filter((p) => p.authorId === id)

  if (!user) return <div className="page"><Card><p className="empty">user not found 🫥 <Link to="/squad">back to squad</Link></p></Card></div>
  const lvl = levelFromXp(user.xp)
  const isMe = user.id === me.id

  return (
    <div className="page profile">
      <div className="home-grid">
        <Card className="hero-stage">
          <Stage camera={[0, 3, 7.5]} target={[0, 1.9, 0]} height={400} plate={10} plateColor="#00b4d8">
            <Minifig config={user.avatar} mode="wave" />
            {finished.slice(0, 12).map((b, i) => (
              <Brick key={b.id} color={b.color} position={[2.2, i * 0.48, -0.6]} rotationY={(i % 2) * Math.PI / 2} />
            ))}
          </Stage>
        </Card>
        <div className="side-col">
          <Card>
            <h2 className="profile-name">{user.displayName}</h2>
            <p className="muted">@{user.username} · {titleForLevel(lvl)}{user.isBot ? ' · NPC 🤖' : ''}</p>
            <p>{user.bio}</p>
            <XPBar xp={user.xp} />
            <div className="stats">
              <Stat icon="📄" label="pages" value={user.stats.pagesRead} />
              <Stat icon="🏁" label="finished" value={user.stats.booksFinished} />
              <Stat icon="⚡" label="streak" value={user.isBot ? user.streak.count : liveStreak(user.streak)} />
              <Stat icon="🗣️" label="takes" value={theirPosts.length} />
            </div>
            {isMe && (
              <div className="row">
                <Link className="btn primary" to="/fig">edit my fig ✏️</Link>
                <button className="btn ghost" onClick={logout}>log out</button>
              </div>
            )}
          </Card>
          {!user.isBot && (
            <Card color="#ffd500">
              <h3>badges</h3>
              <div className="badges">
                {BADGES.filter((b) => user.badges.includes(b.id)).map((b) => (
                  <div key={b.id} className="badge earned" title={b.desc}><span>{b.emoji}</span><small>{b.name}</small></div>
                ))}
                {user.badges.length === 0 && <p className="empty">no badges yet</p>}
              </div>
            </Card>
          )}
        </div>
      </div>
      {finished.length > 0 && (
        <Card color="#00a650">
          <h3>the tower 🗼</h3>
          <ul className="mini-books">
            {finished.map((b) => (
              <li key={b.id}>
                <span className="spine" style={{ background: b.color }} />
                <div><strong>{b.title}</strong><small>{b.author}</small></div>
                {b.rating ? <BrickRating value={b.rating} size="sm" /> : null}
              </li>
            ))}
          </ul>
        </Card>
      )}
      {theirPosts.length > 0 && (
        <Card color="#7b2cbf">
          <h3>takes</h3>
          <ul className="mini-takes">
            {theirPosts.map((p) => (
              <li key={p.id}><b>{p.bookTitle}</b> — {p.text} <span className="vibe">{p.vibe}</span></li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
