import type { Figurine, FigurineConfig, Gender } from './types'

export const SKIN = ['#ffd500', '#f6d7b0', '#e8b98a', '#d9a066', '#b97a45', '#8d5524', '#5c3a21']
export const HAIR = ['#1b1b1b', '#3b2416', '#6d4c41', '#8e5a2b', '#b0b0b0']

/** Rich festive colours: kesari, sindoor, rani pink, peacock, parrot green… */
export const FABRIC = [
  '#e3000b', '#c2185b', '#ff2d87', '#ff6f00', '#ffb300', '#ffd54f',
  '#2e7d32', '#76c043', '#00897b', '#00acc1', '#1565c0', '#283593',
  '#6a1b9a', '#ab47bc', '#4e342e', '#fafafa', '#212121',
]
export const ACCENT = ['#ffd54f', '#ffb300', '#fafafa', '#e3000b', '#00acc1', '#76c043', '#ff2d87', '#212121']

export function defaultConfig(gender: Gender): FigurineConfig {
  return gender === 'female'
    ? {
        gender, skin: '#e8b98a', hairColor: '#1b1b1b', face: 'smile',
        main: '#c2185b', accent: '#ffd54f', second: '#2e7d32', drape: '#ff6f00',
        pattern: 'mirror', femaleHair: 'braid', maleHead: 'pagdi', jewellery: true, dandiyaColor: '#e3000b',
      }
    : {
        gender, skin: '#d9a066', hairColor: '#1b1b1b', face: 'joy',
        main: '#ff6f00', accent: '#ffd54f', second: '#fafafa', drape: '#e3000b',
        pattern: 'mirror', femaleHair: 'braid', maleHead: 'pagdi', jewellery: false, dandiyaColor: '#ffb300',
      }
}

function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 2 ** 32
  }
}

export function randomConfig(gender: Gender, seed = Math.floor(Math.random() * 1e9)): FigurineConfig {
  const r = rng(seed)
  const pick = <T,>(a: readonly T[]): T => a[Math.floor(r() * a.length)]
  const main = pick(FABRIC.filter((c) => c !== '#fafafa' && c !== '#212121'))
  let second = pick(FABRIC)
  if (second === main) second = '#fafafa'
  return {
    gender,
    skin: pick(SKIN.slice(1)),
    hairColor: pick(HAIR),
    face: pick(['smile', 'joy', 'wink', 'calm'] as const),
    main,
    accent: pick(ACCENT),
    second: gender === 'male' ? pick(['#fafafa', '#fafafa', '#ffd54f', '#212121', second]) : second,
    drape: pick(FABRIC),
    pattern: pick(['mirror', 'mirror', 'bandhani', 'leheriya', 'plain'] as const),
    femaleHair: pick(['braid', 'bun', 'open'] as const),
    maleHead: pick(['pagdi', 'pagdi', 'safa', 'topi', 'none'] as const),
    jewellery: gender === 'female' ? r() > 0.15 : r() > 0.7,
    dandiyaColor: pick(['#e3000b', '#ffb300', '#00acc1', '#76c043', '#ff2d87']),
  }
}

const NPC_NAMES: [string, Gender][] = [
  ['Hetal', 'female'], ['Jignesh', 'male'], ['Krupa', 'female'], ['Dhaval', 'male'],
  ['Nirali', 'female'], ['Parth', 'male'], ['Riddhi', 'female'], ['Bhavik', 'male'],
  ['Kinjal', 'female'], ['Chirag', 'male'], ['Foram', 'female'], ['Mehul', 'male'],
]

/** The neighbourhood crowd that's already dancing when you arrive. */
export const NPCS: Figurine[] = NPC_NAMES.map(([name, g], i) => ({
  id: `npc-${name.toLowerCase()}`,
  name,
  config: randomConfig(g, 1000 + i * 97),
  mine: false,
  createdAt: 0,
}))

export const GREETINGS = [
  'Jai Mata Di! 🙏',
  'Kem cho? 😄',
  'Majama! ✨',
  'Garba ramva chalo! 💃',
  'Navratri ni shubhkamna! 🪔',
  'Dandiya lai ne aavjo! 🥢',
  'Ekdum jordar! 🔥',
  'Ambe Maa ni jay! 🌺',
]
