import type { DeclensionDrill, LatvianCaseId } from '../data/declensions'
import type { UserProgress } from '../store/useStore'

export type DeclensionFilters = {
  caseId?: LatvianCaseId | 'all'
  declension?: number | 'all'
}

export function filterDrills(
  drills: DeclensionDrill[],
  filters: DeclensionFilters,
): DeclensionDrill[] {
  return drills.filter((d) => {
    if (filters.caseId && filters.caseId !== 'all' && d.case !== filters.caseId) return false
    if (filters.declension && filters.declension !== 'all' && d.declension !== filters.declension) {
      return false
    }
    return true
  })
}

/** Prefer drills the user got wrong or hasn't seen; shuffle weak first. */
export function pickDrillQueue(
  drills: DeclensionDrill[],
  progress: UserProgress,
  limit = 10,
): DeclensionDrill[] {
  if (drills.length === 0) return []

  const scored = drills.map((d) => {
    const score = progress.exerciseScores[d.id]
    let weight = 1
    if (score === false) weight = 4
    else if (score === undefined) weight = 2
    else weight = 0.5
    return { drill: d, weight }
  })

  const queue: DeclensionDrill[] = []
  const pool = [...scored]

  while (queue.length < Math.min(limit, drills.length) && pool.length > 0) {
    const total = pool.reduce((s, p) => s + p.weight, 0)
    let r = Math.random() * total
    let idx = 0
    for (let i = 0; i < pool.length; i++) {
      r -= pool[i].weight
      if (r <= 0) {
        idx = i
        break
      }
    }
    queue.push(pool[idx].drill)
    pool.splice(idx, 1)
  }

  return queue
}

export function getDeclensionStats(progress: UserProgress, drills: DeclensionDrill[]) {
  let correct = 0
  let wrong = 0
  let unseen = 0

  for (const d of drills) {
    const s = progress.exerciseScores[d.id]
    if (s === true) correct += 1
    else if (s === false) wrong += 1
    else unseen += 1
  }

  return { correct, wrong, unseen, total: drills.length }
}

export function caseLabel(caseId: LatvianCaseId): string {
  const map: Record<LatvianCaseId, string> = {
    nom: 'N',
    gen: 'G',
    dat: 'D',
    acc: 'A',
    ins: 'I',
    loc: 'L',
  }
  return map[caseId]
}
