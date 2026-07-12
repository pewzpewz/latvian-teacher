import { describe, it, expect } from 'vitest'
import { naturalizationSections } from '../data/naturalization'
import { getSectionProgress, getNaturalizationStats } from './naturalizationStats'
import type { UserProgress } from '../store/useStore'

const emptyProgress = {
  exerciseScores: {},
} as UserProgress

describe('naturalizationStats', () => {
  it('counts section progress from nat- prefixed scores', () => {
    const section = naturalizationSections[0]
    const q0 = section.questions[0]
    const progress = {
      exerciseScores: {
        [`nat-${q0.id}`]: true,
      },
    } as unknown as UserProgress

    const { answered, correct } = getSectionProgress(progress, section)
    expect(answered).toBe(1)
    expect(correct).toBe(1)
  })

  it('aggregates stats across sections', () => {
    const stats = getNaturalizationStats(emptyProgress)
    expect(stats.totalQuestions).toBeGreaterThan(20)
    expect(stats.sectionsCompleted).toBe(0)
  })
})
