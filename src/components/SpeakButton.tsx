import { Volume2, Square, Pause, Play } from 'lucide-react'
import { useSpeech } from '../hooks/useSpeech'

type Props = {
  text: string
  size?: 'sm' | 'md'
  className?: string
  messageMode?: boolean
}

export function SpeakButton({ text, size = 'md', className = '', messageMode = false }: Props) {
  const {
    speak,
    speakMessage,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    sessionActive,
    paused,
  } = useSpeech()
  const iconSize = size === 'sm' ? 14 : 18
  const btnClass = `inline-flex items-center justify-center rounded-lg transition-colors hover:bg-accent/15 hover:text-accent ${
    size === 'sm' ? 'h-7 w-7' : 'h-9 w-9'
  }`

  if (messageMode && sessionActive) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {paused ? (
          <button
            type="button"
            onClick={resumeSpeaking}
            className={`${btnClass} bg-accent/20 text-accent`}
            title="Продолжить"
          >
            <Play size={iconSize} className="fill-current" />
          </button>
        ) : (
          <button
            type="button"
            onClick={pauseSpeaking}
            className={`${btnClass} bg-accent/20 text-accent`}
            title="Пауза"
          >
            <Pause size={iconSize} />
          </button>
        )}
        <button
          type="button"
          onClick={stopSpeaking}
          className={`${btnClass} bg-accent/20 text-accent`}
          title="Остановить"
        >
          <Square size={iconSize} className="fill-current" />
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => (messageMode ? speakMessage(text) : speak(text))}
      className={`${btnClass} ${className}`}
      title={messageMode ? 'Прослушать ответ' : 'Прослушать'}
    >
      <Volume2 size={iconSize} />
    </button>
  )
}
