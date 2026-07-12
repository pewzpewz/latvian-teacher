import { describe, it, expect } from 'vitest'
import {
  detectLiveExamProgress,
  isLiveExamFinished,
  buildB1LiveExamProfile,
} from '../data/examB1Live'

describe('examB1Live', () => {
  it('detectLiveExamProgress finds task markers', () => {
    const text = 'Labdien! [Uzdevums 1/4] Pastāstiet par sevi. [Uzdevums 2/4] Tagad par dienu.'
    expect(detectLiveExamProgress(text)).toBe(2)
  })

  it('isLiveExamFinished detects completion marker', () => {
    expect(isLiveExamFinished('=== EKSĀMENS BEIDZTS === Kopumā labs.')).toBe(true)
    expect(isLiveExamFinished('Turpinām…')).toBe(false)
  })

  it('buildB1LiveExamProfile includes structure', () => {
    const p = buildB1LiveExamProfile('Anna')
    expect(p).toContain('VISC')
    expect(p).toContain('Anna')
    expect(p).toContain('[Uzdevums 1/4]')
  })
})
