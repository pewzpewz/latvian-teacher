import { describe, it, expect } from 'vitest'
import {
  createNewStoredCard,
  gradeStoredCard,
  isCardDue,
  migrateLegacyCard,
  qualityToRating,
} from './fsrsSrs'
import { Rating } from 'ts-fsrs'

describe('fsrsSrs', () => {
  it('maps quality to FSRS ratings', () => {
    expect(qualityToRating(1)).toBe(Rating.Again)
    expect(qualityToRating(3)).toBe(Rating.Good)
    expect(qualityToRating(5)).toBe(Rating.Easy)
  })

  it('creates due new card', () => {
    const card = createNewStoredCard('v1')
    expect(card.wordId).toBe('v1')
    expect(isCardDue(card)).toBe(true)
  })

  it('schedules review after good grade', () => {
    const card = createNewStoredCard('v1')
    const graded = gradeStoredCard(card, 5)
    expect(graded.reps).toBeGreaterThan(0)
    expect(graded.due).toBeGreaterThan(Date.now() - 1000)
  })

  it('migrates legacy SM-2 card', () => {
    const legacy = migrateLegacyCard({
      wordId: 'v2',
      ease: 2.5,
      interval: 3,
      repetitions: 2,
      nextReview: Date.now() + 86400000,
      lastReview: Date.now(),
    })
    expect(legacy.stability).toBeGreaterThan(0)
    expect(legacy.reps).toBe(2)
  })
})
