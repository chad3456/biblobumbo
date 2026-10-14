import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { hype } from '../lib/lingo'
import { BUNDLED_TEXTS, paginate } from '../lib/texts'
import type { Book } from '../lib/types'
import { useMe, useStore } from '../store'
import { Card, Progress } from '../components/ui'
import Minifig from '../three/Minifig'
import Stage from '../three/Stage'

const AWARD_EVERY = 5 // minutes

function loadText(book: Book): string | null {
  if (!book.textSource) return null
  if (book.textSource === 'upload') {
    try { return localStorage.getItem(`bb-text-${book.id}`) } catch { return null }
  }
  return BUNDLED_TEXTS.find((t) => t.id === book.textSource)?.body ?? null
}

/** Counts focused reading time (tab visible + not paused) and pays out XP in chunks. */
function useFocusTimer(running: boolean) {
  const logMinutes = useStore((s) => s.logMinutes)
  const [seconds, setSeconds] = useState(0)
  const paid = useRef(0)

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') setSeconds((s) => s + 1)
    }, 1000)
    return () => clearInterval(t)
  }, [running])

  useEffect(() => {
    const mins = Math.floor(seconds / 60)
    if (mins - paid.current >= AWARD_EVERY) {
      logMinutes(mins - paid.current)
      paid.current = mins
    }
  }, [seconds, logMinutes])

  // pay out leftover whole minutes when leaving the page
  const secondsRef = useRef(0)
  secondsRef.current = seconds
  useEffect(() => () => {
    const left = Math.floor(secondsRef.current / 60) - paid.current
    if (left > 0) {
      paid.current += left
      logMinutes(left)
    }
  }, [logMinutes])

  return seconds
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export default function Reader() {
  const { id = '' } = useParams()
  const me = useMe()!
  const book = useStore((s) => s.books[id])
  const setProgress = useStore((s) => s.setProgress)
  const [running, setRunning] = useState(true)
  const seconds = useFocusTimer(running)

  if (!book || book.ownerId !== me.id) {
    return (
      <div className="page">
        <Card><p className="empty">this book isn’t on your shelf. <Link to="/library">back to library</Link></p></Card>
      </div>
    )
  }

  return book.textSource
    ? <TextReader book={book} seconds={seconds} />
    : <FocusMode book={book} seconds={seconds} running={running} setRunning={setRunning} setProgress={setProgress} />
}

function ReaderHeader({ book, seconds }: { book: Book; seconds: number }) {
  const me = useMe()!
  return (
    <div className="reader-head">
      <div className="reader-fig">
        <Stage camera={[2.2, 3.6, 5.6]} target={[0, 2, 0]} height={190} plate={6} plateColor="#ff7a00" zoom={false}>
          <Minifig config={me.avatar} mode="read" bookColor={book.color} rotationY={0.3} />
        </Stage>
      </div>
      <div className="reader-meta">
        <Link to="/library" className="back">← library</Link>
        <h2>{book.title}</h2>
        <p>{book.author}</p>
        <Progress value={book.currentPage} max={book.totalPages} color={book.color} />
        <p className="timer">⏱️ locked in for <b>{fmt(seconds)}</b> <small>· +1 XP per minute</small></p>
      </div>
    </div>
  )
}

function TextReader({ book, seconds }: { book: Book; seconds: number }) {
  const setProgress = useStore((s) => s.setProgress)
  const text = useMemo(() => loadText(book), [book])
  const pages = useMemo(() => paginate(text ?? ''), [text])
  const [i, setI] = useState(() => Math.min(book.currentPage, pages.length - 1))
  const [size, setSize] = useState(19)
  const [dark, setDark] = useState(false)
  const last = i >= pages.length - 1

  const next = useCallback(() => {
    if (i + 1 > book.currentPage) setProgress(book.id, i + 1)
    if (!last) setI(i + 1)
  }, [i, last, book.currentPage, book.id, setProgress])
  const prev = useCallback(() => setI((x) => Math.max(0, x - 1)), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  useEffect(() => window.scrollTo({ top: 0, behavior: 'smooth' }), [i])

  if (!text) {
    return (
      <div className="page">
        <Card><p className="empty">couldn’t load this text (browser storage may have been cleared). <Link to="/library">back</Link></p></Card>
      </div>
    )
  }

  const done = book.status === 'finished' && last

  return (
    <div className="page reader">
      <ReaderHeader book={book} seconds={seconds} />
      <div className="reader-tools">
        <button className="btn small ghost" onClick={() => setSize((s) => Math.max(14, s - 2))}>A−</button>
        <button className="btn small ghost" onClick={() => setSize((s) => Math.min(28, s + 2))}>A+</button>
        <button className="btn small ghost" onClick={() => setDark((d) => !d)}>{dark ? '☀️ paper' : '🌙 night'}</button>
      </div>
      <article className={`paper ${dark ? 'night' : ''}`} style={{ fontSize: size }}>
        {pages[i].split('\n\n').map((p, k) => <p key={k}>{p}</p>)}
        <footer>page {i + 1} of {pages.length}</footer>
      </article>
      <div className="reader-nav">
        <button className="btn" onClick={prev} disabled={i === 0}>← prev</button>
        {done ? (
          <span className="tag big">🏁 finished — {hype()}</span>
        ) : (
          <button className="btn primary big" onClick={next}>{last ? 'finish book 🏁' : 'next page →'}</button>
        )}
      </div>
      <p className="fine center">tip: use ← → keys. each new page = +2 XP & +1 stud</p>
    </div>
  )
}

function FocusMode({ book, seconds, running, setRunning, setProgress }: {
  book: Book
  seconds: number
  running: boolean
  setRunning: (b: boolean) => void
  setProgress: (id: string, page: number) => void
}) {
  const [page, setPage] = useState(String(book.currentPage))
  return (
    <div className="page reader">
      <ReaderHeader book={book} seconds={seconds} />
      <Card className="focus" color={book.color}>
        <h3>lock-in mode 🔒</h3>
        <p>reading a physical book or e-reader? keep this tab open while you read — the timer pays out XP. update your page when you take a break.</p>
        <div className="big-timer">{fmt(seconds)}</div>
        <div className="row center">
          <button className="btn" onClick={() => setRunning(!running)}>{running ? '⏸ pause' : '▶️ resume'}</button>
        </div>
        <form
          className="row center"
          onSubmit={(e) => {
            e.preventDefault()
            setProgress(book.id, Number(page) || 0)
          }}
        >
          <label className="inline">
            i’m now on page
            <input type="number" min={0} max={book.totalPages} value={page} onChange={(e) => setPage(e.target.value)} />
          </label>
          <span>/ {book.totalPages}</span>
          <button className="btn primary">save progress</button>
        </form>
      </Card>
    </div>
  )
}
