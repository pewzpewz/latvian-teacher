import type { UserProgress, UserSettings } from '../store/useStore'

export const BACKUP_VERSION = 1

export type AppBackup = {
  version: number
  exportedAt: string
  app: 'latvian-teacher'
  progress: UserProgress
  settings: UserSettings
}

export function exportBackup(progress: UserProgress, settings: UserSettings): AppBackup {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    app: 'latvian-teacher',
    progress,
    settings: { ...settings, aiApiKey: settings.aiApiKey },
  }
}

export function downloadBackup(data: AppBackup, filename?: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename ?? `lv-skolotajs-backup-${data.exportedAt.slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function parseBackupFile(text: string): AppBackup {
  const raw = JSON.parse(text) as Partial<AppBackup>
  if (raw.app !== 'latvian-teacher') {
    throw new Error('Это не резервная копия Latviešu Skolotājs')
  }
  if (!raw.progress || !raw.settings) {
    throw new Error('Файл повреждён: нет progress или settings')
  }
  return raw as AppBackup
}

export function mergeProgress(
  current: UserProgress,
  incoming: UserProgress,
): UserProgress {
  const mergedLessons = [...new Set([...current.completedLessons, ...incoming.completedLessons])]
  const mergedAchievements = [...new Set([...current.unlockedAchievements, ...incoming.unlockedAchievements])]
  const mergedDialogs = [...new Set([...current.dialogsCompleted, ...incoming.dialogsCompleted])]

  const achievementTimestamps = { ...current.achievementTimestamps, ...incoming.achievementTimestamps }
  const exerciseScores = { ...current.exerciseScores, ...incoming.exerciseScores }
  const srsCards = { ...current.srsCards, ...incoming.srsCards }

  const categoryStats = { ...current.categoryStats }
  for (const [key, stats] of Object.entries(incoming.categoryStats)) {
    const cur = categoryStats[key]
    if (cur) {
      categoryStats[key] = {
        correct: cur.correct + stats.correct,
        total: cur.total + stats.total,
      }
    } else {
      categoryStats[key] = stats
    }
  }

  return {
    ...current,
    ...incoming,
    completedLessons: mergedLessons,
    unlockedAchievements: mergedAchievements,
    achievementTimestamps,
    dialogsCompleted: mergedDialogs,
    exerciseScores,
    srsCards,
    categoryStats,
    exerciseAttempts: [...current.exerciseAttempts, ...incoming.exerciseAttempts].slice(-200),
    adaptiveWords: [...current.adaptiveWords, ...incoming.adaptiveWords].slice(-50),
    adaptiveExercises: [...current.adaptiveExercises, ...incoming.adaptiveExercises].slice(-30),
    chatHistory: incoming.chatHistory.length > current.chatHistory.length
      ? incoming.chatHistory
      : current.chatHistory,
    streak: Math.max(current.streak, incoming.streak),
    totalStudyMinutes: Math.max(current.totalStudyMinutes, incoming.totalStudyMinutes),
    wordsLearned: Math.max(current.wordsLearned, incoming.wordsLearned),
    firstStudyDate:
      current.firstStudyDate && incoming.firstStudyDate
        ? current.firstStudyDate < incoming.firstStudyDate
          ? current.firstStudyDate
          : incoming.firstStudyDate
        : current.firstStudyDate ?? incoming.firstStudyDate ?? null,
    studyDayLog: { ...current.studyDayLog, ...incoming.studyDayLog },
  }
}

export function mergeSettings(current: UserSettings, incoming: UserSettings): UserSettings {
  return {
    ...current,
    ...incoming,
    aiApiKey: incoming.aiApiKey || current.aiApiKey,
    userName: incoming.userName || current.userName,
  }
}
