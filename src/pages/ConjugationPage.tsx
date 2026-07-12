import { useMemo, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Check, ChevronRight, HelpCircle, RotateCcw, X, Zap } from 'lucide-react'
import {
  conjugationDrills,
  CONJUGATION_PERSONS,
  CONJUGATION_GROUPS,
  type ConjugationDrill,
  type ConjugationGroup,
  type ConjugationPerson,
} from '../data/conjugations'
import {
  filterConjugationDrills,
  pickConjugationQueue,
  getConjugationStats,
  personLabel,
  uniqueLemmas,
} from '../lib/conjugationDrill'
import { compareLatvian } from '../hooks/useSpeech'
import { useStore } from '../store/useStore'
import { SpeakButton } from '../components/SpeakButton'
import { useTranslation } from '../hooks/useTranslation'

type Result = 'correct' | 'wrong' | null

export function ConjugationPage() {
  const { t } = useTranslation()
  const progress = useStore((s) => s.progress)
  const recordExercise = useStore((s) => s.recordExercise)
  const addStudyTime = useStore((s) => s.addStudyTime)

  const [personFilter, setPersonFilter] = useState<ConjugationPerson | 'all'>('all')
  const [groupFilter, setGroupFilter] = useState<ConjugationGroup | 'all'>('all')
  const [lemmaFilter, setLemmaFilter] = useState<string | 'all'>('all')
  const [queue, setQueue] = useState<ConjugationDrill[]>(() =>
    pickConjugationQueue(conjugationDrills, progress, 10),
  )
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<Result>(null)
  const [showHint, setShowHint] = useState(false)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionTotal, setSessionTotal] = useState(0)

  const lemmas = useMemo(() => uniqueLemmas(conjugationDrills), [])

  const filtered = useMemo(
    () =>
      filterConjugationDrills(conjugationDrills, {
        person: personFilter,
        group: groupFilter,
        lemma: lemmaFilter,
      }),
    [personFilter, groupFilter, lemmaFilter],
  )

  const stats = useMemo(() => getConjugationStats(progress, filtered), [progress, filtered])

  const current = queue[index] ?? queue[0]

  const applyFilters = (
    person: ConjugationPerson | 'all',
    group: ConjugationGroup | 'all',
    lemma: string | 'all',
  ) => {
    setPersonFilter(person)
    setGroupFilter(group)
    setLemmaFilter(lemma)
    const pool = filterConjugationDrills(conjugationDrills, {
      person,
      group,
      lemma,
    })
    setQueue(pickConjugationQueue(pool, progress, 10))
    setIndex(0)
    setAnswer('')
    setResult(null)
    setShowHint(false)
  }

  const reshuffle = useCallback(() => {
    setQueue(pickConjugationQueue(filtered, progress, 10))
    setIndex(0)
    setAnswer('')
    setResult(null)
    setShowHint(false)
  }, [filtered, progress])

  const check = () => {
    if (!current || result) return
    const ok = compareLatvian(answer, current.form)
    setResult(ok ? 'correct' : 'wrong')
    recordExercise(current.id, ok, { category: 'conjugations', lessonId: 'conjugation-drill' })
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
        <button
          type="button"
          onClick={() => applyFilters('all', 'all', 'all')}
          className="mt-4 text-accent"
        >
          {t('common.resetFilters')}
        </button>
      </div>
    )
  }

  const personMeta = CONJUGATION_PERSONS.find((p) => p.id === current.person)
  const groupMeta = CONJUGATION_GROUPS.find((g) => g.id === current.group)

  return (
    <div data-testid="conjugation-page">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="gradient-text text-3xl font-bold">{t('conjugation.title')}</h1>
          <p className="mt-2 max-w-xl text-muted">{t('conjugation.subtitle')}</p>
        </div>
        <Link
          to="/lessons/grammar-verbs-1"
          className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-muted hover:border-accent/40 hover:text-text"
        >
          <BookOpen size={16} />
          {t('conjugation.lessonLink')}
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: t('conjugation.statCorrect'), value: stats.correct, color: 'text-success' },
          { label: t('conjugation.statWrong'), value: stats.wrong, color: 'text-red-400' },
          { label: t('conjugation.statNew'), value: stats.unseen, color: 'text-gold' },
          {
            label: t('conjugation.statSession'),
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
          onClick={() => applyFilters('all', groupFilter, lemmaFilter)}
          className={`rounded-full px-3 py-1 text-xs ${personFilter === 'all' ? 'bg-accent text-white' : 'border border-border'}`}
        >
          {t('conjugation.allPersons')}
        </button>
        {CONJUGATION_PERSONS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => applyFilters(p.id, groupFilter, lemmaFilter)}
            className={`rounded-full px-3 py-1 text-xs ${personFilter === p.id ? 'bg-accent text-white' : 'border border-border'}`}
            title={`${p.pronoun} — ${p.ru}`}
          >
            {personLabel(p.id)} · {p.pronoun}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => applyFilters(personFilter, 'all', lemmaFilter)}
          className={`rounded-full px-3 py-1 text-xs ${groupFilter === 'all' ? 'bg-gold/20 text-gold' : 'border border-border'}`}
        >
          {t('conjugation.allGroups')}
        </button>
        {CONJUGATION_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => applyFilters(personFilter, g.id, lemmaFilter)}
            className={`rounded-full px-3 py-1 text-xs ${groupFilter === g.id ? 'bg-gold/20 text-gold' : 'border border-border'}`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => applyFilters(personFilter, groupFilter, 'all')}
          className={`rounded-full px-3 py-1 text-xs ${lemmaFilter === 'all' ? 'bg-info/20 text-info' : 'border border-border'}`}
        >
          {t('conjugation.allVerbs')}
        </button>
        {lemmas.map((lemma) => (
          <button
            key={lemma}
            type="button"
            onClick={() => applyFilters(personFilter, groupFilter, lemma)}
            className={`latvian-text rounded-full px-3 py-1 text-xs ${lemmaFilter === lemma ? 'bg-info/20 text-info' : 'border border-border'}`}
          >
            {lemma}
          </button>
        ))}
      </div>

      <div className="glass mx-auto max-w-2xl rounded-2xl p-6 md:p-8">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-accent">
            <Zap size={12} />
            {groupMeta?.label}
          </span>
          <span className="rounded-full bg-surface-2 px-2 py-0.5">
            {personMeta?.ru} ({personMeta?.pronoun})
          </span>
          <span>
            {t('common.sessionOf', { current: index + 1, total: queue.length })}
          </span>
        </div>

        <p className="mb-1 text-sm text-muted">{t('conjugation.infinitive')}</p>
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
          placeholder={t('common.verbFormPlaceholderLv')}
          disabled={result !== null}
          className="mb-4 w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-lg outline-none focus:border-accent disabled:opacity-60"
          data-testid="conjugation-answer"
          autoFocus
        />

        {result && (
          <div
            className={`mb-4 flex items-start gap-2 rounded-xl p-4 ${
              result === 'correct' ? 'bg-success/10 text-success' : 'bg-red-500/10 text-red-400'
            }`}
          >
            {result === 'correct' ? (
              <Check size={20} className="shrink-0" />
            ) : (
              <X size={20} className="shrink-0" />
            )}
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
                <SpeakButton text={current.sentence?.lv ?? current.form} size="sm" />
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
              data-testid="conjugation-check"
            >
              {t('common.check')}
            </button>
          ) : (
            <button
              type="button"
              onClick={next}
              className="flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-white"
              data-testid="conjugation-next"
            >
              {t('conjugation.next')}
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
