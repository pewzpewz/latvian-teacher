import { describe, it, expect } from 'vitest'
import { compareLatvian } from '../hooks/useSpeech'

describe('compareLatvian', () => {
  it('matches identical strings', () => {
    expect(compareLatvian('ūdens', 'ūdens')).toBe(true)
  })

  it('ignores case and punctuation', () => {
    expect(compareLatvian('Labdien!', 'labdien')).toBe(true)
  })

  it('normalizes whitespace', () => {
    expect(compareLatvian('  es   esmu  ', 'es esmu')).toBe(true)
  })

  it('rejects different answers', () => {
    expect(compareLatvian('jā', 'nē')).toBe(false)
  })
})
