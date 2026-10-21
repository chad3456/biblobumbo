/**
 * Diwali in Ayodhya: diyas carry a wish / promise / message. Each one sits on a
 * ghat step by the Saryu, and can travel to friends inside a share link.
 */

export type DiyaKind = 'wish' | 'promise' | 'message' | 'gratitude' | 'prayer'

export interface Diya {
  id: string
  name: string
  kind: DiyaKind
  text: string
  color: string
  createdAt: number
  /** lit by me on this device */
  mine: boolean
  /** arrived through a share link */
  received?: boolean
  reactions: Record<string, number>
}

export const KINDS: { id: DiyaKind; label: string; emoji: string; prompt: string }[] = [
  { id: 'wish', label: 'Wish', emoji: '🌟', prompt: 'May this Diwali bring…' },
  { id: 'promise', label: 'Promise', emoji: '🤝', prompt: 'This year I promise to…' },
  { id: 'message', label: 'Message', emoji: '💌', prompt: 'A message for someone special…' },
  { id: 'gratitude', label: 'Gratitude', emoji: '🌸', prompt: 'I am grateful for…' },
  { id: 'prayer', label: 'Prayer', emoji: '🙏', prompt: 'Jai Shri Ram — I pray that…' },
]
export const KIND_BY_ID = Object.fromEntries(KINDS.map((k) => [k.id, k])) as Record<DiyaKind, (typeof KINDS)[number]>

/** Rim colours for the clay diyas. */
export const DIYA_COLORS = ['#c0602a', '#ffc400', '#e53935', '#ff4081', '#7c4dff', '#00bfa5', '#2979ff', '#fafafa']

export const REACTIONS = ['🙏', '❤️', '🪔', '✨'] as const

export const MAX_TEXT = 160
export const MAX_NAME = 24

/* ---------------- share links ---------------- */

interface Payload { n: string; k: DiyaKind; t: string; c: string; at: number }

function toB64Url(s: string): string {
  const bytes = new TextEncoder().encode(s)
  let bin = ''
  bytes.forEach((b) => { bin += String.fromCharCode(b) })
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromB64Url(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4)
  const bin = atob(b64)
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
}

export function encodeDiya(d: Pick<Diya, 'name' | 'kind' | 'text' | 'color' | 'createdAt'>): string {
  const p: Payload = { n: d.name, k: d.kind, t: d.text, c: d.color, at: d.createdAt }
  return toB64Url(JSON.stringify(p))
}

/** Parses a shared diya, rejecting anything malformed or oversized. */
export function decodeDiya(code: string): Omit<Diya, 'id' | 'mine' | 'reactions'> | null {
  if (!code || code.length > 2000) return null
  try {
    const p = JSON.parse(fromB64Url(code)) as Partial<Payload>
    if (typeof p.n !== 'string' || typeof p.t !== 'string' || typeof p.c !== 'string') return null
    if (!p.k || !(p.k in KIND_BY_ID)) return null
    if (!/^#[0-9a-fA-F]{6}$/.test(p.c)) return null
    const name = p.n.trim().slice(0, MAX_NAME)
    const text = p.t.trim().slice(0, MAX_TEXT)
    if (!name || !text) return null
    const at = typeof p.at === 'number' && Number.isFinite(p.at) ? p.at : Date.now()
    return { name, kind: p.k, text, color: p.c, createdAt: at, received: true }
  } catch {
    return null
  }
}

export function shareUrl(d: Diya, base = `${location.origin}${location.pathname}`): string {
  return `${base}#/diwali?d=${encodeDiya(d)}`
}

export function shareText(d: Diya): string {
  const k = KIND_BY_ID[d.kind]
  return `🪔 ${d.name} lit a diya in Ayodhya — ${k.emoji} ${k.label}: “${d.text}” Light one back!`
}

/* ---------------- ghat layout ---------------- */

export const GHAT = {
  steps: 9,
  rise: 0.42,
  depth: 1.15,
  width: 56,
  /** z of the front edge of the lowest step (the river is in front of it) */
  front: 3,
}

export function stepTop(k: number): { y: number; z: number } {
  return { y: (k + 1) * GHAT.rise, z: GHAT.front - k * GHAT.depth - 0.25 }
}

/**
 * Where the n-th message diya sits: spread along the middle of the ghat,
 * filling from the lowest step upwards, alternating out from the centre.
 */
export function messageSlot(n: number): [number, number, number] {
  const perRow = 24
  const rows = GHAT.steps - 2
  const row = Math.floor(n / perRow) % rows
  const i = n % perRow
  const layer = Math.floor(n / (perRow * rows))
  const side = i % 2 === 0 ? 1 : -1
  const x = side * (0.8 + Math.floor(i / 2) * 1.6) + (layer % 2 ? 0.8 : 0)
  const { y, z } = stepTop(row)
  return [x, y, z - 0.45 - layer * 0.2]
}

/**
 * The decorative diyas lining every step (two rows) and the top terrace,
 * ordered so they light up from the centre outwards, lowest steps first.
 */
let slotsCache: [number, number, number][] | null = null
export function decorativeSlots(): [number, number, number][] {
  if (slotsCache) return slotsCache
  const out: { p: [number, number, number]; order: number }[] = []
  const half = GHAT.width / 2 - 1
  for (let k = 0; k <= GHAT.steps; k++) {
    const { y, z } = stepTop(k)
    for (const dz of [0, -0.9]) {
      for (let x = -half; x <= half + 1e-6; x += 0.6) {
        out.push({ p: [x, y, z + dz], order: Math.abs(x) * 1.2 + k * 3 + (dz ? 1.5 : 0) })
      }
    }
  }
  slotsCache = out.sort((a, b) => a.order - b.order).map((o) => o.p)
  return slotsCache
}

/** Every diya you light kindles more along the ghats — the whole riverfront is the goal. */
export const DIYAS_PER_LIGHT = 25
export const BASE_LIT = 300

export function deepotsavGoal(): number {
  return decorativeSlots().length
}

export function ghatLitCount(messages: number): number {
  return Math.min(deepotsavGoal(), BASE_LIT + messages * DIYAS_PER_LIGHT)
}

/* ---------------- the neighbourhood's diyas ---------------- */

const DAY = 86_400_000
const seed = (id: string, name: string, kind: DiyaKind, text: string, color: string, hoursAgo: number, r: Record<string, number>): Diya => ({
  id, name, kind, text, color, createdAt: Date.UTC(2026, 9, 20) - hoursAgo * (DAY / 24), mine: false, reactions: r,
})

export const SEED_DIYAS: Diya[] = [
  seed('s1', 'Dadi Maa', 'prayer', 'May every home be as bright as Ayodhya the night Shri Ram returned.', '#ffc400', 3, { '🙏': 41, '❤️': 18 }),
  seed('s2', 'Aarav', 'promise', 'I promise to call my grandparents every Sunday this year.', '#2979ff', 5, { '❤️': 22, '🪔': 9 }),
  seed('s3', 'Meera', 'gratitude', 'Grateful for my little brother who stays up all night making rangoli with me.', '#ff4081', 7, { '❤️': 30, '✨': 12 }),
  seed('s4', 'Kabir', 'wish', 'Wishing for a cracker-free, smoke-free sky — lots of diyas instead!', '#00bfa5', 9, { '🪔': 27, '✨': 8 }),
  seed('s5', 'Ananya', 'message', 'To everyone far from home this Diwali — you are not alone. 🪔', '#7c4dff', 12, { '❤️': 51, '🙏': 14 }),
  seed('s6', 'Rohan', 'promise', 'I will share sweets with the security uncles and the didi who helps at home.', '#c0602a', 15, { '🙏': 19, '❤️': 16 }),
  seed('s7', 'Priya', 'wish', 'May Maa Lakshmi bless every small business owner this season.', '#ffc400', 20, { '🪔': 21, '🙏': 11 }),
  seed('s8', 'Ishaan', 'gratitude', 'Thankful for my parents’ patience and my mother’s besan laddoos.', '#e53935', 26, { '❤️': 33 }),
  seed('s9', 'Sanya', 'prayer', 'Jai Shri Ram — may there be light where there is darkness.', '#fafafa', 30, { '🙏': 47, '✨': 10 }),
  seed('s10', 'Vihaan', 'promise', 'This Diwali I promise to forgive, and to ask for forgiveness.', '#2979ff', 36, { '❤️': 28, '🙏': 13 }),
  seed('s11', 'Nani', 'message', 'Shubh Deepavali to my grandchildren in Toronto and Sydney. Come home soon!', '#ff4081', 40, { '❤️': 44 }),
  seed('s12', 'Tara', 'wish', 'May every stray animal find a warm, quiet corner tonight.', '#00bfa5', 46, { '❤️': 25, '✨': 7 }),
]
