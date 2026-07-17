import { State } from 'ts-fsrs'
import type { Level } from '../lib/adaptive'
import type { UserProgress } from '../store/useStore'
import type { TFunction } from '../i18n'
import { createT } from '../i18n'
import { lessons } from '../data/lessons'
import { lessonsExtra } from '../data/lessonsExtra'
import { vocabulary } from '../data/vocabulary'
import { declensionDrills } from '../data/declensions'
import { conjugationDrills } from '../data/conjugations'
import { examA2Sections } from '../data/examA2'
import { examSections } from '../data/examB1'
import { dictations } from '../data/dictations'

export type CefrMilestone = {
  id: string
  title: string
  description: string
  link: string
  /** 0..1 */
  progress: number
  done: boolean
}

export type CefrTrack = {
  level: Level | 'B2'
  title: string
  description: string
  milestones: Omit<CefrMilestone, 'progress' | 'done'>[]
}

export function getCefrTracks(t: TFunction): CefrTrack[] {
  return [
    {
      level: 'A1',
      title: t('cefr.trackA1Title'),
      description: t('cefr.trackA1Desc'),
      milestones: [
        { id: 'a1-lessons', title: t('cefr.mA1Lessons'), description: t('cefr.mA1LessonsD'), link: '/lessons' },
        { id: 'a1-vocab', title: t('cefr.mA1Vocab'), description: t('cefr.mA1VocabD'), link: '/vocabulary' },
        { id: 'a1-decl', title: t('cefr.mA1Decl'), description: t('cefr.mA1DeclD'), link: '/grammar/declensions' },
        { id: 'a1-dict', title: t('cefr.mA1Dict'), description: t('cefr.mA1DictD'), link: '/training/dictation' },
      ],
    },
    {
      level: 'A2',
      title: t('cefr.trackA2Title'),
      description: t('cefr.trackA2Desc'),
      milestones: [
        { id: 'a2-lessons', title: t('cefr.mA2Lessons'), description: t('cefr.mA2LessonsD'), link: '/lessons' },
        { id: 'a2-vocab', title: t('cefr.mA2Vocab'), description: t('cefr.mA2VocabD'), link: '/vocabulary?level=A2' },
        { id: 'a2-exam', title: t('cefr.mA2Exam'), description: t('cefr.mA2ExamD'), link: '/exam' },
        { id: 'a2-conj', title: t('cefr.mA2Conj'), description: t('cefr.mA2ConjD'), link: '/grammar/conjugations' },
      ],
    },
    {
      level: 'B1',
      title: t('cefr.trackB1Title'),
      description: t('cefr.trackB1Desc'),
      milestones: [
        { id: 'b1-vocab', title: t('cefr.mB1Vocab'), description: t('cefr.mB1VocabD'), link: '/vocabulary?level=B1' },
        { id: 'b1-exam', title: t('cefr.mB1Exam'), description: t('cefr.mB1ExamD'), link: '/exam' },
        { id: 'b1-nat', title: t('cefr.mB1Nat'), description: t('cefr.mB1NatD'), link: '/naturalization' },
        { id: 'b1-live', title: t('cefr.mB1Live'), description: t('cefr.mB1LiveD'), link: '/exam' },
      ],
    },
    {
      level: 'B2',
      title: t('cefr.trackB2Title'),
      description: t('cefr.trackB2Desc'),
      milestones: [
        { id: 'b2-vocab', title: t('cefr.mB2Vocab'), description: t('cefr.mB2VocabD'), link: '/vocabulary' },
        { id: 'b2-freq', title: t('cefr.mB2Freq'), description: t('cefr.mB2FreqD'), link: '/vocabulary?sort=freq' },
      ],
    },
  ]
}

/** @deprecated use getCefrTracks(t) in UI */
export const CEFR_TRACKS = getCefrTracks(createT('ru'))

const allLessons = [...lessons, ...lessonsExtra]

function lessonProgress(progress: UserProgress, maxLevel: Level): number {
  const pool = allLessons.filter((l) => {
    const order = ['A0', 'A1', 'A2', 'B1', 'B2']
    return order.indexOf(l.level) <= order.indexOf(maxLevel)
  })
  if (pool.length === 0) return 0
  const done = pool.filter((l) => progress.completedLessons.includes(l.id)).length
  return done / pool.length
}

function vocabProgress(progress: UserProgress, levels: Level[], target: number): number {
  const pool = vocabulary.filter((v) => levels.includes(v.level as Level))
  // reps > 0 only means "was shown at least once" — it says nothing about whether
  // the learner actually got it right. State.Review means the card graduated past
  // the initial learning steps at least once, i.e. was genuinely recalled correctly.
  const learned = pool.filter((v) => progress.srsCards[v.id]?.state === State.Review).length
  return Math.min(1, learned / target)
}

function drillProgress(progress: UserProgress, drills: { id: string }[], min: number): number {
  const correct = drills.filter((d) => progress.exerciseScores[d.id] === true).length
  return Math.min(1, correct / min)
}

function examProgress(
  progress: UserProgress,
  sections: { id: string; questions: { id: string }[] }[],
  minSections: number,
): number {
  let completed = 0
  for (const s of sections) {
    const all = s.questions.every((q) => progress.exerciseScores[q.id] !== undefined)
    if (all) completed += 1
  }
  return Math.min(1, completed / minSections)
}

function dictationProgress(progress: UserProgress, level: Level, min: number): number {
  const pool = dictations.filter((d) => d.level === level)
  const done = pool.filter((d) => progress.exerciseScores[`dict-${d.id}`] === true).length
  const target = pool.length === 0 ? 1 : Math.min(min, pool.length)
  return Math.min(1, done / target)
}

function natProgress(progress: UserProgress): number {
  const keys = Object.keys(progress.exerciseScores).filter((k) => k.startsWith('nat-'))
  return Math.min(1, keys.filter((k) => progress.exerciseScores[k]).length / 8)
}

function freqVocabProgress(): number {
  const ranked = vocabulary.filter((v) => v.freqRank != null && v.freqRank <= 2000)
  return Math.min(1, ranked.length / 2000)
}

export function buildCefrTrackProgress(progress: UserProgress, track: CefrTrack): CefrMilestone[] {
  return track.milestones.map((m) => {
    let p = 0
    switch (m.id) {
      case 'a1-lessons':
        p = lessonProgress(progress, 'A1')
        break
      case 'a1-vocab':
        p = vocabProgress(progress, ['A0', 'A1'], 100)
        break
      case 'a1-decl':
        p = drillProgress(progress, declensionDrills, 10)
        break
      case 'a1-dict':
        p = dictationProgress(progress, 'A1', 4)
        break
      case 'a2-lessons':
        p = lessonProgress(progress, 'A2')
        break
      case 'a2-vocab':
        p = vocabProgress(progress, ['A2'], 80)
        break
      case 'a2-exam':
        p = examProgress(progress, examA2Sections, 1)
        break
      case 'a2-conj':
        p = drillProgress(progress, conjugationDrills, 10)
        break
      case 'b1-vocab':
        p = vocabProgress(progress, ['B1'], 50)
        break
      case 'b1-exam':
        p = examProgress(progress, examSections, 2)
        break
      case 'b1-nat':
        p = natProgress(progress)
        break
      case 'b1-live':
        p = progress.exerciseScores['b1-live-speaking'] ? 1 : 0
        break
      case 'b2-vocab':
        p = Math.min(1, vocabulary.length / 2000)
        break
      case 'b2-freq':
        p = freqVocabProgress()
        break
      default:
        p = 0
    }
    return { ...m, progress: p, done: p >= 1 }
  })
}

export function overallCefrLevel(progress: UserProgress, t: TFunction = createT('ru')): Level | 'B2' {
  for (const track of [...getCefrTracks(t)].reverse()) {
    const milestones = buildCefrTrackProgress(progress, track)
    // A weak milestone must not be masked by strong ones elsewhere — the whole
    // point of leveling up is that every tracked skill actually cleared the bar.
    const weakest = Math.min(...milestones.map((m) => m.progress))
    if (weakest >= 0.75) return track.level as Level | 'B2'
  }
  return progress.estimatedLevel
}
