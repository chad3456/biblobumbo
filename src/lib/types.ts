export type HairStyle = 'bowl' | 'spiky' | 'long' | 'bun' | 'cap' | 'beanie' | 'crown' | 'bald'
export type FaceStyle = 'smile' | 'grin' | 'smirk' | 'shook' | 'wink' | 'sleepy'
export type Accessory = 'none' | 'book' | 'glasses' | 'headphones' | 'cape' | 'coffee'
export type TorsoPrint = 'plain' | 'stripe' | 'heart' | 'star' | 'book' | 'bolt'

export interface MinifigConfig {
  skin: string
  hair: HairStyle
  hairColor: string
  face: FaceStyle
  torso: string
  print: TorsoPrint
  legs: string
  accessory: Accessory
}

export interface UserStats {
  pagesRead: number
  minutesRead: number
  booksFinished: number
  booksAdded: number
  postsMade: number
  reactionsGiven: number
  commentsMade: number
}

export interface User {
  id: string
  username: string
  displayName: string
  bio: string
  passwordHash: string
  salt: string
  createdAt: number
  avatar: MinifigConfig
  xp: number
  studs: number
  streak: { count: number; lastDay: string | null }
  badges: string[]
  unlocked: string[]
  stats: UserStats
  questDay: string | null
  questProgress: Record<string, number>
  questsClaimed: string[]
  isBot?: boolean
}

export type BookStatus = 'tbr' | 'reading' | 'finished'

export interface Book {
  id: string
  ownerId: string
  title: string
  author: string
  totalPages: number
  currentPage: number
  status: BookStatus
  color: string
  coverUrl?: string
  rating?: number
  addedAt: number
  finishedAt?: number
  /** id of a bundled public-domain text, or "upload" for a user-provided .txt */
  textSource?: string
}

export interface Comment {
  id: string
  authorId: string
  text: string
  createdAt: number
}

export interface Post {
  id: string
  authorId: string
  bookTitle: string
  bookAuthor: string
  text: string
  vibe: string
  rating: number
  createdAt: number
  reactions: Record<string, string[]>
  comments: Comment[]
}
