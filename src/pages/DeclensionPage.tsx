import { useMemo, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Check, ChevronRight, HelpCircle, RotateCcw, X } from 'lucide-react'
import {
  declensionDrills,
  LATVIAN_CASES,
  type DeclensionDrill,
  type LatvianCaseId,
} from '../data/declensions'
import {
  filterDrills,
  pickDrillQueue,
  getDeclensionStats,
  caseLabel,
} from '../lib/declensionDrill'
import { compareLatvian } from '../hooks/useSpeech'
import { useStore } from '../store/useStore'
import { SpeakButton } from '../components/SpeakButton'
import { useTranslation } from '../hooks/useTranslation'

type Result = 'correct' | 'wrong' | null

export function DeclensionPage() {
  const { t } = useTranslation()
  const progress = useStore((s) => s.progress)
  const recordExercise = useStore((s) => s.recordExercise)
  const addStudyTime = useStore((s) => s.addStudyTime)

  const [caseFilter, setCaseFilter] = useState<LatvianCaseId | 'all'>('all')
  const [declFilter, setDeclFilter] = useState<number | 'all'>('all')
  const [queue, setQueue] = useState<DeclensionDrill[]>(() =>
    pickDrillQueue(declensionDrills, progress, 10),
  )
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<Result>(null)
  const [showHint, setShowHint] = useState(false)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionTotal, setSessionTotal] = useState(0)

  const filtered = useMemo(
    () => filterDrills(declensionDrills, { caseId: caseFilter, declension: declFilter }),
    [caseFilter, declFilter],
  )

  const stats = useMemo(() => getDeclensionStats(progress, filtered), [progress, filtered])

  const current = queue[index] ?? queue[0]

  const reshuffle = useCallback(() => {
    setQueue(pickDrillQueue(filtered, progress, 10))
    setIndex(0)
    setAnswer('')
    setResult(null)
    setShowHint(false)
  }, [filtered, progress])

  const applyFilters = (caseId: LatvianCaseId | 'all', decl: number | 'all') => {
    setCaseFilter(caseId)
    setDeclFilter(decl)
    const pool = filterDrills(declensionDrills, { caseId, declension: decl })
    setQueue(pickDrillQueue(pool, progress, 10))
    setIndex(0)
    setAnswer('')
    setResult(null)
    setShowHint(false)
  }

  const check = () => {
    if (!current || result) return
    const ok = compareLatvian(answer, current.form)
    setResult(ok ? 'correct' : 'wrong')
    recordExercise(current.id, ok, { category: 'declensions', lessonId: 'declension-drill' })
    setSessionTotal((t) => t + 1)
    if (ok) setSessionCorrect((c) => c + 1)
    if (sessionTotal > 0 && sessionTotal % 4 === 3) addStudyTime(1)
  }

  const next = () => {
    setAnswer('')
    setResult(null)
    setShowHint(false)
    if (index < queue.length - 1) {
      setIndex((i) => i + 1)
    } else {
      reshuffle()
    }
  }

  if (!current) {
    return (
      <div className="text-center">
        <p className="text-muted">{t('common.noExercisesForFilters')}</p>
        <button type="button" onClick={() => applyFilters('all', 'all')} className="mt-4 text-accent">
          {t('common.resetFilters')}
        </button>
      </div>
    )
  }

  const caseMeta = LATVIAN_CASES.find((c) => c.id === current.case)

  return (
    <div data-testid="declension-page">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="gradient-text text-3xl font-bold">{t('declension.title')}</h1>
          <p className="mt-2 max-w-xl text-muted">{t('declension.subtitle')}</p>
        </div>
        <Link
          to="/lessons/cases-intro"
          className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-muted hover:border-accent/40 hover:text-text"
        >
          <BookOpen size={16} />
          {t('declension.lessonLink')}
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: t('declension.statCorrect'), value: stats.correct, color: 'text-success' },
          { label: t('declension.statWrong'), value: stats.wrong, color: 'text-red-400' },
          { label: t('declension.statNew'), value: stats.unseen, color: 'text-gold' },
          {
            label: t('declension.statSession'),
            value: `${sessionCorrect}/${sessionTotal}`,
            color: 'text-accent',
          },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl px-4 py-3 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => applyFilters('all', declFilter)}
          className={`rounded-full px-3 py-1 text-xs ${caseFilter === 'all' ? 'bg-accent text-white' : 'border border-border'}`}
        >
          {t('declension.allCases')}
        </button>
        {LATVIAN_CASES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => applyFilters(c.id, declFilter)}
            className={`rounded-full px-3 py-1 text-xs ${caseFilter === c.id ? 'bg-accent text-white' : 'border border-border'}`}
            title={`${c.ru} (${c.question})`}
          >
            {caseLabel(c.id)} · {c.ru}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => applyFilters(caseFilter, 'all')}
          className={`rounded-full px-3 py-1 text-xs ${declFilter === 'all' ? 'bg-gold/20 text-gold' : 'border border-border'}`}
        >
          {t('declension.allDeclensions')}
        </button>
        {[1, 2, 4, 6].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => applyFilters(caseFilter, n)}
            className={`rounded-full px-3 py-1 text-xs ${declFilter === n ? 'bg-gold/20 text-gold' : 'border border-border'}`}
          >
            {t('declension.declensionShort', { n })}
          </button>
        ))}
      </div>

      <div className="glass mx-auto max-w-2xl rounded-2xl p-6 md:p-8">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-accent">
            {t('declension.declensionN', { n: current.declension })}
          </span>
          <span className="rounded-full bg-surface-2 px-2 py-0.5">
            {caseMeta?.lv} ({caseMeta?.question})
          </span>
          <span>
            {t('common.sessionOf', { current: index + 1, total: queue.length })}
          </span>
        </div>

        <p className="mb-1 text-sm text-muted">{t('declension.sourceWord')}</p>
        <p className="latvian-text mb-4 text-2xl font-semibold text-accent">
          {current.lemma}
          <span className="ml-3 text-lg font-normal text-muted">({current.lemmaRu})</span>
        </p>

        <p className="mb-4 text-lg font-medium">{current.promptRu}</p>

        {current.hint && !result && (
          <button
            type="button"
            onClick={() => setShowHint((v) => !v)}
            className="mb-3 flex items-center gap-1 text-sm text-muted hover:text-gold"
          >
            <HelpCircle size={14} />
            {t('common.hint')}
          </button>
        )}
        {showHint && current.hint && (
          <p className="mb-4 rounded-xl bg-gold/10 px-4 py-2 text-sm text-gold">{current.hint}</p>
        )}

        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !result && check()}
          placeholder={t('common.formPlaceholderLv')}
          disabled={result !== null}
          className="mb-4 w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-lg outline-none focus:border-accent disabled:opacity-60"
          data-testid="declension-answer"
          autoFocus
        />

        {result && (
          <div
            className={`mb-4 flex items-start gap-2 rounded-xl p-4 ${
              result === 'correct' ? 'bg-success/10 text-success' : 'bg-red-500/10 text-red-400'
            }`}
          >
            {result === 'correct' ? <Check size={20} className="shrink-0" /> : <X size={20} className="shrink-0" />}
            <div>
              {result === 'correct' ? (
                <p className="font-medium">{t('common.correct')}</p>
              ) : (
                <>
                  <p className="font-medium">{t('common.correctAnswer')}</p>
                  <p className="latvian-text mt-1 text-lg">{current.form}</p>
                </>
              )}
              {current.sentence && (
                <div className="mt-3 border-t border-border/40 pt-3 text-sm text-text">
                  <p className="latvian-text italic">{current.sentence.lv}</p>
                  <p className="mt-1 text-muted">{current.sentence.ru}</p>
                </div>
              )}
              <div className="mt-2 flex justify-end">
                <SpeakButton text={current.form} size="sm" />
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {!result ? (
            <button
              type="button"
              onClick={check}
              disabled={!answer.trim()}
              className="rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-white disabled:opacity-40"
              data-testid="declension-check"
            >
              {t('common.check')}
            </button>
          ) : (
            <button
              type="button"
              onClick={next}
              className="flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-white"
              data-testid="declension-next"
            >
              {t('declension.next')}
              <ChevronRight size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={reshuffle}
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm hover:border-accent/40"
          >
            <RotateCcw size={14} />
            {t('common.newSession')}
          </button>
        </div>
      </div>
    </div>
  )
}
