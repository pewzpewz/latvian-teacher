import { create } from 'zustand'
import { estimateLevel } from '../lib/adaptive'
import type { AdaptiveExercise, AdaptiveWord, Level } from '../lib/adaptive'
import type { LearningGoal } from '../data/examB1'
import type { UiLanguage } from '../i18n'
import { checkNewAchievements, achievements } from '../data/achievements'
import type { Achievement } from '../data/achievements'

import {
  createNewStoredCard,
  gradeStoredCard,
  isCardDue,
  normalizeSrsCard,
  type StoredFsrsCard,
} from '../lib/fsrsSrs'
import { mergeProgress, mergeSettings, type AppBackup } from '../lib/backup'
import {
  migrateFromLocalStorage,
  readProgressRaw,
  readSettingsRaw,
  writeProgressRaw,
  writeSettingsRaw,
} from '../lib/storage'

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
  /** UUID для E2E sync — пароль не хранится */
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
  // Adaptive learning
  estimatedLevel: Level
  categoryStats: Record<string, CategoryStats>
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
  /** Day 0 для D7 retention */
  firstStudyDate: string | null
  /** ISO date → минуты за день (ключ = активный день) */
  studyDayLog: Record<string, number>
}

const defaultSettings: UserSettings = {
  dailyGoal: 15,
  nativeLanguage: 'ru',
  showTransliteration: true,
  speechRate: 0.85,
  aiProvider: 'gemini',
  aiModel: 'gemini-3-flash-preview',
  aiApiKey: '',
  userName: '',
  adaptiveEnabled: true,
  ttsEngine: 'neural',
  ttsVoice: 'lv-LV-EveritaNeural',
  onboardingCompleted: false,
  learningGoal: 'general',
  selfReportedLevel: null,
  uiLanguage: 'ru',
  streakReminderEnabled: false,
  streakReminderHour: 19,
  syncId: null,
  lastSyncedAt: null,
}

const defaultProgress: UserProgress = {
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

function migrateProgress(raw: Partial<UserProgress>): UserProgress {
  const base = {
    ...defaultProgress,
    ...raw,
    estimatedLevel: raw.estimatedLevel ?? estimateLevel(raw as UserProgress),
    categoryStats: raw.categoryStats ?? {},
    exerciseAttempts: raw.exerciseAttempts ?? [],
    pronunciationAttempts: raw.pronunciationAttempts ?? { correct: 0, total: 0 },
    adaptiveWords: raw.adaptiveWords ?? [],
    adaptiveExercises: raw.adaptiveExercises ?? [],
    lastAdaptationAt: raw.lastAdaptationAt ?? null,
    unlockedAchievements: raw.unlockedAchievements ?? [],
    achievementTimestamps: raw.achievementTimestamps ?? {},
    gameStats: {
      totalPlays: raw.gameStats?.totalPlays ?? 0,
      totalCorrect: raw.gameStats?.totalCorrect ?? 0,
      bestScores: raw.gameStats?.bestScores ?? {},
      playsByGame: raw.gameStats?.playsByGame ?? {},
    },
    todayStudyMinutes: raw.todayStudyMinutes ?? 0,
    todayStudyDate: raw.todayStudyDate ?? null,
    dialogsCompleted: raw.dialogsCompleted ?? [],
    chatHistory: raw.chatHistory ?? [],
  }

  // D7 retention fields
  if (raw.firstStudyDate) {
    base.firstStudyDate = raw.firstStudyDate
  } else if (raw.lastStudyDate) {
    base.firstStudyDate = raw.lastStudyDate
  }
  if (raw.studyDayLog && Object.keys(raw.studyDayLog).length > 0) {
    base.studyDayLog = raw.studyDayLog
  } else if (raw.lastStudyDate) {
    base.studyDayLog = {
      [raw.lastStudyDate]: raw.todayStudyMinutes ?? (Math.min(raw.totalStudyMinutes ?? 0, 60) || 1),
    }
  }

  // Retroactive silent unlock for existing users (no popup spam)
  if (!raw.unlockedAchievements?.length) {
    const earned = achievements.filter((a) => a.check(base))
    base.unlockedAchievements = earned.map((a) => a.id)
    base.achievementTimestamps = Object.fromEntries(
      earned.map((a) => [a.id, Date.now()]),
    )
  }

  // FSRS migration from SM-2
  if (raw.srsCards) {
    const migrated: Record<string, SrsCard> = {}
    for (const [id, card] of Object.entries(raw.srsCards)) {
      migrated[id] = normalizeSrsCard({ ...card, wordId: card.wordId ?? id })
    }
    base.srsCards = migrated
  }

  return base
}

function migrateSettings(raw: Partial<UserSettings>): UserSettings {
  const merged = { ...defaultSettings, ...raw }

  // Миграция: старые настройки OpenAI → Gemini
  if (!raw.aiProvider || raw.aiProvider === 'openai') {
    merged.aiProvider = 'gemini'
    merged.aiModel = 'gemini-3-flash-preview'
  }

  return merged
}

function persistSettings(s: UserSettings) {
  void writeSettingsRaw(s)
}

function persistProgress(p: UserProgress) {
  void writeProgressRaw(p)
}

function ensureTodayStudy(progress: UserProgress): void {
  const today = new Date().toISOString().slice(0, 10)
  if (progress.todayStudyDate !== today) {
    progress.todayStudyMinutes = 0
    progress.todayStudyDate = today
  }
}

function logStudyDay(progress: UserProgress, minutes = 0): void {
  const today = new Date().toISOString().slice(0, 10)
  if (!progress.firstStudyDate) {
    progress.firstStudyDate = today
  }
  if (!progress.studyDayLog) progress.studyDayLog = {}
  if (minutes > 0) {
    progress.studyDayLog[today] = (progress.studyDayLog[today] ?? 0) + minutes
  } else if (!Object.prototype.hasOwnProperty.call(progress.studyDayLog, today)) {
    progress.studyDayLog[today] = 0
  }
}

function trackStudyMinutes(progress: UserProgress, minutes: number): void {
  ensureTodayStudy(progress)
  progress.todayStudyMinutes += minutes
  progress.totalStudyMinutes += minutes
  logStudyDay(progress, minutes)
}

function trackCategory(progress: UserProgress, category: string, correct: boolean) {
  if (!progress.categoryStats[category]) {
    progress.categoryStats[category] = { correct: 0, total: 0 }
  }
  progress.categoryStats[category].total += 1
  if (correct) progress.categoryStats[category].correct += 1
}

type Store = {
  settings: UserSettings
  progress: UserProgress
  hydrated: boolean
  achievementQueue: Achievement[]
  updateSettings: (partial: Partial<UserSettings>) => void
  completeLesson: (id: string) => void
  recordExercise: (id: string, correct: boolean, meta?: { lessonId?: string; category?: string }) => void
  updateSrsCard: (wordId: string, quality: 0 | 1 | 2 | 3 | 4 | 5, category?: string) => void
  recordPronunciation: (correct: boolean) => void
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
  restoreBackup: (backup: AppBackup, mode: 'replace' | 'merge') => void
}

function unlockAchievements(progress: UserProgress, newOnes: Achievement[]) {
  for (const a of newOnes) {
    if (!progress.unlockedAchievements.includes(a.id)) {
      progress.unlockedAchievements.push(a.id)
      progress.achievementTimestamps[a.id] = Date.now()
    }
  }
}

export const useStore = create<Store>((set, get) => ({
  settings: defaultSettings,
  progress: defaultProgress,
  hydrated: false,
  achievementQueue: [],

  checkAchievements: () => {
    const { progress, achievementQueue } = get()
    const newOnes = checkNewAchievements(progress, progress.unlockedAchievements)
    if (newOnes.length === 0) return

    const updated = { ...progress }
    unlockAchievements(updated, newOnes)
    persistProgress(updated)

    const existingIds = new Set(achievementQueue.map((a) => a.id))
    const toQueue = newOnes.filter((a) => !existingIds.has(a.id))

    set({
      progress: updated,
      achievementQueue: [...achievementQueue, ...toQueue],
    })
  },

  dismissAchievement: () => {
    set((state) => ({ achievementQueue: state.achievementQueue.slice(1) }))
  },

  updateSettings: (partial) => {
    const settings = { ...get().settings, ...partial }
    persistSettings(settings)
    set({ settings })
  },

  completeLesson: (id) => {
    const progress = { ...get().progress }
    if (!progress.completedLessons.includes(id)) {
      progress.completedLessons.push(id)
      progress.estimatedLevel = estimateLevel(progress)
      logStudyDay(progress, 5)
      persistProgress(progress)
      set({ progress })
      get().checkAchievements()
    }
  },

  recordExercise: (id, correct, meta) => {
    const progress = { ...get().progress }
    progress.exerciseScores[id] = correct

    const category = meta?.category ?? 'general'
    trackCategory(progress, category, correct)
    logStudyDay(progress, 2)

    progress.exerciseAttempts.push({
      exerciseId: id,
      lessonId: meta?.lessonId,
      category,
      correct,
      timestamp: Date.now(),
    })
    if (progress.exerciseAttempts.length > 200) {
      progress.exerciseAttempts = progress.exerciseAttempts.slice(-200)
    }

    progress.estimatedLevel = estimateLevel(progress)
    persistProgress(progress)
    set({ progress })
    get().checkAchievements()
  },

  updateSrsCard: (wordId, quality, category) => {
    const progress = { ...get().progress }
    const existing = progress.srsCards[wordId] ?? createNewStoredCard(wordId)
    const wasNew = existing.reps === 0
    progress.srsCards[wordId] = gradeStoredCard(existing, quality)

    if (category) {
      trackCategory(progress, category, quality >= 3)
    }

    if (quality >= 3 && wasNew) {
      progress.wordsLearned += 1
    }
    logStudyDay(progress, 1)
    persistProgress(progress)
    set({ progress })
    get().checkAchievements()
  },

  recordPronunciation: (correct) => {
    const progress = { ...get().progress }
    progress.pronunciationAttempts.total += 1
    if (correct) progress.pronunciationAttempts.correct += 1
    trackCategory(progress, 'pronunciation', correct)
    trackStudyMinutes(progress, 1)
    persistProgress(progress)
    set({ progress })
    get().checkAchievements()
  },

  addStudyTime: (minutes) => {
    const progress = { ...get().progress }
    trackStudyMinutes(progress, minutes)
    persistProgress(progress)
    set({ progress })
    get().checkAchievements()
  },

  updateStreak: () => {
    const progress = { ...get().progress }
    const today = new Date().toISOString().slice(0, 10)
    if (progress.lastStudyDate === today) return

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().slice(0, 10)

    if (progress.lastStudyDate === yesterdayStr) {
      progress.streak += 1
    } else if (progress.lastStudyDate !== today) {
      progress.streak = 1
    }
    progress.lastStudyDate = today
    persistProgress(progress)
    set({ progress })
    get().checkAchievements()
  },

  getDueCards: () => {
    const now = Date.now()
    return Object.values(get().progress.srsCards)
      .filter((c) => isCardDue(c, now))
      .map((c) => c.wordId)
  },

  addAdaptiveContent: (words, exercises) => {
    const progress = { ...get().progress }
    const existingWordLv = new Set(progress.adaptiveWords.map((w) => w.lv))
    const existingExIds = new Set(progress.adaptiveExercises.map((e) => e.id))

    for (const w of words) {
      if (!existingWordLv.has(w.lv)) {
        progress.adaptiveWords.push(w)
        existingWordLv.add(w.lv)
      }
    }
    for (const e of exercises) {
      if (!existingExIds.has(e.id)) {
        progress.adaptiveExercises.push(e)
        existingExIds.add(e.id)
      }
    }

    progress.lastAdaptationAt = Date.now()
    persistProgress(progress)
    set({ progress })
    get().checkAchievements()
  },

  refreshEstimatedLevel: () => {
    const progress = { ...get().progress }
    progress.estimatedLevel = estimateLevel(progress)
    persistProgress(progress)
    set({ progress })
  },

  recordGameResult: (gameId, score, correct, total) => {
    const progress = { ...get().progress }
    progress.gameStats.totalPlays += 1
    progress.gameStats.totalCorrect += correct
    progress.gameStats.playsByGame[gameId] = (progress.gameStats.playsByGame[gameId] ?? 0) + 1
    const prevBest = progress.gameStats.bestScores[gameId] ?? 0
    if (score > prevBest) {
      progress.gameStats.bestScores[gameId] = score
    }
    trackCategory(progress, 'games', correct >= total * 0.5)
    progress.exerciseAttempts.push({
      exerciseId: `game-${gameId}-${Date.now()}`,
      category: 'games',
      correct: correct >= total * 0.5,
      timestamp: Date.now(),
    })
    if (progress.exerciseAttempts.length > 200) {
      progress.exerciseAttempts = progress.exerciseAttempts.slice(-200)
    }
    trackStudyMinutes(progress, 2)
    persistProgress(progress)
    set({ progress })
    get().checkAchievements()
  },

  completeDialog: (id) => {
    const progress = { ...get().progress }
    if (!progress.dialogsCompleted.includes(id)) {
      progress.dialogsCompleted.push(id)
      trackCategory(progress, 'dialogs', true)
      trackStudyMinutes(progress, 3)
      persistProgress(progress)
      set({ progress })
      get().checkAchievements()
    }
  },

  setChatHistory: (messages) => {
    const progress = { ...get().progress }
    progress.chatHistory = messages.slice(-50)
    if (messages.some((m) => m.role === 'user')) {
      logStudyDay(progress, 0)
    }
    persistProgress(progress)
    set({ progress })
  },

  restoreBackup: (backup, mode) => {
    const progress =
      mode === 'replace'
        ? migrateProgress(backup.progress)
        : migrateProgress(mergeProgress(get().progress, backup.progress))
    const settings =
      mode === 'replace'
        ? migrateSettings(backup.settings)
        : migrateSettings(mergeSettings(get().settings, backup.settings))
    persistProgress(progress)
    persistSettings(settings)
    set({ progress, settings })
    get().checkAchievements()
  },
}))

export function initNewWord(wordId: string) {
  const store = useStore.getState()
  if (!store.progress.srsCards[wordId]) {
    const progress = { ...store.progress }
    progress.srsCards[wordId] = createNewStoredCard(wordId)
    persistProgress(progress)
    useStore.setState({ progress })
  }
}

let hydratePromise: Promise<void> | null = null

/** Load progress/settings from IndexedDB (migrates localStorage once). */
export function hydrateStore(): Promise<void> {
  if (hydratePromise) return hydratePromise

  hydratePromise = (async () => {
    await migrateFromLocalStorage()

    const rawSettings = await readSettingsRaw()
    const rawProgress = await readProgressRaw()

    const settings = migrateSettings((rawSettings as Partial<UserSettings> | null) ?? {})
    const progress = migrateProgress((rawProgress as Partial<UserProgress> | null) ?? {})

    persistSettings(settings)
    persistProgress(progress)

    useStore.setState({ settings, progress, hydrated: true })
  })().catch((e) => {
    console.error('hydrateStore failed:', e)
    useStore.setState({ hydrated: true })
  })

  return hydratePromise
}
