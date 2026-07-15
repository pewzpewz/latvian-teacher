import { Save } from 'lucide-react'
import { SettingsAdaptiveSection } from '../components/settings/SettingsAdaptiveSection'
import { SettingsAiSection } from '../components/settings/SettingsAiSection'
import { SettingsBackupSection } from '../components/settings/SettingsBackupSection'
import { SettingsDataSection } from '../components/settings/SettingsDataSection'
import { SettingsLanguageSection } from '../components/settings/SettingsLanguageSection'
import { SettingsNotificationsSection } from '../components/settings/SettingsNotificationsSection'
import { SettingsProfileSection } from '../components/settings/SettingsProfileSection'
import { SettingsSpeechSection } from '../components/settings/SettingsSpeechSection'
import { SettingsSyncSection } from '../components/settings/SettingsSyncSection'
import { useSettingsPageState } from '../components/settings/useSettingsPageState'

export function SettingsPage() {
  const {
    t,
    local,
    setLocal,
    saved,
    save,
    progress,
    importMsg,
    syncPassphrase,
    setSyncPassphrase,
    syncMsg,
    syncBusy,
    handleExport,
    handleImport,
    handleSyncUpload,
    handleSyncDownload,
    copySyncId,
    resetProgress,
  } = useSettingsPageState()

  const draft = { local, setLocal }

  return (
    <div>
      <h1 className="gradient-text mb-2 text-3xl font-bold">{t('settings.title')}</h1>
      <p className="mb-8 text-muted">{t('settings.subtitle')}</p>

      <div className="space-y-6">
        <SettingsProfileSection {...draft} />
        <SettingsSpeechSection {...draft} />
        <SettingsLanguageSection {...draft} />
        <SettingsNotificationsSection {...draft} />
        <SettingsAdaptiveSection {...draft} />
        <SettingsAiSection {...draft} />
        <SettingsSyncSection
          {...draft}
          syncPassphrase={syncPassphrase}
          setSyncPassphrase={setSyncPassphrase}
          syncMsg={syncMsg}
          syncBusy={syncBusy}
          onCopySyncId={() => void copySyncId()}
          onSyncUpload={() => void handleSyncUpload()}
          onSyncDownload={(mode) => void handleSyncDownload(mode)}
        />
        <SettingsBackupSection
          importMsg={importMsg}
          onExport={handleExport}
          onImport={(file, mode) => void handleImport(file, mode)}
        />
        <SettingsDataSection progress={progress} onResetProgress={resetProgress} />

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
