import { describe, it, expect } from 'vitest'
import { needsMessageTranslation } from './chatText'

describe('needsMessageTranslation', () => {
  it('returns true for Latvian messages', () => {
    expect(needsMessageTranslation('Čau bračka! Kā iet?')).toBe(true)
  })

  it('returns false for mostly Russian text', () => {
    expect(needsMessageTranslation('Это объяснение грамматики на русском языке.')).toBe(false)
  })
})
