export type Gender = 'female' | 'male'
export type Pattern = 'mirror' | 'bandhani' | 'leheriya' | 'plain'
export type FemaleHair = 'braid' | 'bun' | 'open'
export type MaleHead = 'pagdi' | 'safa' | 'topi' | 'none'
export type Face = 'smile' | 'joy' | 'wink' | 'calm'

export interface FigurineConfig {
  gender: Gender
  skin: string
  hairColor: string
  face: Face
  /** chaniya (skirt) for women, kediyu (frilled jacket) for men */
  main: string
  /** border / embroidery colour */
  accent: string
  /** choli for women, chorno (trousers) for men */
  second: string
  /** odhni (dupatta) for women, pagdi/safa for men */
  drape: string
  pattern: Pattern
  femaleHair: FemaleHair
  maleHead: MaleHead
  jewellery: boolean
  dandiyaColor: string
}

export interface Figurine {
  id: string
  name: string
  config: FigurineConfig
  mine: boolean
  createdAt: number
}

export type StepId = 'be-taali' | 'tran-taali' | 'dodhiyu' | 'hinch' | 'popatiyu' | 'dandiya'

export interface Pose {
  armL: { x: number; z: number }
  armR: { x: number; z: number }
  legL: number
  legR: number
  /** vertical bounce */
  bob: number
  /** extra rotation of the whole body around Y */
  turn: number
  /** forward lean */
  lean: number
  /** true at the instant hands meet */
  clap: boolean
  /** dandiya sticks visible */
  sticks: boolean
  /** how far the skirt flares (0..1) */
  flare: number
}

export type ActionId = 'namaste' | 'wave' | 'spin' | 'jai' | 'clap' | 'fudadi'

export interface ActiveAction {
  id: ActionId
  until: number
  partnerId?: string
  text?: string
}
