import { describe, it, expect } from 'vitest'
import { filterDrills, pickDrillQueue, getDeclensionStats } from './declensionDrill'
import type { DeclensionDrill } from '../data/declensions'
import type { UserProgress } from '../store/useStore'

const sample: DeclensionDrill[] = [
  {
    id: 'maja-nom',
    lemma: 'māja',
    lemmaRu: 'дом',
    declension: 1,
    gender: 'f',
    case: 'nom',
    form: 'māja',
    promptRu: 'Именительный: дом',
  },
  {
    id: 'maja-gen',
    lemma: 'māja',
    lemmaRu: 'дом',
    declension: 1,
    gender: 'f',
    case: 'gen',
    form: 'mājas',
    promptRu: 'Родительный: дома',
  },
  {
    id: 'tevs-nom',
    lemma: 'tēvs',
    lemmaRu: 'отец',
    declension: 2,
    gender: 'm',
    case: 'nom',
    form: 'tēvs',
    promptRu: 'Именительный: отец',
  },
]

const baseProgress = {
  exerciseScores: { 'maja-nom': true, 'maja-gen': false },
} as Partial<UserProgress>

describe('declensionDrill', () => {
  it('filterDrills by case', () => {
    const nom = filterDrills(sample, { caseId: 'nom' })
    expect(nom).toHaveLength(2)
    expect(nom.every((d) => d.case === 'nom')).toBe(true)
  })

  it('filterDrills by declension', () => {
    const d1 = filterDrills(sample, { declension: 1 })
    expect(d1).toHaveLength(2)
  })

  it('pickDrillQueue returns limited items', () => {
    const q = pickDrillQueue(sample, baseProgress as UserProgress, 2)
    expect(q.length).toBe(2)
  })

  it('getDeclensionStats counts scores', () => {
    const stats = getDeclensionStats(baseProgress as UserProgress, sample)
    expect(stats.correct).toBe(1)
    expect(stats.wrong).toBe(1)
    expect(stats.unseen).toBe(1)
  })
})
