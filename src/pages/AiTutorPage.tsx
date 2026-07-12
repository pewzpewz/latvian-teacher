import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Send, Sparkles, AlertCircle, Loader2, Trash2, Mic, MicOff, MessageSquare, Radio } from 'lucide-react'
import { streamToAiTutor, checkApiHealth, getAiStatus, type ChatMessage, type AiStatus } from '../lib/api'
import { useStore } from '../store/useStore'
import { buildProfileSummary } from '../lib/adaptive'
import { SpeakButton } from '../components/SpeakButton'
import { ChatMessageContent } from '../components/ChatMessageContent'
import { LiveTutorPanel } from '../components/LiveTutorPanel'
import { abortSpeech } from '../lib/speechController'
import { useSpeech } from '../hooks/useSpeech'

const WELCOME: ChatMessage = {
  role: 'assistant',
  content:
    'Sveiki! Es esmu tavs latviešu valodas skolotājs. 🇱🇻\n\nЯ ваш AI-репетитор по латышскому. Могу объяснить грамматику, составить упражнения, проверить ваши фразы и вести диалог. Пишите на русском или латышском!',
}

const suggestions = [
  'Объясни мне падежи простыми словами',
  'Составь диалог для кафе',
  'Проверь мою фразу: Es esmu students',
  'Дай 5 новых слов на тему еды',
  'Расскажи о латышских праздниках',
]

export function AiTutorPage() {
  const settings = useStore((s) => s.settings)
  const progress = useStore((s) => s.progress)
  const setChatHistory = useStore((s) => s.setChatHistory)
  const addStudyTime = useStore((s) => s.addStudyTime)

  const initialMessages = useMemo((): ChatMessage[] => {
    if (progress.chatHistory.length > 0) {
      return progress.chatHistory.map((m) => ({ role: m.role, content: m.content }))
    }
    return [WELCOME]
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- only on mount

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [apiOnline, setApiOnline] = useState<boolean | null>(null)
  const [aiStatus, setAiStatus] = useState<AiStatus | null>(null)
  const [viewMode, setViewMode] = useState<'chat' | 'live'>('chat')
  const [voiceMode, setVoiceMode] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const wasListeningRef = useRef(false)

  const { startListening, stopListening, listening, transcript, speakMessage } = useSpeech()

  useEffect(() => {
    checkApiHealth().then(setApiOnline)
    getAiStatus().then(setAiStatus)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') abortSpeech()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const persistHistory = (msgs: ChatMessage[]) => {
    const toSave = msgs.filter((m) => m.role === 'user' || m.role === 'assistant')
    setChatHistory(toSave.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })))
  }

  const clearHistory = () => {
    setMessages([WELCOME])
    setChatHistory([])
  }

  const send = useCallback(async (text: string, speakReply = false) => {
    if (!text.trim() || loading) return

    const userMsg: ChatMessage = { role: 'user', content: text.trim() }
    const baseMessages = [...messages, userMsg]
    setMessages([...baseMessages, { role: 'assistant', content: '' }])
    setInput('')
    setLoading(true)
    setError('')

    try {
      const reply = await streamToAiTutor(
        baseMessages,
        {
          apiKey: settings.aiApiKey || undefined,
          provider: settings.aiProvider,
          model: settings.aiModel,
          profile: buildProfileSummary(progress, settings),
        },
        (partial) => {
          setMessages([...baseMessages, { role: 'assistant', content: partial }])
        },
      )
      const final: ChatMessage[] = [
        ...baseMessages,
        { role: 'assistant', content: reply },
      ]
      setMessages(final)
      persistHistory(final)
      addStudyTime(2)
      if (speakReply && reply.trim()) {
        void speakMessage(reply)
      }
    } catch (e) {
      setMessages(messages)
      setError(e instanceof Error ? e.message : 'Ошибка соединения')
    } finally {
      setLoading(false)
    }
  }, [loading, messages, settings, progress, speakMessage, addStudyTime, setChatHistory])

  useEffect(() => {
    if (wasListeningRef.current && !listening && voiceMode && transcript.trim() && !loading) {
      void send(transcript.trim(), true)
    }
    wasListeningRef.current = listening
  }, [listening, transcript, voiceMode, loading, send])

  return (
    <div className="flex h-[calc(100dvh-5rem)] flex-col md:h-[calc(100vh-4rem)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="gradient-text text-3xl font-bold">AI-репетитор</h1>
          <p className="text-muted">Умный помощник для изучения латышского</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border border-border p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('chat')}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs ${
                viewMode === 'chat' ? 'bg-accent text-white' : 'text-muted hover:text-text'
              }`}
            >
              <MessageSquare size={14} />
              Чат
            </button>
            <button
              type="button"
              onClick={() => setViewMode('live')}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs ${
                viewMode === 'live' ? 'bg-accent text-white' : 'text-muted hover:text-text'
              }`}
            >
              <Radio size={14} />
              Live
            </button>
          </div>
          {viewMode === 'chat' && (
            <button
              type="button"
              onClick={() => setVoiceMode((v) => !v)}
              className={`flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs ${
                voiceMode ? 'border-accent bg-accent/15 text-accent' : 'border-border text-muted hover:text-text'
              }`}
              title="Голосовой режим: STT → AI → TTS"
            >
              {voiceMode ? <Mic size={14} /> : <MicOff size={14} />}
              Push-to-talk
            </button>
          )}
          {viewMode === 'chat' && (
          <button
            type="button"
            onClick={clearHistory}
            className="flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs text-muted hover:text-text"
            title="Очистить историю"
          >
            <Trash2 size={14} />
            Очистить
          </button>
          )}
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`h-2 w-2 rounded-full ${apiOnline ? 'bg-success' : apiOnline === false ? 'bg-red-400' : 'bg-muted'}`}
            />
            {apiOnline
              ? aiStatus
                ? `${aiStatus.provider} / ${aiStatus.model}${aiStatus.configured ? '' : ' — нужен ключ'}`
                : 'Сервер подключён'
              : apiOnline === false
                ? 'Сервер offline'
                : 'Проверка...'}
          </div>
        </div>
      </div>

      {aiStatus && !aiStatus.configured && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-gold/20 bg-gold/5 px-4 py-3 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-gold" />
          <div>
            <p className="font-medium text-gold">Нужен API-ключ Gemini</p>
            <p className="mt-1 text-muted">
              1. Откройте{' '}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-accent underline">
                aistudio.google.com/apikey
              </a>
              <br />
              2. Создайте ключ → вставьте в <code className="text-xs">server/.env</code> как{' '}
              <code className="text-xs">GEMINI_API_KEY=...</code>
              <br />
              3. Перезапустите сервер (START.bat)
            </p>
          </div>
        </div>
      )}

      {!settings.aiApiKey && aiStatus?.configured && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-success/20 bg-success/5 px-4 py-3 text-sm text-success">
          <Sparkles size={16} />
          <span>Gemini подключён через server/.env — можно общаться!</span>
        </div>
      )}

      {viewMode === 'live' ? (
        <LiveTutorPanel
          profile={buildProfileSummary(progress, settings)}
          apiKey={settings.aiApiKey || undefined}
          provider={settings.aiProvider}
          model={settings.aiModel}
          voice={settings.ttsVoice}
          speechRate={settings.speechRate}
          onStudy={() => addStudyTime(2)}
        />
      ) : (
        <>
      <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-border bg-surface p-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[80%] ${
                msg.role === 'user'
                  ? 'bg-accent text-white'
                  : 'border border-border bg-surface-2'
              }`}
            >
              {msg.role === 'assistant' && (
                <Sparkles size={14} className="mb-1 text-gold" />
              )}
              {msg.content ? (
                <>
                  <ChatMessageContent
                    content={msg.content}
                    role={msg.role === 'user' ? 'user' : 'assistant'}
                  />
                  {msg.role === 'assistant' && (
                    <div className="mt-2 flex justify-end border-t border-border/50 pt-2">
                      <SpeakButton text={msg.content} size="sm" messageMode />
                    </div>
                  )}
                </>
              ) : (
                <Loader2 size={16} className="animate-spin text-muted" />
              )}
            </div>
          </div>
        ))}
        {error && (
          <div className="rounded-xl bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => send(s)}
            disabled={loading}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted hover:border-accent/30 hover:text-text disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-3">
        {voiceMode && (
          <button
            type="button"
            onClick={() => (listening ? stopListening() : startListening())}
            disabled={loading}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
              listening ? 'animate-pulse bg-red-500 text-white' : 'border border-accent bg-accent/10 text-accent'
            }`}
            title={listening ? 'Остановить запись' : 'Нажмите и говорите'}
          >
            <Mic size={20} />
          </button>
        )}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
          placeholder="Задайте вопрос или напишите фразу на латышском..."
          className="flex-1 rounded-xl border border-border bg-surface-2 px-4 py-3 outline-none focus:border-accent"
          disabled={loading}
        />
        <button
          type="button"
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-white disabled:opacity-40"
        >
          <Send size={18} />
        </button>
      </div>
        </>
      )}
    </div>
  )
}
