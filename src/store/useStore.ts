import { create } from 'zustand'
import { createNewStoredCard } from '../lib/fsrsSrs'
import {
  migrateFromLocalStorage,
  readProgressRaw,
  readSettingsRaw,
} from '../lib/storage'
import { defaultProgress, defaultSettings } from './defaults'
import { migrateProgress, migrateSettings } from './migrations'
import { persistProgress, persistSettings } from './progressHelpers'
import { createStoreActions } from './storeActions'
import type { Store, UserProgress, UserSettings } from './types'

export type {
  SrsCard,
  ExerciseAttempt,
  CategoryStats,
  UserSettings,
  UserProgress,
} from './types'

export const useStore = create<Store>((set, get, api) => ({
  settings: defaultSettings,
  progress: defaultProgress,
  hydrated: false,
  achievementQueue: [],
  ...createStoreActions(set, get, api),
}))

export function initNewWord(wordId: string) {
  const store = useStore.getState()
  if (!store.progress.srsCards[wordId]) {
    const progress = { ...store.progress }
    progress.srsCards[wordId] = createNewStoredCard(wordId)
    persistProgress(progress)
    useStore.setState({ progress })
  }
}

let hydratePromise: Promise<void> | null = null

/** Load progress/settings from IndexedDB (migrates localStorage once). */
export function hydrateStore(): Promise<void> {
  if (hydratePromise) return hydratePromise

  hydratePromise = (async () => {
    await migrateFromLocalStorage()

    const rawSettings = await readSettingsRaw()
    const rawProgress = await readProgressRaw()

    const settings = migrateSettings((rawSettings as Partial<UserSettings> | null) ?? {})
    const progress = migrateProgress((rawProgress as Partial<UserProgress> | null) ?? {})

    persistProgress(progress)
    persistSettings(settings)

    useStore.setState({ settings, progress, hydrated: true })
  })().catch((e) => {
    console.error('hydrateStore failed:', safeHydrateError(e))
    useStore.setState({ hydrated: true })
  })

  return hydratePromise
}

function safeHydrateError(err: unknown): string {
  return err instanceof Error ? err.message : 'unknown error'
}
