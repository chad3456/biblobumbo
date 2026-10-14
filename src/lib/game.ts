import type { MinifigConfig, User, UserStats } from './types'

/* ---------- levels ---------- */

/** Total XP needed to reach a level (level 1 = 0 XP). Grows quadratically. */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0
  return 50 * (level - 1) * level
}

export function levelFromXp(xp: number): number {
  let level = 1
  while (xp >= xpForLevel(level + 1)) level++
  return level
}

export function levelProgress(xp: number): { level: number; into: number; needed: number; pct: number } {
  const level = levelFromXp(xp)
  const base = xpForLevel(level)
  const next = xpForLevel(level + 1)
  const into = xp - base
  const needed = next - base
  return { level, into, needed, pct: Math.min(100, Math.round((into / needed) * 100)) }
}

const TITLES = [
  'Brick Newbie',
  'Page Turner',
  'Chapter Chaser',
  'Plot Twist Survivor',
  'Annotation Gremlin',
  'Bookshelf Builder',
  'Lore Master',
  'Main Character',
  'Library Legend',
  'Literally Him (the Reader)',
]

export function titleForLevel(level: number): string {
  return TITLES[Math.min(TITLES.length - 1, Math.floor((level - 1) / 2))]
}

/* ---------- rewards ---------- */

export const XP = {
  page: 2,
  minute: 1,
  finishBook: 120,
  addBook: 10,
  post: 25,
  comment: 8,
  react: 2,
}

export const STUDS = {
  page: 1,
  finishBook: 50,
  post: 10,
  levelUp: 25,
}

/* ---------- dates & streaks ---------- */

export function dayKey(ts: number = Date.now()): string {
  const d = new Date(ts)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function daysBetween(a: string, b: string): number {
  const pa = Date.parse(a + 'T00:00:00')
  const pb = Date.parse(b + 'T00:00:00')
  return Math.round((pb - pa) / 86_400_000)
}

/** Returns the updated streak after reading activity on `today`. */
export function bumpStreak(streak: User['streak'], today: string): User['streak'] {
  if (streak.lastDay === today) return streak
  if (streak.lastDay && daysBetween(streak.lastDay, today) === 1) {
    return { count: streak.count + 1, lastDay: today }
  }
  return { count: 1, lastDay: today }
}

/** A streak is shown as alive if the user read today or yesterday. */
export function liveStreak(streak: User['streak'], today: string = dayKey()): number {
  if (!streak.lastDay) return 0
  return daysBetween(streak.lastDay, today) <= 1 ? streak.count : 0
}

/* ---------- badges ---------- */

export interface Badge {
  id: string
  name: string
  emoji: string
  desc: string
  test: (u: Pick<User, 'stats' | 'streak' | 'xp'>) => boolean
}

export const BADGES: Badge[] = [
  { id: 'first-brick', name: 'First Brick', emoji: '🧱', desc: 'Add your first book', test: (u) => u.stats.booksAdded >= 1 },
  { id: 'page-100', name: 'Century Club', emoji: '💯', desc: 'Read 100 pages', test: (u) => u.stats.pagesRead >= 100 },
  { id: 'page-1000', name: 'Thousand Page Era', emoji: '📚', desc: 'Read 1,000 pages', test: (u) => u.stats.pagesRead >= 1000 },
  { id: 'finisher', name: 'It Is Finished', emoji: '🏁', desc: 'Finish a book', test: (u) => u.stats.booksFinished >= 1 },
  { id: 'five-books', name: 'Stack Attack', emoji: '🗼', desc: 'Finish 5 books', test: (u) => u.stats.booksFinished >= 5 },
  { id: 'yapper', name: 'Certified Yapper', emoji: '🗣️', desc: 'Share 3 book takes', test: (u) => u.stats.postsMade >= 3 },
  { id: 'hype', name: 'Hype Machine', emoji: '🔥', desc: 'Drop 10 reactions', test: (u) => u.stats.reactionsGiven >= 10 },
  { id: 'streak-3', name: 'On a Roll', emoji: '⚡', desc: '3-day reading streak', test: (u) => u.streak.count >= 3 },
  { id: 'streak-7', name: 'Locked In', emoji: '🔒', desc: '7-day reading streak', test: (u) => u.streak.count >= 7 },
  { id: 'focus-60', name: 'Deep Focus', emoji: '🧘', desc: 'Read 60 minutes total', test: (u) => u.stats.minutesRead >= 60 },
]

export function newlyEarnedBadges(u: Pick<User, 'stats' | 'streak' | 'xp' | 'badges'>): Badge[] {
  return BADGES.filter((b) => !u.badges.includes(b.id) && b.test(u))
}

/* ---------- daily quests ---------- */

export interface Quest {
  id: string
  label: string
  stat: keyof UserStats
  goal: number
  xp: number
  studs: number
}

export const QUESTS: Quest[] = [
  { id: 'q-pages', label: 'Read 20 pages', stat: 'pagesRead', goal: 20, xp: 40, studs: 15 },
  { id: 'q-minutes', label: 'Lock in for 15 minutes', stat: 'minutesRead', goal: 15, xp: 30, studs: 10 },
  { id: 'q-react', label: 'Hype 3 takes in the Hangout', stat: 'reactionsGiven', goal: 3, xp: 15, studs: 5 },
  { id: 'q-post', label: 'Drop a book take', stat: 'postsMade', goal: 1, xp: 25, studs: 10 },
]

/** Resets quest progress when a new day starts. */
export function rollQuestDay(u: User, today: string = dayKey()): User {
  if (u.questDay === today) return u
  return { ...u, questDay: today, questProgress: {}, questsClaimed: [] }
}

/* ---------- shop / unlockables ---------- */

export interface ShopItem {
  id: string
  label: string
  cost: number
  slot: 'hair' | 'accessory' | 'print' | 'face'
  value: string
  minLevel?: number
}

export const SHOP: ShopItem[] = [
  { id: 'hair-crown', label: 'Bookworm Crown', cost: 150, slot: 'hair', value: 'crown', minLevel: 4 },
  { id: 'hair-beanie', label: 'Cozy Beanie', cost: 40, slot: 'hair', value: 'beanie' },
  { id: 'hair-bun', label: 'Dark Academia Bun', cost: 40, slot: 'hair', value: 'bun' },
  { id: 'acc-headphones', label: 'Audiobook Cans', cost: 60, slot: 'accessory', value: 'headphones' },
  { id: 'acc-cape', label: 'Main Character Cape', cost: 120, slot: 'accessory', value: 'cape', minLevel: 3 },
  { id: 'acc-coffee', label: 'Iced Oat Latte', cost: 30, slot: 'accessory', value: 'coffee' },
  { id: 'print-bolt', label: 'Lightning Tee', cost: 35, slot: 'print', value: 'bolt' },
  { id: 'print-star', label: 'Star Tee', cost: 35, slot: 'print', value: 'star' },
  { id: 'face-wink', label: 'Wink Face', cost: 25, slot: 'face', value: 'wink' },
  { id: 'face-shook', label: 'Shook Face', cost: 25, slot: 'face', value: 'shook' },
]

export function isLocked(slot: ShopItem['slot'], value: string, unlocked: string[]): ShopItem | null {
  const item = SHOP.find((i) => i.slot === slot && i.value === value)
  if (!item) return null
  return unlocked.includes(item.id) ? null : item
}

/* ---------- avatar presets ---------- */

export const SKIN_TONES = ['#ffd500', '#f6d7b0', '#e0ac69', '#c68642', '#8d5524', '#5c3a21']
export const BRICK_COLORS = [
  '#e3000b', '#ff7a00', '#ffd500', '#00a650', '#00b4d8', '#0055bf',
  '#7b2cbf', '#ff5fa2', '#f4f4f4', '#1b1b1b', '#6d4c41', '#9aa5b1',
]

export function randomAvatar(rand: () => number = Math.random): MinifigConfig {
  const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)]
  return {
    skin: pick(SKIN_TONES),
    hair: pick(['bowl', 'spiky', 'long', 'cap', 'bald'] as const),
    hairColor: pick(['#1b1b1b', '#6d4c41', '#ffb703', '#e3000b', '#7b2cbf', '#ff5fa2', '#f4f4f4']),
    face: pick(['smile', 'grin', 'smirk', 'sleepy'] as const),
    torso: pick(BRICK_COLORS),
    print: pick(['plain', 'stripe', 'heart', 'book'] as const),
    legs: pick(BRICK_COLORS),
    accessory: pick(['none', 'book', 'glasses'] as const),
  }
}
