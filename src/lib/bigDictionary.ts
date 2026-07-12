/** Загрузка большого офлайн-словаря lv→ru (Wikidata) */

let bigDict: Record<string, string> | null = null
let loadPromise: Promise<Record<string, string>> | null = null

export function isBigDictionaryLoaded(): boolean {
  return bigDict !== null
}

export function getBigDictionarySize(): number {
  return bigDict ? Object.keys(bigDict).length : 0
}

/** Предзагрузка при старте приложения (фон) */
export function preloadBigDictionary(): void {
  loadBigDictionary().catch(() => {})
}

export async function loadBigDictionary(): Promise<Record<string, string>> {
  if (bigDict) return bigDict
  if (loadPromise) return loadPromise

  loadPromise = fetch('/dict/lv-ru.json')
    .then(async (res) => {
      if (!res.ok) throw new Error(`Dictionary HTTP ${res.status}`)
      const data = (await res.json()) as Record<string, string>
      bigDict = data
      return data
    })
    .catch((err) => {
      console.warn('Big dictionary load failed:', err)
      bigDict = {}
      return bigDict
    })

  return loadPromise
}

export function lookupBigDictionary(word: string): string | null {
  if (!bigDict) return null
  const key = word.toLowerCase().replace(/[.,!?;:»«"'""]/g, '').trim()
  return bigDict[key] ?? null
}
