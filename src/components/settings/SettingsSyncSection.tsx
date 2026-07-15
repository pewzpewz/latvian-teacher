import { Cloud, Copy, Download, Upload } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'
import { generateSyncId } from '../../lib/syncCrypto'
import type { SettingsDraftProps } from './types'

type Props = SettingsDraftProps & {
  syncPassphrase: string
  setSyncPassphrase: (value: string) => void
  syncMsg: string
  syncBusy: boolean
  onCopySyncId: () => void
  onSyncUpload: () => void
  onSyncDownload: (mode: 'merge' | 'replace') => void
}

export function SettingsSyncSection({
  local,
  setLocal,
  syncPassphrase,
  setSyncPassphrase,
  syncMsg,
  syncBusy,
  onCopySyncId,
  onSyncUpload,
  onSyncDownload,
}: Props) {
  const { t } = useTranslation()

  return (
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
            onClick={() => void onCopySyncId()}
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
          onClick={() => void onSyncUpload()}
          className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm hover:border-accent/40 disabled:opacity-50"
        >
          <Upload size={14} />
          {t('settings.syncUpload')}
        </button>
        <button
          type="button"
          disabled={syncBusy}
          onClick={() => void onSyncDownload('merge')}
          className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm hover:border-accent/40 disabled:opacity-50"
        >
          <Download size={14} />
          {t('settings.syncDownloadMerge')}
        </button>
        <button
          type="button"
          disabled={syncBusy}
          onClick={() => void onSyncDownload('replace')}
          className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm hover:border-accent/40 disabled:opacity-50"
        >
          <Download size={14} />
          {t('settings.syncDownloadReplace')}
        </button>
      </div>
      {syncMsg && <p className="mt-3 text-sm text-accent">{syncMsg}</p>}
    </section>
  )
}
