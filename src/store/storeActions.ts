import type { StateCreator } from 'zustand'
import { estimateLevel } from '../lib/adaptive'
import {
  applySkillIdsUpdate,
  recordPhonemeChars,
  resolveSkillIdsForAttempt,
} from '../lib/skillTracking'
import { checkNewAchievements, type Achievement } from '../data/achievements'
import { createNewStoredCard, gradeStoredCard, isCardDue } from '../lib/fsrsSrs'
import { mergeProgress, mergeSettings } from '../lib/backup'
import { migrateProgress, migrateSettings } from './migrations'
import {
  logStudyDay,
  persistProgress,
  persistSettings,
  trackCategory,
  trackStudyMinutes,
} from './progressHelpers'
import type { Store, StoreActions, UserProgress } from './types'

type SliceCreator = StateCreator<Store, [], [], StoreActions>

function unlockAchievements(progress: UserProgress, newOnes: Achievement[]) {
  for (const a of newOnes) {
    if (!progress.unlockedAchievements.includes(a.id)) {
      progress.unlockedAchievements.push(a.id)
      progress.achievementTimestamps[a.id] = Date.now()
    }
  }
}

export const createStoreActions: SliceCreator = (set, get) => ({
  updateSettings: (partial) => {
    const settings = { ...get().settings, ...partial }
    persistSettings(settings)
    set({ settings })
  },

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

    const skillIds = resolveSkillIdsForAttempt(id, meta)
    if (skillIds.length > 0) {
      progress.skillStats = applySkillIdsUpdate(progress.skillStats, skillIds, correct)
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

  recordPronunciation: (correct, chars) => {
    const progress = { ...get().progress }
    progress.pronunciationAttempts.total += 1
    if (correct) progress.pronunciationAttempts.correct += 1
    trackCategory(progress, 'pronunciation', correct)
    progress.phonemeStats = recordPhonemeChars(progress.phonemeStats, chars)
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
})
