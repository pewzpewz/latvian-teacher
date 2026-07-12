import { describe, it, expect, vi, beforeEach } from 'vitest'

const store = new Map<string, unknown>()
const ls = new Map<string, string>()

vi.stubGlobal('localStorage', {
  getItem: (k: string) => ls.get(k) ?? null,
  setItem: (k: string, v: string) => ls.set(k, v),
  removeItem: (k: string) => ls.delete(k),
  clear: () => ls.clear(),
})

vi.mock('idb-keyval', () => ({
  get: vi.fn(async (key: string) => store.get(key)),
  set: vi.fn(async (key: string, value: unknown) => {
    if (value === null || value === undefined) store.delete(key)
    else store.set(key, value)
  }),
}))

import {
  migrateFromLocalStorage,
  readProgressRaw,
  writeProgressRaw,
  storageKeys,
} from './storage'

describe('storage', () => {
  beforeEach(() => {
    store.clear()
    ls.clear()
  })

  it('migrates progress from localStorage to IDB', async () => {
    localStorage.setItem(
      storageKeys.LS_PROGRESS,
      JSON.stringify({ streak: 3, completedLessons: ['alphabet-1'] }),
    )

    const migrated = await migrateFromLocalStorage()
    expect(migrated).toBe(true)

    const progress = await readProgressRaw()
    expect(progress).toMatchObject({ streak: 3, completedLessons: ['alphabet-1'] })
    expect(localStorage.getItem(storageKeys.LS_PROGRESS)).toBeNull()
  })

  it('does not migrate twice', async () => {
    localStorage.setItem(storageKeys.LS_PROGRESS, JSON.stringify({ streak: 1 }))
    await migrateFromLocalStorage()
    localStorage.setItem(storageKeys.LS_PROGRESS, JSON.stringify({ streak: 99 }))

    const again = await migrateFromLocalStorage()
    expect(again).toBe(false)

    const progress = (await readProgressRaw()) as { streak: number }
    expect(progress.streak).toBe(1)
  })

  it('writeProgressRaw persists to IDB', async () => {
    await writeProgressRaw({ wordsLearned: 5 })
    const raw = await readProgressRaw()
    expect(raw).toEqual({ wordsLearned: 5 })
  })
})
