import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { getLessonById } from '../data/lessons'
import { SpeakButton } from '../components/SpeakButton'
import { ExerciseCard } from '../components/ExerciseCard'
import { useStore } from '../store/useStore'
import { useState, useEffect } from 'react'

export function LessonView() {
  const { id } = useParams<{ id: string }>()
  const lesson = getLessonById(id ?? '')
  const { completeLesson, recordExercise, addStudyTime, progress } = useStore()
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [exercisesDone, setExercisesDone] = useState(false)
  const [canProceed, setCanProceed] = useState(false)
  const [contentDone, setContentDone] = useState(false)

  const hasExercises = (lesson?.exercises?.length ?? 0) > 0
  const alreadyCompleted = lesson ? progress.completedLessons.includes(lesson.id) : false

  useEffect(() => {
    setCanProceed(false)
  }, [exerciseIndex])

  if (!lesson) {
    return (
      <div className="text-center">
        <p className="text-muted">Урок не найден</p>
        <Link to="/lessons" className="mt-4 inline-block text-accent">
          ← Назад к урокам
        </Link>
      </div>
    )
  }

  const handleExerciseComplete = (correct: boolean) => {
    const ex = lesson.exercises?.[exerciseIndex]
    if (ex) recordExercise(ex.id, correct, { lessonId: lesson.id, category: lesson.category })
  }

  const finishLesson = () => {
    setExercisesDone(true)
    setContentDone(true)
    completeLesson(lesson.id)
    addStudyTime(lesson.duration)
  }

  const nextExercise = () => {
    if (!canProceed) return
    if (lesson.exercises && exerciseIndex < lesson.exercises.length - 1) {
      setExerciseIndex((i) => i + 1)
    } else {
      finishLesson()
    }
  }

  return (
    <div>
      <Link to="/lessons" className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-text">
        <ArrowLeft size={16} />
        Все уроки
      </Link>

      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="gradient-text text-3xl font-bold">{lesson.title}</h1>
          <span className="rounded-full bg-accent/15 px-3 py-1 text-xs text-accent">{lesson.level}</span>
          {alreadyCompleted && (
            <span className="rounded-full bg-success/15 px-3 py-1 text-xs text-success">Пройден</span>
          )}
        </div>
        <p className="mt-2 text-muted">{lesson.subtitle}</p>
      </div>

      <div className="space-y-8">
        {lesson.sections.map((section, i) => (
          <div key={i} className="glass rounded-2xl p-6">
            <h2 className="mb-3 text-xl font-semibold">{section.title}</h2>
            <p className="mb-4 leading-relaxed text-muted">{section.content}</p>

            {section.examples && (
              <div className="space-y-2">
                {section.examples.map((ex, j) => (
                  <div
                    key={j}
                    className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3"
                  >
                    <div>
                      <span className="latvian-text font-medium text-accent">{ex.lv}</span>
                      <span className="mx-3 text-muted">—</span>
                      <span>{ex.ru}</span>
                      {ex.note && <span className="ml-2 text-xs text-gold">({ex.note})</span>}
                    </div>
                    <SpeakButton text={ex.lv} size="sm" />
                  </div>
                ))}
              </div>
            )}

            {section.tip && (
              <div className="mt-4 rounded-xl border border-gold/20 bg-gold/5 px-4 py-3 text-sm">
                <span className="font-medium text-gold">Совет: </span>
                {section.tip}
              </div>
            )}
          </div>
        ))}
      </div>

      {hasExercises ? (
        <div className="mt-10">
          <h2 className="mb-4 text-xl font-semibold">Упражнения</h2>
          {!exercisesDone ? (
            <div>
              <p className="mb-4 text-sm text-muted">
                Задание {exerciseIndex + 1} из {lesson.exercises!.length}
              </p>
              <ExerciseCard
                key={lesson.exercises![exerciseIndex].id}
                exercise={lesson.exercises![exerciseIndex]}
                onComplete={handleExerciseComplete}
                onChecked={() => setCanProceed(true)}
              />
              {!canProceed && (
                <p className="mt-3 text-sm text-muted">Сначала проверьте ответ, затем нажмите «Следующее»</p>
              )}
              <button
                type="button"
                onClick={nextExercise}
                disabled={!canProceed}
                className="mt-4 rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {exerciseIndex < lesson.exercises!.length - 1 ? 'Следующее' : 'Завершить урок'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-success/30 bg-success/10 p-6">
              <CheckCircle className="text-success" />
              <div>
                <p className="font-medium text-success">Урок завершён!</p>
                <p className="text-sm text-muted">Отличная работа. Переходите к следующему уроку.</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-10">
          {!contentDone && !alreadyCompleted ? (
            <button
              type="button"
              onClick={finishLesson}
              className="rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-white hover:opacity-90"
            >
              Завершить урок
            </button>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-success/30 bg-success/10 p-6">
              <CheckCircle className="text-success" />
              <div>
                <p className="font-medium text-success">Урок завершён!</p>
                <p className="text-sm text-muted">Можете перейти к следующему уроку.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
