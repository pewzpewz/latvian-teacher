import type { ConjugationDrill, ConjugationGroup, ConjugationPerson } from '../data/conjugations'
import type { UserProgress } from '../store/useStore'

export type ConjugationFilters = {
  person?: ConjugationPerson | 'all'
  group?: ConjugationGroup | 'all'
  lemma?: string | 'all'
}

export function filterConjugationDrills(
  drills: ConjugationDrill[],
  filters: ConjugationFilters,
): ConjugationDrill[] {
  return drills.filter((d) => {
    if (filters.person && filters.person !== 'all' && d.person !== filters.person) return false
    if (filters.group && filters.group !== 'all' && d.group !== filters.group) return false
    if (filters.lemma && filters.lemma !== 'all' && d.lemma !== filters.lemma) return false
    return true
  })
}

export function pickConjugationQueue(
  drills: ConjugationDrill[],
  progress: UserProgress,
  limit = 10,
): ConjugationDrill[] {
  if (drills.length === 0) return []

  const scored = drills.map((d) => {
    const score = progress.exerciseScores[d.id]
    let weight = 1
    if (score === false) weight = 4
    else if (score === undefined) weight = 2
    else weight = 0.5
    return { drill: d, weight }
  })

  const queue: ConjugationDrill[] = []
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

export function getConjugationStats(progress: UserProgress, drills: ConjugationDrill[]) {
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

export function personLabel(person: ConjugationPerson): string {
  const map: Record<ConjugationPerson, string> = {
    '1sg': '1sg',
    '2sg': '2sg',
    '3sg': '3sg',
    '1pl': '1pl',
    '2pl': '2pl',
    '3pl': '3pl',
  }
  return map[person]
}

export function uniqueLemmas(drills: ConjugationDrill[]): string[] {
  return [...new Set(drills.map((d) => d.lemma))]
}
