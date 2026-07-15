import { Key, Sparkles } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'
import type { SettingsDraftProps } from './types'

export function SettingsAiSection({ local, setLocal }: SettingsDraftProps) {
  const { t } = useTranslation()

  return (
    <section className="glass rounded-2xl p-6">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles size={18} className="text-accent" />
        <h2 className="font-semibold">{t('settings.aiTutor')}</h2>
      </div>
      <label className="mb-4 block">
        <span className="mb-1 block text-sm text-muted">{t('settings.aiProvider')}</span>
        <select
          value={local.aiProvider}
          onChange={(e) => {
            const provider = e.target.value as typeof local.aiProvider
            const defaultModels = {
              gemini: 'gemini-3-flash-preview',
              openai: 'gpt-4o-mini',
              anthropic: 'claude-3-5-haiku-20241022',
              local: 'gemma2:9b',
            }
            setLocal({
              ...local,
              aiProvider: provider,
              aiModel: defaultModels[provider],
            })
          }}
          className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 outline-none focus:border-accent"
        >
          <option value="gemini">{t('settings.aiProviderGemini')}</option>
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="local">{t('settings.aiProviderLocal')}</option>
        </select>
        {local.aiProvider === 'gemini' && (
          <p className="mt-1 text-xs text-muted">
            {t('settings.aiGeminiKeyHint')}{' '}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-accent underline">
              aistudio.google.com/apikey
            </a>
          </p>
        )}
      </label>
      <label className="mb-4 block">
        <span className="mb-1 block text-sm text-muted">{t('settings.aiModel')}</span>
        {local.aiProvider === 'gemini' ? (
          <select
            value={local.aiModel}
            onChange={(e) => setLocal({ ...local, aiModel: e.target.value })}
            className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 outline-none focus:border-accent"
          >
            <option value="gemini-3-flash-preview">{t('settings.aiModelGeminiRecommended')}</option>
            <option value="gemini-2.0-flash">gemini-2.0-flash</option>
            <option value="gemini-2.0-flash-lite">gemini-2.0-flash-lite</option>
          </select>
        ) : (
          <input
            type="text"
            value={local.aiModel}
            onChange={(e) => setLocal({ ...local, aiModel: e.target.value })}
            placeholder="gemini-2.5-flash"
            className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 outline-none focus:border-accent"
          />
        )}
      </label>
      <label className="block">
        <span className="mb-1 flex items-center gap-1 text-sm text-muted">
          <Key size={14} />
          {t('settings.aiApiKey')}
        </span>
        <input
          type="password"
          value={local.aiApiKey}
          onChange={(e) => setLocal({ ...local, aiApiKey: e.target.value })}
          placeholder={local.aiProvider === 'gemini' ? 'AIza...' : 'sk-...'}
          className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 outline-none focus:border-accent"
        />
        <p className="mt-1 text-xs text-muted">{t('settings.aiApiKeyHint')}</p>
      </label>
    </section>
  )
}
