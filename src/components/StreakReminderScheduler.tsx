import { useEffect } from 'react'
import { useStore } from '../store/useStore'
import { shouldShowStreakReminder, showStreakReminder } from '../lib/streakReminder'
import { translate } from '../i18n'

/** Периодическая проверка PWA-напоминания о серии (когда приложение открыто). */
export function StreakReminderScheduler() {
  const settings = useStore((s) => s.settings)
  const progress = useStore((s) => s.progress)

  useEffect(() => {
    const tick = () => {
      if (shouldShowStreakReminder(settings, progress)) {
        showStreakReminder(progress.streak, {
          title: translate(settings.uiLanguage, 'streak.reminderTitle'),
          body: translate(settings.uiLanguage, 'streak.reminderBody', { count: progress.streak }),
        })
      }
    }

    tick()
    const id = window.setInterval(tick, 60_000)
    return () => window.clearInterval(id)
  }, [settings, progress])

  return null
}
