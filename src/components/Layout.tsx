import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { AchievementProvider } from './AchievementUnlockModal'
import { OfflineIndicator } from './OfflineIndicator'
import { OnboardingModal } from './OnboardingModal'
import { StreakReminderScheduler } from './StreakReminderScheduler'
import { useStore } from '../store/useStore'
import { useTranslation } from '../hooks/useTranslation'
import { preloadBigDictionary } from '../lib/bigDictionary'

export function Layout() {
  const { t } = useTranslation()
  const checkAchievements = useStore((s) => s.checkAchievements)
  const settings = useStore((s) => s.settings)
  const progress = useStore((s) => s.progress)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [onboardingDismissed, setOnboardingDismissed] = useState(false)

  const showOnboarding =
    !settings.onboardingCompleted &&
    !onboardingDismissed &&
    progress.completedLessons.length === 0 &&
    progress.totalStudyMinutes === 0

  useEffect(() => {
    checkAchievements()
    preloadBigDictionary()
  }, [checkAchievements])

  useEffect(() => {
    if (!mobileNavOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNavOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileNavOpen])

  return (
    <div className="flex min-h-full">
      <Sidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />

      {mobileNavOpen && (
        <button
          type="button"
          aria-label={t('layout.closeMenu')}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <div className="flex min-h-full flex-1 flex-col md:ml-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur md:hidden">
          <button
            type="button"
            aria-label={t('layout.openMenu')}
            onClick={() => setMobileNavOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border"
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div>
            <p className="text-sm font-semibold">{t('app.title')}</p>
            <p className="text-xs text-muted">{t('app.subtitle')}</p>
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
            <Outlet />
          </div>
        </main>
      </div>

      <AchievementProvider />
      <OfflineIndicator />
      <StreakReminderScheduler />
      {showOnboarding && (
        <OnboardingModal onComplete={() => setOnboardingDismissed(true)} />
      )}
    </div>
  )
}
