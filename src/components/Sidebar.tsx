import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  BookOpen,
  Brain,
  Home,
  MessageCircle,
  Mic,
  Settings,
  Sparkles,
  Trophy,
  Target,
  Volume2,
  Gamepad2,
  GraduationCap,
  Layers,
  Flag,
  Zap,
  Headphones,
  Map,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { checkTtsHealth } from '../lib/tts'
import { useTranslation } from '../hooks/useTranslation'
import { dayCountLabel } from '../i18n/plural'

const navItems = [
  { to: '/', icon: Home, labelKey: 'nav.home' },
  { to: '/plan', icon: Target, labelKey: 'nav.plan' },
  { to: '/progress', icon: Trophy, labelKey: 'nav.progress' },
  { to: '/lessons', icon: BookOpen, labelKey: 'nav.lessons' },
  { to: '/declensions', icon: Layers, labelKey: 'nav.declensions' },
  { to: '/conjugations', icon: Zap, labelKey: 'nav.conjugations' },
  { to: '/dictations', icon: Headphones, labelKey: 'nav.dictations' },
  { to: '/cefr', icon: Map, labelKey: 'nav.cefr' },
  { to: '/naturalization', icon: Flag, labelKey: 'nav.naturalization' },
  { to: '/vocabulary', icon: Brain, labelKey: 'nav.vocabulary' },
  { to: '/dialogs', icon: MessageCircle, labelKey: 'nav.dialogs' },
  { to: '/practice', icon: Mic, labelKey: 'nav.practice' },
  { to: '/games', icon: Gamepad2, labelKey: 'nav.games' },
  { to: '/exam', icon: GraduationCap, labelKey: 'nav.exam' },
  { to: '/tutor', icon: Sparkles, labelKey: 'nav.tutor' },
  { to: '/settings', icon: Settings, labelKey: 'nav.settings' },
]

type SidebarProps = {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const { t, lang } = useTranslation()
  const streak = useStore((s) => s.progress.streak)
  const level = useStore((s) => s.progress.estimatedLevel)
  const unlockedCount = useStore((s) => s.progress.unlockedAchievements.length)
  const ttsEngine = useStore((s) => s.settings.ttsEngine)
  const [neuralOk, setNeuralOk] = useState<boolean | null>(null)

  useEffect(() => {
    if (ttsEngine === 'neural') {
      checkTtsHealth().then(setNeuralOk)
    }
  }, [ttsEngine])

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-border bg-surface transition-transform duration-200 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}
    >
      <div className="border-b border-border px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-xl font-serif text-accent">
            Ā
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-tight">{t('app.title')}</h1>
            <p className="text-xs text-muted">{t('app.subtitle')}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map(({ to, icon: Icon, labelKey }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onMobileClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-accent/15 text-accent'
                  : 'text-muted hover:bg-surface-2 hover:text-text'
              }`
            }
          >
            <Icon size={18} />
            {t(labelKey)}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border px-6 py-4">
        <div className="mb-2 text-xs text-muted">
          {t('sidebar.levelValue', { level })}
          {' · '}
          <span className="text-gold">{t('sidebar.achievementsBadge', { count: unlockedCount })}</span>
        </div>
        {streak > 0 && (
          <div className="mb-3 flex items-center gap-2 text-sm">
            <span className="text-gold">🔥</span>
            <span>
              {t('sidebar.streakValue', { count: streak, unit: dayCountLabel(lang, streak) })}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted">
          <Volume2 size={14} />
          <span>
            {ttsEngine === 'neural'
              ? neuralOk
                ? t('sidebar.ttsNeural')
                : neuralOk === false
                  ? t('sidebar.ttsNeuralOffline')
                  : t('sidebar.ttsNeuralLoading')
              : t('sidebar.ttsBrowser')}
          </span>
        </div>
      </div>
    </aside>
  )
}
