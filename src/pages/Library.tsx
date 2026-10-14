import { useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { searchOpenLibrary, type OLResult } from '../lib/openlibrary'
import { BUNDLED_TEXTS, paginate } from '../lib/texts'
import type { Book, BookStatus } from '../lib/types'
import { useMe, useStore } from '../store'
import { BrickRating, Card, Progress } from '../components/ui'
import { ratingLabel } from '../lib/lingo'

const SHELVES: { status: BookStatus; label: string }[] = [
  { status: 'reading', label: 'currently reading 📖' },
  { status: 'tbr', label: 'TBR pile 🗂️' },
  { status: 'finished', label: 'finished — in the tower 🗼' },
]

const MAX_UPLOAD = 1_500_000

function BookCard({ book }: { book: Book }) {
  const setProgress = useStore((s) => s.setProgress)
  const finishBook = useStore((s) => s.finishBook)
  const updateBook = useStore((s) => s.updateBook)
  const removeBook = useStore((s) => s.removeBook)
  const [page, setPage] = useState(String(book.currentPage))

  return (
    <li className="book">
      <div className="cover" style={{ background: book.color }}>
        {book.coverUrl ? <img src={book.coverUrl} alt="" loading="lazy" /> : <span>{book.title.slice(0, 1)}</span>}
        <span className="cover-studs" aria-hidden />
      </div>
      <div className="book-body">
        <strong>{book.title}</strong>
        <small>{book.author}</small>
        <Progress value={book.currentPage} max={book.totalPages} color={book.color} />
        <small>p.{book.currentPage} / {book.totalPages}{book.textSource ? ' · readable in-app' : ''}</small>

        {book.status === 'finished' ? (
          <div className="row">
            <BrickRating value={book.rating ?? 0} onChange={(n) => updateBook(book.id, { rating: n })} size="sm" />
            <small>{ratingLabel(book.rating ?? 0)}</small>
          </div>
        ) : (
          <form
            className="row"
            onSubmit={(e) => {
              e.preventDefault()
              setProgress(book.id, Number(page) || 0)
            }}
          >
            <label className="inline">
              on page
              <input type="number" min={0} max={book.totalPages} value={page} onChange={(e) => setPage(e.target.value)} />
            </label>
            <button className="btn small">update</button>
          </form>
        )}

        <div className="row">
          <Link className="btn small primary" to={`/read/${book.id}`}>{book.textSource ? 'read 📖' : 'lock in ⏱️'}</Link>
          {book.status !== 'finished' && <button className="btn small" onClick={() => finishBook(book.id)}>finished it 🏁</button>}
          <button className="btn small ghost" onClick={() => { if (confirm(`remove “${book.title}”?`)) removeBook(book.id) }}>remove</button>
        </div>
      </div>
    </li>
  )
}

export default function Library() {
  const me = useMe()!
  const allBooks = useStore((s) => s.books)
  const addBook = useStore((s) => s.addBook)
  const pushToast = useStore((s) => s.pushToast)
  const navigate = useNavigate()
  const books = useMemo(() => Object.values(allBooks).filter((b) => b.ownerId === me.id).sort((a, b) => b.addedAt - a.addedAt), [allBooks, me.id])

  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [pages, setPages] = useState('')
  const [q, setQ] = useState('')
  const [results, setResults] = useState<OLResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searchErr, setSearchErr] = useState<string | null>(null)
  const abort = useRef<AbortController | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const owns = (t: string) => books.some((b) => b.title.toLowerCase() === t.toLowerCase())

  const addManual = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !Number(pages)) return
    addBook({ title: title.trim(), author: author.trim() || 'Unknown author', totalPages: Number(pages) })
    setTitle(''); setAuthor(''); setPages('')
  }

  const search = async (e: FormEvent) => {
    e.preventDefault()
    if (!q.trim()) return
    abort.current?.abort()
    abort.current = new AbortController()
    setSearching(true)
    setSearchErr(null)
    try {
      setResults(await searchOpenLibrary(q.trim(), abort.current.signal))
    } catch (err) {
      if ((err as Error).name !== 'AbortError') setSearchErr('couldn’t reach Open Library rn — add it manually below')
    } finally {
      setSearching(false)
    }
  }

  const addFree = (id: string) => {
    const t = BUNDLED_TEXTS.find((x) => x.id === id)!
    const bookId = addBook({ title: t.title, author: t.author, totalPages: paginate(t.body).length, color: t.color, textSource: t.id })
    navigate(`/read/${bookId}`)
  }

  const upload = async (file: File) => {
    if (file.size > MAX_UPLOAD) {
      pushToast('that file is too thicc (1.5MB max) 😅', 'error')
      return
    }
    const text = await file.text()
    const name = file.name.replace(/\.txt$/i, '').replace(/[_-]+/g, ' ')
    const id = addBook({ title: name, author: 'Uploaded', totalPages: paginate(text).length, textSource: 'upload' })
    try {
      localStorage.setItem(`bb-text-${id}`, text)
      navigate(`/read/${id}`)
    } catch {
      pushToast('browser storage is full — try a smaller file', 'error')
    }
  }

  return (
    <div className="page library">
      <div className="lib-grid">
        <Card color="#00b4d8">
          <h3>find a book 🔎</h3>
          <form className="row" onSubmit={search}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="search title or author…" />
            <button className="btn primary" disabled={searching}>{searching ? '…' : 'search'}</button>
          </form>
          {searchErr && <p className="error">{searchErr}</p>}
          {results.length > 0 && (
            <ul className="results">
              {results.map((r) => (
                <li key={r.key}>
                  {r.coverUrl ? <img src={r.coverUrl} alt="" loading="lazy" /> : <span className="noimg">📕</span>}
                  <div>
                    <strong>{r.title}</strong>
                    <small>{r.author}{r.pages ? ` · ${r.pages} pages` : ''}</small>
                  </div>
                  <button
                    className="btn small"
                    disabled={owns(r.title)}
                    onClick={() => addBook({ title: r.title, author: r.author, totalPages: r.pages ?? 300, coverUrl: r.coverUrl })}
                  >
                    {owns(r.title) ? 'added' : '+ add'}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <h3>or add it manually</h3>
          <form className="manual" onSubmit={addManual}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="title" required />
            <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="author" />
            <input type="number" min={1} value={pages} onChange={(e) => setPages(e.target.value)} placeholder="pages" required />
            <button className="btn primary">+ add brick</button>
          </form>
        </Card>

        <Card color="#ff5fa2">
          <h3>free reads — read in-app 📜</h3>
          <ul className="free">
            {BUNDLED_TEXTS.map((t) => (
              <li key={t.id}>
                <span className="spine" style={{ background: t.color }} />
                <div>
                  <strong>{t.title}</strong>
                  <small>{t.author} — {t.blurb}</small>
                </div>
                <button className="btn small" disabled={owns(t.title)} onClick={() => addFree(t.id)}>
                  {owns(t.title) ? 'on shelf' : 'read'}
                </button>
              </li>
            ))}
          </ul>
          <p className="fine">
            Got a .txt (e.g. from Project Gutenberg)? Upload it and read it here.
          </p>
          <input ref={fileInput} type="file" accept=".txt,text/plain" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} />
          <button className="btn" onClick={() => fileInput.current?.click()}>⬆️ upload .txt</button>
        </Card>
      </div>

      {SHELVES.map((s) => {
        const list = books.filter((b) => b.status === s.status)
        return (
          <Card key={s.status} className="shelf">
            <h3>{s.label} <small>{list.length}</small></h3>
            {list.length === 0 ? <p className="empty">empty shelf energy. fix that 👆</p> : (
              <ul className="books">{list.map((b) => <BookCard key={`${b.id}:${b.currentPage}`} book={b} />)}</ul>
            )}
          </Card>
        )
      })}
    </div>
  )
}
