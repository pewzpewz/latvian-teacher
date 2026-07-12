import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  ChevronRight,
  ExternalLink,
  Flag,
  Clock,
  Landmark,
  ScrollText,
  Users,
} from 'lucide-react'
import {
  naturalizationSections,
  NATURALIZATION_OFFICIAL_LINKS,
  type NaturalizationQuestion,
  type NaturalizationSectionType,
} from '../data/naturalization'
import { ExerciseCard } from '../components/ExerciseCard'
import { useStore } from '../store/useStore'
import { getSectionProgress } from '../lib/naturalizationStats'
import { useTranslation } from '../hooks/useTranslation'

const SECTION_ICONS: Record<NaturalizationSectionType, typeof Flag> = {
  history: Landmark,
  constitution: ScrollText,
  symbols: Flag,
  society: Users,
}

export function NaturalizationPage() {
  const { t } = useTranslation()
  const progress = useStore((s) => s.progress)
  const recordExercise = useStore((s) => s.recordExercise)
  const addStudyTime = useStore((s) => s.addStudyTime)

  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [canProceed, setCanProceed] = useState(false)
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)

  const section = activeSection
    ? naturalizationSections.find((s) => s.id === activeSection)
    : null
  const question = section?.questions[questionIndex]

  const startSection = (id: string) => {
    setActiveSection(id)
    setQuestionIndex(0)
    setScore(0)
    setFinished(false)
    setCanProceed(false)
    setLastCorrect(null)
  }

  const handleAnswer = (correct: boolean) => {
    if (!question) return
    setLastCorrect(correct)
    if (correct) setScore((s) => s + 1)
    recordExercise(`nat-${question.id}`, correct, {
      category: 'naturalization',
      lessonId: `naturalization-${activeSection}`,
    })
  }

  const nextQuestion = () => {
    if (!section) return
    setCanProceed(false)
    setLastCorrect(null)
    if (questionIndex + 1 >= section.questions.length) {
      setFinished(true)
      addStudyTime(section.timeMinutes)
    } else {
      setQuestionIndex((i) => i + 1)
    }
  }

  const backToList = () => {
    setActiveSection(null)
    setFinished(false)
    setLastCorrect(null)
  }

  if (section && question && !finished) {
    const exercise = questionToExercise(question)
    return (
      <div>
        <button type="button" onClick={backToList} className="mb-4 text-sm text-muted hover:text-text">
          {t('naturalization.backToSections')}
        </button>
        <h1 className="gradient-text mb-2 text-2xl font-bold">{section.title}</h1>
        <p className="mb-2 text-sm text-muted">
          {t('common.questionOf', { current: questionIndex + 1, total: section.questions.length })}
        </p>
        {question.passage && (
          <div className="glass mb-6 rounded-2xl border-l-4 border-accent/50 p-5 text-sm leading-relaxed">
            {question.passage}
          </div>
        )}
        <ExerciseCard
          key={question.id}
          exercise={exercise}
          onComplete={handleAnswer}
          onChecked={() => setCanProceed(true)}
        />
        {canProceed && question.explanation && (
          <div
            className={`mt-4 rounded-xl border p-4 text-sm leading-relaxed ${
              lastCorrect
                ? 'border-success/30 bg-success/10 text-text'
                : 'border-gold/30 bg-gold/10 text-text'
            }`}
          >
            <p className="mb-1 font-medium">{lastCorrect ? t('common.correct') : t('common.explanation')}</p>
            <p className="text-muted">{question.explanation}</p>
          </div>
        )}
        <button
          type="button"
          onClick={nextQuestion}
          disabled={!canProceed}
          className="mt-4 rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {questionIndex + 1 >= section.questions.length ? t('common.finishSection') : t('common.nextQuestion')}
        </button>
      </div>
    )
  }

  if (section && finished) {
    const total = section.questions.length
    const pct = Math.round((score / total) * 100)
    return (
      <div className="text-center">
        <button type="button" onClick={backToList} className="mb-6 text-sm text-muted hover:text-text">
          {t('naturalization.backToSections')}
        </button>
        <div className="glass mx-auto max-w-md rounded-2xl p-8">
          <Flag size={48} className="mx-auto mb-4 text-accent" />
          <h2 className="mb-2 text-xl font-bold">{t('naturalization.sectionFinished')}</h2>
          <p className="mb-4 text-3xl font-bold text-accent">
            {score}/{total} ({pct}%)
          </p>
          <p className="text-sm text-muted">
            {pct >= 70 ? t('naturalization.passGood') : t('naturalization.passBad')}
          </p>
          <button
            type="button"
            onClick={() => startSection(section.id)}
            className="mt-6 rounded-xl bg-accent/15 px-5 py-2 text-sm font-medium text-accent hover:bg-accent/25"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="gradient-text mb-2 text-3xl font-bold">{t('naturalization.title')}</h1>
      <p className="mb-4 text-muted">
        {t('naturalization.subtitle')}{' '}
        <a href="https://www.valoda.lv/" target="_blank" rel="noreferrer" className="text-accent">
          valoda.lv
        </a>
        .
      </p>
      <p className="mb-8 text-sm text-muted">
        {t('naturalization.alsoB1')}{' '}
        <Link to="/exam" className="text-accent no-underline hover:underline">
          {t('naturalization.viscLink')}
        </Link>
      </p>

      <div className="mb-8 grid gap-3">
        {naturalizationSections.map((s) => {
          const Icon = SECTION_ICONS[s.type]
          const { answered, correct } = getSectionProgress(progress, s)
          const done = answered >= s.questions.length
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => startSection(s.id)}
              className="glass card-hover flex items-center gap-4 rounded-2xl p-5 text-left"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <Icon size={22} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{s.title}</h3>
                  {done && (
                    <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs text-success">
                      {t('naturalization.completed')}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted">{s.description}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />{t('common.timeApprox', { minutes: s.timeMinutes })}
                  </span>
                  <span>{t('common.questionsCount', { count: s.questions.length })}</span>
                  {answered > 0 && (
                    <span>
                      {t('common.bestResult', { correct, answered })}
                    </span>
                  )}
                </p>
              </div>
              <ChevronRight size={18} className="text-muted" />
            </button>
          )
        })}
      </div>

      <section className="glass rounded-2xl p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <BookOpen size={18} className="text-accent" />
          {t('naturalization.officialPmlp')}
        </h2>
        <ul className="space-y-3">
          {NATURALIZATION_OFFICIAL_LINKS.map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-2 text-accent no-underline hover:underline"
              >
                <ExternalLink size={16} className="mt-0.5 shrink-0" />
                <span>
                  <strong>{link.title}</strong>
                  <span className="mt-0.5 block text-sm text-muted">{link.description}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function questionToExercise(q: NaturalizationQuestion) {
  return {
    id: q.id,
    type: q.type,
    question: q.question,
    answer: q.answer,
    options: q.options,
    hint: q.hint,
  }
}
