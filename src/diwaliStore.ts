import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MAX_NAME, MAX_TEXT, SEED_DIYAS, type Diya, type DiyaKind } from './lib/diwali'

interface DiwaliState {
  diyas: Diya[]
  /** reactions I've given: `${diyaId}:${emoji}` */
  myReactions: string[]
  selectedId: string | null
  lastName: string

  lightDiya: (d: { name: string; kind: DiyaKind; text: string; color: string }) => string | null
  receive: (d: Omit<Diya, 'id' | 'mine' | 'reactions'>) => string
  react: (id: string, emoji: string) => void
  select: (id: string | null) => void
  remove: (id: string) => void
}

const uid = () => 'diya-' + Math.random().toString(36).slice(2, 10)

export const useDiwali = create<DiwaliState>()(
  persist(
    (set, get) => ({
      diyas: SEED_DIYAS,
      myReactions: [],
      selectedId: null,
      lastName: '',

      lightDiya: ({ name, kind, text, color }) => {
        const n = name.trim().slice(0, MAX_NAME)
        const t = text.trim().slice(0, MAX_TEXT)
        if (!n || !t) return null
        const d: Diya = { id: uid(), name: n, kind, text: t, color, createdAt: Date.now(), mine: true, reactions: {} }
        set((s) => ({ diyas: [...s.diyas, d], selectedId: d.id, lastName: n }))
        return d.id
      },

      receive: (incoming) => {
        // opening the same link twice shouldn't light a second diya
        const dup = get().diyas.find((d) => d.received && d.name === incoming.name && d.text === incoming.text && d.createdAt === incoming.createdAt)
        if (dup) {
          set({ selectedId: dup.id })
          return dup.id
        }
        const d: Diya = { ...incoming, id: uid(), mine: false, received: true, reactions: {} }
        set((s) => ({ diyas: [...s.diyas, d], selectedId: d.id }))
        return d.id
      },

      react: (id, emoji) => {
        const key = `${id}:${emoji}`
        const had = get().myReactions.includes(key)
        set((s) => ({
          myReactions: had ? s.myReactions.filter((k) => k !== key) : [...s.myReactions, key],
          diyas: s.diyas.map((d) =>
            d.id === id ? { ...d, reactions: { ...d.reactions, [emoji]: Math.max(0, (d.reactions[emoji] ?? 0) + (had ? -1 : 1)) } } : d,
          ),
        }))
      },

      select: (selectedId) => set({ selectedId }),

      remove: (id) => set((s) => ({ diyas: s.diyas.filter((d) => !(d.id === id && (d.mine || d.received))), selectedId: s.selectedId === id ? null : s.selectedId })),
    }),
    {
      name: 'diwali-ayodhya',
      version: 1,
      partialize: (s) => ({ diyas: s.diyas, myReactions: s.myReactions, lastName: s.lastName }),
    },
  ),
)
