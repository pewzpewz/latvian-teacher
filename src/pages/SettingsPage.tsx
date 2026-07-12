import { useState, useRef } from 'react'
import { Save, RotateCcw, User, Volume2, Key, Sparkles, Download, Upload } from 'lucide-react'
import { useStore } from '../store/useStore'
import {
  downloadBackup,
  exportBackup,
  parseBackupFile,
} from '../lib/backup'

export function SettingsPage() {
  const { settings, updateSettings, progress, restoreBackup } = useStore()
  const [local, setLocal] = useState(settings)
  const [saved, setSaved] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const save = () => {
    updateSettings(local)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const resetProgress = () => {
    if (confirm('Сбросить весь прогресс? Это нельзя отменить.')) {
      localStorage.removeItem('lv-progress')
      window.location.reload()
    }
  }

  const handleExport = () => {
    downloadBackup(exportBackup(progress, local))
  }

  const handleImport = async (file: File, mode: 'merge' | 'replace') => {
    try {
      const text = await file.text()
      const backup = parseBackupFile(text)
      if (mode === 'replace' && !confirm('Заменить все данные содержимым файла?')) return
      restoreBackup(backup, mode)
      setImportMsg(mode === 'merge' ? 'Данные объединены' : 'Данные восстановлены')
      setTimeout(() => setImportMsg(''), 3000)
    } catch (e) {
      setImportMsg(e instanceof Error ? e.message : 'Ошибка импорта')
    }
  }

  return (
    <div>
      <h1 className="gradient-text mb-2 text-3xl font-bold">Настройки</h1>
      <p className="mb-8 text-muted">Персонализация вашего учителя</p>

      <div className="space-y-6">
        <section className="glass rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <User size={18} className="text-accent" />
            <h2 className="font-semibold">Профиль</h2>
          </div>
          <label className="mb-4 block">
            <span className="mb-1 block text-sm text-muted">Ваше имя</span>
            <input
              type="text"
              value={local.userName}
              onChange={(e) => setLocal({ ...local, userName: e.target.value })}
              placeholder="Как к вам обращаться?"
              className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-muted">Цель на день (минут)</span>
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

        <section className="glass rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <Volume2 size={18} className="text-gold" />
            <h2 className="font-semibold">Озвучка</h2>
          </div>

          <label className="mb-4 block">
            <span className="mb-2 block text-sm text-muted">Движок озвучки</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setLocal({ ...local, ttsEngine: 'neural' })}
                className={`rounded-xl px-4 py-2 text-sm ${local.ttsEngine === 'neural' ? 'bg-accent text-white' : 'border border-border'}`}
              >
                Neural (рекомендуется)
              </button>
              <button
                type="button"
                onClick={() => setLocal({ ...local, ttsEngine: 'browser' })}
                className={`rounded-xl px-4 py-2 text-sm ${local.ttsEngine === 'browser' ? 'bg-accent text-white' : 'border border-border'}`}
              >
                Браузер
              </button>
            </div>
            <p className="mt-1 text-xs text-muted">
              Neural — натуральные голоса Microsoft (Everita / Nils). Браузер — резервный вариант.
            </p>
          </label>

          {local.ttsEngine === 'neural' && (
            <label className="mb-4 block">
              <span className="mb-1 block text-sm text-muted">Голос</span>
              <select
                value={local.ttsVoice}
                onChange={(e) => setLocal({ ...local, ttsVoice: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 outline-none focus:border-accent"
              >
                <option value="lv-LV-EveritaNeural">Everita — женский, дружелюбный</option>
                <option value="lv-LV-NilsNeural">Nils — мужской, нейтральный</option>
              </select>
            </label>
          )}

          <label className="block">
            <span className="mb-1 block text-sm text-muted">
              Скорость речи: {local.speechRate.toFixed(2)}
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
        </section>

        <section className="glass rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-accent" />
            <h2 className="font-semibold">Адаптивное обучение</h2>
          </div>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={local.adaptiveEnabled ?? true}
              onChange={(e) => setLocal({ ...local, adaptiveEnabled: e.target.checked })}
              className="h-4 w-4 accent-accent"
            />
            <span className="text-sm">Подстраивать контент под мой прогресс</span>
          </label>
          <p className="mt-2 text-xs text-muted">
            Система отслеживает ошибки, слабые темы и автоматически рекомендует что учить
          </p>
        </section>

        <section className="glass rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-accent" />
            <h2 className="font-semibold">AI-репетитор</h2>
          </div>
          <label className="mb-4 block">
            <span className="mb-1 block text-sm text-muted">Провайдер</span>
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
              <option value="gemini">Google Gemini (бесплатно, рекомендуется)</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="local">Локальный (Ollama)</option>
            </select>
            {local.aiProvider === 'gemini' && (
              <p className="mt-1 text-xs text-muted">
                Ключ в server/.env → GEMINI_API_KEY. Получить:{' '}
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-accent underline">
                  aistudio.google.com/apikey
                </a>
              </p>
            )}
          </label>
          <label className="mb-4 block">
            <span className="mb-1 block text-sm text-muted">Модель</span>
            {local.aiProvider === 'gemini' ? (
              <select
                value={local.aiModel}
                onChange={(e) => setLocal({ ...local, aiModel: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 outline-none focus:border-accent"
              >
                <option value="gemini-3-flash-preview">gemini-3-flash-preview (рекомендуется)</option>
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
              API-ключ (опционально, запасной — в браузере)
            </span>
            <input
              type="password"
              value={local.aiApiKey}
              onChange={(e) => setLocal({ ...local, aiApiKey: e.target.value })}
              placeholder={local.aiProvider === 'gemini' ? 'AIza...' : 'sk-...'}
              className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 outline-none focus:border-accent"
            />
            <p className="mt-1 text-xs text-muted">
              Основной ключ лучше хранить в server/.env — так безопаснее
            </p>
          </label>
        </section>

        <section className="glass rounded-2xl p-6">
          <h2 className="mb-4 font-semibold">Резервная копия</h2>
          <p className="mb-4 text-sm text-muted">
            Экспорт прогресса и настроек в JSON. Можно перенести на другой браузер или устройство.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm hover:border-accent/40"
            >
              <Download size={14} />
              Скачать backup
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm hover:border-accent/40"
            >
              <Upload size={14} />
              Импорт (замена)
            </button>
            <button
              type="button"
              onClick={() => {
                fileRef.current?.setAttribute('data-mode', 'merge')
                fileRef.current?.click()
              }}
              className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm hover:border-accent/40"
            >
              <Upload size={14} />
              Импорт (объединить)
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const mode = fileRef.current?.getAttribute('data-mode') === 'merge' ? 'merge' : 'replace'
              fileRef.current?.removeAttribute('data-mode')
              void handleImport(file, mode)
              e.target.value = ''
            }}
          />
          {importMsg && <p className="mt-3 text-sm text-accent">{importMsg}</p>}
        </section>

        <section className="glass rounded-2xl p-6">
          <h2 className="mb-4 font-semibold">Данные</h2>
          <div className="mb-4 space-y-1 text-sm text-muted">
            <p>Уроков пройдено: {progress.completedLessons.length}</p>
            <p>Слов выучено: {progress.wordsLearned}</p>
            <p>Время: {progress.totalStudyMinutes} мин</p>
          </div>
          <button
            type="button"
            onClick={resetProgress}
            className="flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
          >
            <RotateCcw size={14} />
            Сбросить прогресс
          </button>
        </section>

        <button
          type="button"
          onClick={save}
          className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-medium text-white hover:opacity-90"
        >
          <Save size={18} />
          {saved ? 'Сохранено!' : 'Сохранить настройки'}
        </button>
      </div>
    </div>
  )
}
