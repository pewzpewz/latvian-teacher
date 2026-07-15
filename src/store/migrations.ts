import { estimateLevel } from '../lib/adaptive'
import { achievements } from '../data/achievements'
import { normalizeSrsCard } from '../lib/fsrsSrs'
import { defaultProgress, defaultSettings } from './defaults'
import type { SrsCard, UserProgress, UserSettings } from './types'

export function migrateProgress(raw: Partial<UserProgress>): UserProgress {
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

  if (!raw.unlockedAchievements?.length) {
    const earned = achievements.filter((a) => a.check(base))
    base.unlockedAchievements = earned.map((a) => a.id)
    base.achievementTimestamps = Object.fromEntries(earned.map((a) => [a.id, Date.now()]))
  }

  if (raw.srsCards) {
    const migrated: Record<string, SrsCard> = {}
    for (const [id, card] of Object.entries(raw.srsCards)) {
      migrated[id] = normalizeSrsCard({ ...card, wordId: card.wordId ?? id })
    }
    base.srsCards = migrated
  }

  return base
}

export function migrateSettings(raw: Partial<UserSettings>): UserSettings {
  const merged = { ...defaultSettings, ...raw }

  if (!raw.aiProvider || raw.aiProvider === 'openai') {
    merged.aiProvider = 'gemini'
    merged.aiModel = 'gemini-3-flash-preview'
  }

  if (!raw.pronunciationEngine) {
    merged.pronunciationEngine = 'auto'
  }

  return merged
}
