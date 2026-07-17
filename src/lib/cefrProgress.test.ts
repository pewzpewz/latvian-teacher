import { describe, it, expect } from 'vitest'
import { buildCefrTrackProgress, overallCefrLevel, CEFR_TRACKS } from './cefrProgress'
import type { UserProgress } from '../store/useStore'
import { createNewStoredCard, gradeStoredCard } from './fsrsSrs'

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

  it('dictation milestone requires 4 completed A1 dictations, not 2', () => {
    const track = CEFR_TRACKS.find((t) => t.level === 'A1')!
    const partial: UserProgress = {
      ...base,
      exerciseScores: { 'dict-d1': true, 'dict-d2': true },
    }
    const partialMilestones = buildCefrTrackProgress(partial, track)
    const partialDict = partialMilestones.find((m) => m.id === 'a1-dict')
    expect(partialDict?.progress).toBe(0.5)
    expect(partialDict?.done).toBe(false)

    const full: UserProgress = {
      ...base,
      exerciseScores: {
        'dict-d1': true,
        'dict-d2': true,
        'dict-d17': true,
        'dict-d18': true,
      },
    }
    const fullMilestones = buildCefrTrackProgress(full, track)
    const fullDict = fullMilestones.find((m) => m.id === 'a1-dict')
    expect(fullDict?.progress).toBe(1)
    expect(fullDict?.done).toBe(true)
  })

  it('overallCefrLevel falls back to estimatedLevel for new user', () => {
    expect(overallCefrLevel(base)).toBe('A0')
  })

  it('overallCefrLevel uses the weakest milestone, not the average — one lagging category blocks level-up', () => {
    // Lessons + declensions maxed out, but dictations and vocab untouched.
    // A naive average could still clear 0.75; the weakest milestone must not.
    const p: UserProgress = {
      ...base,
      completedLessons: ['alphabet-1', 'greetings-1', 'city-1', 'family-1', 'food-2', 'home-1', 'shopping-1', 'sport-1', 'work-1'],
      exerciseScores: Object.fromEntries(
        Array.from({ length: 10 }, (_, i) => [`decl-${i}`, true]),
      ),
    }
    expect(overallCefrLevel(p)).toBe('A0')
  })

  it('vocab milestone counts real mastery (State.Review), not just "was shown once"', () => {
    const track = CEFR_TRACKS.find((t) => t.level === 'A1')!

    // Shown once but rated "Again" — stays in learning, never graduates.
    const shownOnly = gradeStoredCard(createNewStoredCard('v1'), 1)
    const shownOnlyProgress: UserProgress = {
      ...base,
      srsCards: { v1: shownOnly },
    }
    const shownMilestones = buildCefrTrackProgress(shownOnlyProgress, track)
    expect(shownMilestones.find((m) => m.id === 'a1-vocab')?.progress).toBe(0)

    // Graduated with a couple of "Good" ratings — genuinely recalled correctly.
    let graduated = createNewStoredCard('v1')
    graduated = gradeStoredCard(graduated, 4)
    graduated = gradeStoredCard(graduated, 4)
    const graduatedProgress: UserProgress = {
      ...base,
      srsCards: { v1: graduated },
    }
    const graduatedMilestones = buildCefrTrackProgress(graduatedProgress, track)
    expect(graduatedMilestones.find((m) => m.id === 'a1-vocab')?.progress).toBeGreaterThan(0)
  })
})
