import type { Exercise } from '../data/lessons'
import { useState } from 'react'
import { Check, X, HelpCircle } from 'lucide-react'
import { compareLatvian } from '../hooks/useSpeech'
import { useTranslation } from '../hooks/useTranslation'

type Props = {
  exercise: Exercise
  onComplete: (correct: boolean) => void
  onChecked?: () => void
}

export function ExerciseCard({ exercise, onComplete, onChecked }: Props) {
  const { t } = useTranslation()
  const [answer, setAnswer] = useState('')
  const [selected, setSelected] = useState('')
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [showHint, setShowHint] = useState(false)

  const check = () => {
    const userAnswer = exercise.type === 'choose' ? selected : answer
    const correct = compareLatvian(userAnswer, exercise.answer)
    setResult(correct ? 'correct' : 'wrong')
    onComplete(correct)
    onChecked?.()
  }

  return (
    <div className="rounded-2xl border border-border bg-surface-2 p-6">
      <p className="mb-4 text-lg">{exercise.question}</p>

      {exercise.type === 'choose' && exercise.options && (
        <div className="mb-4 grid grid-cols-2 gap-2">
          {exercise.options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setSelected(opt)}
              className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                selected === opt
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border hover:border-accent/30'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {(exercise.type === 'translate' || exercise.type === 'fill') && (
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !result && check()}
          placeholder={t('exercise.placeholder')}
          className="mb-4 w-full rounded-xl border border-border bg-bg px-4 py-3 outline-none focus:border-accent"
          disabled={result !== null}
        />
      )}

      {exercise.hint && !result && (
        <button
          type="button"
          onClick={() => setShowHint(!showHint)}
          className="mb-4 flex items-center gap-1 text-sm text-muted hover:text-gold"
        >
          <HelpCircle size={14} />
          {t('exercise.hint')}
        </button>
      )}
      {showHint && exercise.hint && (
        <p className="mb-4 text-sm text-gold">{exercise.hint}</p>
      )}

      {result && (
        <div
          className={`mb-4 flex items-center gap-2 rounded-xl p-3 ${
            result === 'correct' ? 'bg-success/10 text-success' : 'bg-red-500/10 text-red-400'
          }`}
        >
          {result === 'correct' ? <Check size={18} /> : <X size={18} />}
          {result === 'correct'
            ? t('exercise.correct')
            : t('exercise.correctAnswer', { answer: exercise.answer })}
        </div>
      )}

      {!result && (
        <button
          type="button"
          onClick={check}
          disabled={exercise.type === 'choose' ? !selected : !answer.trim()}
          className="rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {t('exercise.check')}
        </button>
      )}
    </div>
  )
}
