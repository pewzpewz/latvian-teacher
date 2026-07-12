import { describe, it, expect } from 'vitest'
import { exportBackup } from './backup'
import type { UserProgress, UserSettings } from '../store/useStore'
import {
  decryptBackup,
  encryptBackup,
  validateSyncPassphrase,
} from './syncCrypto'

const progress = {
  completedLessons: ['alphabet-1'],
  exerciseScores: {},
  srsCards: {},
  streak: 1,
  lastStudyDate: null,
  totalStudyMinutes: 5,
  todayStudyMinutes: 5,
  todayStudyDate: '2026-07-12',
  wordsLearned: 3,
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
  firstStudyDate: '2026-07-12',
  studyDayLog: {},
} satisfies UserProgress

const settings = {
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
  learningGoal: 'general',
  selfReportedLevel: null,
  uiLanguage: 'ru',
  streakReminderEnabled: false,
  streakReminderHour: 19,
  syncId: null,
  lastSyncedAt: null,
} satisfies UserSettings

describe('syncCrypto', () => {
  it('validateSyncPassphrase rejects short passwords', () => {
    expect(validateSyncPassphrase('short')).toMatch(/8/)
    expect(validateSyncPassphrase('long-enough')).toBeNull()
  })

  it('encrypt/decrypt roundtrip', async () => {
    const backup = exportBackup(progress, settings)
    const blob = await encryptBackup(backup, 'my-sync-passphrase')
    const restored = await decryptBackup(blob, 'my-sync-passphrase')
    expect(restored.progress.completedLessons).toContain('alphabet-1')
    expect(restored.settings.userName).toBe('Test')
  })

  it('decrypt fails with wrong passphrase', async () => {
    const backup = exportBackup(progress, settings)
    const blob = await encryptBackup(backup, 'correct-password')
    await expect(decryptBackup(blob, 'wrong-password')).rejects.toThrow(/пароль/i)
  })
})
