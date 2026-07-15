import { describe, it, expect } from 'vitest'
import { buildCefrTrackProgress, overallCefrLevel, CEFR_TRACKS } from './cefrProgress'
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

describe('cefrProgress', () => {
  it('buildCefrTrackProgress returns milestones with progress 0..1', () => {
    const track = CEFR_TRACKS[0]
    const milestones = buildCefrTrackProgress(base, track)
    expect(milestones).toHaveLength(track.milestones.length)
    for (const m of milestones) {
      expect(m.progress).toBeGreaterThanOrEqual(0)
      expect(m.progress).toBeLessThanOrEqual(1)
      expect(typeof m.done).toBe('boolean')
    }
  })

  it('dictation milestone progresses when dict exercises completed', () => {
    const track = CEFR_TRACKS.find((t) => t.level === 'A1')!
    const p: UserProgress = {
      ...base,
      exerciseScores: { 'dict-d1': true, 'dict-d2': true },
    }
    const milestones = buildCefrTrackProgress(p, track)
    const dict = milestones.find((m) => m.id === 'a1-dict')
    expect(dict?.progress).toBe(1)
    expect(dict?.done).toBe(true)
  })

  it('overallCefrLevel falls back to estimatedLevel for new user', () => {
    expect(overallCefrLevel(base)).toBe('A0')
  })
})
