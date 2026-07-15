import { useRef } from 'react'
import { Download, Upload } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'

type Props = {
  importMsg: string
  onExport: () => void
  onImport: (file: File, mode: 'merge' | 'replace') => void
}

export function SettingsBackupSection({ importMsg, onExport, onImport }: Props) {
  const { t } = useTranslation()
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <section className="glass rounded-2xl p-6">
      <h2 className="mb-4 font-semibold">{t('settings.backup')}</h2>
      <p className="mb-4 text-sm text-muted">{t('settings.backupDesc')}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onExport}
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
          void onImport(file, mode)
          e.target.value = ''
        }}
      />
      {importMsg && <p className="mt-3 text-sm text-accent">{importMsg}</p>}
    </section>
  )
}
