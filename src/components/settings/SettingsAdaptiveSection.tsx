import { Sparkles } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'
import type { SettingsDraftProps } from './types'

export function SettingsAdaptiveSection({ local, setLocal }: SettingsDraftProps) {
  const { t } = useTranslation()

  return (
    <section className="glass rounded-2xl p-6">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles size={18} className="text-accent" />
        <h2 className="font-semibold">{t('settings.adaptiveTitle')}</h2>
      </div>
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={local.adaptiveEnabled ?? true}
          onChange={(e) => setLocal({ ...local, adaptiveEnabled: e.target.checked })}
          className="h-4 w-4 accent-accent"
        />
        <span className="text-sm">{t('settings.adaptiveToggle')}</span>
      </label>
      <p className="mt-2 text-xs text-muted">{t('settings.adaptiveHint')}</p>
    </section>
  )
}
