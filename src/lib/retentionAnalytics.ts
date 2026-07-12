/**
 * D7 retention analytics (local-first, без сервера)
 *
 * Day 0 = firstStudyDate (первый день активности)
 * D7 retained = была активность в календарный день firstStudyDate + 7
 */
import type { UserProgress } from '../store/useStore'

export type D7Status = 'no_data' | 'pending' | 'retained' | 'missed'

export type WeekOneDay = {
  offset: number
  date: string
  label: string
  active: boolean
  minutes: number
}

export type RetentionMetrics = {
  firstStudyDate: string | null
  daysSinceStart: number
  d7Status: D7Status
  d7Date: string | null
  d7Active: boolean
  activeDaysFirstWeek: number
  weekOne: WeekOneDay[]
  last14Days: { date: string; label: string; active: boolean; minutes: number }[]
  totalActiveDays: number
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00`)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function daysBetween(from: string, to: string): number {
  const a = new Date(`${from}T12:00:00`).getTime()
  const b = new Date(`${to}T12:00:00`).getTime()
  return Math.round((b - a) / 86_400_000)
}

export function isStudyDayActive(log: Record<string, number>, date: string): boolean {
  return Object.prototype.hasOwnProperty.call(log, date)
}

export function computeRetentionMetrics(
  progress: UserProgress,
  now = new Date(),
): RetentionMetrics {
  const today = now.toISOString().slice(0, 10)
  const log = progress.studyDayLog ?? {}
  const first = progress.firstStudyDate

  if (!first) {
    return {
      firstStudyDate: null,
      daysSinceStart: 0,
      d7Status: 'no_data',
      d7Date: null,
      d7Active: false,
      activeDaysFirstWeek: 0,
      weekOne: [],
      last14Days: [],
      totalActiveDays: 0,
    }
  }

  const daysSinceStart = daysBetween(first, today)
  const d7Date = addDays(first, 7)
  const d7Active = isStudyDayActive(log, d7Date)

  let d7Status: D7Status
  if (daysSinceStart < 7) {
    d7Status = 'pending'
  } else if (d7Active) {
    d7Status = 'retained'
  } else {
    d7Status = 'missed'
  }

  const weekOne: WeekOneDay[] = Array.from({ length: 7 }, (_, offset) => {
    const date = addDays(first, offset)
    return {
      offset,
      date,
      label: `D${offset}`,
      active: isStudyDayActive(log, date),
      minutes: log[date] ?? 0,
    }
  })

  const activeDaysFirstWeek = weekOne.filter((d) => d.active).length

  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(today, -(13 - i))
    const d = new Date(`${date}T12:00:00`)
    const label = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
    return {
      date,
      label,
      active: isStudyDayActive(log, date),
      minutes: log[date] ?? 0,
    }
  })

  const totalActiveDays = Object.keys(log).length

  return {
    firstStudyDate: first,
    daysSinceStart,
    d7Status,
    d7Date,
    d7Active,
    activeDaysFirstWeek,
    weekOne,
    last14Days,
    totalActiveDays,
  }
}

export function d7StatusLabel(status: D7Status): string {
  switch (status) {
    case 'no_data':
      return 'Начните учиться — появится статистика'
    case 'pending':
      return 'День 7 ещё не наступил'
    case 'retained':
      return 'D7 ✓ — вы вернулись на 7-й день'
    case 'missed':
      return 'D7 — не было активности на 7-й день'
  }
}
