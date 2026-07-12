/**
 * FSRS spaced repetition (ts-fsrs)
 * Заменяет SM-2 с миграцией старых карточек
 */
import {
  FSRS,
  Rating,
  State,
  createEmptyCard,
  generatorParameters,
  type Card,
  type Grade,
} from 'ts-fsrs'

const fsrs = new FSRS(generatorParameters({ enable_fuzz: true }))

/** Сериализуемая карточка для localStorage */
export type StoredFsrsCard = {
  wordId: string
  due: number
  stability: number
  difficulty: number
  elapsed_days: number
  scheduled_days: number
  learning_steps: number
  reps: number
  lapses: number
  state: State
  last_review?: number
}

/** Старый формат SM-2 */
export type LegacySm2Card = {
  wordId: string
  ease?: number
  interval?: number
  repetitions?: number
  nextReview?: number
  lastReview?: number
}

export function qualityToRating(quality: number): Grade {
  if (quality <= 1) return Rating.Again
  if (quality <= 2) return Rating.Hard
  if (quality <= 4) return Rating.Good
  return Rating.Easy
}

export function cardToStored(wordId: string, card: Card): StoredFsrsCard {
  return {
    wordId,
    due: card.due.getTime(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review?.getTime(),
  }
}

export function storedToCard(stored: StoredFsrsCard): Card {
  return {
    due: new Date(stored.due),
    stability: stored.stability,
    difficulty: stored.difficulty,
    elapsed_days: stored.elapsed_days,
    scheduled_days: stored.scheduled_days,
    learning_steps: stored.learning_steps,
    reps: stored.reps,
    lapses: stored.lapses,
    state: stored.state,
    last_review: stored.last_review ? new Date(stored.last_review) : undefined,
  }
}

export function createNewStoredCard(wordId: string, now = new Date()): StoredFsrsCard {
  return cardToStored(wordId, createEmptyCard(now))
}

export function isLegacySm2Card(raw: LegacySm2Card & Partial<StoredFsrsCard>): boolean {
  return raw.ease !== undefined && raw.stability === undefined
}

export function migrateLegacyCard(raw: LegacySm2Card): StoredFsrsCard {
  const now = new Date()
  if (!raw.repetitions || raw.repetitions === 0) {
    return createNewStoredCard(raw.wordId, now)
  }
  const card = createEmptyCard(new Date(raw.lastReview ?? now))
  card.state = State.Review
  card.reps = raw.repetitions
  card.stability = Math.max(1, raw.interval ?? 1)
  card.difficulty = Math.min(10, Math.max(1, 11 - (raw.ease ?? 2.5)))
  card.due = new Date(raw.nextReview ?? now.getTime())
  card.scheduled_days = raw.interval ?? 1
  card.last_review = raw.lastReview ? new Date(raw.lastReview) : undefined
  return cardToStored(raw.wordId, card)
}

export function gradeStoredCard(
  stored: StoredFsrsCard,
  quality: number,
  now = new Date(),
): StoredFsrsCard {
  const card = storedToCard(stored)
  const rating = qualityToRating(quality)
  const result = fsrs.next(card, now, rating)
  return cardToStored(stored.wordId, result.card)
}

export function isCardDue(stored: StoredFsrsCard, now = Date.now()): boolean {
  return stored.due <= now
}

export function normalizeSrsCard(raw: LegacySm2Card & Partial<StoredFsrsCard>): StoredFsrsCard {
  if (isLegacySm2Card(raw)) return migrateLegacyCard(raw)
  if (raw.due !== undefined && raw.stability !== undefined) {
    return raw as StoredFsrsCard
  }
  return createNewStoredCard(raw.wordId)
}
