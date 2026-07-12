import { useCallback, useMemo, useState } from 'react'
import { Headphones, Check, X, RotateCcw, ChevronRight, Gauge } from 'lucide-react'
import { dictations, type DictationItem } from '../data/dictations'
import { compareLatvian } from '../hooks/useSpeech'
import { useStore } from '../store/useStore'
import { fetchSpeech, playAudioUrl } from '../lib/tts'
import { useTranslation } from '../hooks/useTranslation'

type LevelFilter = 'all' | DictationItem['level']
type Result = 'correct' | 'wrong' | null

export function DictationPage() {
  const { t } = useTranslation()
  const progress = useStore((s) => s.progress)
  const settings = useStore((s) => s.settings)
  const recordExercise = useStore((s) => s.recordExercise)
  const addStudyTime = useStore((s) => s.addStudyTime)

  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<Result>(null)
  const [showHint, setShowHint] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [useSlow, setUseSlow] = useState(true)

  const filtered = useMemo(
    () => (levelFilter === 'all' ? dictations : dictations.filter((d) => d.level === levelFilter)),
    [levelFilter],
  )

  const active = activeId ? dictations.find((d) => d.id === activeId) : null

  const stats = useMemo(() => {
    const done = dictations.filter((d) => progress.exerciseScores[`dict-${d.id}`] === true).length
    return { done, total: dictations.length }
  }, [progress])

  const playDictation = useCallback(
    async (item: DictationItem) => {
      if (playing) return
      setPlaying(true)
      try {
        const rate = useSlow ? item.slowRate : settings.speechRate
        const url = await fetchSpeech(item.text, settings.ttsVoice, rate)
        await playAudioUrl(url)
      } catch {
        /* TTS offline */
      } finally {
        setPlaying(false)
      }
    },
    [playing, useSlow, settings.speechRate, settings.ttsVoice],
  )

  const startDictation = (id: string) => {
    setActiveId(id)
    setAnswer('')
    setResult(null)
    setShowHint(false)
  }

  const checkAnswer = () => {
    if (!active) return
    const ok = compareLatvian(answer, active.text)
    setResult(ok ? 'correct' : 'wrong')
    recordExercise(`dict-${active.id}`, ok, { category: `dict-${active.id}` })
    addStudyTime(2)
  }

  const nextDictation = () => {
    if (!active) return
    const idx = filtered.findIndex((d) => d.id === active.id)
    const next = filtered[idx + 1] ?? filtered[0]
    if (next) startDictation(next.id)
  }

  if (active) {
    const doneBefore = progress.exerciseScores[`dict-${active.id}`] === true

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
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={playing}
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
                onChange={(e) => setUseSlow(e.target.checked)}
                className="rounded"
              />
              <Gauge size={14} />
              {t('common.slowPercent', { percent: Math.round(active.slowRate * 100) })}
            </label>
          </div>

          <textarea
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value)
              setResult(null)
            }}
            rows={3}
            placeholder={t('dictation.placeholder')}
            className="w-full resize-none rounded-lg border border-border bg-surface-2 px-4 py-3 text-base focus:border-accent focus:outline-none"
            disabled={result === 'correct'}
          />

          {result === 'correct' && (
            <div className="flex items-center gap-2 text-green-500">
              <Check size={18} />
              <span>{t('common.correct')}</span>
            </div>
          )}
          {result === 'wrong' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-400">
                <X size={18} />
                <span>{t('common.hasErrors')}</span>
              </div>
              <p className="rounded-lg bg-surface-2 px-3 py-2 font-serif text-accent">{active.text}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {result !== 'correct' && (
              <>
                <button
                  type="button"
                  onClick={checkAnswer}
                  disabled={!answer.trim()}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
                >
                  {t('common.check')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowHint((v) => !v)}
                  className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-text"
                >
                  {showHint ? t('dictation.hideHint') : t('dictation.hintRu')}
                </button>
              </>
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
            <button
              type="button"
              onClick={() => {
                setAnswer('')
                setResult(null)
                setShowHint(false)
              }}
              className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm text-muted"
            >
              <RotateCcw size={14} /> {t('common.reset')}
            </button>
          </div>

          {showHint && (
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
        {(['all', 'A1', 'A2', 'B1'] as LevelFilter[]).map((lvl) => (
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
