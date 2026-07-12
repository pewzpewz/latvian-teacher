import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  stripBracketTranslations,
  isHoverableLine,
  isLatvianWord,
  WORD_TOKEN_RE,
  cleanMarkdown,
  countCyrillic,
  countLatin,
} from '../lib/chatText'
import { getWordGloss, peekCachedGloss } from '../lib/wordGloss'

type HoverWordProps = {
  word: string
  sentence: string
}

function HoverWord({ word, sentence }: HoverWordProps) {
  const [tip, setTip] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const genRef = useRef(0)
  const spanRef = useRef<HTMLSpanElement>(null)

  const fetchGloss = () => {
    const cached = peekCachedGloss(word, sentence)
    if (cached) {
      setTip(cached)
      setLoading(false)
      return
    }

    setLoading(true)
    setTip(null)

    timerRef.current = setTimeout(async () => {
      const gen = ++genRef.current
      try {
        const gloss = await getWordGloss(word, sentence)
        if (gen !== genRef.current) return
        setTip(gloss || 'перевод не найден')
      } catch {
        if (gen === genRef.current) setTip('перевод не найден')
      } finally {
        if (gen === genRef.current) setLoading(false)
      }
    }, 80)
  }

  const show = () => {
    setVisible(true)
    fetchGloss()
  }

  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (longPressRef.current) clearTimeout(longPressRef.current)
    genRef.current++
    setVisible(false)
    setLoading(false)
    setTip(null)
  }

  const onMouseEnter = () => show()

  const onMouseLeave = () => hide()

  const onTouchStart = () => {
    longPressRef.current = setTimeout(() => show(), 450)
  }

  const onTouchEnd = () => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current)
      longPressRef.current = null
    }
  }

  useEffect(() => {
    if (!visible) return

    const onDocPointer = (e: PointerEvent) => {
      if (spanRef.current && !spanRef.current.contains(e.target as Node)) {
        hide()
      }
    }

    document.addEventListener('pointerdown', onDocPointer)
    return () => document.removeEventListener('pointerdown', onDocPointer)
  }, [visible])

  const showTooltip = visible && (loading || (tip && tip.length > 0))

  return (
    <span ref={spanRef} className="relative inline">
      <span
        className="cursor-help border-b border-dotted border-accent/40 text-accent/90 transition-colors hover:border-accent hover:text-accent"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      >
        {word}
      </span>
      {showTooltip && (
        <span className="absolute bottom-full left-1/2 z-50 mb-1.5 max-w-[240px] -translate-x-1/2 whitespace-normal rounded-lg border border-gold/30 bg-surface px-2.5 py-1 text-center text-xs font-medium text-text shadow-lg">
          {loading ? <span className="text-muted">перевожу…</span> : tip}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-border" />
        </span>
      )}
    </span>
  )
}

function renderLine(line: string, lineIndex: number) {
  const cleaned = cleanMarkdown(line)
  const sentence = stripBracketTranslations(cleaned)
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

  if (!isHoverableLine(cleaned)) {
    return <span key={lineIndex}>{cleaned}</span>
  }

  const tokens: ReactNode[] = []
  let match: RegExpExecArray | null
  const re = new RegExp(WORD_TOKEN_RE.source, WORD_TOKEN_RE.flags)
  let tokenIdx = 0

  while ((match = re.exec(cleaned)) !== null) {
    const token = match[0]
    if (isLatvianWord(token, cleaned)) {
      tokens.push(
        <HoverWord key={`${lineIndex}-${tokenIdx++}`} word={token} sentence={sentence} />,
      )
    } else {
      tokens.push(<span key={`${lineIndex}-${tokenIdx++}`}>{token}</span>)
    }
  }

  return <span key={lineIndex}>{tokens}</span>
}

type Props = {
  content: string
  role: 'user' | 'assistant'
}

export function ChatMessageContent({ content, role }: Props) {
  const display = role === 'assistant' ? stripBracketTranslations(content) : content
  const lines = display.split('\n')

  return (
    <div className="whitespace-pre-wrap leading-relaxed">
      {lines.map((line, i) => (
        <span key={i}>
          {role === 'assistant' ? renderLine(line, i) : line}
          {i < lines.length - 1 ? '\n' : null}
        </span>
      ))}
    </div>
  )
}
