import { Globe } from 'lucide-react'
import type { UiLanguage } from '../../i18n'
import { useTranslation } from '../../hooks/useTranslation'
import type { SettingsDraftProps } from './types'

export function SettingsLanguageSection({ local, setLocal }: SettingsDraftProps) {
  const { t } = useTranslation()

  return (
    <section className="glass rounded-2xl p-6">
      <div className="mb-4 flex items-center gap-2">
        <Globe size={18} className="text-accent" />
        <h2 className="font-semibold">{t('settings.uiLanguage')}</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: 'ru', label: t('settings.langRu') },
            { id: 'en', label: t('settings.langEn') },
            { id: 'lv', label: t('settings.langLv') },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setLocal({ ...local, uiLanguage: id as UiLanguage })}
            className={`rounded-xl px-4 py-2 text-sm ${local.uiLanguage === id ? 'bg-accent text-white' : 'border border-border'}`}
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  )
}
