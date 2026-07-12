import { vocabulary } from '../data/vocabulary'
import { getAllGameWords } from '../data/games'
import { lessons } from '../data/lessons'
import { dialogs } from '../data/dialogs'
import { wordGlossary, phraseGlossary, glossButFuture, glossTe } from '../data/glossary'
import { fetchWordGloss } from './api'
import { loadBigDictionary, lookupBigDictionary } from './bigDictionary'

const LS_GLOSS_KEY = 'lv-hover-gloss'
const MAX_PERSISTENT = 400

function normalizeWord(w: string): string {
  return w
    .toLowerCase()
    .replace(/[*_`]/g, '')
    .replace(/[.,!?;:»«"'""]/g, '')
    .trim()
}

function normalizePhrase(p: string): string {
  return p
    .toLowerCase()
    .replace(/[*_`#]/g, '')
    .replace(/[.,!?;:»«"'""]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function loadPersistentCache(): Map<string, string> {
  try {
    const raw = localStorage.getItem(LS_GLOSS_KEY)
    if (!raw) return new Map()
    return new Map(Object.entries(JSON.parse(raw) as Record<string, string>))
  } catch {
    return new Map()
  }
}

function savePersistentCache(map: Map<string, string>) {
  try {
    const entries = [...map.entries()].slice(-MAX_PERSISTENT)
    localStorage.setItem(LS_GLOSS_KEY, JSON.stringify(Object.fromEntries(entries)))
  } catch {
    /* ignore quota */
  }
}

function buildWordMap(): Map<string, string> {
  const map = new Map<string, string>()

  const addWord = (lv: string, ru: string) => {
    const key = normalizeWord(lv)
    if (!key || key.includes(' ')) return
    const val = ru.split('(')[0].trim()
    if (!map.has(key)) map.set(key, val)
  }

  for (const [lv, ru] of Object.entries(wordGlossary)) {
    map.set(normalizeWord(lv), ru)
  }

  for (const v of vocabulary) addWord(v.lv, v.ru)
  for (const w of getAllGameWords()) addWord(w.lv, w.ru)

  for (const lesson of lessons) {
    for (const section of lesson.sections) {
      for (const ex of section.examples ?? []) {
        const lv = ex.lv.replace(/[!?.,"«»]/g, '').trim()
        if (!lv.includes(' ') && !lv.includes('/')) addWord(lv, ex.ru)
      }
    }
  }

  return map
}

function buildPhraseMap(): Map<string, string> {
  const map = new Map<string, string>()

  const addPhrase = (lv: string, ru: string) => {
    const key = normalizePhrase(lv)
    if (key.length > 3 && !map.has(key)) map.set(key, ru.split('(')[0].trim())
  }

  for (const [lv, ru] of Object.entries(phraseGlossary)) {
    map.set(normalizePhrase(lv), ru)
  }

  for (const lesson of lessons) {
    for (const section of lesson.sections) {
      for (const ex of section.examples ?? []) {
        if (ex.lv.includes(' ') || ex.lv.includes('/')) addPhrase(ex.lv, ex.ru)
      }
    }
  }

  for (const dialog of dialogs) {
    for (const line of dialog.lines) addPhrase(line.lv, line.ru)
  }

  return map
}

const wordMap = buildWordMap()
const phraseMap = buildPhraseMap()
const memoryCache = loadPersistentCache()
const pending = new Map<string, Promise<string>>()

function cacheKey(word: string, sentence: string): string {
  return `${normalizeWord(word)}|${normalizePhrase(sentence).slice(0, 150)}`
}

/** Поиск по основе слова (teikumus → teikums) */
function tryStemLookup(word: string): string | null {
  const key = normalizeWord(word)
  const variants = [
    key,
    key.replace(/umus$/, 'ums'),
    key.replace(/ums$/, 'ums'),
    key.replace(/us$/, 's'),
    key.replace(/os$/, 's'),
    key.replace(/as$/, 'a'),
    key.replace(/us$/, 'a'),
    key.replace(/iem$/, 's'),
    key.replace(/ī$/, 't'),
    key.replace(/īt$/, 'īt'),
    key.replace(/ini$/, 'ināt'),
    key.replace(/iet$/, 'ēt'),
  ]
  for (const v of variants) {
    const hit = wordMap.get(v) ?? lookupBigDictionary(v)
    if (hit) return hit
  }
  return null
}

function findPhraseInSentence(sentence: string, word: string): string | null {
  const norm = normalizePhrase(sentence)
  const w = normalizeWord(word)
  const words = norm.split(/\s+/)
  const idx = words.findIndex((x) => x === w || x.startsWith(w))
  if (idx < 0) return null

  for (let size = 8; size >= 2; size--) {
    for (let start = Math.max(0, idx - size + 1); start <= idx; start++) {
      const slice = words.slice(start, Math.min(words.length, start + size)).join(' ')
      if (slice.includes(w) && phraseMap.has(slice)) return phraseMap.get(slice)!
    }
  }
  return null
}

function alignWordInPhrase(word: string, sentence: string, phraseRu: string): string | null {
  const w = normalizeWord(word)
  const normSent = normalizePhrase(sentence)

  if (normSent.includes('te būs') || normSent.includes('te bus')) {
    if (w === 'te') return 'здесь'
    if (w === 'būs' || w === 'bus') return 'будет'
  }
  if (normSent.includes('te ir')) {
    if (w === 'te') return 'здесь'
    if (w === 'ir') return 'есть'
  }
  if (normSent.includes('es esmu')) {
    if (w === 'es') return 'я'
    if (w === 'esmu') return 'есть / —'
  }
  if (normSent.includes('tu esi')) {
    if (w === 'tu') return 'ты'
    if (w === 'esi') return 'есть / —'
  }
  if (normSent.includes('mēģini pabeigt')) {
    if (w === 'mēģini') return 'попробуй'
    if (w === 'pabeigt') return 'закончить'
    if (w === 'šos') return 'эти'
    if (w === 'teikumus') return 'предложения'
    if (w === 'par') return 'о'
    if (w === 'sevi') return 'себе'
  }
  if (normSent.includes('par sevi')) {
    if (w === 'par') return 'о'
    if (w === 'sevi') return 'себе'
  }

  const phraseWords = normSent.split(/\s+/)
  const ruWords = phraseRu.split(/\s+/)
  const idx = phraseWords.indexOf(w)
  if (idx >= 0 && idx < ruWords.length && phraseWords.length === ruWords.length) {
    return ruWords[idx]
  }
  return null
}

function lookupContextual(word: string, sentence: string): string | null {
  const key = normalizeWord(word)
  if (!key) return null

  if (key === 'būs') {
    const ctx = glossButFuture(sentence)
    if (ctx) return ctx
  }
  if (key === 'te') {
    const ctx = glossTe(sentence)
    if (ctx) return ctx
  }

  const direct = wordMap.get(key) ?? lookupBigDictionary(key)
  if (direct) return direct

  const stem = tryStemLookup(key)
  if (stem) return stem

  const phraseHit = findPhraseInSentence(sentence, word)
  if (phraseHit) {
    const aligned = alignWordInPhrase(key, sentence, phraseHit)
    if (aligned) return aligned
  }

  return null
}

export function lookupLocalGloss(word: string, sentence?: string): string | null {
  if (sentence) {
    const ck = cacheKey(word, sentence)
    const persisted = memoryCache.get(ck)
    if (persisted) return persisted

    const ctx = lookupContextual(word, sentence)
    if (ctx) return ctx
  }
  return wordMap.get(normalizeWord(word)) ?? lookupBigDictionary(normalizeWord(word)) ?? tryStemLookup(word)
}

function persistGloss(word: string, sentence: string, translation: string) {
  const key = cacheKey(word, sentence)
  memoryCache.set(key, translation)
  savePersistentCache(memoryCache)
}

async function fetchWithRetry(word: string, sentence: string): Promise<string> {
  try {
    return await fetchWordGloss(word, sentence)
  } catch {
    await new Promise((r) => setTimeout(r, 400))
    return fetchWordGloss(word, sentence)
  }
}

export async function getWordGloss(word: string, sentence: string): Promise<string> {
  const clean = normalizeWord(word)
  if (!clean) return ''

  await loadBigDictionary()

  const local = lookupContextual(clean, sentence)
  if (local) {
    persistGloss(word, sentence, local)
    return local
  }

  const key = cacheKey(clean, sentence)
  const persisted = memoryCache.get(key)
  if (persisted) return persisted

  const inflight = pending.get(key)
  if (inflight) return inflight

  const promise = fetchWithRetry(clean, sentence)
    .then((ru) => {
      const result = ru?.trim()
      if (result && result.length > 0 && result.length < 120) {
        persistGloss(word, sentence, result)
        pending.delete(key)
        return result
      }
      const stem = tryStemLookup(clean)
      pending.delete(key)
      return stem ?? ''
    })
    .catch(() => {
      pending.delete(key)
      return tryStemLookup(clean) ?? ''
    })

  pending.set(key, promise)
  return promise
}

export function getWordGlossSync(word: string, sentence?: string): string | null {
  return lookupLocalGloss(word, sentence)
}

export function peekCachedGloss(word: string, sentence: string): string | null {
  const key = cacheKey(word, sentence)
  return memoryCache.get(key) ?? lookupLocalGloss(word, sentence)
}
