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
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { checkTtsHealth } from '../lib/tts'

const navItems = [
  { to: '/', icon: Home, label: 'Главная' },
  { to: '/plan', icon: Target, label: 'Мой план' },
  { to: '/progress', icon: Trophy, label: 'Прогресс' },
  { to: '/lessons', icon: BookOpen, label: 'Уроки' },
  { to: '/vocabulary', icon: Brain, label: 'Словарь' },
  { to: '/dialogs', icon: MessageCircle, label: 'Диалоги' },
  { to: '/practice', icon: Mic, label: 'Практика' },
  { to: '/games', icon: Gamepad2, label: 'Игры' },
  { to: '/exam', icon: GraduationCap, label: 'Экзамен' },
  { to: '/tutor', icon: Sparkles, label: 'AI-репетитор' },
  { to: '/settings', icon: Settings, label: 'Настройки' },
]

type SidebarProps = {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
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
            <h1 className="text-sm font-semibold leading-tight">Latviešu Skolotājs</h1>
            <p className="text-xs text-muted">Учитель латышского</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map(({ to, icon: Icon, label }) => (
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
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border px-6 py-4">
        <div className="mb-2 text-xs text-muted">
          Уровень: <span className="font-medium text-accent">{level}</span>
          {' · '}
          <span className="text-gold">🏅 {unlockedCount}</span>
        </div>
        {streak > 0 && (
          <div className="mb-3 flex items-center gap-2 text-sm">
            <span className="text-gold">🔥</span>
            <span>
              Серия: <strong>{streak}</strong> {streak === 1 ? 'день' : 'дней'}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted">
          <Volume2 size={14} />
          <span>
            {ttsEngine === 'neural'
              ? neuralOk
                ? 'Neural TTS (Everita/Nils)'
                : neuralOk === false
                  ? 'Neural TTS offline'
                  : 'Neural TTS...'
              : 'Озвучка через браузер'}
          </span>
        </div>
      </div>
    </aside>
  )
}
