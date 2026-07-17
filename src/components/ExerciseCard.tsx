import type { Exercise } from '../data/lessons'
import { useState } from 'react'
import { Check, X, HelpCircle, Headphones } from 'lucide-react'
import { compareLatvian } from '../hooks/useSpeech'
import { useTranslation } from '../hooks/useTranslation'
import { useStore } from '../store/useStore'
import { fetchSpeech, playAudioUrl } from '../lib/tts'

type Props = {
  exercise: Exercise
  onComplete: (correct: boolean) => void
  onChecked?: () => void
}

export function ExerciseCard({ exercise, onComplete, onChecked }: Props) {
  const { t } = useTranslation()
  const settings = useStore((s) => s.settings)
  const [answer, setAnswer] = useState('')
  const [selected, setSelected] = useState('')
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [playing, setPlaying] = useState(false)

  const check = () => {
    const userAnswer = exercise.type === 'choose' ? selected : answer
    const correct = compareLatvian(userAnswer, exercise.answer)
    setResult(correct ? 'correct' : 'wrong')
    onComplete(correct)
    onChecked?.()
  }

  const playAudio = async () => {
    if (playing) return
    setPlaying(true)
    try {
      const url = await fetchSpeech(exercise.answer, settings.ttsVoice, settings.speechRate)
      await playAudioUrl(url)
    } catch {
      /* TTS offline */
    } finally {
      setPlaying(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface-2 p-6">
      <p className="mb-4 text-lg">{exercise.question}</p>

      {exercise.type === 'listen' && (
        <button
          type="button"
          disabled={playing}
          onClick={playAudio}
          className="mb-4 flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          <Headphones size={16} />
          {playing ? t('common.playing') : t('common.listen')}
        </button>
      )}

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

      {(exercise.type === 'translate' || exercise.type === 'fill' || exercise.type === 'listen') && (
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
