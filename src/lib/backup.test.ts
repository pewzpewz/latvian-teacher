import { describe, it, expect } from 'vitest'
import { exportBackup, mergeProgress, parseBackupFile } from './backup'
import type { UserProgress, UserSettings } from '../store/useStore'

const baseProgress: UserProgress = {
  completedLessons: ['alphabet-1'],
  exerciseScores: { a1: true },
  srsCards: {},
  streak: 2,
  lastStudyDate: '2026-07-12',
  totalStudyMinutes: 10,
  todayStudyMinutes: 5,
  todayStudyDate: '2026-07-12',
  wordsLearned: 3,
  estimatedLevel: 'A0',
  categoryStats: { grammar: { correct: 1, total: 2 } },
  skillStats: {},
  phonemeStats: {},
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
  firstStudyDate: '2026-07-01',
  studyDayLog: { '2026-07-01': 10 },
}

const baseSettings: UserSettings = {
  dailyGoal: 15,
  nativeLanguage: 'ru',
  showTransliteration: true,
  speechRate: 0.85,
  aiProvider: 'gemini',
  aiModel: 'gemini-3-flash-preview',
  aiApiKey: '',
  userName: 'Test',
  adaptiveEnabled: true,
  ttsEngine: 'neural',
  ttsVoice: 'lv-LV-EveritaNeural',
  onboardingCompleted: true,
  learningGoal: 'exam',
  selfReportedLevel: 'A1',
  uiLanguage: 'ru',
  streakReminderEnabled: false,
  streakReminderHour: 19,
  pronunciationEngine: 'auto',
  syncId: null,
  lastSyncedAt: null,
}

describe('backup', () => {
  it('exportBackup creates valid structure', () => {
    const backup = exportBackup(baseProgress, baseSettings)
    expect(backup.app).toBe('latvian-teacher')
    expect(backup.version).toBe(1)
    expect(backup.progress.completedLessons).toContain('alphabet-1')
  })

  it('parseBackupFile validates app id', () => {
    const raw = exportBackup(baseProgress, baseSettings)
    const parsed = parseBackupFile(JSON.stringify(raw))
    expect(parsed.settings.userName).toBe('Test')
  })

  it('mergeProgress combines lessons', () => {
    const incoming = {
      ...baseProgress,
      completedLessons: ['greetings-1'],
      streak: 5,
    }
    const merged = mergeProgress(baseProgress, incoming)
    expect(merged.completedLessons).toContain('alphabet-1')
    expect(merged.completedLessons).toContain('greetings-1')
    expect(merged.streak).toBe(5)
  })
})
