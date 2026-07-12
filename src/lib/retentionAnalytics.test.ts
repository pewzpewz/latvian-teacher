import { describe, it, expect } from 'vitest'
import { addDays, computeRetentionMetrics, daysBetween } from './retentionAnalytics'
import type { UserProgress } from '../store/useStore'

function progress(overrides: Partial<UserProgress> = {}): UserProgress {
  return {
    completedLessons: [],
    exerciseScores: {},
    srsCards: {},
    streak: 0,
    lastStudyDate: null,
    totalStudyMinutes: 0,
    todayStudyMinutes: 0,
    todayStudyDate: null,
    wordsLearned: 0,
    estimatedLevel: 'A0',
    categoryStats: {},
    exerciseAttempts: [],
    pronunciationAttempts: { correct: 0, total: 0 },
    adaptiveWords: [],
    adaptiveExercises: [],
    lastAdaptationAt: null,
    unlockedAchievements: [],
    achievementTimestamps: {},
    gameStats: { totalPlays: 0, totalCorrect: 0, bestScores: {}, playsByGame: {} },
    dialogsCompleted: [],
    chatHistory: [],
    firstStudyDate: null,
    studyDayLog: {},
    ...overrides,
  }
}

describe('retentionAnalytics', () => {
  it('addDays shifts calendar dates', () => {
    expect(addDays('2026-07-01', 7)).toBe('2026-07-08')
  })

  it('daysBetween counts inclusive span', () => {
    expect(daysBetween('2026-07-01', '2026-07-08')).toBe(7)
  })

  it('returns no_data without firstStudyDate', () => {
    const m = computeRetentionMetrics(progress(), new Date('2026-07-12T12:00:00'))
    expect(m.d7Status).toBe('no_data')
  })

  it('pending before day 7', () => {
    const m = computeRetentionMetrics(
      progress({
        firstStudyDate: '2026-07-10',
        studyDayLog: { '2026-07-10': 5, '2026-07-11': 3 },
      }),
      new Date('2026-07-12T12:00:00'),
    )
    expect(m.d7Status).toBe('pending')
    expect(m.daysSinceStart).toBe(2)
  })

  it('retained when active on d7 date', () => {
    const first = '2026-07-01'
    const d7 = addDays(first, 7)
    const m = computeRetentionMetrics(
      progress({
        firstStudyDate: first,
        studyDayLog: { [first]: 10, [d7]: 5 },
      }),
      new Date(`${d7}T12:00:00`),
    )
    expect(m.d7Status).toBe('retained')
    expect(m.d7Active).toBe(true)
  })

  it('missed when no activity on d7', () => {
    const first = '2026-07-01'
    const d7 = addDays(first, 7)
    const m = computeRetentionMetrics(
      progress({
        firstStudyDate: first,
        studyDayLog: { [first]: 10, '2026-07-02': 5 },
      }),
      new Date(`${d7}T12:00:00`),
    )
    expect(m.d7Status).toBe('missed')
  })

  it('counts active days in first week', () => {
    const first = '2026-07-01'
    const m = computeRetentionMetrics(
      progress({
        firstStudyDate: first,
        studyDayLog: {
          '2026-07-01': 5,
          '2026-07-03': 5,
          '2026-07-05': 5,
        },
      }),
      new Date('2026-07-10T12:00:00'),
    )
    expect(m.activeDaysFirstWeek).toBe(3)
  })
})
