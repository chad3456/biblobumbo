/** Gen Z flavour text. Kept in one place so the vibe stays consistent. */

export const VIBES = [
  'it’s giving ✨',
  'no thoughts just vibes',
  'emotional damage 💀',
  'unhinged (affectionate)',
  'comfort read 🧸',
  'plot twist jumpscare',
  'slow burn supremacy',
  'DNF energy 🚩',
]

export const REACTIONS: { emoji: string; label: string }[] = [
  { emoji: '🔥', label: 'fire' },
  { emoji: '💀', label: 'dead' },
  { emoji: '😭', label: 'crying' },
  { emoji: '🧱', label: 'solid' },
  { emoji: '🫶', label: 'love' },
]

const HYPE = [
  'slay bestie 💅',
  'ate and left no crumbs',
  'main character behaviour',
  'you’re lowkey cracked at this',
  'W reader fr',
  'certified page-turner moment',
  'brain getting so big rn 🧠',
  'that’s bussin no cap',
]

export function hype(): string {
  return HYPE[Math.floor(Math.random() * HYPE.length)]
}

export function ratingLabel(r: number): string {
  return ['', 'mid tbh', 'it was aight', 'solid read', 'kinda obsessed', 'life changing, no cap'][r] ?? ''
}

export function timeAgo(ts: number, now: number = Date.now()): string {
  const s = Math.max(1, Math.round((now - ts) / 1000))
  if (s < 60) return `${s}s`
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.round(h / 24)}d`
}
