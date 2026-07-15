import { useState } from 'react'
import { useStore } from '../../store/useStore'
import {
  downloadBackup,
  exportBackup,
  parseBackupFile,
} from '../../lib/backup'
import { encryptBackup, decryptBackup, generateSyncId, validateSyncPassphrase } from '../../lib/syncCrypto'
import { pushSyncBlob, pullSyncBlob } from '../../lib/syncClient'
import { useTranslation } from '../../hooks/useTranslation'
import type { UserSettings } from '../../store/types'

export function useSettingsPageState() {
  const { t } = useTranslation()
  const { settings, updateSettings, progress, restoreBackup } = useStore()
  const [local, setLocal] = useState(settings)
  const [saved, setSaved] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const [syncPassphrase, setSyncPassphrase] = useState('')
  const [syncMsg, setSyncMsg] = useState('')
  const [syncBusy, setSyncBusy] = useState(false)

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
      const next: UserSettings = { ...local, syncId, lastSyncedAt: updatedAt }
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
      const next: UserSettings = { ...local, syncId, lastSyncedAt: remote.updatedAt }
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

  return {
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
  }
}
