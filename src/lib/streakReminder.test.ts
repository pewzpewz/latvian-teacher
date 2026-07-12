import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shouldShowStreakReminder, studiedToday } from './streakReminder'
import type { UserProgress, UserSettings } from '../store/useStore'

const baseSettings = {
  streakReminderEnabled: true,
  streakReminderHour: 19,
} as UserSettings

const baseProgress = {
  streak: 5,
  todayStudyDate: null,
  todayStudyMinutes: 0,
} as UserProgress

describe('streakReminder', () => {
  const storage: Record<string, string> = {}

  beforeEach(() => {
    Object.keys(storage).forEach((k) => delete storage[k])
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, value: string) => {
        storage[key] = value
      },
      clear: () => {
        Object.keys(storage).forEach((k) => delete storage[k])
      },
    })
    vi.stubGlobal('Notification', class {
      static permission = 'granted'
    })
  })

  it('studiedToday when minutes logged', () => {
    const today = new Date().toISOString().slice(0, 10)
    expect(
      studiedToday({ todayStudyDate: today, todayStudyMinutes: 5 } as UserProgress),
    ).toBe(true)
  })

  it('shouldShowStreakReminder at configured hour', () => {
    const now = new Date('2026-07-12T19:30:00')
    expect(shouldShowStreakReminder(baseSettings, baseProgress, now)).toBe(true)
  })

  it('skips when already studied', () => {
    const now = new Date('2026-07-12T19:30:00')
    const today = now.toISOString().slice(0, 10)
    expect(
      shouldShowStreakReminder(
        baseSettings,
        { ...baseProgress, todayStudyDate: today, todayStudyMinutes: 10 },
        now,
      ),
    ).toBe(false)
  })
})
