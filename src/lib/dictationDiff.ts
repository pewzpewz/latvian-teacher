import { vocabulary, type VocabWord } from '../data/vocabulary'
import { foldDiacritics } from './pronunciationMatch'

function normalizeWord(w: string): string {
  return foldDiacritics(w.toLowerCase()).replace(/[.,!?;:"'()]/g, '')
}

/**
 * Words present in the expected dictation text but missing (or badly
 * mangled) from what the learner actually typed, resolved against the
 * vocabulary dataset so they can be pushed back into SRS review.
 */
export function findMissedVocabWords(expectedText: string, spokenText: string): VocabWord[] {
  const expectedWords = expectedText.split(/\s+/).filter(Boolean).map(normalizeWord)
  const spokenWordSet = new Set(spokenText.split(/\s+/).filter(Boolean).map(normalizeWord))

  const missed: VocabWord[] = []
  const seen = new Set<string>()

  for (const word of expectedWords) {
    if (word.length < 2 || spokenWordSet.has(word) || seen.has(word)) continue
    seen.add(word)
    const match = vocabulary.find((v) => normalizeWord(v.lv) === word)
    if (match) missed.push(match)
  }

  return missed
}
