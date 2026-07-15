import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, User, Mic, MicOff, Check, X, BookOpen, Drama, Loader2 } from 'lucide-react'
import { dialogs, getDialogById, type DialogLine } from '../data/dialogs'
import { SpeakButton } from '../components/SpeakButton'
import { useStore } from '../store/useStore'
import { useSpeech } from '../hooks/useSpeech'
import { useTranslation } from '../hooks/useTranslation'
import { useVoiceEngine } from '../lib/voice/useVoiceEngine'

const USER_SPEAKERS = new Set(['Jūs', 'Tu'])

function isUserLine(line: DialogLine): boolean {
  return USER_SPEAKERS.has(line.speaker)
}

export function DialogsPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const selected = id ? getDialogById(id) : null
  const [viewMode, setViewMode] = useState<'read' | 'practice'>(
    searchParams.get('mode') === 'practice' ? 'practice' : 'read',
  )
  const [activeLine, setActiveLine] = useState(0)
  const [practiceIndex, setPracticeIndex] = useState(0)
  const [practiceResult, setPracticeResult] = useState<'correct' | 'wrong' | null>(null)
  const [practiceDone, setPracticeDone] = useState(false)

  const dialogsCompleted = useStore((s) => s.progress.dialogsCompleted)
  const completeDialog = useStore((s) => s.completeDialog)
  const pronunciationEngine = useStore((s) => s.settings.pronunciationEngine)
  const { speak } = useSpeech()

  const voiceOptions = useMemo(
    () => ({
      mode: 'dialogTurn' as const,
      captureAudio: true,
      geminiForShortDialog: true,
      pronunciationPreference: pronunciationEngine,
    }),
    [pronunciationEngine],
  )

  const {
    listening,
    processing,
    transcript,
    startRecording,
    stopRecording,
    evaluate,
  } = useVoiceEngine(voiceOptions)

  useEffect(() => {
    if (searchParams.get('mode') === 'practice') setViewMode('practice')
  }, [searchParams])

  const resetPractice = useCallback(() => {
    setPracticeIndex(0)
    setPracticeResult(null)
    setPracticeDone(false)
  }, [])

  const finishDialog = useCallback(() => {
    if (selected) {
      completeDialog(selected.id)
      setPracticeDone(true)
    }
  }, [selected, completeDialog])

  const advancePractice = useCallback(() => {
    if (!selected) return
    if (practiceIndex >= selected.lines.length - 1) {
      finishDialog()
    } else {
      setPracticeIndex((i) => i + 1)
      setPracticeResult(null)
    }
  }, [selected, practiceIndex, finishDialog])

  const checkUserLine = useCallback(async () => {
    if (!selected) return
    stopRecording()
    const line = selected.lines[practiceIndex]
    try {
      const report = await evaluate(line.lv)
      setPracticeResult(report.accepted ? 'correct' : 'wrong')
      if (report.accepted) {
        setTimeout(advancePractice, 800)
      }
    } catch {
      setPracticeResult('wrong')
    }
  }, [selected, practiceIndex, stopRecording, evaluate, advancePractice])

  if (selected) {
    const isCompleted = dialogsCompleted.includes(selected.id)
    const currentPracticeLine = selected.lines[practiceIndex]

    return (
      <div>
        <Link to="/dialogs" className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-text">
          <ArrowLeft size={16} />
          {t('dialogs.allDialogs')}
        </Link>

        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="gradient-text text-3xl font-bold">{selected.title}</h1>
            <p className="mt-2 text-muted">{selected.scene}</p>
            {isCompleted && (
              <span className="mt-2 inline-block rounded-full bg-success/15 px-3 py-1 text-xs text-success">
                {t('dialogs.passedPractice')}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setViewMode('read'); resetPractice() }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm ${
                viewMode === 'read' ? 'bg-accent text-white' : 'border border-border'
              }`}
            >
              <BookOpen size={14} />
              {t('dialogs.reading')}
            </button>
            <button
              type="button"
              onClick={() => { setViewMode('practice'); resetPractice() }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm ${
                viewMode === 'practice' ? 'bg-accent text-white' : 'border border-border'
              }`}
            >
              <Drama size={14} />
              {t('dialogs.practice')}
            </button>
          </div>
        </div>

        {viewMode === 'read' ? (
          <>
            <div className="space-y-3">
              {selected.lines.map((line, i) => (
                <div
                  key={i}
                  onClick={() => setActiveLine(i)}
                  className={`cursor-pointer rounded-2xl border p-5 transition-colors ${
                    activeLine === i
                      ? 'border-accent/40 bg-accent/5'
                      : 'border-border bg-surface-2 hover:border-accent/20'
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <User size={14} className="text-muted" />
                    <span className="text-sm font-medium text-gold">{line.speaker}</span>
                    <SpeakButton text={line.lv} size="sm" />
                  </div>
                  <p className="latvian-text mb-1 text-lg">{line.lv}</p>
                  <p className="text-sm text-muted">{line.ru}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setActiveLine((i) => Math.max(0, i - 1))}
                disabled={activeLine === 0}
                className="rounded-xl border border-border px-4 py-2 text-sm disabled:opacity-30"
              >
                {t('dialogs.back')}
              </button>
              <button
                type="button"
                onClick={() => setActiveLine((i) => Math.min(selected.lines.length - 1, i + 1))}
                disabled={activeLine === selected.lines.length - 1}
                className="rounded-xl bg-accent px-4 py-2 text-sm text-white disabled:opacity-30"
              >
                {t('dialogs.next')}
              </button>
            </div>
          </>
        ) : practiceDone ? (
          <div className="rounded-2xl border border-success/30 bg-success/10 p-8 text-center">
            <Check size={40} className="mx-auto mb-4 text-success" />
            <p className="text-xl font-semibold text-success">{t('dialogs.completed')}</p>
            <p className="mt-2 text-muted">{t('dialogs.completedDesc')}</p>
            <button
              type="button"
              onClick={resetPractice}
              className="mt-6 rounded-xl border border-border px-4 py-2 text-sm"
            >
              {t('dialogs.retry')}
            </button>
          </div>
        ) : (
          <div className="glass mx-auto max-w-lg rounded-3xl p-8">
            <p className="mb-2 text-center text-sm text-muted">
              {t('common.replicaOf', { current: practiceIndex + 1, total: selected.lines.length })}
            </p>

            {!isUserLine(currentPracticeLine) ? (
              <>
                <div className="mb-4 text-center">
                  <span className="text-sm font-medium text-gold">{currentPracticeLine.speaker}</span>
                  <p className="latvian-text mt-3 text-2xl font-bold text-accent">{currentPracticeLine.lv}</p>
                  <p className="mt-2 text-sm text-muted">{currentPracticeLine.ru}</p>
                </div>
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => speak(currentPracticeLine.lv)}
                    className="rounded-xl bg-accent/15 px-4 py-2 text-sm text-accent"
                  >
                    {t('dialogs.listen')}
                  </button>
                  <button
                    type="button"
                    onClick={advancePractice}
                    className="rounded-xl bg-accent px-4 py-2 text-sm text-white"
                  >
                    {t('dialogs.next')}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4 text-center">
                  <span className="text-sm font-medium text-gold">
                    {t('dialogs.yourLine', { speaker: currentPracticeLine.speaker })}
                  </span>
                  <p className="mt-3 text-sm text-muted">{currentPracticeLine.ru}</p>
                  <p className="latvian-text mt-4 text-xl font-bold text-accent">{currentPracticeLine.lv}</p>
                </div>

                <div className="mb-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => void (listening ? checkUserLine() : startRecording())}
                    disabled={processing}
                    className={`flex h-16 w-16 items-center justify-center rounded-full ${
                      listening ? 'animate-pulse bg-red-500/20 text-red-400' : 'bg-success/15 text-success'
                    }`}
                  >
                    {processing ? <Loader2 size={28} className="animate-spin" /> : listening ? <MicOff size={28} /> : <Mic size={28} />}
                  </button>
                </div>

                {listening && (
                  <p className="mb-4 text-center text-sm text-muted">{t('common.speakPromptShort')}</p>
                )}

                {transcript && (
                  <p className="mb-4 text-center text-sm">
                    {t('common.youSaid')} <span className="latvian-text font-medium">{transcript}</span>
                  </p>
                )}

                {practiceResult && (
                  <div
                    className={`mb-4 flex items-center justify-center gap-2 rounded-xl p-3 ${
                      practiceResult === 'correct' ? 'bg-success/10 text-success' : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {practiceResult === 'correct' ? <Check size={18} /> : <X size={18} />}
                    {practiceResult === 'correct' ? t('common.excellent') : t('common.tryAgain')}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <h1 className="gradient-text mb-2 text-3xl font-bold">{t('dialogs.title')}</h1>
      <p className="mb-8 text-muted">{t('dialogs.subtitle')}</p>

      <div className="grid gap-4">
        {dialogs.map((dialog) => {
          const done = dialogsCompleted.includes(dialog.id)
          return (
            <div key={dialog.id} className="glass card-hover rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium text-text">{dialog.title}</h3>
                  <p className="mt-1 text-sm text-muted">{dialog.scene}</p>
                  {done && <span className="mt-2 inline-block text-xs text-success">{t('dialogs.passed')}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">{dialog.level}</span>
                  <Link
                    to={`/dialogs/${dialog.id}`}
                    className="rounded-xl border border-border px-3 py-1.5 text-sm no-underline"
                  >
                    {t('common.read')}
                  </Link>
                  <Link
                    to={`/dialogs/${dialog.id}?mode=practice`}
                    className="rounded-xl bg-accent px-3 py-1.5 text-sm text-white no-underline"
                  >
                    {t('dialogs.practice')}
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
