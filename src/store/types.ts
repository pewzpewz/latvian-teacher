import type { AdaptiveExercise, AdaptiveWord, Level } from '../lib/adaptive'
import type { LearningGoal } from '../data/examB1'
import type { UiLanguage } from '../i18n'
import type { StoredFsrsCard } from '../lib/fsrsSrs'
import type { SkillState } from '../lib/knowledgeTracing'
import type { PhonemeChar } from '../lib/phonemeFeedback'

export type SrsCard = StoredFsrsCard

export type ExerciseAttempt = {
  exerciseId: string
  lessonId?: string
  category: string
  correct: boolean
  timestamp: number
}

export type CategoryStats = {
  correct: number
  total: number
}

export type UserSettings = {
  dailyGoal: number
  nativeLanguage: 'ru'
  showTransliteration: boolean
  speechRate: number
  aiProvider: 'openai' | 'anthropic' | 'local' | 'gemini'
  aiModel: string
  aiApiKey: string
  userName: string
  adaptiveEnabled: boolean
  ttsEngine: 'neural' | 'browser'
  ttsVoice: string
  onboardingCompleted: boolean
  learningGoal: LearningGoal
  selfReportedLevel: Level | null
  uiLanguage: UiLanguage
  streakReminderEnabled: boolean
  streakReminderHour: number
  pronunciationEngine: 'auto' | 'gemini' | 'stt'
  syncId: string | null
  lastSyncedAt: string | null
}

export type UserProgress = {
  completedLessons: string[]
  exerciseScores: Record<string, boolean>
  srsCards: Record<string, SrsCard>
  streak: number
  lastStudyDate: string | null
  totalStudyMinutes: number
  todayStudyMinutes: number
  todayStudyDate: string | null
  wordsLearned: number
  estimatedLevel: Level
  categoryStats: Record<string, CategoryStats>
  skillStats: Record<string, SkillState>
  phonemeStats: Record<string, SkillState>
  exerciseAttempts: ExerciseAttempt[]
  pronunciationAttempts: { correct: number; total: number }
  adaptiveWords: AdaptiveWord[]
  adaptiveExercises: AdaptiveExercise[]
  lastAdaptationAt: number | null
  unlockedAchievements: string[]
  achievementTimestamps: Record<string, number>
  gameStats: {
    totalPlays: number
    totalCorrect: number
    bestScores: Record<string, number>
    playsByGame: Record<string, number>
  }
  dialogsCompleted: string[]
  chatHistory: { role: 'user' | 'assistant'; content: string }[]
  firstStudyDate: string | null
  studyDayLog: Record<string, number>
}

export type StoreState = {
  settings: UserSettings
  progress: UserProgress
  hydrated: boolean
  achievementQueue: import('../data/achievements').Achievement[]
}

export type StoreActions = {
  updateSettings: (partial: Partial<UserSettings>) => void
  completeLesson: (id: string) => void
  recordExercise: (id: string, correct: boolean, meta?: { lessonId?: string; category?: string }) => void
  updateSrsCard: (wordId: string, quality: 0 | 1 | 2 | 3 | 4 | 5, category?: string) => void
  recordPronunciation: (correct: boolean, chars?: PhonemeChar[]) => void
  addStudyTime: (minutes: number) => void
  updateStreak: () => void
  getDueCards: () => string[]
  addAdaptiveContent: (words: AdaptiveWord[], exercises: AdaptiveExercise[]) => void
  refreshEstimatedLevel: () => void
  dismissAchievement: () => void
  checkAchievements: () => void
  recordGameResult: (gameId: string, score: number, correct: number, total: number) => void
  completeDialog: (id: string) => void
  setChatHistory: (messages: { role: 'user' | 'assistant'; content: string }[]) => void
  restoreBackup: (backup: import('../lib/backup').AppBackup, mode: 'replace' | 'merge') => void
}

export type Store = StoreState & StoreActions
