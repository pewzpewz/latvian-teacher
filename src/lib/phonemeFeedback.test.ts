import { describe, it, expect } from 'vitest'
import { analyzePronunciation } from './phonemeFeedback'

describe('analyzePronunciation', () => {
  it('marks exact match as accepted', () => {
    const r = analyzePronunciation('Labdien', 'Labdien!')
    expect(r.accepted).toBe(true)
    expect(r.chars.every((c) => c.status === 'match' || c.status === 'diacritic')).toBe(true)
  })

  it('flags missing diacritics', () => {
    const r = analyzePronunciation('Riga', 'Rīga')
    expect(r.chars.some((c) => c.char === 'ī' && (c.status === 'diacritic' || c.status === 'wrong'))).toBe(
      true,
    )
    expect(r.tips.length).toBeGreaterThan(0)
  })

  it('rejects wrong word', () => {
    const r = analyzePronunciation('hello', 'Labdien')
    expect(r.accepted).toBe(false)
    expect(r.similarity).toBeLessThan(0.5)
  })
})
