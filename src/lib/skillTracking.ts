import { lessons } from '../data/lessons'
import type { Exercise } from '../data/lessons'
import { skillWeight } from '../data/skills'
import { applySkillUpdate, decayedPKnow, type SkillState } from './knowledgeTracing'
import { phonemeResultsFromChars } from './phonemeMap'
import type { PhonemeChar } from './phonemeFeedback'

const CATEGORY_SKILL_MAP: Record<string, string[]> = {
  declensions: ['noun-dat-sg', 'noun-acc-sg'],
  conjugations: ['verb-present', 'verb-past'],
  alphabet: ['topic-alphabet', 'phoneme-sh', 'phoneme-zh'],
  grammar: ['verb-present'],
  pronunciation: ['phoneme-sh'],
  dictation: ['topic-listening'],
}

export function findExerciseById(exerciseId: string, lessonId?: string): Exercise | undefined {
  for (const lesson of lessons) {
    if (lessonId && lesson.id !== lessonId) continue
    const ex = lesson.exercises?.find((e) => e.id === exerciseId)
    if (ex) return ex
  }
  return undefined
}

export function resolveSkillIdsForAttempt(
  exerciseId: string,
  meta?: { lessonId?: string; category?: string },
): string[] {
  const ex = findExerciseById(exerciseId, meta?.lessonId)
  if (ex?.skillIds?.length) return ex.skillIds

  if (meta?.category && CATEGORY_SKILL_MAP[meta.category]) {
    return CATEGORY_SKILL_MAP[meta.category]
  }

  if (meta?.lessonId) {
    const lesson = lessons.find((l) => l.id === meta.lessonId)
    if (lesson?.category && CATEGORY_SKILL_MAP[lesson.category]) {
      return CATEGORY_SKILL_MAP[lesson.category]
    }
  }

  return []
}

export function applySkillIdsUpdate(
  stats: Record<string, SkillState>,
  skillIds: string[],
  correct: boolean,
  now = Date.now(),
): Record<string, SkillState> {
  let next = stats
  for (const skillId of skillIds) {
    next = applySkillUpdate(next, skillId, correct, now)
  }
  return next
}

export function recordPhonemeChars(
  phonemeStats: Record<string, SkillState>,
  chars: PhonemeChar[] | undefined,
  now = Date.now(),
): Record<string, SkillState> {
  if (!chars?.length) {
    return phonemeStats
  }

  const results = phonemeResultsFromChars(chars)
  if (results.length === 0) {
    return phonemeStats
  }

  let next = phonemeStats
  for (const { phonemeId, correct } of results) {
    next = applySkillUpdate(next, phonemeId, correct, now)
  }

  return next
}

export function weakSkillStates(
  stats: Record<string, SkillState>,
  minReps = 2,
  threshold = 0.5,
  now = Date.now(),
): SkillState[] {
  return Object.values(stats)
    .filter((s) => s.reps >= minReps && decayedPKnow(s, now) < threshold)
    .sort((a, b) => decayedPKnow(a, now) - decayedPKnow(b, now))
}

export function urgencyForSkillState(state: SkillState, now = Date.now()): number {
  return (1 - decayedPKnow(state, now)) * skillWeight(state.skillId)
}
