import { describe, it, expect } from 'vitest'
import { decayedPKnow, skillUrgency, updateSkillState } from './knowledgeTracing'

describe('knowledgeTracing', () => {
  it('starts from prior when no history', () => {
    const s = updateSkillState(undefined, 'phoneme-sh', true)
    expect(s.reps).toBe(1)
    expect(s.pKnow).toBeGreaterThan(0.3)
  })

  it('increases pKnow on repeated success', () => {
    let s = updateSkillState(undefined, 'x', true, 1000)
    s = updateSkillState(s, 'x', true, 2000)
    expect(s.pKnow).toBeGreaterThan(0.5)
  })

  it('decreases pKnow on errors', () => {
    let s = updateSkillState(undefined, 'x', true, 1000)
    s = updateSkillState(s, 'x', false, 2000)
    expect(s.pKnow).toBeLessThan(0.6)
  })

  it('decays confidence over time', () => {
    const s = updateSkillState(undefined, 'x', true, 0)
    const later = decayedPKnow(s, 86_400_000 * 30)
    expect(later).toBeLessThan(s.pKnow)
  })

  it('urgency rises when confidence drops', () => {
    const high = skillUrgency(0.8, 8)
    const low = skillUrgency(0.2, 8)
    expect(low).toBeGreaterThan(high)
  })
})
