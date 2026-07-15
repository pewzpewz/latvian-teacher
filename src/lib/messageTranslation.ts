import { fetchMessageTranslation } from './api'
import { stripBracketTranslations } from './chatText'

const LS_KEY = 'lv-message-translation'
const MAX_CACHE = 120

function cacheKey(text: string): string {
  return stripBracketTranslations(text).trim().slice(0, 400)
}

function loadCache(): Map<string, string> {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return new Map()
    return new Map(Object.entries(JSON.parse(raw) as Record<string, string>))
  } catch {
    return new Map()
  }
}

function saveCache(map: Map<string, string>) {
  try {
    const entries = [...map.entries()].slice(-MAX_CACHE)
    localStorage.setItem(LS_KEY, JSON.stringify(Object.fromEntries(entries)))
  } catch {
    /* ignore quota */
  }
}

const memoryCache = loadCache()
const pending = new Map<string, Promise<string>>()

export function peekMessageTranslation(text: string): string | null {
  return memoryCache.get(cacheKey(text)) ?? null
}

export async function getMessageTranslation(text: string): Promise<string> {
  const key = cacheKey(text)
  if (!key) return ''

  const cached = memoryCache.get(key)
  if (cached) return cached

  const inflight = pending.get(key)
  if (inflight) return inflight

  const promise = fetchMessageTranslation(key)
    .then((ru) => {
      const result = ru.trim()
      if (result) {
        memoryCache.set(key, result)
        saveCache(memoryCache)
      }
      pending.delete(key)
      return result
    })
    .catch(() => {
      pending.delete(key)
      return ''
    })

  pending.set(key, promise)
  return promise
}
