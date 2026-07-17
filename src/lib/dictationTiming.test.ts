import { describe, it, expect } from 'vitest'
import { dictationTimeLimitSec, DICTATION_MAX_REPLAYS } from './dictationTiming'

describe('dictationTimeLimitSec', () => {
  it('gives more time per word at lower levels', () => {
    const a0 = dictationTimeLimitSec({ level: 'A0', text: 'Viens, divi, trīs.' })
    const b1 = dictationTimeLimitSec({ level: 'B1', text: 'Viens, divi, trīs.' })
    expect(a0).toBeGreaterThan(b1)
  })

  it('scales with sentence length', () => {
    const short = dictationTimeLimitSec({ level: 'A1', text: 'Sveiki!' })
    const long = dictationTimeLimitSec({
      level: 'A1',
      text: 'Nākamnedēļ mēs braucam uz Jūrmalu un pavadīsim tur visu dienu kopā ar draugiem.',
    })
    expect(long).toBeGreaterThan(short)
  })

  it('always returns a positive, finite number of seconds', () => {
    const t = dictationTimeLimitSec({ level: 'A2', text: 'Labdien!' })
    expect(t).toBeGreaterThan(0)
    expect(Number.isFinite(t)).toBe(true)
  })

  it('exposes a small, sane replay cap', () => {
    expect(DICTATION_MAX_REPLAYS).toBeGreaterThan(0)
    expect(DICTATION_MAX_REPLAYS).toBeLessThanOrEqual(3)
  })
})
