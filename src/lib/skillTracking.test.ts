import { describe, it, expect } from 'vitest'
import { recordPhonemeChars } from './skillTracking'

describe('recordPhonemeChars', () => {
  it('returns stats unchanged when there are no chars', () => {
    const stats = {}
    expect(recordPhonemeChars(stats, undefined)).toBe(stats)
    expect(recordPhonemeChars(stats, [])).toBe(stats)
  })

  it('records errors even when the overall attempt was accepted', () => {
    const next = recordPhonemeChars({}, [{ char: 'ā', status: 'diacritic' }], 1000)
    expect(next['phoneme-long-a']).toBeDefined()
    expect(next['phoneme-long-a'].reps).toBe(1)
    expect(next['phoneme-long-a'].pKnow).toBeLessThan(0.3)
  })

  it('gives positive reinforcement on a correctly pronounced sound', () => {
    let stats = recordPhonemeChars({}, [{ char: 'š', status: 'wrong' }], 1000)
    const afterFail = stats['phoneme-sh'].pKnow

    stats = recordPhonemeChars(stats, [{ char: 'š', status: 'match' }], 2000)
    expect(stats['phoneme-sh'].pKnow).toBeGreaterThan(afterFail)
  })
})
