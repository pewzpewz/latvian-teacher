import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useStore } from '../store/useStore'
import { fetchSpeech } from '../lib/tts'
import { prepareSpeechText, splitForTts } from '../lib/chatText'
import {
  abortSpeech,
  getCurrentAudio,
  getPausedSnapshot,
  getSessionActiveSnapshot,
  isSpeechAborted,
  isSpeechPaused,
  isSessionActive,
  pauseSpeech,
  resetSpeechAbort,
  resumeSpeech,
  setCurrentAudio,
  setSessionActive,
  subscribeSpeech,
  waitWhilePaused,
} from '../lib/speechController'
import { SttAdapter } from '../lib/voice/sttAdapter'

export function useSpeech() {
  const speechRate = useStore((s) => s.settings.speechRate)
  const ttsVoice = useStore((s) => s.settings.ttsVoice)
  const ttsEngine = useStore((s) => s.settings.ttsEngine)
  const sessionActive = useSyncExternalStore(subscribeSpeech, getSessionActiveSnapshot)
  const paused = useSyncExternalStore(subscribeSpeech, getPausedSnapshot)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const sttRef = useRef<SttAdapter | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopSpeaking = useCallback(() => abortSpeech(), [])
  const pauseSpeaking = useCallback(() => pauseSpeech(), [])
  const resumeSpeaking = useCallback(() => resumeSpeech(), [])

  const speakBrowser = useCallback(
    (text: string, lang = 'lv-LV') => {
      if (!window.speechSynthesis || isSpeechAborted()) return
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = speechRate
      const lvVoice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith('lv'))
      if (lvVoice) utterance.voice = lvVoice
      utterance.onstart = () => setSessionActive(true)
      utterance.onend = () => setSessionActive(false)
      utterance.onerror = () => setSessionActive(false)
      window.speechSynthesis.speak(utterance)
    },
    [speechRate],
  )

  const speakNeural = useCallback(
    async (text: string) => {
      abortSpeech()
      resetSpeechAbort()
      setSessionActive(true)
      try {
        const url = await fetchSpeech(text, ttsVoice, speechRate)
        if (isSpeechAborted()) return
        const audio = new Audio(url)
        setCurrentAudio(audio)
        audio.onended = () => {
          setCurrentAudio(null)
          setSessionActive(false)
        }
        audio.onerror = () => {
          setCurrentAudio(null)
          setSessionActive(false)
        }
        await audio.play()
      } catch {
        if (!isSpeechAborted()) speakBrowser(text)
        else setSessionActive(false)
      }
    },
    [ttsVoice, speechRate, speakBrowser],
  )

  const speakNeuralOnce = useCallback(
    async (text: string): Promise<void> => {
      if (isSpeechAborted()) return
      const url = await fetchSpeech(text, ttsVoice, speechRate)
      if (isSpeechAborted()) return

      const audio = new Audio(url)
      setCurrentAudio(audio)

      await new Promise<void>((resolve, reject) => {
        const cleanup = () => {
          if (pollRef.current) clearInterval(pollRef.current)
          pollRef.current = null
        }

        audio.onended = () => {
          cleanup()
          if (getCurrentAudio() === audio) setCurrentAudio(null)
          resolve()
        }
        audio.onerror = () => {
          cleanup()
          reject(new Error('Audio playback failed'))
        }

        pollRef.current = setInterval(() => {
          if (isSpeechAborted()) {
            cleanup()
            audio.pause()
            if (getCurrentAudio() === audio) setCurrentAudio(null)
            resolve()
            return
          }
          if (isSpeechPaused()) {
            if (!audio.paused && !audio.ended) audio.pause()
          } else if (audio.paused && !audio.ended && isSessionActive()) {
            audio.play().catch(reject)
          }
        }, 120)

        audio.play().catch((e) => {
          cleanup()
          reject(e)
        })
      })
    },
    [ttsVoice, speechRate],
  )

  const speakBrowserOnce = useCallback(
    (text: string, lang = 'lv-LV'): Promise<void> => {
      if (isSpeechAborted()) return Promise.resolve()
      return new Promise((resolve, reject) => {
        if (!window.speechSynthesis) {
          reject(new Error('No speech synthesis'))
          return
        }
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = lang
        utterance.rate = speechRate
        const lvVoice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith('lv'))
        if (lvVoice) utterance.voice = lvVoice
        utterance.onend = () => resolve()
        utterance.onerror = () => reject(new Error('Speech error'))
        window.speechSynthesis.speak(utterance)
      })
    },
    [speechRate],
  )

  const speak = useCallback(
    (text: string, lang = 'lv-LV') => {
      resetSpeechAbort()
      if (ttsEngine === 'neural') speakNeural(text)
      else {
        abortSpeech()
        resetSpeechAbort()
        speakBrowser(text, lang)
      }
    },
    [ttsEngine, speakNeural, speakBrowser],
  )

  const speakMessage = useCallback(
    async (content: string) => {
      abortSpeech()
      resetSpeechAbort()
      const prepared = prepareSpeechText(content)
      if (!prepared.trim()) return

      const chunks = splitForTts(prepared)
      setSessionActive(true)
      try {
        for (const chunk of chunks) {
          if (isSpeechAborted()) break
          await waitWhilePaused()
          if (isSpeechAborted()) break
          if (ttsEngine === 'neural') {
            try {
              await speakNeuralOnce(chunk)
            } catch {
              if (!isSpeechAborted()) await speakBrowserOnce(chunk)
            }
          } else {
            await speakBrowserOnce(chunk)
          }
        }
      } finally {
        setSessionActive(false)
        setCurrentAudio(null)
      }
    },
    [ttsEngine, speakNeuralOnce, speakBrowserOnce],
  )

  const startListening = useCallback(() => {
    sttRef.current?.destroy()
    const stt = new SttAdapter(
      {
        onInterim: (text) => setTranscript(text),
        onFinal: (text) => setTranscript(text),
        onStart: () => {
          setListening(true)
          setTranscript('')
        },
        onEnd: () => setListening(false),
        onError: () => setListening(false),
      },
      { continuous: false, interimResults: true },
    )
    sttRef.current = stt
    stt.start()
  }, [])

  const stopListening = useCallback(() => {
    sttRef.current?.stop()
    setListening(false)
  }, [])

  useEffect(() => {
    return () => sttRef.current?.destroy()
  }, [])

  useEffect(() => {
    window.speechSynthesis?.getVoices()
    const handler = () => window.speechSynthesis?.getVoices()
    window.speechSynthesis?.addEventListener('voiceschanged', handler)
    return () => {
      window.speechSynthesis?.removeEventListener('voiceschanged', handler)
      abortSpeech()
    }
  }, [])

  return {
    speak,
    speakMessage,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    sessionActive,
    paused,
    speaking: sessionActive,
    startListening,
    stopListening,
    listening,
    transcript,
  }
}

export function normalizeLatvian(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:]/g, '')
    .replace(/\s+/g, ' ')
}

export function compareLatvian(a: string, b: string): boolean {
  return normalizeLatvian(a) === normalizeLatvian(b)
}
