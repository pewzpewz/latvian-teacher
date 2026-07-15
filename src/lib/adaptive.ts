import type { Exercise } from '../data/lessons'
import type { UserProgress } from '../store/useStore'
import type { TFunction } from '../i18n'
import { createT } from '../i18n'
import { lessons } from '../data/lessons'
import { vocabulary } from '../data/vocabulary'
import { minimalPairs } from '../data/minimalPairs'
import { skillLabel, skillWeight } from '../data/skills'
import { decayedPKnow, skillUrgency } from './knowledgeTracing'
import { weakSkillStates, urgencyForSkillState } from './skillTracking'
import {
  getWordPracticeItems,
  PRACTICE_PHRASES,
  practiceItemWithPhonemes,
  type PracticeItem,
} from '../data/practiceItems'

export type Level = 'A0' | 'A1' | 'A2' | 'B1'

export type AdaptiveWord = {
  id: string
  lv: string
  ru: string
  category: string
  reason: string
  createdAt: number
}

export type AdaptiveExercise = Exercise & {
  topic: string
  createdAt: number
}

export type PlanAction = {
  id: string
  type: 'lesson' | 'vocabulary' | 'practice' | 'dialog' | 'review' | 'adaptive'
  title: string
  description: string
  link: string
  priority: number
  reason: string
}

export type SkillSnapshot = {
  skillId: string
  label: string
  confidence: number
}

export type LearningAnalysis = {
  estimatedLevel: Level
  weakAreas: { name: string; score: number; total: number }[]
  strongAreas: { name: string; score: number }[]
  weakSkills: SkillSnapshot[]
  weakPhonemes: SkillSnapshot[]
  masteryPercent: number
  actions: PlanAction[]
  wordsToReview: string[]
  needsAiRefresh: boolean
}

const LEVEL_ORDER: Level[] = ['A0', 'A1', 'A2', 'B1']

const CATEGORY_KEYS: Record<string, string> = {
  alphabet: 'wordCategories.alphabet',
  grammar: 'wordCategories.grammar',
  phrases: 'wordCategories.phrases',
  culture: 'wordCategories.culture',
  writing: 'wordCategories.writing',
  pronunciation: 'wordCategories.pronunciation',
  'Приветствия': 'wordCategories.greetings',
  'Семья': 'wordCategories.family',
  'Еда': 'wordCategories.food',
  'Город': 'wordCategories.city',
  'Время': 'wordCategories.time',
  'Глаголы': 'wordCategories.verbs',
  'Прилагательные': 'wordCategories.adjectives',
  'Природа': 'wordCategories.nature',
}

const SKILL_LINK: Record<string, string> = {
  'topic-greetings': '/lessons/greetings-1',
  'topic-alphabet': '/lessons/alphabet-1',
  'noun-nom-sg': '/lessons/grammar-nouns-1',
  'noun-dat-sg': '/lessons/cases-intro',
  'noun-acc-sg': '/lessons/cases-intro',
  'verb-present': '/lessons/grammar-verbs-1',
  'verb-past': '/conjugations',
}

function categoryLabel(t: TFunction, key: string): string {
  const mapped = CATEGORY_KEYS[key]
  return mapped ? t(mapped) : key
}

function getCategoryScore(progress: UserProgress, category: string) {
  const stats = progress.categoryStats[category]
  if (!stats || stats.total === 0) return null
  return Math.round((stats.correct / stats.total) * 100)
}

function buildSkillSnapshots(
  stats: UserProgress['skillStats'] | UserProgress['phonemeStats'],
  threshold = 0.5,
  minReps = 1,
  now = Date.now(),
): SkillSnapshot[] {
  return weakSkillStates(stats, minReps, threshold, now).map((s) => ({
    skillId: s.skillId,
    label: skillLabel(s.skillId),
    confidence: Math.round(decayedPKnow(s, now) * 100),
  }))
}

function linkForSkill(skillId: string): string {
  if (skillId.startsWith('phoneme-')) return '/practice'
  return SKILL_LINK[skillId] ?? '/lessons'
}

export function estimateLevel(progress: UserProgress): Level {
  const completed = progress.completedLessons.length
  const exerciseCount = Object.keys(progress.exerciseScores).length
  const correctCount = Object.values(progress.exerciseScores).filter(Boolean).length
  const accuracy = exerciseCount > 0 ? correctCount / exerciseCount : 0

  if (completed >= 7 && accuracy >= 0.8) return 'A2'
  if (completed >= 4 && accuracy >= 0.65) return 'A1'
  if (completed >= 1 || exerciseCount >= 3) return 'A0'
  return 'A0'
}

export function analyzeLearning(progress: UserProgress, t: TFunction = createT('ru')): LearningAnalysis {
  const estimatedLevel = progress.estimatedLevel || estimateLevel(progress)
  const now = Date.now()

  const weakAreas = Object.entries(progress.categoryStats)
    .filter(([, s]) => s.total >= 2)
    .map(([name, s]) => ({
      name: categoryLabel(t, name),
      score: Math.round((s.correct / s.total) * 100),
      total: s.total,
    }))
    .filter((a) => a.score < 65)
    .sort((a, b) => a.score - b.score)

  const strongAreas = Object.entries(progress.categoryStats)
    .filter(([, s]) => s.total >= 3)
    .map(([name, s]) => ({
      name: categoryLabel(t, name),
      score: Math.round((s.correct / s.total) * 100),
    }))
    .filter((a) => a.score >= 80)
    .sort((a, b) => b.score - a.score)

  const weakSkills = buildSkillSnapshots(progress.skillStats, 0.55, 2, now)
  const weakPhonemes = buildSkillSnapshots(progress.phonemeStats, 0.55, 1, now)

  const totalAttempts = Object.values(progress.categoryStats).reduce((s, c) => s + c.total, 0)
  const totalCorrect = Object.values(progress.categoryStats).reduce((s, c) => s + c.correct, 0)
  const masteryPercent = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0

  const actions: PlanAction[] = []

  const failedWords = Object.entries(progress.srsCards)
    .filter(([, c]) => c.reps === 0 && c.last_review)
    .map(([id]) => id)

  const dueWords = Object.values(progress.srsCards)
    .filter((c) => c.due <= now && c.reps > 0)
    .map((c) => c.wordId)

  if (dueWords.length > 0 || failedWords.length > 0) {
    const srsUrgency = Math.round(skillUrgency(0.25, 10) * 10)
    actions.push({
      id: 'vocab-review',
      type: 'vocabulary',
      title: t('adaptive.vocabReview'),
      description: t('adaptive.vocabReviewDesc', { count: dueWords.length + failedWords.length }),
      link: '/vocabulary?mode=cards',
      priority: srsUrgency,
      reason: t('adaptive.vocabReason'),
    })
  }

  for (const state of weakSkillStates(progress.skillStats, 2, 0.55, now).slice(0, 2)) {
    const label = skillLabel(state.skillId)
    const priority = Math.round(urgencyForSkillState(state, now) * 10)
    actions.push({
      id: `skill-${state.skillId}`,
      type: 'review',
      title: t('adaptive.reviewArea', { name: label }),
      description: t('adaptive.reviewAreaDesc', { score: Math.round(decayedPKnow(state, now) * 100) }),
      link: linkForSkill(state.skillId),
      priority,
      reason: t('adaptive.reviewReason', { score: Math.round(decayedPKnow(state, now) * 100) }),
    })
  }

  for (const area of weakAreas.slice(0, 2)) {
    const rawName = Object.keys(CATEGORY_KEYS).find((k) => categoryLabel(t, k) === area.name) || area.name
    const relatedLesson = lessons.find(
      (l) => l.category === rawName || l.title.toLowerCase().includes(area.name.toLowerCase()),
    )
    if (relatedLesson && !actions.some((a) => a.link === `/lessons/${relatedLesson.id}`)) {
      const pKnow = area.score / 100
      actions.push({
        id: `review-${rawName}`,
        type: 'review',
        title: t('adaptive.reviewArea', { name: area.name }),
        description: t('adaptive.reviewAreaDesc', { score: area.score }),
        link: `/lessons/${relatedLesson.id}`,
        priority: Math.round(skillUrgency(pKnow, skillWeight(rawName) || 7) * 10),
        reason: t('adaptive.reviewReason', { score: area.score }),
      })
    }
  }

  const pendingAdaptive = progress.adaptiveExercises.filter((e) => !progress.exerciseScores[e.id])
  if (pendingAdaptive.length > 0) {
    actions.push({
      id: 'adaptive-exercises',
      type: 'adaptive',
      title: t('adaptive.adaptiveEx'),
      description: t('adaptive.adaptiveExDesc', { count: pendingAdaptive.length }),
      link: '/plan',
      priority: Math.round(skillUrgency(0.2, 9) * 10),
      reason: t('adaptive.adaptiveReason'),
    })
  }

  const nextLesson = lessons.find((l) => !progress.completedLessons.includes(l.id))
  if (nextLesson) {
    const levelIdx = LEVEL_ORDER.indexOf(nextLesson.level)
    const userIdx = LEVEL_ORDER.indexOf(estimatedLevel)
    actions.push({
      id: `lesson-${nextLesson.id}`,
      type: 'lesson',
      title: nextLesson.title,
      description: nextLesson.subtitle,
      link: `/lessons/${nextLesson.id}`,
      priority: Math.round(skillUrgency(0.5, levelIdx <= userIdx + 1 ? 7 : 5) * 10),
      reason: levelIdx > userIdx ? t('adaptive.nextLevelReason') : t('adaptive.nextLessonReason'),
    })
  }

  const weakestPhoneme = weakSkillStates(progress.phonemeStats, 1, 0.7, now)[0]
  if (weakestPhoneme) {
    const conf = Math.round(decayedPKnow(weakestPhoneme, now) * 100)
    actions.push({
      id: 'practice-pron',
      type: 'practice',
      title: t('adaptive.pronTitle'),
      description: t('adaptive.pronDesc', { score: conf }),
      link: '/practice',
      priority: Math.round(urgencyForSkillState(weakestPhoneme, now) * 10),
      reason: t('adaptive.pronReasonPhoneme', { sound: skillLabel(weakestPhoneme.skillId) }),
    })
  } else {
    const pronScore = getCategoryScore(progress, 'pronunciation')
    if (pronScore !== null && pronScore < 70) {
      actions.push({
        id: 'practice-pron',
        type: 'practice',
        title: t('adaptive.pronTitle'),
        description: t('adaptive.pronDesc', { score: pronScore }),
        link: '/practice',
        priority: Math.round(skillUrgency(pronScore / 100, 8) * 10),
        reason: t('adaptive.pronReason'),
      })
    } else if (progress.pronunciationAttempts.total < 5) {
      actions.push({
        id: 'practice-start',
        type: 'practice',
        title: t('adaptive.pronStartTitle'),
        description: t('adaptive.pronStartDesc'),
        link: '/practice',
        priority: Math.round(skillUrgency(0.7, 4) * 10),
        reason: t('adaptive.pronStartReason'),
      })
    }
  }

  if (estimatedLevel !== 'A0') {
    actions.push({
      id: 'dialog',
      type: 'dialog',
      title: t('adaptive.dialogTitle'),
      description: t('adaptive.dialogDesc'),
      link: estimatedLevel === 'A2' ? '/dialogs/d3' : '/dialogs/d1',
      priority: Math.round(skillUrgency(0.6, 3.5) * 10),
      reason: t('adaptive.dialogReason'),
    })
  }

  actions.sort((a, b) => b.priority - a.priority)

  const wordsToReview = [...new Set([...failedWords, ...dueWords])].slice(0, 10)

  const lastAdapt = progress.lastAdaptationAt ?? 0
  const daysSinceAdapt = (Date.now() - lastAdapt) / (1000 * 60 * 60 * 24)
  const needsAiRefresh =
    ((weakAreas.length > 0 || weakSkills.length > 0) && daysSinceAdapt > 1 && pendingAdaptive.length < 3) ||
    (totalAttempts >= 10 && progress.adaptiveExercises.length === 0)

  return {
    estimatedLevel,
    weakAreas,
    strongAreas,
    weakSkills,
    weakPhonemes,
    masteryPercent,
    actions: actions.slice(0, 6),
    wordsToReview,
    needsAiRefresh,
  }
}

export function getAdaptivePracticeItems(progress: UserProgress, t: TFunction = createT('ru')): PracticeItem[] {
  const analysis = analyzeLearning(progress, t)
  const level = progress.estimatedLevel || estimateLevel(progress)
  const items: PracticeItem[] = []
  const now = Date.now()

  for (const ph of weakSkillStates(progress.phonemeStats, 1, 0.6, now).slice(0, 2)) {
    const pairs = minimalPairs.filter((p) => p.phonemeId === ph.skillId)
    for (const pair of pairs.slice(0, 2)) {
      items.push(
        practiceItemWithPhonemes({
          lv: pair.lv,
          ru: pair.ru,
          reason: t('adaptive.phonemeDrill', { sound: skillLabel(ph.skillId) }),
        }),
      )
    }
  }

  for (const area of analysis.weakAreas) {
    const rawName = Object.keys(CATEGORY_KEYS).find((k) => categoryLabel(t, k) === area.name) ?? area.name
    const words = vocabulary.filter((w) => w.category === rawName || w.category === area.name).slice(0, 3)
    words.forEach((w) =>
      items.push(
        practiceItemWithPhonemes({
          lv: w.lv,
          ru: w.ru,
          reason: t('adaptive.weakArea', { name: area.name }),
        }),
      ),
    )
  }

  for (const area of analysis.weakAreas.slice(0, 2)) {
    const rawName = Object.keys(CATEGORY_KEYS).find((k) => categoryLabel(t, k) === area.name) ?? area.name
    const relatedLessons = lessons.filter(
      (l) => l.category === rawName || l.title.toLowerCase().includes(area.name.toLowerCase()),
    )
    for (const lesson of relatedLessons.slice(0, 1)) {
      for (const section of lesson.sections) {
        for (const ex of (section.examples ?? []).slice(0, 2)) {
          items.push(
            practiceItemWithPhonemes({
              lv: ex.lv,
              ru: ex.ru,
              reason: t('adaptive.reviewArea', { name: area.name }),
            }),
          )
        }
      }
    }
  }

  for (const wordId of analysis.wordsToReview.slice(0, 5)) {
    const w = vocabulary.find((v) => v.id === wordId)
    if (w) {
      items.push(
        practiceItemWithPhonemes({
          lv: w.lv,
          ru: w.ru,
          reason: t('adaptive.vocabReviewReason'),
        }),
      )
    }
  }

  progress.adaptiveWords.forEach((w) => {
    items.push(practiceItemWithPhonemes({ lv: w.lv, ru: w.ru, reason: w.reason }))
  })

  const mistakeCategories = [
    ...new Set(
      progress.exerciseAttempts
        .filter((a) => !a.correct)
        .slice(-8)
        .map((a) => a.category),
    ),
  ]
  for (const cat of mistakeCategories.slice(0, 2)) {
    vocabulary
      .filter((w) => w.category === cat)
      .slice(0, 2)
      .forEach((w) =>
        items.push(
          practiceItemWithPhonemes({
            lv: w.lv,
            ru: w.ru,
            reason: t('adaptive.weakArea', { name: categoryLabel(t, cat) }),
          }),
        ),
      )
  }

  const deduped = dedupePracticeItems(items)

  if (deduped.length > 0) return deduped

  const starterWords = getWordPracticeItems(level)
    .slice(0, 6)
    .map((w) => ({
      ...practiceItemWithPhonemes(w),
      reason: t('adaptive.starterWords', { level }),
    }))
  const starterPhrases = PRACTICE_PHRASES.slice(0, 4).map((p) => ({
    ...practiceItemWithPhonemes(p),
    reason: t('adaptive.starterPhrases'),
  }))

  return dedupePracticeItems([...starterWords, ...starterPhrases])
}

function dedupePracticeItems(items: PracticeItem[]): PracticeItem[] {
  const seen = new Set<string>()
  return items.filter((i) => {
    const key = i.lv.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function getAllExercises(progress: UserProgress): AdaptiveExercise[] {
  return progress.adaptiveExercises
}

export function buildProfileSummary(
  progress: UserProgress,
  settings?: { learningGoal?: string; selfReportedLevel?: string | null; userName?: string },
): string {
  const analysis = analyzeLearning(progress)
  const now = Date.now()
  const completed = progress.completedLessons
    .map((id) => lessons.find((l) => l.id === id)?.title)
    .filter(Boolean)

  return JSON.stringify({
    level: analysis.estimatedLevel,
    selfReportedLevel: settings?.selfReportedLevel ?? null,
    learningGoal: settings?.learningGoal ?? 'general',
    userName: settings?.userName ?? '',
    masteryPercent: analysis.masteryPercent,
    completedLessons: completed,
    weakAreas: analysis.weakAreas,
    strongAreas: analysis.strongAreas,
    weakSkills: Object.values(progress.skillStats)
      .filter((s) => decayedPKnow(s, now) < 0.5)
      .map((s) => ({
        skill: skillLabel(s.skillId),
        confidence: Math.round(decayedPKnow(s, now) * 100),
      })),
    weakPhonemes: Object.values(progress.phonemeStats)
      .filter((s) => decayedPKnow(s, now) < 0.5)
      .map((s) => skillLabel(s.skillId)),
    recentMistakes: progress.exerciseAttempts
      .filter((a) => !a.correct)
      .slice(-10)
      .map((a) => ({ category: a.category, exerciseId: a.exerciseId })),
    wordsLearned: progress.wordsLearned,
    streak: progress.streak,
  })
}
