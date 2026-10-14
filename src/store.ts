import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { hashPassword, makeSalt, uid, validatePassword, validateUsername } from './lib/auth'
import {
  BRICK_COLORS, QUESTS, SHOP, STUDS, XP, bumpStreak, dayKey, levelFromXp, newlyEarnedBadges, randomAvatar, rollQuestDay,
} from './lib/game'
import { hype } from './lib/lingo'
import { SEED_POSTS, SEED_USERS } from './lib/seed'
import type { Book, MinifigConfig, Post, User, UserStats } from './lib/types'

export interface Toast {
  id: string
  text: string
  kind: 'xp' | 'level' | 'badge' | 'info' | 'error'
  xp?: number
  studs?: number
}

interface Reward {
  xp?: number
  studs?: number
  stats?: Partial<UserStats>
  /** counts as reading activity for streaks */
  reading?: boolean
}

interface State {
  users: Record<string, User>
  books: Record<string, Book>
  posts: Post[]
  sessionUserId: string | null
  toasts: Toast[]

  signup: (username: string, password: string) => Promise<string | null>
  login: (username: string, password: string) => Promise<string | null>
  logout: () => void
  ensureSeed: () => void

  updateAvatar: (cfg: MinifigConfig) => void
  updateProfile: (p: { displayName: string; bio: string }) => void
  buyItem: (itemId: string) => string | null

  addBook: (b: Pick<Book, 'title' | 'author' | 'totalPages'> & Partial<Book>) => string
  updateBook: (id: string, patch: Partial<Book>) => void
  removeBook: (id: string) => void
  /** Move a book's bookmark. Only forward progress earns XP. */
  setProgress: (id: string, page: number) => void
  finishBook: (id: string, rating?: number) => void
  logMinutes: (minutes: number) => void

  createPost: (p: Pick<Post, 'bookTitle' | 'bookAuthor' | 'text' | 'vibe' | 'rating'>) => void
  toggleReaction: (postId: string, emoji: string) => void
  addComment: (postId: string, text: string) => void
  deletePost: (postId: string) => void

  claimQuest: (questId: string) => void
  pushToast: (text: string, kind?: Toast['kind']) => void
  dismissToast: (id: string) => void
}

const emptyStats = (): UserStats => ({
  pagesRead: 0, minutesRead: 0, booksFinished: 0, booksAdded: 0, postsMade: 0, reactionsGiven: 0, commentsMade: 0,
})

export const useStore = create<State>()(
  persist(
    (set, get) => {
      const toast = (text: string, kind: Toast['kind'] = 'info') => {
        const t = { id: uid('t'), text, kind }
        set((s) => ({ toasts: [...s.toasts.slice(-3), t] }))
        setTimeout(() => get().dismissToast(t.id), 3200)
      }

      /** Rapid rewards (page flips) merge into one running toast instead of stacking. */
      const xpToast = (xp: number, studs: number) => {
        const last = get().toasts.at(-1)
        if (last?.kind === 'xp' && last.xp !== undefined) {
          const merged = { ...last, xp: last.xp + xp, studs: (last.studs ?? 0) + studs }
          merged.text = `+${merged.xp} XP${merged.studs ? ` · +${merged.studs} studs` : ''}`
          set((s) => ({ toasts: s.toasts.map((t) => (t.id === last.id ? merged : t)) }))
          return
        }
        const t: Toast = { id: uid('t'), kind: 'xp', xp, studs, text: `+${xp} XP${studs ? ` · +${studs} studs` : ''}` }
        set((s) => ({ toasts: [...s.toasts.slice(-3), t] }))
        setTimeout(() => get().dismissToast(t.id), 3200)
      }

      /** Central reward pipeline: stats, streak, quests, level-ups, badges, toasts. */
      const reward = (r: Reward) => {
        const id = get().sessionUserId
        if (!id) return
        const prev = rollQuestDay(get().users[id])
        const stats = { ...prev.stats }
        const questProgress = { ...prev.questProgress }
        for (const [k, v] of Object.entries(r.stats ?? {}) as [keyof UserStats, number][]) {
          stats[k] += v
          questProgress[k] = (questProgress[k] ?? 0) + v
        }
        let next: User = {
          ...prev,
          stats,
          questProgress,
          xp: prev.xp + (r.xp ?? 0),
          studs: prev.studs + (r.studs ?? 0),
          streak: r.reading ? bumpStreak(prev.streak, dayKey()) : prev.streak,
        }
        const before = levelFromXp(prev.xp)
        const after = levelFromXp(next.xp)
        if (after > before) {
          next = { ...next, studs: next.studs + STUDS.levelUp * (after - before) }
          toast(`LEVEL UP → ${after}! +${STUDS.levelUp * (after - before)} studs. ${hype()}`, 'level')
        }
        const earned = newlyEarnedBadges(next)
        if (earned.length) {
          next = { ...next, badges: [...next.badges, ...earned.map((b) => b.id)] }
          earned.forEach((b) => toast(`${b.emoji} Badge unlocked: ${b.name}`, 'badge'))
        }
        if (next.streak.count > prev.streak.count) toast(next.streak.count === 1 ? '⚡ reading streak started!' : `⚡ ${next.streak.count}-day streak! keep it up`, 'info')
        set((s) => ({ users: { ...s.users, [id]: next } }))
        if (r.xp && after === before) xpToast(r.xp, r.studs ?? 0)
      }

      const me = () => {
        const id = get().sessionUserId
        return id ? get().users[id] : undefined
      }

      return {
        users: {},
        books: {},
        posts: [],
        sessionUserId: null,
        toasts: [],

        ensureSeed: () => {
          const s = get()
          const users = { ...s.users }
          let changed = false
          for (const u of SEED_USERS) if (!users[u.id]) { users[u.id] = u; changed = true }
          const posts = [...s.posts]
          for (const p of SEED_POSTS) if (!posts.some((x) => x.id === p.id)) { posts.push(p); changed = true }
          if (changed) set({ users, posts: posts.sort((a, b) => b.createdAt - a.createdAt) })
        },

        signup: async (rawName, password) => {
          const username = rawName.trim().toLowerCase()
          const err = validateUsername(username) ?? validatePassword(password)
          if (err) return err
          if (Object.values(get().users).some((u) => u.username === username)) return 'that username is taken, be original 😤'
          const salt = makeSalt()
          const user: User = {
            id: uid('u-'),
            username,
            displayName: rawName.trim(),
            bio: 'new to the brick club 🧱📚',
            passwordHash: await hashPassword(password, salt),
            salt,
            createdAt: Date.now(),
            avatar: randomAvatar(),
            xp: 0,
            studs: 50,
            streak: { count: 0, lastDay: null },
            badges: [],
            unlocked: [],
            stats: emptyStats(),
            questDay: dayKey(),
            questProgress: {},
            questsClaimed: [],
          }
          set((s) => ({ users: { ...s.users, [user.id]: user }, sessionUserId: user.id }))
          toast('welcome to the brick club bestie 🧱 here’s 50 studs to start', 'info')
          return null
        },

        login: async (rawName, password) => {
          const username = rawName.trim().toLowerCase()
          const user = Object.values(get().users).find((u) => u.username === username && !u.isBot)
          if (!user) return 'no account with that username (yet 👀)'
          if ((await hashPassword(password, user.salt)) !== user.passwordHash) return 'wrong password, try again'
          set((s) => ({ sessionUserId: user.id, users: { ...s.users, [user.id]: rollQuestDay(user) } }))
          toast(`welcome back ${user.displayName} ✨`, 'info')
          return null
        },

        logout: () => set({ sessionUserId: null }),

        updateAvatar: (cfg) => {
          const u = me()
          if (!u) return
          set((s) => ({ users: { ...s.users, [u.id]: { ...u, avatar: cfg } } }))
          toast('fit check: passed ✅', 'info')
        },

        updateProfile: ({ displayName, bio }) => {
          const u = me()
          if (!u) return
          set((s) => ({ users: { ...s.users, [u.id]: { ...u, displayName: displayName.trim() || u.username, bio: bio.slice(0, 140) } } }))
        },

        buyItem: (itemId) => {
          const u = me()
          const item = SHOP.find((i) => i.id === itemId)
          if (!u || !item) return 'item not found'
          if (u.unlocked.includes(itemId)) return 'you already own this'
          if (item.minLevel && levelFromXp(u.xp) < item.minLevel) return `reach level ${item.minLevel} first`
          if (u.studs < item.cost) return `need ${item.cost - u.studs} more studs — go read 📖`
          set((s) => ({ users: { ...s.users, [u.id]: { ...u, studs: u.studs - item.cost, unlocked: [...u.unlocked, itemId] } } }))
          toast(`unlocked ${item.label}! 🛍️`, 'badge')
          return null
        },

        addBook: (b) => {
          const u = me()
          const id = uid('b-')
          if (!u) return id
          const book: Book = {
            id,
            ownerId: u.id,
            status: 'tbr',
            currentPage: 0,
            color: BRICK_COLORS[Math.floor(Math.random() * BRICK_COLORS.length)],
            addedAt: Date.now(),
            ...b,
            totalPages: Math.max(1, Math.round(b.totalPages)),
          }
          set((s) => ({ books: { ...s.books, [id]: book } }))
          reward({ xp: XP.addBook, stats: { booksAdded: 1 } })
          return id
        },

        updateBook: (id, patch) => {
          const b = get().books[id]
          if (!b) return
          set((s) => ({ books: { ...s.books, [id]: { ...b, ...patch } } }))
        },

        removeBook: (id) => {
          const books = { ...get().books }
          delete books[id]
          try { localStorage.removeItem(`bb-text-${id}`) } catch { /* ignore */ }
          set({ books })
        },

        setProgress: (id, page) => {
          const b = get().books[id]
          if (!b) return
          const target = Math.max(0, Math.min(b.totalPages, Math.round(page)))
          const gained = target - b.currentPage
          set((s) => ({
            books: { ...s.books, [id]: { ...b, currentPage: target, status: b.status === 'tbr' && target > 0 ? 'reading' : b.status } },
          }))
          if (gained > 0) {
            reward({ xp: gained * XP.page, studs: gained * STUDS.page, stats: { pagesRead: gained }, reading: true })
          }
          if (target >= b.totalPages && b.status !== 'finished') get().finishBook(id)
        },

        finishBook: (id, rating) => {
          const b = get().books[id]
          if (!b) return
          const already = b.status === 'finished'
          set((s) => ({
            books: {
              ...s.books,
              [id]: { ...b, status: 'finished', currentPage: b.totalPages, finishedAt: b.finishedAt ?? Date.now(), rating: rating ?? b.rating },
            },
          }))
          if (!already) {
            toast(`🏁 finished “${b.title}”! a new brick joins your tower`, 'badge')
            reward({ xp: XP.finishBook, studs: STUDS.finishBook, stats: { booksFinished: 1 }, reading: true })
          }
        },

        logMinutes: (minutes) => {
          if (minutes <= 0) return
          reward({ xp: minutes * XP.minute, stats: { minutesRead: minutes }, reading: true })
        },

        createPost: (p) => {
          const u = me()
          if (!u || !p.text.trim()) return
          const post: Post = { ...p, text: p.text.trim(), id: uid('p-'), authorId: u.id, createdAt: Date.now(), reactions: {}, comments: [] }
          set((s) => ({ posts: [post, ...s.posts] }))
          reward({ xp: XP.post, studs: STUDS.post, stats: { postsMade: 1 } })
        },

        toggleReaction: (postId, emoji) => {
          const u = me()
          if (!u) return
          let added = false
          set((s) => ({
            posts: s.posts.map((p) => {
              if (p.id !== postId) return p
              const list = p.reactions[emoji] ?? []
              added = !list.includes(u.id)
              return { ...p, reactions: { ...p.reactions, [emoji]: added ? [...list, u.id] : list.filter((x) => x !== u.id) } }
            }),
          }))
          const post = get().posts.find((p) => p.id === postId)
          if (added && post && post.authorId !== u.id) reward({ xp: XP.react, stats: { reactionsGiven: 1 } })
        },

        addComment: (postId, text) => {
          const u = me()
          if (!u || !text.trim()) return
          set((s) => ({
            posts: s.posts.map((p) =>
              p.id === postId ? { ...p, comments: [...p.comments, { id: uid('c-'), authorId: u.id, text: text.trim().slice(0, 280), createdAt: Date.now() }] } : p,
            ),
          }))
          reward({ xp: XP.comment, stats: { commentsMade: 1 } })
        },

        deletePost: (postId) => {
          const u = me()
          set((s) => ({ posts: s.posts.filter((p) => !(p.id === postId && p.authorId === u?.id)) }))
        },

        claimQuest: (questId) => {
          const u = me()
          const q = QUESTS.find((x) => x.id === questId)
          if (!u || !q) return
          const fresh = rollQuestDay(u)
          if (fresh.questsClaimed.includes(q.id) || (fresh.questProgress[q.stat] ?? 0) < q.goal) return
          set((s) => ({ users: { ...s.users, [u.id]: { ...fresh, questsClaimed: [...fresh.questsClaimed, q.id] } } }))
          reward({ xp: q.xp, studs: q.studs })
        },

        pushToast: (text, kind = 'info') => toast(text, kind),
        dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      }
    },
    {
      name: 'biblobumbo-db',
      version: 1,
      partialize: (s) => ({ users: s.users, books: s.books, posts: s.posts, sessionUserId: s.sessionUserId }),
    },
  ),
)

export function useMe(): User | undefined {
  return useStore((s) => (s.sessionUserId ? s.users[s.sessionUserId] : undefined))
}
