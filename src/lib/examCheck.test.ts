import { describe, it, expect } from 'vitest'
import { checkWritingAnswer, checkSpeakingAnswer } from './examCheck'

describe('examCheck', () => {
  it('accepts exact writing match', () => {
    expect(checkWritingAnswer('Labdien! Es nevaru rīt nākt.', 'Labdien! Es nevaru rīt nākt.')).toBe(true)
  })

  it('accepts writing with enough keywords', () => {
    expect(
      checkWritingAnswer(
        'Labdien! Rīt es nevaru nākt uz nodarbību. Atvainojiet.',
        'model',
        ['rīt', 'nevaru', 'nodarb', 'atvainoj'],
      ),
    ).toBe(true)
  })

  it('rejects too short writing', () => {
    expect(checkWritingAnswer('Sveiki', 'Labdien! Es nevaru rīt nākt.')).toBe(false)
  })

  it('accepts fuzzy speaking match', () => {
    expect(checkSpeakingAnswer('labdien', 'Labdien')).toBe(true)
  })

  it('accepts speaking via keywords', () => {
    expect(checkSpeakingAnswer('mani sauc anna', 'Mani sauc Anna.', ['mani', 'sauc'])).toBe(true)
  })
})
