/** Нормализация и fuzzy-сравнение для STT (произношение) */

const DIACRITIC_FOLD: Record<string, string> = {
  ā: 'a',
  ē: 'e',
  ī: 'i',
  ū: 'u',
  ō: 'o',
  č: 'c',
  š: 's',
  ž: 'z',
  ģ: 'g',
  ķ: 'k',
  ļ: 'l',
  ņ: 'n',
}

export function foldDiacritics(text: string): string {
  return text.replace(/[āēīūōčšžģķļņ]/g, (ch) => DIACRITIC_FOLD[ch] ?? ch)
}

export function normalizeForSpeech(text: string): string {
  return foldDiacritics(
    text
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:«»"']/g, '')
      .replace(/\s+/g, ' '),
  )
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  const row = Array.from({ length: b.length + 1 }, (_, i) => i)

  for (let i = 1; i <= a.length; i++) {
    let prev = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      const next = Math.min(row[j] + 1, prev + 1, row[j - 1] + cost)
      row[j - 1] = prev
      prev = next
    }
    row[b.length] = prev
  }

  return row[b.length]
}

/** Схожесть 0..1 (1 = идентично после normalize) */
export function pronunciationSimilarity(spoken: string, expected: string): number {
  const a = normalizeForSpeech(spoken)
  const b = normalizeForSpeech(expected)
  if (!a && !b) return 1
  if (!a || !b) return 0
  const dist = levenshtein(a, b)
  const maxLen = Math.max(a.length, b.length)
  return 1 - dist / maxLen
}

export function matchPronunciation(
  spoken: string,
  expected: string,
  threshold = 0.85,
): boolean {
  return pronunciationSimilarity(spoken, expected) >= threshold
}
