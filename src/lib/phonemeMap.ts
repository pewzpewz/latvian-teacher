import type { PhonemeChar } from './phonemeFeedback'

/** Map Latvian grapheme → stable phoneme skill id */
export const CHAR_TO_PHONEME: Record<string, string> = {
  š: 'phoneme-sh',
  s: 'phoneme-sh',
  ž: 'phoneme-zh',
  z: 'phoneme-zh',
  č: 'phoneme-ch',
  c: 'phoneme-ch',
  ā: 'phoneme-long-a',
  a: 'phoneme-long-a',
  ē: 'phoneme-long-e',
  e: 'phoneme-long-e',
  ī: 'phoneme-long-i',
  i: 'phoneme-long-i',
  ū: 'phoneme-long-u',
  u: 'phoneme-long-u',
  ģ: 'phoneme-palatal-g',
  g: 'phoneme-palatal-g',
  ķ: 'phoneme-palatal-k',
  k: 'phoneme-palatal-k',
  ļ: 'phoneme-palatal-l',
  l: 'phoneme-palatal-l',
  ņ: 'phoneme-palatal-n',
  n: 'phoneme-palatal-n',
  r: 'phoneme-rolled-r',
}

const PROBLEM_STATUSES = new Set(['wrong', 'missing', 'diacritic'])

export function phonemeIdsFromChars(chars: PhonemeChar[]): string[] {
  const ids = new Set<string>()
  for (const c of chars) {
    if (!PROBLEM_STATUSES.has(c.status)) continue
    const key = c.char.toLowerCase()
    const id = CHAR_TO_PHONEME[key]
    if (id) ids.add(id)
  }
  return [...ids]
}

export function phonemeIdsFromText(lv: string): string[] {
  const ids = new Set<string>()
  for (const ch of lv.toLowerCase()) {
    const id = CHAR_TO_PHONEME[ch]
    if (id) ids.add(id)
  }
  return [...ids]
}
