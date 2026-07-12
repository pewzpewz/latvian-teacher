import type { UserProgress } from '../store/useStore'
import { naturalizationSections, type NaturalizationSection } from '../data/naturalization'

export function getSectionProgress(
  progress: UserProgress,
  section: NaturalizationSection,
): { answered: number; correct: number } {
  let answered = 0
  let correct = 0
  for (const q of section.questions) {
    const key = `nat-${q.id}`
    const score = progress.exerciseScores[key]
    if (score !== undefined) {
      answered += 1
      if (score) correct += 1
    }
  }
  return { answered, correct }
}

export function getNaturalizationStats(progress: UserProgress): {
  sectionsCompleted: number
  totalQuestions: number
  answeredQuestions: number
} {
  let sectionsCompleted = 0
  let totalQuestions = 0
  let answeredQuestions = 0

  for (const section of naturalizationSections) {
    totalQuestions += section.questions.length
    const { answered } = getSectionProgress(progress, section)
    answeredQuestions += answered
    if (answered >= section.questions.length) sectionsCompleted += 1
  }

  return { sectionsCompleted, totalQuestions, answeredQuestions }
}
