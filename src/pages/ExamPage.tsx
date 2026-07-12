import { useState } from 'react'
import { GraduationCap, ChevronRight, ExternalLink, BookOpen, Clock } from 'lucide-react'
import { examSections, EXAM_OFFICIAL_LINKS } from '../data/examB1'
import { ExerciseCard } from '../components/ExerciseCard'
import type { ExamQuestion } from '../data/examB1'

export function ExamPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const section = activeSection ? examSections.find((s) => s.id === activeSection) : null
  const question = section?.questions[questionIndex]

  const [canProceed, setCanProceed] = useState(false)

  const startSection = (id: string) => {
    setActiveSection(id)
    setQuestionIndex(0)
    setScore(0)
    setFinished(false)
    setCanProceed(false)
  }

  const handleAnswer = (correct: boolean) => {
    if (correct) setScore((s) => s + 1)
  }

  const nextQuestion = () => {
    if (!section) return
    setCanProceed(false)
    if (questionIndex + 1 >= section.questions.length) {
      setFinished(true)
    } else {
      setQuestionIndex((i) => i + 1)
    }
  }

  const backToList = () => {
    setActiveSection(null)
    setFinished(false)
  }

  if (section && question && !finished) {
    const exercise = questionToExercise(question)
    return (
      <div>
        <button type="button" onClick={backToList} className="mb-4 text-sm text-muted hover:text-text">
          ← К списку тестов
        </button>
        <h1 className="gradient-text mb-2 text-2xl font-bold">{section.title}</h1>
        <p className="mb-2 text-sm text-muted">
          Вопрос {questionIndex + 1} из {section.questions.length}
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
        <button
          type="button"
          onClick={nextQuestion}
          disabled={!canProceed}
          className="mt-4 rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {questionIndex + 1 >= section.questions.length ? 'Завершить тест' : 'Следующий вопрос'}
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
          ← К списку тестов
        </button>
        <div className="glass mx-auto max-w-md rounded-2xl p-8">
          <GraduationCap size={48} className="mx-auto mb-4 text-accent" />
          <h2 className="mb-2 text-xl font-bold">Результат</h2>
          <p className="mb-4 text-3xl font-bold text-accent">
            {score}/{total} ({pct}%)
          </p>
          <p className="text-sm text-muted">
            {pct >= 70
              ? 'Хороший результат! Продолжайте готовиться к B1.'
              : 'Есть над чем поработать — повторите слабые темы в уроках.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="gradient-text mb-2 text-3xl font-bold">Экзамен B1</h1>
      <p className="mb-8 text-muted">
        Mock-тесты в формате LVA: чтение и грамматика. Для официальной сдачи — valoda.lv
      </p>

      <div className="mb-8 grid gap-3">
        {examSections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => startSection(s.id)}
            className="glass card-hover flex items-center gap-4 rounded-2xl p-5 text-left"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
              {s.type === 'reading' ? <BookOpen size={22} /> : <GraduationCap size={22} />}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.description}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                <Clock size={12} />
                ~{s.timeMinutes} мин · {s.questions.length} вопросов
              </p>
            </div>
            <ChevronRight size={18} className="text-muted" />
          </button>
        ))}
      </div>

      <section className="glass rounded-2xl p-6">
        <h2 className="mb-4 font-semibold">Официальные материалы LVA</h2>
        <ul className="space-y-3">
          {EXAM_OFFICIAL_LINKS.map((link) => (
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

function questionToExercise(q: ExamQuestion) {
  return {
    id: q.id,
    type: q.type,
    question: q.question,
    answer: q.answer,
    options: q.options,
    hint: q.hint,
  }
}
