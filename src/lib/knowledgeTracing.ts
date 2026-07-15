export type SkillState = {
  skillId: string
  pKnow: number
  reps: number
  lastSeen: number
}

const P_INIT = 0.3
const P_LEARN = 0.15
const P_SLIP = 0.1
const P_GUESS = 0.2

export function updateSkillState(
  prev: SkillState | undefined,
  skillId: string,
  correct: boolean,
  now = Date.now(),
): SkillState {
  const pKnowPrior = prev?.pKnow ?? P_INIT

  const pCorrectGivenKnow = 1 - P_SLIP
  const pCorrectGivenNotKnow = P_GUESS
  const pCorrect = pKnowPrior * pCorrectGivenKnow + (1 - pKnowPrior) * pCorrectGivenNotKnow

  const pKnowPosterior = correct
    ? (pKnowPrior * pCorrectGivenKnow) / pCorrect
    : (pKnowPrior * P_SLIP) / (1 - pCorrect)

  const pKnowAfterLearning = pKnowPosterior + (1 - pKnowPosterior) * P_LEARN

  return {
    skillId,
    pKnow: Math.min(0.99, Math.max(0.01, pKnowAfterLearning)),
    reps: (prev?.reps ?? 0) + 1,
    lastSeen: now,
  }
}

export function decayedPKnow(state: SkillState, now = Date.now()): number {
  const daysSince = (now - state.lastSeen) / 86_400_000
  const decayRate = 0.02
  return state.pKnow * Math.exp(-decayRate * daysSince)
}

/** Priority score: higher = more urgent to practice */
export function skillUrgency(pKnowDecayed: number, weight: number): number {
  return (1 - pKnowDecayed) * weight
}

export function applySkillUpdate(
  stats: Record<string, SkillState>,
  skillId: string,
  correct: boolean,
  now = Date.now(),
): Record<string, SkillState> {
  return {
    ...stats,
    [skillId]: updateSkillState(stats[skillId], skillId, correct, now),
  }
}
