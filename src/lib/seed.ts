import type { MinifigConfig, Post, User } from './types'

const now = Date.now()
const H = 3_600_000

function bot(id: string, displayName: string, bio: string, xp: number, avatar: MinifigConfig, pagesRead: number, booksFinished: number, streak: number): User {
  return {
    id,
    username: id.replace('bot-', ''),
    displayName,
    bio,
    passwordHash: '',
    salt: '',
    createdAt: now - 30 * 24 * H,
    avatar,
    xp,
    studs: 0,
    streak: { count: streak, lastDay: null },
    badges: [],
    unlocked: [],
    stats: { pagesRead, minutesRead: 0, booksFinished, booksAdded: booksFinished, postsMade: 2, reactionsGiven: 0, commentsMade: 0 },
    questDay: null,
    questProgress: {},
    questsClaimed: [],
    isBot: true,
  }
}

export const SEED_USERS: User[] = [
  bot('bot-romantasy.queen', 'Romantasy Queen 👑', 'if there’s no dragon i’m not reading it', 2400,
    { skin: '#f6d7b0', hair: 'long', hairColor: '#7b2cbf', face: 'smirk', torso: '#ff5fa2', print: 'heart', legs: '#1b1b1b', accessory: 'cape' }, 6120, 31, 12),
  bot('bot-dark.academia', 'dark academia dan', 'tweed jacket. greek tragedy. espresso. repeat.', 1580,
    { skin: '#c68642', hair: 'bun', hairColor: '#1b1b1b', face: 'sleepy', torso: '#6d4c41', print: 'book', legs: '#1b1b1b', accessory: 'glasses' }, 4300, 19, 5),
  bot('bot-scifi.goblin', 'sci-fi goblin', 'space operas & existential dread enjoyer', 980,
    { skin: '#ffd500', hair: 'spiky', hairColor: '#00b4d8', face: 'grin', torso: '#0055bf', print: 'bolt', legs: '#9aa5b1', accessory: 'headphones' }, 2890, 11, 3),
  bot('bot-cozy.mystery', 'cozy mystery cat', 'murder but make it cottagecore 🧶', 610,
    { skin: '#8d5524', hair: 'beanie', hairColor: '#e3000b', face: 'smile', torso: '#00a650', print: 'stripe', legs: '#0055bf', accessory: 'coffee' }, 1750, 8, 2),
]

function post(id: string, authorId: string, bookTitle: string, bookAuthor: string, text: string, vibe: string, rating: number, hoursAgo: number, reactions: Record<string, string[]>): Post {
  return { id, authorId, bookTitle, bookAuthor, text, vibe, rating, createdAt: now - hoursAgo * H, reactions, comments: [] }
}

export const SEED_POSTS: Post[] = [
  post('seed-1', 'bot-romantasy.queen', 'Pride and Prejudice', 'Jane Austen',
    'mr darcy said “you have bewitched me body and soul” and i had to put the book down and walk a lap around my room 😭',
    'slow burn supremacy', 5, 2, { '😭': ['bot-cozy.mystery'], '🫶': ['bot-dark.academia', 'bot-scifi.goblin'] }),
  post('seed-2', 'bot-dark.academia', 'The Raven', 'Edgar Allan Poe',
    'poe really wrote a bird that only says one word and made it the most unsettling thing in literature. the rhythm is insane read it out loud',
    'it’s giving ✨', 5, 6, { '🔥': ['bot-romantasy.queen'], '💀': ['bot-scifi.goblin'] }),
  post('seed-3', 'bot-scifi.goblin', 'Frankenstein', 'Mary Shelley',
    'reminder that a 19 year old invented science fiction on a rainy vacation. what did you do on your last vacation',
    'emotional damage 💀', 4, 20, { '💀': ['bot-dark.academia', 'bot-romantasy.queen', 'bot-cozy.mystery'] }),
  post('seed-4', 'bot-cozy.mystery', 'Alice in Wonderland', 'Lewis Carroll',
    'rereading as an adult and the caterpillar asking “who are YOU” is lowkey the hardest-hitting question in the book',
    'unhinged (affectionate)', 4, 30, { '🧱': ['bot-scifi.goblin'] }),
]
