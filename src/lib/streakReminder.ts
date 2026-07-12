import type { UserProgress, UserSettings } from '../store/useStore'

const LAST_REMINDER_KEY = 'lv-streak-reminder-date'

export function isNotificationSupported(): boolean {
  return typeof globalThis !== 'undefined' && 'Notification' in globalThis
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied'
  const NotificationApi = globalThis.Notification
  if (NotificationApi.permission === 'granted') return 'granted'
  if (NotificationApi.permission === 'denied') return 'denied'
  return NotificationApi.requestPermission()
}

export function studiedToday(progress: UserProgress): boolean {
  const today = new Date().toISOString().slice(0, 10)
  return progress.todayStudyDate === today && progress.todayStudyMinutes > 0
}

export function shouldShowStreakReminder(
  settings: UserSettings,
  progress: UserProgress,
  now = new Date(),
): boolean {
  if (!settings.streakReminderEnabled) return false
  if (!isNotificationSupported() || globalThis.Notification.permission !== 'granted') return false
  if (progress.streak <= 0) return false
  if (studiedToday(progress)) return false

  const hour = now.getHours()
  if (hour !== settings.streakReminderHour) return false

  const today = now.toISOString().slice(0, 10)
  if (localStorage.getItem(LAST_REMINDER_KEY) === today) return false

  return true
}

export function showStreakReminder(
  streak: number,
  messages?: { title: string; body: string },
): void {
  if (!isNotificationSupported() || globalThis.Notification.permission !== 'granted') return

  const title = messages?.title ?? 'Latviešu Skolotājs'
  const body =
    messages?.body ??
    `Серия ${streak} ${streak === 1 ? 'день' : streak < 5 ? 'дня' : 'дней'} — не забудьте позаниматься сегодня!`

  try {
    new globalThis.Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'lv-streak-reminder',
    })
    localStorage.setItem(LAST_REMINDER_KEY, new Date().toISOString().slice(0, 10))
  } catch {
    /* Safari / restricted contexts */
  }
}

export function markReminderShown(): void {
  localStorage.setItem(LAST_REMINDER_KEY, new Date().toISOString().slice(0, 10))
}
