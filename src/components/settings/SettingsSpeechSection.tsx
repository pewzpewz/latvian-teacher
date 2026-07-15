import { Volume2 } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'
import type { SettingsDraftProps } from './types'

export function SettingsSpeechSection({ local, setLocal }: SettingsDraftProps) {
  const { t } = useTranslation()

  return (
    <section className="glass rounded-2xl p-6">
      <div className="mb-4 flex items-center gap-2">
        <Volume2 size={18} className="text-gold" />
        <h2 className="font-semibold">{t('settings.tts')}</h2>
      </div>

      <label className="mb-4 block">
        <span className="mb-2 block text-sm text-muted">{t('settings.ttsEngine')}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setLocal({ ...local, ttsEngine: 'neural' })}
            className={`rounded-xl px-4 py-2 text-sm ${local.ttsEngine === 'neural' ? 'bg-accent text-white' : 'border border-border'}`}
          >
            {t('settings.ttsNeural')}
          </button>
          <button
            type="button"
            onClick={() => setLocal({ ...local, ttsEngine: 'browser' })}
            className={`rounded-xl px-4 py-2 text-sm ${local.ttsEngine === 'browser' ? 'bg-accent text-white' : 'border border-border'}`}
          >
            {t('settings.ttsBrowser')}
          </button>
        </div>
        <p className="mt-1 text-xs text-muted">{t('settings.ttsEngineHint')}</p>
      </label>

      {local.ttsEngine === 'neural' && (
        <label className="mb-4 block">
          <span className="mb-1 block text-sm text-muted">{t('settings.voice')}</span>
          <select
            value={local.ttsVoice}
            onChange={(e) => setLocal({ ...local, ttsVoice: e.target.value })}
            className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 outline-none focus:border-accent"
          >
            <option value="lv-LV-EveritaNeural">{t('settings.voiceEverita')}</option>
            <option value="lv-LV-NilsNeural">{t('settings.voiceNils')}</option>
          </select>
        </label>
      )}

      <label className="block">
        <span className="mb-1 block text-sm text-muted">
          {t('settings.speechRate', { rate: local.speechRate.toFixed(2) })}
        </span>
        <input
          type="range"
          min={0.5}
          max={1.2}
          step={0.05}
          value={local.speechRate}
          onChange={(e) => setLocal({ ...local, speechRate: Number(e.target.value) })}
          className="w-full accent-accent"
        />
      </label>

      <label className="mt-4 block">
        <span className="mb-2 block text-sm text-muted">{t('settings.pronunciationEngine')}</span>
        <div className="flex flex-wrap gap-2">
          {(['auto', 'gemini', 'stt'] as const).map((engine) => (
            <button
              key={engine}
              type="button"
              onClick={() => setLocal({ ...local, pronunciationEngine: engine })}
              className={`rounded-xl px-4 py-2 text-sm ${
                local.pronunciationEngine === engine ? 'bg-accent text-white' : 'border border-border'
              }`}
            >
              {engine === 'auto'
                ? t('settings.pronunciationAuto')
                : engine === 'gemini'
                  ? t('settings.pronunciationGemini')
                  : t('settings.pronunciationStt')}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-muted">{t('settings.pronunciationEngineHint')}</p>
      </label>
    </section>
  )
}
