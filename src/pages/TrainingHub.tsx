import { NavLink, Outlet } from 'react-router-dom'
import { Mic, Headphones, Gamepad2 } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'

const tabs = [
  { to: '/training/pronunciation', icon: Mic, labelKey: 'trainingHub.tabPronunciation' },
  { to: '/training/dictation', icon: Headphones, labelKey: 'trainingHub.tabDictation' },
  { to: '/training/games', icon: Gamepad2, labelKey: 'trainingHub.tabGames' },
] as const

export function TrainingHub() {
  const { t } = useTranslation()

  return (
    <div>
      <div className="mb-6 flex gap-2 border-b border-border">
        {tabs.map(({ to, icon: Icon, labelKey }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-accent text-text'
                  : 'border-transparent text-muted hover:text-text'
              }`
            }
          >
            <Icon size={16} />
            {t(labelKey)}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  )
}
