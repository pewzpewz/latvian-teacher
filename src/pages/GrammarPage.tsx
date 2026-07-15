import { NavLink, Outlet } from 'react-router-dom'
import { Layers, Zap } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'

const tabs = [
  { to: '/grammar/declensions', icon: Layers, labelKey: 'grammarHub.tabDeclensions' },
  { to: '/grammar/conjugations', icon: Zap, labelKey: 'grammarHub.tabConjugations' },
] as const

export function GrammarPage() {
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
