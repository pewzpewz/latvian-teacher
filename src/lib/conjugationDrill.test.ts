import { describe, it, expect } from 'vitest'
import {
  filterConjugationDrills,
  pickConjugationQueue,
  getConjugationStats,
  uniqueLemmas,
} from './conjugationDrill'
import type { ConjugationDrill } from '../data/conjugations'
import type { UserProgress } from '../store/useStore'

const sample: ConjugationDrill[] = [
  {
    id: 'but-1sg',
    lemma: 'būt',
    lemmaRu: 'быть',
    group: 'irregular',
    tense: 'present',
    person: '1sg',
    pronoun: 'es',
    form: 'esmu',
    promptRu: '1 л. ед.: быть',
  },
  {
    id: 'but-2sg',
    lemma: 'būt',
    lemmaRu: 'быть',
    group: 'irregular',
    tense: 'present',
    person: '2sg',
    pronoun: 'tu',
    form: 'esi',
    promptRu: '2 л. ед.: быть',
  },
  {
    id: 'runat-1sg',
    lemma: 'runāt',
    lemmaRu: 'говорить',
    group: 'conj1',
    tense: 'present',
    person: '1sg',
    pronoun: 'es',
    form: 'runāju',
    promptRu: '1 л. ед.: говорить',
  },
]

const baseProgress = {
  exerciseScores: { 'but-1sg': true, 'but-2sg': false },
} as Partial<UserProgress>

describe('conjugationDrill', () => {
  it('filterConjugationDrills by person', () => {
    const sg = filterConjugationDrills(sample, { person: '1sg' })
    expect(sg).toHaveLength(2)
  })

  it('filterConjugationDrills by group', () => {
    const irr = filterConjugationDrills(sample, { group: 'irregular' })
    expect(irr).toHaveLength(2)
  })

  it('pickConjugationQueue returns limited items', () => {
    const q = pickConjugationQueue(sample, baseProgress as UserProgress, 2)
    expect(q.length).toBe(2)
  })

  it('getConjugationStats counts scores', () => {
    const stats = getConjugationStats(baseProgress as UserProgress, sample)
    expect(stats.correct).toBe(1)
    expect(stats.wrong).toBe(1)
    expect(stats.unseen).toBe(1)
  })

  it('uniqueLemmas deduplicates', () => {
    expect(uniqueLemmas(sample)).toEqual(['būt', 'runāt'])
  })
})
