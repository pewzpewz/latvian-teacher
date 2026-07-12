import { useState, useRef } from 'react'
import { Save, RotateCcw, User, Volume2, Key, Sparkles, Download, Upload, Bell, Globe, Cloud, Copy } from 'lucide-react'
import { useStore } from '../store/useStore'
import {
  downloadBackup,
  exportBackup,
  parseBackupFile,
} from '../lib/backup'
import { encryptBackup, decryptBackup, generateSyncId, validateSyncPassphrase } from '../lib/syncCrypto'
import { pushSyncBlob, pullSyncBlob } from '../lib/syncClient'
import { useTranslation } from '../hooks/useTranslation'
import { requestNotificationPermission, isNotificationSupported } from '../lib/streakReminder'
import type { UiLanguage } from '../i18n'

export function SettingsPage() {
  const { t } = useTranslation()
  const { settings, updateSettings, progress, restoreBackup } = useStore()
  const [local, setLocal] = useState(settings)
  const [saved, setSaved] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const [syncPassphrase, setSyncPassphrase] = useState('')
  const [syncMsg, setSyncMsg] = useState('')
  const [syncBusy, setSyncBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const save = () => {
    updateSettings(local)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const resetProgress = () => {
    if (confirm(t('settings.resetConfirm'))) {
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
      if (mode === 'replace' && !confirm(t('settings.importReplaceConfirm'))) return
      restoreBackup(backup, mode)
      setImportMsg(mode === 'merge' ? t('settings.backupMerged') : t('settings.backupRestored'))
      setTimeout(() => setImportMsg(''), 3000)
    } catch (e) {
      setImportMsg(e instanceof Error ? e.message : t('common.importError'))
    }
  }

  const showSyncMsg = (msg: string) => {
    setSyncMsg(msg)
    setTimeout(() => setSyncMsg(''), 4000)
  }

  const ensureSyncId = (): string => {
    if (local.syncId) return local.syncId
    const id = generateSyncId()
    const next = { ...local, syncId: id }
    setLocal(next)
    updateSettings({ syncId: id })
    return id
  }

  const handleSyncUpload = async () => {
    const err = validateSyncPassphrase(syncPassphrase)
    if (err) {
      showSyncMsg(err)
      return
    }
    setSyncBusy(true)
    try {
      const syncId = ensureSyncId()
      const blob = await encryptBackup(exportBackup(progress, local), syncPassphrase)
      const updatedAt = await pushSyncBlob(syncId, blob)
      const next = { ...local, syncId, lastSyncedAt: updatedAt }
      setLocal(next)
      updateSettings({ syncId, lastSyncedAt: updatedAt })
      showSyncMsg(t('settings.syncUploaded'))
    } catch (e) {
      showSyncMsg(e instanceof Error ? e.message : t('common.uploadError'))
    } finally {
      setSyncBusy(false)
    }
  }

  const handleSyncDownload = async (mode: 'merge' | 'replace') => {
    const syncId = local.syncId?.trim()
    if (!syncId) {
      showSyncMsg(t('settings.syncNeedId'))
      return
    }
    const err = validateSyncPassphrase(syncPassphrase)
    if (err) {
      showSyncMsg(err)
      return
    }
    if (mode === 'replace' && !confirm(t('settings.syncReplaceConfirm'))) return
    setSyncBusy(true)
    try {
      const remote = await pullSyncBlob(syncId)
      if (!remote) {
        showSyncMsg(t('settings.syncNoServerData'))
        return
      }
      const backup = await decryptBackup(remote.blob, syncPassphrase)
      restoreBackup(backup, mode)
      const next = { ...local, syncId, lastSyncedAt: remote.updatedAt }
      setLocal(next)
      updateSettings({ syncId, lastSyncedAt: remote.updatedAt })
      showSyncMsg(mode === 'merge' ? t('settings.syncMerged') : t('settings.syncRestored'))
    } catch (e) {
      showSyncMsg(e instanceof Error ? e.message : t('common.downloadError'))
    } finally {
      setSyncBusy(false)
    }
  }

  const copySyncId = async () => {
    const id = local.syncId ?? ensureSyncId()
    try {
      await navigator.clipboard.writeText(id)
      showSyncMsg(t('settings.syncIdCopied'))
    } catch {
      showSyncMsg(id)
    }
  }

  return (
    <div>
      <h1 className="gradient-text mb-2 text-3xl font-bold">{t('settings.title')}</h1>
      <p className="mb-8 text-muted">{t('settings.subtitle')}</p>

      <div className="space-y-6">
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
        </section>

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

        <section className="glass rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <Bell size={18} className="text-gold" />
            <h2 className="font-semibold">{t('settings.notifications')}</h2>
          </div>
          {!isNotificationSupported() ? (
            <p className="text-sm text-muted">{t('settings.notificationsUnsupported')}</p>
          ) : (
            <>
              <label className="mb-4 flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={local.streakReminderEnabled ?? false}
                  onChange={async (e) => {
                    const enabled = e.target.checked
                    if (enabled) {
                      const perm = await requestNotificationPermission()
                      if (perm !== 'granted') return
                    }
                    setLocal({ ...local, streakReminderEnabled: enabled })
                  }}
                  className="h-4 w-4 accent-accent"
                />
                <span className="text-sm">{t('settings.streakReminder')}</span>
              </label>
              <p className="mb-4 text-xs text-muted">{t('settings.streakReminderDesc')}</p>
              {local.streakReminderEnabled && (
                <label className="block">
                  <span className="mb-1 block text-sm text-muted">{t('settings.reminderHour')}</span>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={local.streakReminderHour ?? 19}
                    onChange={(e) =>
                      setLocal({ ...local, streakReminderHour: Number(e.target.value) })
                    }
                    className="w-24 rounded-xl border border-border bg-surface-2 px-4 py-2.5 outline-none focus:border-accent"
                  />
                </label>
              )}
            </>
          )}
        </section>

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
            <p className="mt-1 text-xs text-muted">
              {t('settings.aiApiKeyHint')}
            </p>
          </label>
        </section>

        <section className="glass rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <Cloud size={18} className="text-accent" />
            <h2 className="font-semibold">{t('settings.syncTitle')}</h2>
          </div>
          <p className="mb-4 text-sm text-muted">{t('settings.syncDesc')}</p>

          <label className="mb-4 block">
            <span className="mb-1 block text-sm text-muted">Sync ID</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={local.syncId ?? ''}
                onChange={(e) => setLocal({ ...local, syncId: e.target.value || null })}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="min-w-0 flex-1 rounded-xl border border-border bg-surface-2 px-4 py-2.5 font-mono text-sm outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={() => setLocal({ ...local, syncId: generateSyncId() })}
                className="shrink-0 rounded-xl border border-border px-3 py-2 text-sm hover:border-accent/40"
              >
                {t('settings.syncNewId')}
              </button>
              <button
                type="button"
                onClick={() => void copySyncId()}
                className="shrink-0 rounded-xl border border-border px-3 py-2 text-sm hover:border-accent/40"
                title={t('common.copy')}
              >
                <Copy size={14} />
              </button>
            </div>
          </label>

          <label className="mb-4 block">
            <span className="mb-1 block text-sm text-muted">{t('settings.syncPassphrase')}</span>
            <input
              type="password"
              value={syncPassphrase}
              onChange={(e) => setSyncPassphrase(e.target.value)}
              placeholder={t('settings.syncPassphrasePlaceholder')}
              className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 outline-none focus:border-accent"
            />
            <p className="mt-1 text-xs text-muted">{t('settings.syncPassphraseHint')}</p>
          </label>

          {local.lastSyncedAt && (
            <p className="mb-4 text-xs text-muted">
              {t('settings.syncLast')}: {new Date(local.lastSyncedAt).toLocaleString()}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={syncBusy}
              onClick={() => void handleSyncUpload()}
              className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm hover:border-accent/40 disabled:opacity-50"
            >
              <Upload size={14} />
              {t('settings.syncUpload')}
            </button>
            <button
              type="button"
              disabled={syncBusy}
              onClick={() => void handleSyncDownload('merge')}
              className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm hover:border-accent/40 disabled:opacity-50"
            >
              <Download size={14} />
              {t('settings.syncDownloadMerge')}
            </button>
            <button
              type="button"
              disabled={syncBusy}
              onClick={() => void handleSyncDownload('replace')}
              className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm hover:border-accent/40 disabled:opacity-50"
            >
              <Download size={14} />
              {t('settings.syncDownloadReplace')}
            </button>
          </div>
          {syncMsg && <p className="mt-3 text-sm text-accent">{syncMsg}</p>}
        </section>

        <section className="glass rounded-2xl p-6">
          <h2 className="mb-4 font-semibold">{t('settings.backup')}</h2>
          <p className="mb-4 text-sm text-muted">{t('settings.backupDesc')}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm hover:border-accent/40"
            >
              <Download size={14} />
              {t('settings.backupDownload')}
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm hover:border-accent/40"
            >
              <Upload size={14} />
              {t('settings.backupImportReplace')}
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
              {t('settings.backupImportMerge')}
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
          <h2 className="mb-4 font-semibold">{t('settings.data')}</h2>
          <div className="mb-4 space-y-1 text-sm text-muted">
            <p>{t('settings.dataLessons', { count: progress.completedLessons.length })}</p>
            <p>{t('settings.dataWords', { count: progress.wordsLearned })}</p>
            <p>{t('settings.dataTime', { minutes: progress.totalStudyMinutes })}</p>
          </div>
          <button
            type="button"
            onClick={resetProgress}
            className="flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
          >
            <RotateCcw size={14} />
            {t('settings.resetProgress')}
          </button>
        </section>

        <button
          type="button"
          onClick={save}
          className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-medium text-white hover:opacity-90"
        >
          <Save size={18} />
          {saved ? t('common.saved') : t('common.save')}
        </button>
      </div>
    </div>
  )
}
