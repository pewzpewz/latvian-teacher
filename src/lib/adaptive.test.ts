import { describe, it, expect } from 'vitest'
import { estimateLevel, analyzeLearning } from './adaptive'
import type { UserProgress } from '../store/useStore'

const base: UserProgress = {
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
  skillStats: {},
  phonemeStats: {},
  exerciseAttempts: [],
  pronunciationAttempts: { correct: 0, total: 0 },
  adaptiveWords: [],
  adaptiveExercises: [],
  lastAdaptationAt: null,
  unlockedAchievements: [],
  achievementTimestamps: {},
  gameStats: {
    totalPlays: 0,
    totalCorrect: 0,
    bestScores: {},
    playsByGame: {},
  },
  dialogsCompleted: [],
  chatHistory: [],
  firstStudyDate: null,
  studyDayLog: {},
}

describe('adaptive', () => {
  it('estimateLevel returns A0 for new user', () => {
    expect(estimateLevel(base)).toBe('A0')
  })

  it('estimateLevel returns A1 with progress', () => {
    const p: UserProgress = {
      ...base,
      completedLessons: ['alphabet-1', 'greetings-1', 'grammar-nouns-1', 'grammar-verbs-1'],
      exerciseScores: { a1: true, g1: true, n1: false, v1: true },
    }
    expect(estimateLevel(p)).toBe('A1')
  })

  it('analyzeLearning returns actions and level', () => {
    const analysis = analyzeLearning(base)
    expect(analysis.estimatedLevel).toBe('A0')
    expect(analysis.actions.length).toBeGreaterThan(0)
    expect(typeof analysis.masteryPercent).toBe('number')
  })
})
