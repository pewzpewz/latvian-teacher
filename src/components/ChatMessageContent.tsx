import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Languages } from 'lucide-react'
import {
  stripBracketTranslations,
  cleanMarkdown,
  countCyrillic,
  countLatin,
  needsMessageTranslation,
} from '../lib/chatText'
import { getMessageTranslation, peekMessageTranslation } from '../lib/messageTranslation'
import { useTranslation } from '../hooks/useTranslation'

function renderLine(line: string, lineIndex: number) {
  const cleaned = cleanMarkdown(line)
  const cyr = countCyrillic(cleaned)
  const lat = countLatin(cleaned)

  if (cyr > lat && lat < 4) {
    return (
      <span
        key={lineIndex}
        className="my-1 block border-l-2 border-muted/30 pl-3 text-xs leading-relaxed text-muted"
      >
        {cleaned}
      </span>
    )
  }

  return <span key={lineIndex}>{cleaned}</span>
}

type TranslateControlsProps = {
  content: string
  role: 'user' | 'assistant'
  pinned: boolean
  onPinnedChange: (pinned: boolean) => void
  onTranslation: (text: string | null, loading: boolean) => void
}

function MessageTranslateControls({
  content,
  role,
  pinned,
  onPinnedChange,
  onTranslation,
}: TranslateControlsProps) {
  const { t } = useTranslation()
  const [hoverOpen, setHoverOpen] = useState(false)
  const [translation, setTranslation] = useState<string | null>(() => peekMessageTranslation(content))
  const [loading, setLoading] = useState(false)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const genRef = useRef(0)

  const loadTranslation = async () => {
    const cached = peekMessageTranslation(content)
    if (cached) {
      setTranslation(cached)
      onTranslation(cached, false)
      return cached
    }

    setLoading(true)
    onTranslation(translation, true)
    const gen = ++genRef.current
    try {
      const ru = await getMessageTranslation(content)
      if (gen !== genRef.current) return ru
      const result = ru || t('chat.translationNotFound')
      setTranslation(result)
      onTranslation(result, false)
      return ru
    } catch {
      if (gen === genRef.current) {
        const fail = t('chat.translationNotFound')
        setTranslation(fail)
        onTranslation(fail, false)
      }
      return ''
    } finally {
      if (gen === genRef.current) setLoading(false)
    }
  }

  const showHover = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    hoverTimerRef.current = setTimeout(() => {
      setHoverOpen(true)
      void loadTranslation()
    }, 280)
  }

  const hideHover = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
    if (!pinned) setHoverOpen(false)
  }

  const togglePinned = () => {
    if (pinned) {
      onPinnedChange(false)
      return
    }
    onPinnedChange(true)
    setHoverOpen(false)
    void loadTranslation()
  }

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    }
  }, [])

  const btnClass =
    role === 'user'
      ? 'text-white/70 hover:text-white'
      : 'text-muted hover:text-accent'

  return (
    <div className="absolute right-0 top-0">
      <button
        type="button"
        onClick={togglePinned}
        onMouseEnter={showHover}
        onMouseLeave={hideHover}
        onFocus={showHover}
        onBlur={hideHover}
        className={`rounded-md p-0.5 transition-colors ${btnClass} ${pinned ? 'text-accent' : ''}`}
        title={t('chat.showTranslation')}
        aria-label={t('chat.showTranslation')}
        aria-expanded={pinned || hoverOpen}
      >
        <Languages size={14} />
      </button>

      {hoverOpen && !pinned && (
        <div
          className="absolute right-0 top-full z-50 mt-1 w-[min(280px,calc(100vw-3rem))] rounded-lg border border-gold/30 bg-surface px-3 py-2 text-xs leading-relaxed text-text shadow-lg"
          onMouseEnter={() => setHoverOpen(true)}
          onMouseLeave={hideHover}
        >
          {loading ? (
            <span className="text-muted">{t('chat.translating')}</span>
          ) : (
            translation
          )}
        </div>
      )}
    </div>
  )
}

type Props = {
  content: string
  role: 'user' | 'assistant'
}

export function ChatMessageContent({ content, role }: Props) {
  const { t } = useTranslation()
  const display = role === 'assistant' ? stripBracketTranslations(content) : content
  const lines = display.split('\n')
  const showTranslate = needsMessageTranslation(display)
  const [pinned, setPinned] = useState(false)
  const [translation, setTranslation] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const body: ReactNode[] = lines.map((line, i) => (
    <span key={i}>
      {renderLine(line, i)}
      {i < lines.length - 1 ? '\n' : null}
    </span>
  ))

  return (
    <div>
      <div className={`relative ${showTranslate ? 'pr-6' : ''}`}>
        {showTranslate && (
          <MessageTranslateControls
            content={display}
            role={role}
            pinned={pinned}
            onPinnedChange={setPinned}
            onTranslation={(text, isLoading) => {
              setTranslation(text)
              setLoading(isLoading)
            }}
          />
        )}
        <div className="whitespace-pre-wrap leading-relaxed">{body}</div>
      </div>

      {showTranslate && pinned && (
        <div
          className={`mt-2 rounded-lg border px-3 py-2 text-xs leading-relaxed ${
            role === 'user'
              ? 'border-white/20 bg-white/10 text-white/90'
              : 'border-gold/25 bg-gold/5 text-muted'
          }`}
        >
          <p
            className={`mb-1 text-[10px] font-medium uppercase tracking-wide ${
              role === 'user' ? 'text-white/60' : 'text-gold'
            }`}
          >
            {t('chat.fullTranslation')}
          </p>
          {loading ? (
            <span className={role === 'user' ? 'text-white/70' : 'text-muted'}>{t('chat.translating')}</span>
          ) : (
            translation
          )}
        </div>
      )}
    </div>
  )
}
