import { describe, it, expect } from 'vitest'
import {
  foldDiacritics,
  levenshtein,
  matchPronunciation,
  normalizeForSpeech,
  pronunciationSimilarity,
} from './pronunciationMatch'

describe('normalizeForSpeech', () => {
  it('folds diacritics', () => {
    expect(normalizeForSpeech('Labdien!')).toBe('labdien')
    expect(normalizeForSpeech('četri')).toBe('cetri')
  })

  it('strips punctuation', () => {
    expect(normalizeForSpeech('Paldies!!!')).toBe('paldies')
  })
})

describe('matchPronunciation', () => {
  it('accepts exact match', () => {
    expect(matchPronunciation('Labdien', 'Labdien!')).toBe(true)
  })

  it('accepts missing diacritics from STT', () => {
    expect(matchPronunciation('Es esmu students', 'Es esmu students.')).toBe(true)
    expect(matchPronunciation('labdien', 'Labdien!')).toBe(true)
  })

  it('accepts small typos', () => {
    const sim = pronunciationSimilarity('paldies', 'paldijs')
    expect(sim).toBeGreaterThanOrEqual(0.85)
    expect(matchPronunciation('paldies', 'paldijs')).toBe(true)
  })

  it('rejects completely wrong phrase', () => {
    expect(matchPronunciation('hello world', 'Labdien!')).toBe(false)
  })
})

describe('levenshtein', () => {
  it('returns 0 for equal strings', () => {
    expect(levenshtein('abc', 'abc')).toBe(0)
  })

  it('counts edits', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3)
  })
})

describe('foldDiacritics', () => {
  it('maps Latvian chars', () => {
    expect(foldDiacritics('ģ')).toBe('g')
    expect(foldDiacritics('Rīga')).toBe('Riga')
  })
})
