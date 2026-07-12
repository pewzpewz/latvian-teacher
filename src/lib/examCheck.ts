import { compareLatvian, normalizeLatvian } from '../hooks/useSpeech'
import { matchPronunciation, normalizeForSpeech } from './pronunciationMatch'

/** Проверка письменного ответа: точное совпадение, альтернативы через |, или ключевые слова. */
export function checkWritingAnswer(
  user: string,
  expected: string,
  keywords?: string[],
): boolean {
  const norm = normalizeLatvian(user)
  if (norm.length < 12) return false

  if (compareLatvian(user, expected)) return true

  if (expected.includes('|')) {
    return expected.split('|').some((alt) => compareLatvian(user, alt.trim()))
  }

  if (keywords?.length) {
    const folded = normalizeForSpeech(user)
    const hits = keywords.filter((k) => folded.includes(normalizeForSpeech(k)))
    const required = Math.max(2, Math.ceil(keywords.length * 0.6))
    return hits.length >= required
  }

  return matchPronunciation(user, expected, 0.72)
}

/** Проверка устного ответа (STT) — fuzzy match + ключевые слова. */
export function checkSpeakingAnswer(
  spoken: string,
  expected: string,
  keywords?: string[],
): boolean {
  const trimmed = spoken.trim()
  if (!trimmed) return false

  if (compareLatvian(trimmed, expected)) return true
  if (matchPronunciation(trimmed, expected, 0.78)) return true

  if (expected.includes('|')) {
    return expected.split('|').some((alt) => matchPronunciation(trimmed, alt.trim(), 0.78))
  }

  if (keywords?.length) {
    const folded = normalizeForSpeech(trimmed)
    const hits = keywords.filter((k) => folded.includes(normalizeForSpeech(k)))
    return hits.length >= Math.ceil(keywords.length * 0.5)
  }

  return false
}

export function checkExamAnswer(
  user: string,
  question: {
    type: string
    answer: string
    keywords?: string[]
  },
): boolean {
  if (question.type === 'writing') {
    return checkWritingAnswer(user, question.answer, question.keywords)
  }
  if (question.type === 'speaking') {
    return checkSpeakingAnswer(user, question.answer, question.keywords)
  }
  return compareLatvian(user, question.answer)
}
