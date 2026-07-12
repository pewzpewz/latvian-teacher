import { useEffect, useRef, useState, useMemo } from 'react'
import { Mic, MicOff, Radio, Square, Wifi, CheckCircle2, Circle } from 'lucide-react'
import { LiveTutorSession, type LivePhase } from '../lib/liveTutorSession'
import { ChatMessageContent } from './ChatMessageContent'
import {
  B1_LIVE_EXAM_TASKS,
  buildB1LiveExamProfile,
  detectLiveExamProgress,
  isLiveExamFinished,
} from '../data/examB1Live'
import { useTranslation } from '../hooks/useTranslation'

type Props = {
  apiKey?: string
  provider: string
  model: string
  voice: string
  speechRate: number
  userName?: string
  onStudy: () => void
  onFinish: (result: { completed: boolean; tasksReached: number; utteranceCount: number }) => void
}

const phaseColors: Record<LivePhase, string> = {
  idle: 'bg-muted/20',
  connecting: 'bg-info/20',
  listening: 'bg-success/20 animate-pulse',
  thinking: 'bg-gold/20',
  speaking: 'bg-accent/20',
  error: 'bg-red-500/20',
}

export function LiveExamPanel({
  apiKey,
  provider,
  model,
  voice,
  speechRate,
  userName,
  onStudy,
  onFinish,
}: Props) {
  const { t } = useTranslation()
  const sessionRef = useRef<LiveTutorSession | null>(null)
  const lastUserFinalRef = useRef('')
  const [phase, setPhase] = useState<LivePhase>('idle')
  const [webrtcReady, setWebrtcReady] = useState(false)
  const [userText, setUserText] = useState('')
  const [assistantText, setAssistantText] = useState('')
  const [error, setError] = useState('')
  const [active, setActive] = useState(false)
  const [utteranceCount, setUtteranceCount] = useState(0)
  const [finished, setFinished] = useState(false)

  const phaseLabel = (p: LivePhase) => t(`live.phase_${p}_exam`)

  const profile = useMemo(
    () =>
      buildB1LiveExamProfile(
        userName ? `Studenta vārds (ja zina): ${userName}` : undefined,
      ),
    [userName],
  )

  const tasksReached = useMemo(() => detectLiveExamProgress(assistantText), [assistantText])
  const examComplete = useMemo(() => isLiveExamFinished(assistantText), [assistantText])

  useEffect(() => {
    if (examComplete && active && !finished) {
      setFinished(true)
    }
  }, [examComplete, active, finished])

  useEffect(() => {
    return () => {
      sessionRef.current?.stop()
    }
  }, [])

  const start = async () => {
    setError('')
    setUserText('')
    setAssistantText('')
    setUtteranceCount(0)
    setFinished(false)
    lastUserFinalRef.current = ''

    const session = new LiveTutorSession(
      {
        onPhase: setPhase,
        onUserText: (text) => {
          setUserText(text)
          const trimmed = text.trim()
          if (trimmed && trimmed !== lastUserFinalRef.current && phase === 'listening') {
            lastUserFinalRef.current = trimmed
          }
        },
        onAssistantPartial: setAssistantText,
        onAssistantDone: (text) => {
          setAssistantText(text)
          onStudy()
        },
        onError: (msg) => setError(msg),
        onWebrtcReady: setWebrtcReady,
      },
      { profile, apiKey, provider, model, voice, speechRate, autoResumeListen: true },
    )
    sessionRef.current = session
    setActive(true)
    try {
      await session.start()
    } catch (e) {
      setActive(false)
      setError(e instanceof Error ? e.message : t('common.errorGeneric'))
    }
  }

  const stop = (completed: boolean) => {
    sessionRef.current?.stop()
    sessionRef.current = null
    setActive(false)
    setWebrtcReady(false)
    setPhase('idle')
    onFinish({ completed, tasksReached, utteranceCount })
  }

  const lastPhaseRef = useRef<LivePhase>('idle')

  useEffect(() => {
    if (lastPhaseRef.current !== 'thinking' && phase === 'thinking') {
      setUtteranceCount((c) => c + 1)
    }
    lastPhaseRef.current = phase
  }, [phase])

  return (
    <div className="flex flex-col" data-testid="live-exam-panel">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Radio size={20} className="text-accent" />
            {t('live.examTitle')}
          </h2>
          <p className="text-sm text-muted">{t('live.examSubtitle')}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <Wifi size={14} className={webrtcReady ? 'text-success' : ''} />
          {webrtcReady ? t('live.webrtcActive') : t('live.webrtcInactive')}
        </div>
      </div>

      <ol className="mb-6 space-y-2">
        {B1_LIVE_EXAM_TASKS.map((task) => {
          const done = tasksReached >= task.step || finished
          const current = active && tasksReached === task.step - 1 && !finished
          return (
            <li
              key={task.id}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
                current
                  ? 'border-accent/50 bg-accent/10'
                  : done
                    ? 'border-success/30 bg-success/5'
                    : 'border-border bg-surface-2'
              }`}
            >
              {done ? (
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" />
              ) : (
                <Circle size={18} className="mt-0.5 shrink-0 text-muted" />
              )}
              <div>
                <p className="font-medium">
                  {task.step}. {task.titleRu}
                </p>
                <p className="text-muted">{task.descriptionRu}</p>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="glass flex flex-col items-center gap-6 rounded-2xl px-6 py-10">
        <div
          className={`flex h-32 w-32 items-center justify-center rounded-full border-2 border-accent/30 ${phaseColors[phase]}`}
        >
          {phase === 'listening' ? (
            <Mic size={44} className="text-success" />
          ) : phase === 'speaking' ? (
            <Radio size={44} className="text-accent" />
          ) : (
            <MicOff size={44} className="text-muted" />
          )}
        </div>
        <p className="text-center text-lg font-medium">{phaseLabel(phase)}</p>

        {userText && (
          <div className="w-full max-w-lg rounded-xl bg-accent/10 px-4 py-3 text-sm">
            <span className="text-xs text-muted">{t('common.you')} </span>
            <span className="latvian-text">{userText}</span>
          </div>
        )}
        {assistantText && (
          <div className="w-full max-w-lg rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm">
            <span className="mb-1 block text-xs text-muted">{t('live.examiner')}</span>
            <ChatMessageContent content={assistantText} role="assistant" />
          </div>
        )}
        {finished && (
          <p className="text-center text-sm font-medium text-success">{t('live.examFinished')}</p>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {!active ? (
          <button
            type="button"
            onClick={() => void start()}
            className="flex items-center gap-2 rounded-xl bg-accent px-8 py-3 font-medium text-white hover:opacity-90"
            data-testid="live-exam-start"
          >
            <Mic size={18} />
            {t('live.startExam')}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => sessionRef.current?.interrupt()}
              className="rounded-xl border border-border px-5 py-2.5 text-sm hover:border-accent/40"
            >
              {t('live.interrupt')}
            </button>
            <button
              type="button"
              onClick={() => stop(examComplete || tasksReached >= 4)}
              className="flex items-center gap-2 rounded-xl border border-red-500/40 px-5 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
              data-testid="live-exam-stop"
            >
              <Square size={14} />
              {examComplete ? t('common.finish') : t('common.exit')}
            </button>
          </>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-muted">
        {t('live.examHint')}
        {!apiKey && t('live.examHintNoKey')}
      </p>
    </div>
  )
}
