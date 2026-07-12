import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Sparkles } from 'lucide-react'
import { useStore } from '../store/useStore'
import type { LearningGoal } from '../data/examB1'
import type { Level } from '../lib/adaptive'
import { lessons } from '../data/lessons'
import { useTranslation } from '../hooks/useTranslation'

const LEVEL_IDS: Level[] = ['A0', 'A1', 'A2', 'B1']
const GOAL_IDS: LearningGoal[] = ['exam', 'daily', 'work', 'general']

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
  const { t } = useTranslation()
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
          <h2 className="text-xl font-bold">{t('onboarding.welcome')}</h2>
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
            <p className="mb-4 text-muted">{t('onboarding.levelQuestion')}</p>
            <div className="space-y-2">
              {LEVEL_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setLevel(id)}
                  className={`w-full rounded-xl border p-4 text-left transition-colors ${
                    level === id ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/40'
                  }`}
                >
                  <p className="font-medium">{t(`levels.${id}_label`)}</p>
                  <p className="text-sm text-muted">{t(`levels.${id}_desc`)}</p>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 font-medium text-white"
            >
              {t('common.next')}
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <p className="mb-4 text-muted">{t('onboarding.goalQuestion')}</p>
            <div className="space-y-2">
              {GOAL_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setGoal(id)}
                  className={`w-full rounded-xl border px-4 py-3 text-left ${
                    goal === id ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/40'
                  }`}
                >
                  {t(`goals.${id}`)}
                </button>
              ))}
            </div>
            <div className="mt-6 flex gap-2">
              <button type="button" onClick={() => setStep(0)} className="flex-1 rounded-xl border border-border py-3">
                {t('common.back')}
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-3 font-medium text-white"
              >
                {t('common.next')}
                <ChevronRight size={18} />
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="mb-4 text-muted">{t('onboarding.recommendLesson')}</p>
            {lesson && (
              <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
                <p className="font-medium">{lesson.title}</p>
                <p className="text-sm text-muted">{lesson.subtitle}</p>
                <p className="mt-1 text-xs text-accent">
                  {t('onboarding.lessonMeta', { level: lesson.level, duration: lesson.duration })}
                </p>
              </div>
            )}
            <Link
              to={`/lessons/${lessonId}`}
              onClick={finish}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 font-medium text-white no-underline"
            >
              {t('onboarding.startLesson')}
              <ChevronRight size={18} />
            </Link>
            <button
              type="button"
              onClick={finish}
              className="mt-2 w-full py-2 text-sm text-muted hover:text-text"
            >
              {t('onboarding.skipToHome')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
