import type { UserProgress } from '../store/useStore'
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

export function buildTodayPlan(progress: UserProgress, dueCount: number): TodayItem[] {
  const analysis = analyzeLearning(progress)
  const items: TodayItem[] = []

  const pendingAdaptive = progress.adaptiveExercises.filter((e) => !progress.exerciseScores[e.id]).length
  if (pendingAdaptive > 0) {
    items.unshift({
      id: 'adaptive-exercises',
      title: `Персональные упражнения (${pendingAdaptive})`,
      description: 'Задания от AI под ваши ошибки',
      link: '/plan',
      kind: 'plan',
    })
  }

  if (dueCount > 0) {
    items.push({
      id: 'srs-today',
      title: `Повторить ${dueCount} ${dueCount === 1 ? 'слово' : dueCount < 5 ? 'слова' : 'слов'}`,
      description: 'Интервальное повторение (SRS)',
      link: '/vocabulary?mode=cards&due=1',
      kind: 'srs',
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
      title: `Диалог: ${nextDialog.title}`,
      description: `${nextDialog.lines.length} реплик · режим практики`,
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
      link: '/practice',
      kind: 'practice',
    })
  }

  items.push({
    id: 'tutor',
    title: '5 минут с AI-репетитором',
    description: 'Задайте вопрос или попросите проверить фразу',
    link: '/tutor',
    kind: 'tutor',
  })

  if (analysis.needsAiRefresh) {
    items.push({
      id: 'adapt',
      title: 'Обновить персональный план',
      description: 'AI подберёт слова и упражнения под ваши ошибки',
      link: '/plan?adapt=1',
      kind: 'plan',
    })
  }

  return items.slice(0, 6)
}
