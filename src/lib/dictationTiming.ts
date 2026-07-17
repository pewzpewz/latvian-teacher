import type { DictationItem } from '../data/dictations'

/**
 * Base reading/writing speed budget per level, in seconds per word.
 * Lower levels get more time per word (learner needs to parse each word,
 * recall spelling/diacritics); higher levels are expected to write closer
 * to real-time dictation speed.
 */
const SECONDS_PER_WORD: Record<DictationItem['level'], number> = {
  A0: 5.5,
  A1: 4.5,
  A2: 3.5,
  B1: 3,
}

/** Fixed overhead to account for starting the recording/typing, independent of length. */
const BASE_SECONDS = 6

/**
 * Time limit (seconds) for a single dictation attempt, from the moment
 * playback finishes until the answer is auto-submitted.
 */
export function dictationTimeLimitSec(item: Pick<DictationItem, 'level' | 'text'>): number {
  const wordCount = item.text.trim().split(/\s+/).filter(Boolean).length
  const perWord = SECONDS_PER_WORD[item.level] ?? SECONDS_PER_WORD.A1
  return Math.round(BASE_SECONDS + wordCount * perWord)
}

/** How many times the audio may be replayed before the timer starts (0 = only the very first play doesn't count against the limit). */
export const DICTATION_MAX_REPLAYS = 2
