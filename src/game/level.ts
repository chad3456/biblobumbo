/**
 * Level layout, built in code so it's easy to tweak.
 * Tiles:  # ground   B brick   ? project block   = used block   P protest barricade
 * Spawns: o vote   R / K opponent   F flag
 */

export const ROWS = 15
export const COLS = 230
export const GROUND = 13

export type Tile = '.' | '#' | 'B' | '?' | '=' | 'P'
export const SOLID = new Set<Tile>(['#', 'B', '?', '=', 'P'])

export interface Spawn {
  kind: 'vote' | 'rahul' | 'kejriwal' | 'flag'
  x: number
  y: number
}

export interface Level {
  tiles: Tile[][]
  spawns: Spawn[]
  checkpoints: number[]
}

export function buildLevel(): Level {
  const tiles: Tile[][] = Array.from({ length: ROWS }, () => Array<Tile>(COLS).fill('.'))
  const spawns: Spawn[] = []
  const set = (x: number, y: number, t: Tile) => { if (x >= 0 && x < COLS && y >= 0 && y < ROWS) tiles[y][x] = t }
  const row = (x0: number, x1: number, y: number, t: Tile) => { for (let x = x0; x <= x1; x++) set(x, y, t) }
  const votes = (x0: number, x1: number, y: number) => { for (let x = x0; x <= x1; x++) spawns.push({ kind: 'vote', x, y }) }
  const foe = (kind: 'rahul' | 'kejriwal', x: number, y = GROUND - 1) => spawns.push({ kind, x, y })
  const protest = (x: number, h = 2) => { for (let i = 0; i < h; i++) set(x, GROUND - 1 - i, 'P') }
  const stairs = (x: number, h: number, dir: 1 | -1) => {
    for (let i = 0; i < h; i++) for (let j = 0; j <= i; j++) set(x + (dir === 1 ? i : h - 1 - i), GROUND - 1 - j, 'B')
  }

  // ground with a few gaps
  row(0, COLS - 1, GROUND, '#')
  row(0, COLS - 1, GROUND + 1, '#')
  const gaps: [number, number][] = [[46, 48], [99, 101], [152, 154], [178, 179]]
  for (const [a, b] of gaps) { row(a, b, GROUND, '.'); row(a, b, GROUND + 1, '.') }

  // --- section 1: warm-up rally ---
  set(14, 9, '?')
  row(18, 22, 9, 'B'); set(19, 9, '?'); set(21, 9, '?')
  set(20, 5, '?')
  votes(24, 27, 11)
  foe('rahul', 24)
  protest(30)
  foe('kejriwal', 36)
  protest(41, 3)
  votes(46, 48, 8)

  // --- section 2: campaign trail ---
  row(52, 56, 9, 'B'); set(54, 9, '?')
  row(58, 62, 6, 'B'); votes(58, 62, 5)
  foe('rahul', 60)
  foe('rahul', 63)
  protest(68)
  protest(69)
  set(74, 9, '?'); set(77, 9, '?'); set(80, 9, '?'); set(77, 5, '?')
  foe('kejriwal', 84)
  foe('kejriwal', 87)
  stairs(92, 4, 1)
  stairs(102, 4, -1)
  votes(99, 101, 7)

  // --- section 3: development corridor ---
  row(110, 116, 9, 'B'); set(112, 9, '?'); set(114, 9, '?')
  row(118, 124, 5, 'B'); votes(118, 124, 4)
  foe('rahul', 115)
  protest(122, 3)
  foe('kejriwal', 127)
  foe('rahul', 131)
  set(136, 9, '?'); row(137, 139, 9, 'B'); set(140, 9, '?')
  protest(144)
  protest(145, 3)
  protest(146)
  votes(150, 155, 8)

  // --- section 4: final push ---
  foe('kejriwal', 158)
  foe('rahul', 162)
  foe('kejriwal', 166)
  row(164, 168, 9, 'B'); set(166, 9, '?')
  protest(172, 3)
  votes(176, 181, 9)
  foe('rahul', 185)
  foe('kejriwal', 188)
  set(190, 9, '?')
  stairs(196, 8, 1)
  spawns.push({ kind: 'flag', x: 212, y: GROUND - 1 })

  return { tiles, spawns, checkpoints: [2, 104, 157] }
}

export const PROJECTS = [
  'Metro line opened 🚇',
  'Highway inaugurated 🛣️',
  'Vande Bharat flagged off 🚄',
  'Solar park lit up ☀️',
  'Digital India rollout 📱',
  'New airport opened ✈️',
  'Clean water scheme 💧',
  'Bridge completed 🌉',
]
