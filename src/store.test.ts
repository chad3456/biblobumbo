import { beforeEach, describe, expect, it } from 'vitest'
import { useStore } from './store'

const me = () => {
  const s = useStore.getState()
  return s.users[s.sessionUserId!]
}

beforeEach(() => {
  localStorage.clear()
  useStore.setState({ users: {}, books: {}, posts: [], sessionUserId: null, toasts: [] })
  useStore.getState().ensureSeed()
})

describe('auth', () => {
  it('signs up, logs out and logs back in with a hashed password', async () => {
    const { signup, logout, login } = useStore.getState()
    expect(await signup('Page.Turner', 'secret1')).toBeNull()
    const u = me()
    expect(u.username).toBe('page.turner')
    expect(u.passwordHash).not.toContain('secret1')
    logout()
    expect(await login('page.turner', 'nope!!')).toMatch(/wrong password/)
    expect(await login('PAGE.TURNER', 'secret1')).toBeNull()
    expect(useStore.getState().sessionUserId).toBe(u.id)
  })

  it('rejects duplicate usernames and NPC logins', async () => {
    await useStore.getState().signup('reader1', 'secret1')
    expect(await useStore.getState().signup('reader1', 'secret2')).toMatch(/taken/)
    expect(await useStore.getState().login('romantasy.queen', '')).toMatch(/no account/)
  })
})

describe('reading rewards', () => {
  it('awards XP for forward progress only and finishes the book', async () => {
    await useStore.getState().signup('reader2', 'secret1')
    const { addBook, setProgress } = useStore.getState()
    const id = addBook({ title: 'Test Book', author: 'A', totalPages: 50 })
    const xp0 = me().xp
    setProgress(id, 20)
    expect(me().stats.pagesRead).toBe(20)
    expect(me().xp).toBe(xp0 + 40)
    setProgress(id, 10) // going backwards earns nothing
    expect(me().stats.pagesRead).toBe(20)
    setProgress(id, 50)
    const book = useStore.getState().books[id]
    expect(book.status).toBe('finished')
    expect(me().stats.booksFinished).toBe(1)
    expect(me().badges).toContain('finisher')
    expect(me().streak.count).toBe(1)
  })

  it('lets you claim a completed daily quest exactly once', async () => {
    await useStore.getState().signup('reader3', 'secret1')
    const id = useStore.getState().addBook({ title: 'Q', author: 'A', totalPages: 100 })
    useStore.getState().setProgress(id, 25)
    const studs = me().studs
    useStore.getState().claimQuest('q-pages')
    useStore.getState().claimQuest('q-pages')
    expect(me().questsClaimed).toEqual(['q-pages'])
    // 15 quest studs + 25 level-up bonus (60 XP + 40 quest XP crosses level 2)
    expect(me().xp).toBe(100)
    expect(me().studs).toBe(studs + 15 + 25)
  })
})

describe('shop', () => {
  it('spends studs and blocks level-gated items', async () => {
    await useStore.getState().signup('reader4', 'secret1')
    expect(useStore.getState().buyItem('acc-coffee')).toBeNull()
    expect(me().unlocked).toContain('acc-coffee')
    expect(me().studs).toBe(20)
    expect(useStore.getState().buyItem('hair-crown')).toMatch(/level/)
  })
})

describe('hangout', () => {
  it('posts, reacts (toggle) and comments', async () => {
    await useStore.getState().signup('reader5', 'secret1')
    const { createPost, toggleReaction, addComment } = useStore.getState()
    createPost({ bookTitle: 'Dune', bookAuthor: 'Herbert', text: 'spice must flow', vibe: 'it’s giving ✨', rating: 5 })
    const post = useStore.getState().posts[0]
    expect(post.authorId).toBe(me().id)
    toggleReaction('seed-1', '🔥')
    expect(useStore.getState().posts.find((p) => p.id === 'seed-1')!.reactions['🔥']).toContain(me().id)
    toggleReaction('seed-1', '🔥')
    expect(useStore.getState().posts.find((p) => p.id === 'seed-1')!.reactions['🔥']).not.toContain(me().id)
    addComment(post.id, 'real')
    expect(useStore.getState().posts[0].comments).toHaveLength(1)
    expect(me().stats.postsMade).toBe(1)
  })
})
