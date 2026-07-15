import { User } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'
import type { SettingsDraftProps } from './types'

export function SettingsProfileSection({ local, setLocal }: SettingsDraftProps) {
  const { t } = useTranslation()

  return (
    <section className="glass rounded-2xl p-6">
      <div className="mb-4 flex items-center gap-2">
        <User size={18} className="text-accent" />
        <h2 className="font-semibold">{t('settings.profile')}</h2>
      </div>
      <label className="mb-4 block">
        <span className="mb-1 block text-sm text-muted">{t('settings.yourName')}</span>
        <input
          type="text"
          value={local.userName}
          onChange={(e) => setLocal({ ...local, userName: e.target.value })}
          placeholder={t('settings.yourNamePlaceholder')}
          className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 outline-none focus:border-accent"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-muted">{t('settings.dailyGoalMinutes')}</span>
        <input
          type="number"
          min={5}
          max={120}
          value={local.dailyGoal}
          onChange={(e) => setLocal({ ...local, dailyGoal: Number(e.target.value) })}
          className="w-32 rounded-xl border border-border bg-surface-2 px-4 py-2.5 outline-none focus:border-accent"
        />
      </label>
    </section>
  )
}
