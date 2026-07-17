import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Headphones, Check, X, RotateCcw, ChevronRight, Gauge, Timer } from 'lucide-react'
import { dictations, type DictationItem } from '../data/dictations'
import { compareLatvian } from '../hooks/useSpeech'
import { useStore } from '../store/useStore'
import { fetchSpeech, playAudioUrl } from '../lib/tts'
import { useTranslation } from '../hooks/useTranslation'
import { dictationTimeLimitSec, DICTATION_MAX_REPLAYS } from '../lib/dictationTiming'
import { findMissedVocabWords } from '../lib/dictationDiff'

type LevelFilter = 'all' | DictationItem['level']
type Result = 'correct' | 'wrong' | 'timeout' | null

export function DictationPage() {
  const { t } = useTranslation()
  const progress = useStore((s) => s.progress)
  const recordDictationResult = useStore((s) => s.recordDictationResult)
  const settings = useStore((s) => s.settings)

  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<Result>(null)
  const [showHint, setShowHint] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [useSlow, setUseSlow] = useState(true)
  const [playsUsed, setPlaysUsed] = useState(0)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const answerRef = useRef('')

  const filtered = useMemo(
    () => (levelFilter === 'all' ? dictations : dictations.filter((d) => d.level === levelFilter)),
    [levelFilter],
  )

  const active = activeId ? dictations.find((d) => d.id === activeId) : null
  const maxPlays = 1 + DICTATION_MAX_REPLAYS

  const stats = useMemo(() => {
    const done = dictations.filter((d) => progress.exerciseScores[`dict-${d.id}`] === true).length
    return { done, total: dictations.length }
  }, [progress])

  const missedWords = useMemo(() => {
    if (!active || result === null || result === 'correct') return []
    return findMissedVocabWords(active.text, answer)
  }, [active, result, answer])

  useEffect(() => {
    answerRef.current = answer
  }, [answer])

  const finishAttempt = useCallback(
    (mode: 'check' | 'timeout') => {
      if (!active || result !== null) return
      const spoken = answerRef.current
      const ok = mode === 'check' && compareLatvian(spoken, active.text)
      setResult(mode === 'timeout' ? 'timeout' : ok ? 'correct' : 'wrong')
      recordDictationResult(active.id, ok, spoken, active.text)
    },
    [active, result, recordDictationResult],
  )

  // Countdown ticks once the timer has been armed (after the first playback finishes).
  useEffect(() => {
    if (timeLeft === null || result !== null) return
    if (timeLeft <= 0) {
      finishAttempt('timeout')
      return
    }
    const id = setTimeout(() => setTimeLeft((v) => (v === null ? null : v - 1)), 1000)
    return () => clearTimeout(id)
  }, [timeLeft, result, finishAttempt])

  const playDictation = useCallback(
    async (item: DictationItem) => {
      if (playing || playsUsed >= maxPlays) return
      setPlaying(true)
      const isFirstPlay = playsUsed === 0
      setPlaysUsed((v) => v + 1)
      try {
        const rate = useSlow ? item.slowRate : settings.speechRate
        const url = await fetchSpeech(item.text, settings.ttsVoice, rate)
        await playAudioUrl(url)
      } catch {
        /* TTS offline */
      } finally {
        setPlaying(false)
        if (isFirstPlay) {
          setTimeLeft(dictationTimeLimitSec(item))
        }
      }
    },
    [playing, playsUsed, maxPlays, useSlow, settings.speechRate, settings.ttsVoice],
  )

  const startDictation = (id: string) => {
    setActiveId(id)
    setAnswer('')
    setResult(null)
    setShowHint(false)
    setPlaysUsed(0)
    setTimeLeft(null)
  }

  const nextDictation = () => {
    if (!active) return
    const idx = filtered.findIndex((d) => d.id === active.id)
    const next = filtered[idx + 1] ?? filtered[0]
    if (next) startDictation(next.id)
  }

  if (active) {
    const doneBefore = progress.exerciseScores[`dict-${active.id}`] === true
    const timeUrgent = timeLeft !== null && timeLeft <= 5

    return (
      <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-8">
        <button
          type="button"
          onClick={() => setActiveId(null)}
          className="text-sm text-muted hover:text-text"
        >
          {t('dictation.backToList')}
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="rounded bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
              {active.level}
            </span>
            <h1 className="mt-2 text-2xl font-semibold">{active.title}</h1>
            <p className="mt-1 text-sm text-muted">{t('dictation.instruction')}</p>
          </div>
          {doneBefore && (
            <span className="flex items-center gap-1 text-sm text-green-500">
              <Check size={16} /> {t('common.passed')}
            </span>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={playing || playsUsed >= maxPlays || result !== null}
                onClick={() => playDictation(active)}
                className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                <Headphones size={16} />
                {playing ? t('common.playing') : t('common.listen')}
              </button>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={useSlow}
                  disabled={playsUsed > 0}
                  onChange={(e) => setUseSlow(e.target.checked)}
                  className="rounded"
                />
                <Gauge size={14} />
                {t('common.slowPercent', { percent: Math.round(active.slowRate * 100) })}
              </label>
              <span className="text-xs text-muted">
                {t('dictation.playsLeft', { count: Math.max(0, maxPlays - playsUsed) })}
              </span>
            </div>

            {timeLeft !== null && result === null && (
              <div
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold tabular-nums ${
                  timeUrgent ? 'bg-red-500/15 text-red-400' : 'bg-surface-2 text-text'
                }`}
              >
                <Timer size={14} />
                {timeLeft}s
              </div>
            )}
          </div>

          <textarea
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value)
            }}
            rows={3}
            placeholder={t('dictation.placeholder')}
            className="w-full resize-none rounded-lg border border-border bg-surface-2 px-4 py-3 text-base focus:border-accent focus:outline-none"
            disabled={result !== null}
          />

          {result === 'correct' && (
            <div className="flex items-center gap-2 text-green-500">
              <Check size={18} />
              <span>{t('common.correct')}</span>
            </div>
          )}
          {(result === 'wrong' || result === 'timeout') && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-400">
                <X size={18} />
                <span>{result === 'timeout' ? t('dictation.timeUp') : t('common.hasErrors')}</span>
              </div>
              <p className="rounded-lg bg-surface-2 px-3 py-2 font-serif text-accent">{active.text}</p>
              {missedWords.length > 0 && (
                <p className="text-sm text-muted">
                  {t('dictation.addedToReview', {
                    words: missedWords.map((w) => w.lv).join(', '),
                  })}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {result === null && (
              <>
                <button
                  type="button"
                  onClick={() => finishAttempt('check')}
                  disabled={!answer.trim()}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
                >
                  {t('common.check')}
                </button>
                <button
                  type="button"
                  onClick={() => finishAttempt('timeout')}
                  disabled={playsUsed === 0}
                  className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-text disabled:opacity-40"
                >
                  {t('dictation.giveUp')}
                </button>
              </>
            )}
            {result !== null && result !== 'correct' && (
              <button
                type="button"
                onClick={() => setShowHint((v) => !v)}
                className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-text"
              >
                {showHint ? t('dictation.hideHint') : t('dictation.hintRu')}
              </button>
            )}
            {result === 'correct' && (
              <button
                type="button"
                onClick={nextDictation}
                className="flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
              >
                {t('dictation.next')} <ChevronRight size={16} />
              </button>
            )}
            {result !== null && result !== 'correct' && (
              <button
                type="button"
                onClick={() => startDictation(active.id)}
                className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm text-muted"
              >
                <RotateCcw size={14} /> {t('common.reset')}
              </button>
            )}
          </div>

          {showHint && (result === 'wrong' || result === 'timeout') && (
            <p className="text-sm text-muted italic">{active.hintRu}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold">{t('dictation.title')}</h1>
        <p className="mt-1 text-muted">
          {t('dictation.subtitle', { done: stats.done, total: stats.total })}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'A0', 'A1', 'A2', 'B1'] as LevelFilter[]).map((lvl) => (
          <button
            key={lvl}
            type="button"
            onClick={() => setLevelFilter(lvl)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              levelFilter === lvl
                ? 'bg-accent/15 text-accent'
                : 'bg-surface-2 text-muted hover:text-text'
            }`}
          >
            {lvl === 'all' ? t('common.allLevels') : lvl}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {filtered.map((d) => {
          const done = progress.exerciseScores[`dict-${d.id}`] === true
          return (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => startDictation(d.id)}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-left transition-colors hover:border-accent/40"
              >
                <div className="flex items-center gap-3">
                  <Headphones size={18} className="text-accent" />
                  <div>
                    <div className="font-medium">{d.title}</div>
                    <div className="text-xs text-muted">
                      {d.level} · {t('common.slowMeta', { percent: Math.round(d.slowRate * 100) })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {done && <Check size={16} className="text-green-500" />}
                  <ChevronRight size={16} className="text-muted" />
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
