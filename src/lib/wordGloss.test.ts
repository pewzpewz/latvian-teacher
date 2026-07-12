import { describe, it, expect } from 'vitest'
import { lookupLocalGloss } from './wordGloss'

describe('wordGloss', () => {
  it('lookupLocalGloss finds vocabulary word', () => {
    expect(lookupLocalGloss('sveiki')).toBe('привет')
  })

  it('lookupLocalGloss stems inflected forms', () => {
    const gloss = lookupLocalGloss('teikumus')
    expect(gloss).toBeTruthy()
  })

  it('lookupLocalGloss uses sentence context for būs', () => {
    const gloss = lookupLocalGloss('būs', 'Rīt būs saulains laiks.')
    expect(gloss).toBeTruthy()
  })
})
