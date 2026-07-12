import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Sparkles } from 'lucide-react'
import { useStore } from '../store/useStore'
import { GOAL_LABELS, type LearningGoal } from '../data/examB1'
import type { Level } from '../lib/adaptive'
import { lessons } from '../data/lessons'

const LEVELS: { id: Level; label: string; desc: string }[] = [
  { id: 'A0', label: 'A0 — с нуля', desc: 'Не знаю латышский или только алфавит' },
  { id: 'A1', label: 'A1 — базовый', desc: 'Приветствия, простые фразы' },
  { id: 'A2', label: 'A2 — средний', desc: 'Могу поддержать простой разговор' },
  { id: 'B1', label: 'B1 — экзамен', desc: 'Готовлюсь к VISC / натурализации' },
]

const GOALS: { id: LearningGoal; label: string }[] = [
  { id: 'exam', label: GOAL_LABELS.exam },
  { id: 'daily', label: GOAL_LABELS.daily },
  { id: 'work', label: GOAL_LABELS.work },
  { id: 'general', label: GOAL_LABELS.general },
]

function recommendLesson(level: Level, goal: LearningGoal): string {
  if (goal === 'exam') return 'tech-1'
  if (goal === 'work') return 'work-1'
  if (level === 'A0') return 'alphabet-1'
  if (level === 'B1') return 'health-1'
  return 'greetings-1'
}

type Props = {
  onComplete: () => void
}

export function OnboardingModal({ onComplete }: Props) {
  const updateSettings = useStore((s) => s.updateSettings)
  const refreshEstimatedLevel = useStore((s) => s.refreshEstimatedLevel)

  const [step, setStep] = useState(0)
  const [level, setLevel] = useState<Level>('A0')
  const [goal, setGoal] = useState<LearningGoal>('general')

  const lessonId = recommendLesson(level, goal)
  const lesson = lessons.find((l) => l.id === lessonId)

  const finish = () => {
    updateSettings({
      onboardingCompleted: true,
      selfReportedLevel: level,
      learningGoal: goal,
    })
    const progress = useStore.getState().progress
    const updated = { ...progress, estimatedLevel: level }
    localStorage.setItem('lv-progress', JSON.stringify(updated))
    useStore.setState({ progress: updated })
    refreshEstimatedLevel()
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="glass max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6 shadow-2xl">
        <div className="mb-6 flex items-center gap-2">
          <Sparkles className="text-accent" size={22} />
          <h2 className="text-xl font-bold">Добро пожаловать!</h2>
        </div>

        <div className="mb-6 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-accent' : 'bg-white/10'}`}
            />
          ))}
        </div>

        {step === 0 && (
          <>
            <p className="mb-4 text-muted">Какой у вас уровень латышского?</p>
            <div className="space-y-2">
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLevel(l.id)}
                  className={`w-full rounded-xl border p-4 text-left transition-colors ${
                    level === l.id ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/40'
                  }`}
                >
                  <p className="font-medium">{l.label}</p>
                  <p className="text-sm text-muted">{l.desc}</p>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 font-medium text-white"
            >
              Далее
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <p className="mb-4 text-muted">Какая ваша главная цель?</p>
            <div className="space-y-2">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id)}
                  className={`w-full rounded-xl border px-4 py-3 text-left ${
                    goal === g.id ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/40'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
            <div className="mt-6 flex gap-2">
              <button type="button" onClick={() => setStep(0)} className="flex-1 rounded-xl border border-border py-3">
                Назад
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-3 font-medium text-white"
              >
                Далее
                <ChevronRight size={18} />
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="mb-4 text-muted">Рекомендуем начать с этого урока:</p>
            {lesson && (
              <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
                <p className="font-medium">{lesson.title}</p>
                <p className="text-sm text-muted">{lesson.subtitle}</p>
                <p className="mt-1 text-xs text-accent">{lesson.level} · {lesson.duration} мин</p>
              </div>
            )}
            <Link
              to={`/lessons/${lessonId}`}
              onClick={finish}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 font-medium text-white no-underline"
            >
              Начать урок
              <ChevronRight size={18} />
            </Link>
            <button
              type="button"
              onClick={finish}
              className="mt-2 w-full py-2 text-sm text-muted hover:text-text"
            >
              Пропустить — на главную
            </button>
          </>
        )}
      </div>
    </div>
  )
}
