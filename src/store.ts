import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { GREETINGS } from './lib/presets'
import type { ActionId, ActiveAction, Figurine, FigurineConfig, StepId } from './lib/types'

export const MAX_MINE = 12

interface State {
  mine: Figurine[]
  /** dancer order around the circle (ids of mine + npcs) */
  order: string[]
  trackId: string
  /** 'auto' follows the track's step */
  stepMode: StepId | 'auto'
  selectedId: string | null
  actions: Record<string, ActiveAction>
  bubbles: Record<string, { text: string; until: number }>
  showNpcs: boolean

  saveFigurine: (f: { id?: string; name: string; config: FigurineConfig }) => string
  deleteFigurine: (id: string) => void
  setTrack: (id: string) => void
  setStepMode: (s: StepId | 'auto') => void
  select: (id: string | null) => void
  setShowNpcs: (v: boolean) => void
  /** Trigger an interaction. Paired actions bring the partner next to you in the circle. */
  act: (id: string, action: ActionId, partnerId?: string) => void
  say: (id: string, text: string, seconds?: number) => void
}

const uid = () => 'fig-' + Math.random().toString(36).slice(2, 9)

const DURATION: Record<ActionId, number> = { namaste: 3, wave: 2.5, spin: 2.4, jai: 3, clap: 2.5, fudadi: 5 }

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      mine: [],
      order: [],
      trackId: 'ambe',
      stepMode: 'auto',
      selectedId: null,
      actions: {},
      bubbles: {},
      showNpcs: true,

      saveFigurine: ({ id, name, config }) => {
        const clean = name.trim().slice(0, 18) || 'Rangilo'
        const existing = id && get().mine.find((f) => f.id === id)
        if (existing) {
          set((s) => ({ mine: s.mine.map((f) => (f.id === id ? { ...f, name: clean, config } : f)) }))
          return existing.id
        }
        const fig: Figurine = { id: uid(), name: clean, config, mine: true, createdAt: Date.now() }
        set((s) => ({ mine: [...s.mine, fig].slice(-MAX_MINE), selectedId: fig.id }))
        return fig.id
      },

      deleteFigurine: (id) =>
        set((s) => ({
          mine: s.mine.filter((f) => f.id !== id),
          order: s.order.filter((x) => x !== id),
          selectedId: s.selectedId === id ? null : s.selectedId,
        })),

      setTrack: (trackId) => set({ trackId }),
      setStepMode: (stepMode) => set({ stepMode }),
      select: (selectedId) => set({ selectedId }),
      setShowNpcs: (showNpcs) => set({ showNpcs }),

      act: (id, action, partnerId) => {
        const now = performance.now() / 1000
        const until = now + DURATION[action]
        const actions = { ...get().actions, [id]: { id: action, until, partnerId } }
        let order = get().order
        if (partnerId) {
          actions[partnerId] = { id: action, until, partnerId: id }
          // move the partner right next to the initiator so they can dance together
          order = order.filter((x) => x !== partnerId)
          const at = order.indexOf(id)
          if (at >= 0) order = [...order.slice(0, at + 1), partnerId, ...order.slice(at + 1)]
        }
        set({ actions, order })
        if (action === 'jai') get().say(id, 'Jai Mata Di! 🙏')
        if (action === 'namaste') get().say(id, 'Namaste 🙏')
        if (action === 'fudadi' && partnerId) {
          get().say(id, 'Chalo fudadi! 🌀')
          get().say(partnerId, 'Haa chalo! 😄')
        }
      },

      say: (id, text, seconds = 3) => {
        const until = performance.now() / 1000 + seconds
        set((s) => ({ bubbles: { ...s.bubbles, [id]: { text: text || GREETINGS[0], until } } }))
      },
    }),
    {
      name: 'garba-night',
      version: 1,
      partialize: (s) => ({ mine: s.mine, order: s.order, trackId: s.trackId, stepMode: s.stepMode, showNpcs: s.showNpcs }),
    },
  ),
)

/** Stable circle order: keeps saved positions, appends newcomers, drops missing. */
export function circleOrder(saved: string[], ids: string[]): string[] {
  const set = new Set(ids)
  const kept = saved.filter((id) => set.has(id))
  const keptSet = new Set(kept)
  return [...kept, ...ids.filter((id) => !keptSet.has(id))]
}
