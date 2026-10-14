import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import AvatarFace from '../components/AvatarFace'
import { BrickRating, Card } from '../components/ui'
import { levelFromXp } from '../lib/game'
import { REACTIONS, VIBES, ratingLabel, timeAgo } from '../lib/lingo'
import type { Post } from '../lib/types'
import { useMe, useStore } from '../store'

function PostCard({ post }: { post: Post }) {
  const me = useMe()!
  const author = useStore((s) => s.users[post.authorId])
  const users = useStore((s) => s.users)
  const toggleReaction = useStore((s) => s.toggleReaction)
  const addComment = useStore((s) => s.addComment)
  const deletePost = useStore((s) => s.deletePost)
  const [reply, setReply] = useState('')
  const [open, setOpen] = useState(false)
  if (!author) return null

  return (
    <li className="post">
      <div className="post-head">
        <Link to={`/u/${author.id}`}><AvatarFace cfg={author.avatar} size={46} /></Link>
        <div>
          <Link to={`/u/${author.id}`} className="name">{author.displayName}</Link>
          <small>@{author.username} · Lv {levelFromXp(author.xp)} · {timeAgo(post.createdAt)}</small>
        </div>
        {post.authorId === me.id && (
          <button className="btn small ghost push-right" onClick={() => deletePost(post.id)} aria-label="delete post">🗑️</button>
        )}
      </div>
      <div className="post-book">
        <span>📖 <b>{post.bookTitle}</b>{post.bookAuthor ? ` — ${post.bookAuthor}` : ''}</span>
        {post.rating > 0 && (
          <span className="row tight"><BrickRating value={post.rating} size="sm" /><small>{ratingLabel(post.rating)}</small></span>
        )}
      </div>
      <p className="post-text">{post.text}</p>
      {post.vibe && <span className="vibe">{post.vibe}</span>}
      <div className="reactions">
        {REACTIONS.map((r) => {
          const list = post.reactions[r.emoji] ?? []
          const mine = list.includes(me.id)
          return (
            <button key={r.emoji} className={`react ${mine ? 'on' : ''}`} onClick={() => toggleReaction(post.id, r.emoji)} aria-label={r.label} aria-pressed={mine}>
              {r.emoji} {list.length > 0 && <span>{list.length}</span>}
            </button>
          )
        })}
        <button className="react" onClick={() => setOpen(!open)}>💬 {post.comments.length || ''}</button>
      </div>
      {open && (
        <div className="comments">
          {post.comments.map((c) => {
            const u = users[c.authorId]
            return (
              <div key={c.id} className="comment">
                {u && <AvatarFace cfg={u.avatar} size={28} />}
                <p><b>{u?.displayName ?? 'someone'}</b> {c.text}</p>
              </div>
            )
          })}
          <form
            className="row"
            onSubmit={(e) => {
              e.preventDefault()
              addComment(post.id, reply)
              setReply('')
            }}
          >
            <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="add a reply…" maxLength={280} />
            <button className="btn small primary" disabled={!reply.trim()}>send</button>
          </form>
        </div>
      )}
    </li>
  )
}

export default function Hangout() {
  const me = useMe()!
  const posts = useStore((s) => s.posts)
  const allBooks = useStore((s) => s.books)
  const createPost = useStore((s) => s.createPost)
  const myBooks = useMemo(() => Object.values(allBooks).filter((b) => b.ownerId === me.id), [allBooks, me.id])
  const [bookTitle, setBookTitle] = useState('')
  const [bookAuthor, setBookAuthor] = useState('')
  const [text, setText] = useState('')
  const [vibe, setVibe] = useState(VIBES[0])
  const [rating, setRating] = useState(0)
  const [filter, setFilter] = useState<'all' | 'mine'>('all')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!bookTitle.trim() || !text.trim()) return
    createPost({ bookTitle: bookTitle.trim(), bookAuthor: bookAuthor.trim(), text, vibe, rating })
    setText(''); setRating(0)
  }

  const shown = filter === 'mine' ? posts.filter((p) => p.authorId === me.id) : posts

  return (
    <div className="page hangout">
      <Card color="#7b2cbf" className="composer">
        <h3>drop a book take 🎤 <small>+25 XP</small></h3>
        <form onSubmit={submit}>
          <div className="row">
            <input
              list="my-books"
              value={bookTitle}
              onChange={(e) => {
                setBookTitle(e.target.value)
                const b = myBooks.find((x) => x.title === e.target.value)
                if (b) setBookAuthor(b.author)
              }}
              placeholder="which book?"
              required
            />
            <datalist id="my-books">{myBooks.map((b) => <option key={b.id} value={b.title} />)}</datalist>
            <input value={bookAuthor} onChange={(e) => setBookAuthor(e.target.value)} placeholder="author (optional)" />
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="spill. no spoilers without a warning tho 🙏" rows={3} maxLength={500} required />
          <div className="vibes">
            {VIBES.map((v) => (
              <button key={v} type="button" className={`chip ${v === vibe ? 'on' : ''}`} onClick={() => setVibe(v)}>{v}</button>
            ))}
          </div>
          <div className="row spread">
            <span className="row tight">rate it: <BrickRating value={rating} onChange={setRating} /> <small>{ratingLabel(rating)}</small></span>
            <button className="btn primary">post it 🚀</button>
          </div>
        </form>
      </Card>

      <div className="tabs feed-tabs">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>for you</button>
        <button className={filter === 'mine' ? 'active' : ''} onClick={() => setFilter('mine')}>my takes</button>
      </div>
      {shown.length === 0 ? <Card><p className="empty">no takes yet. be the main character 👆</p></Card> : (
        <ul className="feed">{shown.map((p) => <PostCard key={p.id} post={p} />)}</ul>
      )}
    </div>
  )
}
