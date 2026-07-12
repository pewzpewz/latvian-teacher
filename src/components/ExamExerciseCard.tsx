import { useState, useEffect, useRef, useCallback } from 'react'
import { Check, HelpCircle, Mic, MicOff, X } from 'lucide-react'
import type { ExamQuestion } from '../data/examB1'
import { checkExamAnswer } from '../lib/examCheck'
import { ExerciseCard } from './ExerciseCard'
import { useTranslation } from '../hooks/useTranslation'

type BaseProps = {
  question: ExamQuestion
  onComplete: (correct: boolean) => void
  onChecked?: () => void
}

type Props = BaseProps & {
  listening?: boolean
  transcript?: string
  onStartListen?: () => void
  onStopListen?: () => void
}

export function ExamExerciseCard({
  question,
  onComplete,
  onChecked,
  listening,
  transcript,
  onStartListen,
  onStopListen,
}: Props) {
  if (question.type === 'choose' || question.type === 'fill' || question.type === 'translate') {
    return (
      <ExerciseCard
        exercise={{
          id: question.id,
          type: question.type,
          question: question.question,
          answer: question.answer,
          options: question.options,
          hint: question.hint,
        }}
        onComplete={onComplete}
        onChecked={onChecked}
      />
    )
  }

  if (question.type === 'writing') {
    return (
      <WritingExercise
        question={question}
        onComplete={onComplete}
        onChecked={onChecked}
      />
    )
  }

  if (question.type === 'speaking') {
    return (
      <SpeakingExercise
        question={question}
        onComplete={onComplete}
        onChecked={onChecked}
        listening={listening}
        transcript={transcript}
        onStartListen={onStartListen}
        onStopListen={onStopListen}
      />
    )
  }

  return null
}

function WritingExercise({ question, onComplete, onChecked }: BaseProps) {
  const { t } = useTranslation()
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [showHint, setShowHint] = useState(false)

  const check = () => {
    const correct = checkExamAnswer(answer, question)
    setResult(correct ? 'correct' : 'wrong')
    onComplete(correct)
    onChecked?.()
  }

  return (
    <div className="rounded-2xl border border-border bg-surface-2 p-6">
      <p className="mb-4 text-lg">{question.question}</p>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder={t('exercise.writingPlaceholder')}
        disabled={result !== null}
        rows={6}
        className="mb-4 w-full resize-y rounded-xl border border-border bg-bg px-4 py-3 outline-none focus:border-accent disabled:opacity-60"
        data-testid="exam-writing-answer"
      />
      {question.hint && !result && (
        <button
          type="button"
          onClick={() => setShowHint((v) => !v)}
          className="mb-4 flex items-center gap-1 text-sm text-muted hover:text-gold"
        >
          <HelpCircle size={14} />
          {t('common.hintStructure')}
        </button>
      )}
      {showHint && question.hint && (
        <p className="mb-4 text-sm text-gold">{question.hint}</p>
      )}
      {result && (
        <div
          className={`mb-4 rounded-xl p-4 text-sm ${
            result === 'correct' ? 'bg-success/10 text-success' : 'bg-red-500/10 text-red-400'
          }`}
        >
          {result === 'correct' ? (
            <p className="flex items-center gap-2 font-medium">
              <Check size={18} /> {t('exercise.writingGood')}
            </p>
          ) : (
            <>
              <p className="flex items-center gap-2 font-medium">
                <X size={18} /> {t('exercise.writingSample')}
              </p>
              <p className="latvian-text mt-2 leading-relaxed">
                {question.sampleAnswer ?? question.answer}
              </p>
            </>
          )}
        </div>
      )}
      {!result && (
        <button
          type="button"
          onClick={check}
          disabled={answer.trim().length < 12}
          className="rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-white disabled:opacity-40"
        >
          {t('exercise.check')}
        </button>
      )}
    </div>
  )
}

function SpeakingExercise({
  question,
  onComplete,
  onChecked,
  listening,
  transcript = '',
  onStartListen,
  onStopListen,
}: Props) {
  const { t } = useTranslation()
  const [spoken, setSpoken] = useState('')
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [showHint, setShowHint] = useState(false)
  const wasListening = useRef(false)

  const runCheck = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return
      setSpoken(trimmed)
      const correct = checkExamAnswer(trimmed, question)
      setResult(correct ? 'correct' : 'wrong')
      onComplete(correct)
      onChecked?.()
    },
    [question, onComplete, onChecked],
  )

  useEffect(() => {
    if (wasListening.current && !listening && transcript.trim()) {
      runCheck(transcript)
    }
    wasListening.current = !!listening
  }, [listening, transcript, runCheck])

  const handleStop = () => {
    onStopListen?.()
  }

  return (
    <div className="rounded-2xl border border-border bg-surface-2 p-6">
      <p className="mb-4 text-lg">{question.question}</p>
      {question.hint && !result && (
        <button
          type="button"
          onClick={() => setShowHint((v) => !v)}
          className="mb-4 flex items-center gap-1 text-sm text-muted hover:text-gold"
        >
          <HelpCircle size={14} />
          {t('exercise.hint')}
        </button>
      )}
      {showHint && question.hint && (
        <p className="mb-4 text-sm text-gold">{question.hint}</p>
      )}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {!listening ? (
          <button
            type="button"
            onClick={onStartListen}
            disabled={result !== null}
            className="flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white disabled:opacity-40"
            data-testid="exam-speak-start"
          >
            <Mic size={18} />
            {t('exercise.speak')}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStop}
            className="flex animate-pulse items-center gap-2 rounded-xl bg-red-500/90 px-5 py-3 text-sm font-medium text-white"
            data-testid="exam-speak-stop"
          >
            <MicOff size={18} />
            {t('exercise.speakStop')}
          </button>
        )}
        {listening && (
          <span className="text-sm text-muted">{t('exercise.speakListening')}</span>
        )}
      </div>
      {spoken && !listening && (
        <p className="mb-4 rounded-xl bg-surface px-4 py-3 text-sm">
          <span className="text-muted">{t('exercise.speakRecognized')} </span>
          <span className="latvian-text">{spoken}</span>
        </p>
      )}
      {result && (
        <div
          className={`mb-4 rounded-xl p-4 text-sm ${
            result === 'correct' ? 'bg-success/10 text-success' : 'bg-red-500/10 text-red-400'
          }`}
        >
          {result === 'correct' ? (
            <p className="flex items-center gap-2 font-medium">
              <Check size={18} /> {t('exercise.speakExcellent')}
            </p>
          ) : (
            <>
              <p className="flex items-center gap-2 font-medium">
                <X size={18} /> {t('exercise.speakExpected')}
              </p>
              <p className="latvian-text mt-1 text-lg">{question.answer}</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
