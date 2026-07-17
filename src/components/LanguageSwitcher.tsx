import type { UiLanguage } from '../i18n'
import { useStore } from '../store/useStore'
import { useTranslation } from '../hooks/useTranslation'

const OPTIONS: { id: UiLanguage; short: string }[] = [
  { id: 'ru', short: 'RU' },
  { id: 'en', short: 'EN' },
  { id: 'lv', short: 'LV' },
]

type Props = {
  className?: string
  size?: 'sm' | 'md'
}

export function LanguageSwitcher({ className = '', size = 'sm' }: Props) {
  const { t } = useTranslation()
  const uiLanguage = useStore((s) => s.settings.uiLanguage)
  const updateSettings = useStore((s) => s.updateSettings)

  const pad = size === 'sm' ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1.5 text-xs'

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-lg border border-border bg-surface-2/60 p-0.5 ${className}`}
      role="group"
      aria-label={t('settings.uiLanguage')}
    >
      {OPTIONS.map(({ id, short }) => (
        <button
          key={id}
          type="button"
          onClick={() => {
            if (id !== uiLanguage) updateSettings({ uiLanguage: id })
          }}
          className={`rounded-md font-medium tracking-wide transition-colors ${pad} ${
            uiLanguage === id
              ? 'bg-accent text-white'
              : 'text-muted hover:bg-surface hover:text-text'
          }`}
          aria-pressed={uiLanguage === id}
          title={
            id === 'ru' ? t('settings.langRu') : id === 'en' ? t('settings.langEn') : t('settings.langLv')
          }
        >
          {short}
        </button>
      ))}
    </div>
  )
}
