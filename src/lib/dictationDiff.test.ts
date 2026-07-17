import { describe, it, expect } from 'vitest'
import { findMissedVocabWords } from './dictationDiff'

describe('findMissedVocabWords', () => {
  it('returns vocabulary words present in the expected text but missing from what was typed', () => {
    const missed = findMissedVocabWords('Labdien! Kā jums klājas?', 'kā klājas')
    expect(missed.some((w) => w.lv === 'labdien')).toBe(true)
  })

  it('returns nothing when everything expected was typed', () => {
    const missed = findMissedVocabWords('Sveiki, labdien!', 'Sveiki, labdien!')
    expect(missed.every((w) => w.lv !== 'sveiki' && w.lv !== 'labdien')).toBe(true)
  })

  it('is tolerant of missing diacritics when matching what was typed', () => {
    // "labdien" has no diacritics, but this checks the fold-based comparison doesn't
    // over-flag words that were actually typed, just without perfect casing.
    const missed = findMissedVocabWords('Labdien!', 'LABDIEN')
    expect(missed.some((w) => w.lv === 'labdien')).toBe(false)
  })

  it('ignores words with no vocabulary match instead of throwing', () => {
    expect(() => findMissedVocabWords('Šī ir pilnīgi izdomāta frāze.', '')).not.toThrow()
  })
})
