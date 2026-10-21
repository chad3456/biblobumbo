import { beforeEach, describe, expect, it } from 'vitest'
import { useDiwali } from '../diwaliStore'
import { BASE_LIT, DIYAS_PER_LIGHT, GHAT, MAX_TEXT, SEED_DIYAS, decodeDiya, decorativeSlots, deepotsavGoal, encodeDiya, ghatLitCount, messageSlot } from './diwali'

const sample = { name: 'Riya', kind: 'promise' as const, text: 'હું દરરોજ દાદીને ફોન કરીશ 🪔 — मैं वादा करती हूँ', color: '#ffc400', createdAt: 1760000000000 }

describe('share links', () => {
  it('round-trips unicode (Gujarati, Hindi, emoji) through a URL-safe code', () => {
    const code = encodeDiya(sample)
    expect(code).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(decodeDiya(code)).toEqual({ ...sample, received: true })
  })

  it('rejects tampered or malicious payloads', () => {
    expect(decodeDiya('not-base64!!')).toBeNull()
    const enc = (o: object) => btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    expect(decodeDiya(enc({ n: 'x', k: 'hack', t: 'hi', c: '#ffffff' }))).toBeNull()
    expect(decodeDiya(enc({ n: 'x', k: 'wish', t: 'hi', c: 'red;background:url(x)' }))).toBeNull()
    expect(decodeDiya(enc({ n: '', k: 'wish', t: 'hi', c: '#ffffff' }))).toBeNull()
    expect(decodeDiya('a'.repeat(3000))).toBeNull()
  })

  it('trims overlong text', () => {
    const d = decodeDiya(encodeDiya({ ...sample, text: 'x'.repeat(400) }))
    expect(d?.text.length).toBe(MAX_TEXT)
  })
})

describe('ghat layout', () => {
  it('lights more of the riverfront with every diya, capped at the whole ghat', () => {
    expect(ghatLitCount(0)).toBe(BASE_LIT)
    expect(ghatLitCount(4)).toBe(BASE_LIT + 4 * DIYAS_PER_LIGHT)
    expect(ghatLitCount(10_000)).toBe(deepotsavGoal())
    expect(deepotsavGoal()).toBeGreaterThan(1500)
  })

  it('places message diyas on distinct spots on the steps', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 300; i++) {
      const [x, y, z] = messageSlot(i)
      const key = `${x.toFixed(2)},${y.toFixed(2)},${z.toFixed(2)}`
      expect(seen.has(key)).toBe(false)
      seen.add(key)
      expect(Math.abs(x)).toBeLessThan(GHAT.width / 2)
    }
  })

  it('decorative diyas start lighting from the centre of the lowest step', () => {
    const [first] = decorativeSlots()
    expect(Math.abs(first[0])).toBeLessThan(0.7)
    expect(first[1]).toBeCloseTo(GHAT.rise)
  })
})

describe('diwali store', () => {
  beforeEach(() => useDiwali.setState({ diyas: SEED_DIYAS, myReactions: [], selectedId: null, lastName: '' }))

  it('lights a diya, remembers your name and selects it', () => {
    const id = useDiwali.getState().lightDiya({ name: ' Arjun ', kind: 'wish', text: ' Happy Diwali ', color: '#e53935' })
    const s = useDiwali.getState()
    expect(s.diyas.at(-1)).toMatchObject({ id, name: 'Arjun', text: 'Happy Diwali', mine: true })
    expect(s.lastName).toBe('Arjun')
    expect(s.selectedId).toBe(id)
    expect(useDiwali.getState().lightDiya({ name: 'A', kind: 'wish', text: '   ', color: '#e53935' })).toBeNull()
  })

  it('toggles a reaction', () => {
    const { react } = useDiwali.getState()
    react('s1', '🙏')
    expect(useDiwali.getState().diyas.find((d) => d.id === 's1')!.reactions['🙏']).toBe(42)
    react('s1', '🙏')
    expect(useDiwali.getState().diyas.find((d) => d.id === 's1')!.reactions['🙏']).toBe(41)
  })

  it('opening the same shared link twice keeps one diya', () => {
    const incoming = decodeDiya(encodeDiya(sample))!
    const a = useDiwali.getState().receive(incoming)
    const b = useDiwali.getState().receive(incoming)
    expect(a).toBe(b)
    expect(useDiwali.getState().diyas.filter((d) => d.received)).toHaveLength(1)
  })

  it('only lets you remove your own or shared diyas', () => {
    useDiwali.getState().remove('s1')
    expect(useDiwali.getState().diyas.some((d) => d.id === 's1')).toBe(true)
  })
})
