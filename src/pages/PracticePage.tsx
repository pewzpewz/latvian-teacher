import { useState, useMemo } from 'react'
import { Mic, MicOff, Volume2, Check, X, RefreshCw, Zap } from 'lucide-react'
import { useSpeech } from '../hooks/useSpeech'
import { analyzePronunciation } from '../lib/phonemeFeedback'
import { PronunciationFeedback } from '../components/PronunciationFeedback'
import { useStore } from '../store/useStore'
import {
  getPhrasePracticeItems,
  getWordPracticeItems,
  type PracticeItem,
} from '../data/practiceItems'
import { getAdaptivePracticeItems, estimateLevel } from '../lib/adaptive'
import { useTranslation } from '../hooks/useTranslation'

export function PracticePage() {
  const { t } = useTranslation()
  const { speak, speaking, startListening, stopListening, listening, transcript } = useSpeech()
  const { progress, recordPronunciation } = useStore()
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzePronunciation> | null>(null)
  const [mode, setMode] = useState<'adaptive' | 'phrases' | 'words'>('adaptive')

  const level = progress.estimatedLevel || estimateLevel(progress)

  const adaptiveItems = useMemo(() => getAdaptivePracticeItems(progress), [progress])

  const items = useMemo((): PracticeItem[] => {
    if (mode === 'adaptive') return adaptiveItems

    if (mode === 'phrases') return getPhrasePracticeItems()

    const personalWords = progress.adaptiveWords.map((w) => ({ lv: w.lv, ru: w.ru }))
    const dictionaryWords = getWordPracticeItems(level)
    const seen = new Set<string>()
    return [...personalWords, ...dictionaryWords].filter((item) => {
      const key = item.lv.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [mode, adaptiveItems, progress.adaptiveWords, level])

  const current = items[phraseIndex] ?? items[0]

  const checkPronunciation = () => {
    stopListening()
    const report = analyzePronunciation(transcript, current.lv)
    setAnalysis(report)
    setResult(report.accepted ? 'correct' : 'wrong')
    recordPronunciation(report.accepted)
  }

  const next = () => {
    setResult(null)
    setAnalysis(null)
    setPhraseIndex((i) => (i + 1) % items.length)
  }

  return (
    <div>
      <h1 className="gradient-text mb-2 text-3xl font-bold">{t('practice.title')}</h1>
      <p className="mb-8 text-muted">{t('practice.subtitle')}</p>

      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => { setMode('adaptive'); setPhraseIndex(0); setResult(null) }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm ${mode === 'adaptive' ? 'bg-accent text-white' : 'border border-border'}`}
        >
          <Zap size={14} />
          {t('practice.modeAdaptive')}
        </button>
        <button
          type="button"
          onClick={() => { setMode('phrases'); setPhraseIndex(0); setResult(null) }}
          className={`rounded-xl px-4 py-2 text-sm ${mode === 'phrases' ? 'bg-accent text-white' : 'border border-border'}`}
        >
          {t('practice.modePhrases')}
        </button>
        <button
          type="button"
          onClick={() => { setMode('words'); setPhraseIndex(0); setResult(null) }}
          className={`rounded-xl px-4 py-2 text-sm ${mode === 'words' ? 'bg-accent text-white' : 'border border-border'}`}
        >
          {t('practice.modeWords')}
        </button>
      </div>

      {mode === 'adaptive' && current.reason && (
        <div className="mx-auto mb-4 max-w-lg rounded-xl border border-gold/20 bg-gold/5 px-4 py-2 text-center text-sm text-gold">
          {current.reason}
        </div>
      )}

      {mode !== 'adaptive' && (
        <p className="mb-4 text-center text-sm text-muted">
          {mode === 'words'
            ? t('practice.wordsCount', { count: items.length })
            : t('practice.phrasesCount', { count: items.length })}
        </p>
      )}

      <div className="glass mx-auto max-w-lg rounded-3xl p-10 text-center">
        <p className="mb-2 text-sm text-muted">{current.ru}</p>
        <p className="latvian-text mb-8 text-4xl font-bold text-accent">{current.lv}</p>

        <div className="mb-8 flex justify-center gap-4">
          <button
            type="button"
            onClick={() => speak(current.lv)}
            disabled={speaking}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent transition-colors hover:bg-accent/25"
          >
            <Volume2 size={28} />
          </button>

          <button
            type="button"
            onClick={listening ? checkPronunciation : startListening}
            className={`flex h-16 w-16 items-center justify-center rounded-full transition-colors ${
              listening
                ? 'animate-pulse bg-red-500/20 text-red-400'
                : 'bg-success/15 text-success hover:bg-success/25'
            }`}
          >
            {listening ? <MicOff size={28} /> : <Mic size={28} />}
          </button>
        </div>

        {listening && (
          <p className="mb-4 text-sm text-muted">{t('common.speakPromptShort')}</p>
        )}

        {transcript && (
          <p className="mb-4 text-sm">
            {t('common.youSaid')} <span className="latvian-text font-medium">{transcript}</span>
          </p>
        )}

        {result && (
          <div
            className={`mb-4 rounded-xl p-3 ${
              result === 'correct' ? 'bg-success/10 text-success' : 'bg-red-500/10 text-red-400'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {result === 'correct' ? <Check size={18} /> : <X size={18} />}
              {result === 'correct'
                ? t('common.excellentWithPercent', {
                    percent: Math.round((analysis?.similarity ?? 1) * 100),
                  })
                : t('practice.discrepancies')}
            </div>
            {analysis && (
              <PronunciationFeedback
                chars={analysis.chars}
                tips={analysis.tips}
                spoken={analysis.spokenDisplay}
              />
            )}
          </div>
        )}

        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={next}
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm"
          >
            <RefreshCw size={14} />
            {t('practice.next')}
          </button>
        </div>

        <p className="mt-6 text-xs text-muted">
          {t('common.sessionOf', { current: phraseIndex + 1, total: items.length })}
          {progress.pronunciationAttempts.total > 0 && (
            <>
              {' '}
              ·{' '}
              {t('common.accuracyPercent', {
                percent: Math.round(
                  (progress.pronunciationAttempts.correct / progress.pronunciationAttempts.total) * 100,
                ),
              })}
            </>
          )}
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-lg rounded-xl border border-gold/20 bg-gold/5 p-4 text-sm">
        <p className="font-medium text-gold">{t('practice.tipTitle')}</p>
        <p className="mt-1 text-muted">{t('practice.tipText')}</p>
      </div>
    </div>
  )
}
