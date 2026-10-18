import { beforeEach, describe, expect, it } from 'vitest'
import { defaultConfig } from './lib/presets'
import { MAX_MINE, circleOrder, useStore } from './store'

beforeEach(() => {
  localStorage.clear()
  useStore.setState({ mine: [], order: [], actions: {}, bubbles: {}, selectedId: null })
})

describe('figurines', () => {
  it('creates, renames and deletes figurines', () => {
    const { saveFigurine } = useStore.getState()
    const id = saveFigurine({ name: '  Hetal  ', config: defaultConfig('female') })
    expect(useStore.getState().mine[0]).toMatchObject({ id, name: 'Hetal', mine: true })
    saveFigurine({ id, name: 'Hetu', config: defaultConfig('male') })
    expect(useStore.getState().mine).toHaveLength(1)
    expect(useStore.getState().mine[0].config.gender).toBe('male')
    useStore.getState().deleteFigurine(id)
    expect(useStore.getState().mine).toHaveLength(0)
  })

  it('gives unnamed figurines a default name and caps the collection', () => {
    for (let i = 0; i < MAX_MINE + 2; i++) useStore.getState().saveFigurine({ name: '', config: defaultConfig('male') })
    expect(useStore.getState().mine).toHaveLength(MAX_MINE)
    expect(useStore.getState().mine[0].name).toBe('Rangilo')
  })
})

describe('interactions', () => {
  it('pairing for fudadi moves the partner next to you and both get the action', () => {
    useStore.setState({ order: ['a', 'b', 'c', 'd'] })
    useStore.getState().act('a', 'fudadi', 'd')
    const s = useStore.getState()
    expect(s.order).toEqual(['a', 'd', 'b', 'c'])
    expect(s.actions.a.id).toBe('fudadi')
    expect(s.actions.d.partnerId).toBe('a')
    expect(s.bubbles.a.text).toMatch(/fudadi/i)
  })

  it('jai mata di shows a speech bubble', () => {
    useStore.getState().act('x', 'jai')
    expect(useStore.getState().bubbles.x.text).toBe('Jai Mata Di! 🙏')
  })
})

describe('circleOrder', () => {
  it('keeps saved positions, appends newcomers and drops leavers', () => {
    expect(circleOrder(['b', 'a', 'gone'], ['a', 'b', 'c'])).toEqual(['b', 'a', 'c'])
  })
})
