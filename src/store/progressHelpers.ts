import { writeProgressRaw, writeSettingsRaw } from '../lib/storage'
import type { UserProgress, UserSettings } from './types'

export function persistSettings(s: UserSettings) {
  void writeSettingsRaw(s)
}

export function persistProgress(p: UserProgress) {
  void writeProgressRaw(p)
}

export function ensureTodayStudy(progress: UserProgress): void {
  const today = new Date().toISOString().slice(0, 10)
  if (progress.todayStudyDate !== today) {
    progress.todayStudyMinutes = 0
    progress.todayStudyDate = today
  }
}

export function logStudyDay(progress: UserProgress, minutes = 0): void {
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

export function trackStudyMinutes(progress: UserProgress, minutes: number): void {
  ensureTodayStudy(progress)
  progress.todayStudyMinutes += minutes
  progress.totalStudyMinutes += minutes
  logStudyDay(progress, minutes)
}

export function trackCategory(progress: UserProgress, category: string, correct: boolean) {
  if (!progress.categoryStats[category]) {
    progress.categoryStats[category] = { correct: 0, total: 0 }
  }
  progress.categoryStats[category].total += 1
  if (correct) progress.categoryStats[category].correct += 1
}
