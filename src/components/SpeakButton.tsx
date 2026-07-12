import { Volume2, Square, Pause, Play } from 'lucide-react'
import { useSpeech } from '../hooks/useSpeech'
import { useTranslation } from '../hooks/useTranslation'

type Props = {
  text: string
  size?: 'sm' | 'md'
  className?: string
  messageMode?: boolean
}

export function SpeakButton({ text, size = 'md', className = '', messageMode = false }: Props) {
  const { t } = useTranslation()
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
            title={t('speak.resume')}
          >
            <Play size={iconSize} className="fill-current" />
          </button>
        ) : (
          <button
            type="button"
            onClick={pauseSpeaking}
            className={`${btnClass} bg-accent/20 text-accent`}
            title={t('speak.pause')}
          >
            <Pause size={iconSize} />
          </button>
        )}
        <button
          type="button"
          onClick={stopSpeaking}
          className={`${btnClass} bg-accent/20 text-accent`}
          title={t('speak.stop')}
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
      title={messageMode ? t('speak.listenReply') : t('speak.listen')}
    >
      <Volume2 size={iconSize} />
    </button>
  )
}
