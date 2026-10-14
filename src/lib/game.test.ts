import { describe, expect, it } from 'vitest'
import { bumpStreak, levelFromXp, levelProgress, liveStreak, newlyEarnedBadges, xpForLevel } from './game'
import { paginate } from './texts'

describe('levels', () => {
  it('starts at level 1 and grows quadratically', () => {
    expect(levelFromXp(0)).toBe(1)
    expect(xpForLevel(2)).toBe(100)
    expect(levelFromXp(99)).toBe(1)
    expect(levelFromXp(100)).toBe(2)
    expect(levelFromXp(300)).toBe(3)
  })

  it('reports progress within the current level', () => {
    expect(levelProgress(150)).toMatchObject({ level: 2, into: 50, needed: 200, pct: 25 })
  })
})

describe('streaks', () => {
  it('extends on consecutive days, resets after a gap, ignores same day', () => {
    let s = bumpStreak({ count: 0, lastDay: null }, '2026-10-01')
    expect(s).toEqual({ count: 1, lastDay: '2026-10-01' })
    expect(bumpStreak(s, '2026-10-01')).toBe(s)
    s = bumpStreak(s, '2026-10-02')
    expect(s.count).toBe(2)
    expect(bumpStreak(s, '2026-10-05').count).toBe(1)
  })

  it('crosses month boundaries', () => {
    expect(bumpStreak({ count: 4, lastDay: '2026-10-31' }, '2026-11-01').count).toBe(5)
  })

  it('is only live if read today or yesterday', () => {
    expect(liveStreak({ count: 3, lastDay: '2026-10-13' }, '2026-10-14')).toBe(3)
    expect(liveStreak({ count: 3, lastDay: '2026-10-11' }, '2026-10-14')).toBe(0)
  })
})

describe('badges', () => {
  it('awards only new badges whose condition is met', () => {
    const stats = { pagesRead: 120, minutesRead: 0, booksFinished: 1, booksAdded: 1, postsMade: 0, reactionsGiven: 0, commentsMade: 0 }
    const ids = newlyEarnedBadges({ stats, streak: { count: 0, lastDay: null }, xp: 0, badges: ['first-brick'] }).map((b) => b.id)
    expect(ids).toEqual(['page-100', 'finisher'])
  })
})

describe('paginate', () => {
  it('keeps every word and respects the page size', () => {
    const para = 'Lorem ipsum dolor sit amet. '.repeat(30).trim()
    const text = [para, 'Short one.', para].join('\n\n')
    const pages = paginate(text, 400)
    expect(pages.length).toBeGreaterThan(2)
    for (const p of pages) expect(p.length).toBeLessThanOrEqual(420)
    const words = (s: string) => s.split(/\s+/).filter(Boolean).length
    expect(pages.reduce((n, p) => n + words(p), 0)).toBe(words(text))
  })
})
