import type { UserProgress } from '../store/useStore'
import type { LearningGoal } from '../data/examB1'
import type { TFunction, UiLanguage } from '../i18n'
import { wordCountLabel } from '../i18n/plural'
import { createT } from '../i18n'
import { analyzeLearning } from './adaptive'
import { lessons } from '../data/lessons'
import { dialogs } from '../data/dialogs'

export type TodayItem = {
  id: string
  title: string
  description: string
  link: string
  kind: 'srs' | 'lesson' | 'dialog' | 'practice' | 'tutor' | 'plan'
  done?: boolean
}

export function buildTodayPlan(
  progress: UserProgress,
  dueCount: number,
  options?: { learningGoal?: LearningGoal; t?: TFunction; lang?: UiLanguage },
): TodayItem[] {
  const t = options?.t ?? createT('ru')
  const lang = options?.lang ?? 'ru'
  const analysis = analyzeLearning(progress, t)
  const items: TodayItem[] = []

  const pendingAdaptive = progress.adaptiveExercises.filter((e) => !progress.exerciseScores[e.id]).length
  if (pendingAdaptive > 0) {
    items.unshift({
      id: 'adaptive-exercises',
      title: t('today.adaptiveEx', { count: pendingAdaptive }),
      description: t('today.adaptiveExDesc'),
      link: '/plan',
      kind: 'plan',
    })
  }

  if (dueCount > 0) {
    items.push({
      id: 'srs-today',
      title: t('today.srsTitle', { count: dueCount, unit: wordCountLabel(lang, dueCount) }),
      description: t('today.srsDesc'),
      link: '/vocabulary?mode=cards&due=1',
      kind: 'srs',
    })
  }

  const hasCasesLesson = progress.completedLessons.includes('cases-intro')
  if (hasCasesLesson || progress.estimatedLevel !== 'A0') {
    items.push({
      id: 'dictation-a1',
      title: t('today.dictation'),
      description: t('today.dictationDesc'),
      link: '/training/dictation',
      kind: 'practice',
    })
    items.push({
      id: 'declensions-drill',
      title: t('today.declension'),
      description: t('today.declensionDesc'),
      link: '/grammar/declensions',
      kind: 'practice',
    })
  }

  const hasVerbsLesson = progress.completedLessons.includes('grammar-verbs-1')
  if (hasVerbsLesson || progress.estimatedLevel !== 'A0') {
    items.push({
      id: 'conjugations-drill',
      title: t('today.conjugation'),
      description: t('today.conjugationDesc'),
      link: '/grammar/conjugations',
      kind: 'practice',
    })
  }

  if (options?.learningGoal === 'exam' || options?.learningGoal === 'work') {
    items.unshift({
      id: 'naturalization-quiz',
      title: t('today.naturalization'),
      description: t('today.naturalizationDesc'),
      link: '/naturalization',
      kind: 'practice',
    })
  }

  const nextLesson = lessons.find((l) => !progress.completedLessons.includes(l.id))
  if (nextLesson) {
    items.push({
      id: `lesson-${nextLesson.id}`,
      title: nextLesson.title,
      description: nextLesson.subtitle,
      link: `/lessons/${nextLesson.id}`,
      kind: 'lesson',
      done: false,
    })
  }

  const nextDialog = dialogs.find((d) => !progress.dialogsCompleted.includes(d.id))
  if (nextDialog) {
    items.push({
      id: `dialog-${nextDialog.id}`,
      title: t('today.dialogTitle', { title: nextDialog.title }),
      description: t('today.dialogDesc', { count: nextDialog.lines.length }),
      link: `/dialogs/${nextDialog.id}?mode=practice`,
      kind: 'dialog',
    })
  }

  const pronAction = analysis.actions.find((a) => a.type === 'practice')
  if (pronAction) {
    items.push({
      id: 'practice',
      title: pronAction.title,
      description: pronAction.description,
      link: '/training/pronunciation',
      kind: 'practice',
    })
  }

  items.push({
    id: 'tutor',
    title: t('today.tutor'),
    description: t('today.tutorDesc'),
    link: '/tutor',
    kind: 'tutor',
  })

  if (analysis.needsAiRefresh) {
    items.push({
      id: 'adapt',
      title: t('today.adapt'),
      description: t('today.adaptDesc'),
      link: '/plan?adapt=1',
      kind: 'plan',
    })
  }

  return items.slice(0, 6)
}
