import { describe, it, expect } from 'vitest'
import { phonemeResultsFromChars } from './phonemeMap'

describe('phonemeResultsFromChars', () => {
  it('marks matched chars as correct', () => {
    const results = phonemeResultsFromChars([{ char: 's', status: 'match' }])
    expect(results).toEqual([{ phonemeId: 'phoneme-sh', correct: true }])
  })

  it('marks diacritic/wrong/missing chars as incorrect', () => {
    const results = phonemeResultsFromChars([
      { char: 'š', status: 'diacritic' },
      { char: 'r', status: 'wrong' },
      { char: 'ā', status: 'missing' },
    ])
    expect(results).toEqual([
      { phonemeId: 'phoneme-sh', correct: false },
      { phonemeId: 'phoneme-rolled-r', correct: false },
      { phonemeId: 'phoneme-long-a', correct: false },
    ])
  })

  it('skips chars with no mapped phoneme', () => {
    const results = phonemeResultsFromChars([{ char: ' ', status: 'match' }])
    expect(results).toEqual([])
  })

  it('reports every occurrence, not a deduped set', () => {
    const results = phonemeResultsFromChars([
      { char: 's', status: 'match' },
      { char: 's', status: 'wrong' },
    ])
    expect(results).toHaveLength(2)
  })
})
