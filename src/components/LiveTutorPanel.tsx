import { useEffect, useRef, useState } from 'react'
import { Mic, MicOff, Radio, Square, Wifi } from 'lucide-react'
import { LiveTutorSession, type LivePhase } from '../lib/liveTutorSession'
import { ChatMessageContent } from './ChatMessageContent'
import { useTranslation } from '../hooks/useTranslation'

type Props = {
  profile: string
  apiKey?: string
  provider: string
  model: string
  voice: string
  speechRate: number
  onStudy: () => void
}

const phaseColors: Record<LivePhase, string> = {
  idle: 'bg-muted/20',
  connecting: 'bg-info/20',
  listening: 'bg-success/20 animate-pulse',
  thinking: 'bg-gold/20',
  speaking: 'bg-accent/20',
  error: 'bg-red-500/20',
}

export function LiveTutorPanel({ profile, apiKey, provider, model, voice, speechRate, onStudy }: Props) {
  const { t } = useTranslation()
  const sessionRef = useRef<LiveTutorSession | null>(null)
  const [phase, setPhase] = useState<LivePhase>('idle')
  const [webrtcReady, setWebrtcReady] = useState(false)
  const [userText, setUserText] = useState('')
  const [assistantText, setAssistantText] = useState('')
  const [error, setError] = useState('')
  const [active, setActive] = useState(false)

  const phaseLabel = (p: LivePhase) => t(`live.phase_${p}_tutor`)

  useEffect(() => {
    return () => {
      sessionRef.current?.stop()
    }
  }, [])

  const start = async () => {
    setError('')
    setUserText('')
    setAssistantText('')
    const session = new LiveTutorSession(
      {
        onPhase: setPhase,
        onUserText: setUserText,
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

  const stop = () => {
    sessionRef.current?.stop()
    sessionRef.current = null
    setActive(false)
    setWebrtcReady(false)
    setPhase('idle')
  }

  return (
    <div className="flex flex-1 flex-col rounded-2xl border border-border bg-surface p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Radio size={20} className="text-accent" />
            {t('live.tutorTitle')}
          </h2>
          <p className="text-sm text-muted">{t('live.tutorSubtitle')}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <Wifi size={14} className={webrtcReady ? 'text-success' : ''} />
          {webrtcReady ? t('live.webrtcActive') : t('live.webrtcInactive')}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-8">
        <div
          className={`flex h-36 w-36 items-center justify-center rounded-full border-2 border-accent/30 ${phaseColors[phase]}`}
        >
          {phase === 'listening' ? (
            <Mic size={48} className="text-success" />
          ) : phase === 'speaking' ? (
            <Radio size={48} className="text-accent" />
          ) : (
            <MicOff size={48} className="text-muted" />
          )}
        </div>
        <p className="text-center text-lg font-medium">{phaseLabel(phase)}</p>

        {userText && (
          <div className="w-full max-w-lg rounded-xl bg-accent/10 px-4 py-3 text-sm">
            <span className="text-xs text-muted">{t('common.you')} </span>
            {userText}
          </div>
        )}
        {assistantText && (
          <div className="w-full max-w-lg rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm">
            <ChatMessageContent content={assistantText} role="assistant" />
          </div>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {!active ? (
          <button
            type="button"
            onClick={() => void start()}
            className="flex items-center gap-2 rounded-xl bg-accent px-8 py-3 font-medium text-white hover:opacity-90"
          >
            <Mic size={18} />
            {t('live.startDialog')}
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
              onClick={stop}
              className="flex items-center gap-2 rounded-xl border border-red-500/40 px-5 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
            >
              <Square size={14} />
              {t('common.finish')}
            </button>
          </>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-muted">{t('live.tutorHint')}</p>
    </div>
  )
}
