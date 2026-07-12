/**
 * IndexedDB persistence (idb-keyval) with one-time localStorage migration.
 */
import { get, set } from 'idb-keyval'

const META_KEY = 'lv-storage-meta'
const PROGRESS_KEY = 'lv-progress'
const SETTINGS_KEY = 'lv-settings'

const LS_PROGRESS = 'lv-progress'
const LS_SETTINGS = 'lv-settings'

type StorageMeta = {
  version: number
  migratedFromLocalStorage: boolean
  migratedAt?: string
}

export async function getStorageMeta(): Promise<StorageMeta | null> {
  return (await get(META_KEY)) as StorageMeta | null
}

export async function migrateFromLocalStorage(): Promise<boolean> {
  const meta = await getStorageMeta()
  if (meta?.migratedFromLocalStorage) return false

  let migrated = false

  const lsProgress = localStorage.getItem(LS_PROGRESS)
  if (lsProgress && !(await get(PROGRESS_KEY))) {
    await set(PROGRESS_KEY, JSON.parse(lsProgress))
    migrated = true
  }

  const lsSettings = localStorage.getItem(LS_SETTINGS)
  if (lsSettings && !(await get(SETTINGS_KEY))) {
    await set(SETTINGS_KEY, JSON.parse(lsSettings))
    migrated = true
  }

  await set(META_KEY, {
    version: 2,
    migratedFromLocalStorage: true,
    migratedAt: new Date().toISOString(),
  } satisfies StorageMeta)

  if (migrated) {
    localStorage.removeItem(LS_PROGRESS)
    localStorage.removeItem(LS_SETTINGS)
  }

  return migrated
}

export async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await get(key)
    if (raw == null) return null
    return raw as T
  } catch {
    return null
  }
}

export async function writeJson(key: string, value: unknown): Promise<void> {
  await set(key, value)
}

export async function readProgressRaw(): Promise<unknown | null> {
  return readJson(PROGRESS_KEY)
}

export async function writeProgressRaw(value: unknown): Promise<void> {
  await writeJson(PROGRESS_KEY, value)
}

export async function readSettingsRaw(): Promise<unknown | null> {
  return readJson(SETTINGS_KEY)
}

export async function writeSettingsRaw(value: unknown): Promise<void> {
  await writeJson(SETTINGS_KEY, value)
}

/** Test helper — reset storage */
export async function clearAppStorage(): Promise<void> {
  await set(META_KEY, null)
  await set(PROGRESS_KEY, null)
  await set(SETTINGS_KEY, null)
}

export const storageKeys = { META_KEY, PROGRESS_KEY, SETTINGS_KEY, LS_PROGRESS, LS_SETTINGS }
