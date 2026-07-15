import { useCallback, useEffect, useRef, useState } from 'react'
import { VoiceEngine } from './voiceEngine'
import type { PronunciationAssessment, VoiceEngineOptions, VoicePhase } from './types'

export function useVoiceEngine(options: VoiceEngineOptions) {
  const optionsRef = useRef(options)
  optionsRef.current = options

  const engineRef = useRef<VoiceEngine | null>(null)
  const [phase, setPhase] = useState<VoicePhase>('idle')
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const engine = new VoiceEngine(optionsRef.current)
    engine.setListeners({
      onPhase: setPhase,
      onTranscript: setTranscript,
      onError: setError,
    })
    engineRef.current = engine
    return () => engine.destroy()
  }, [])

  const startRecording = useCallback(async () => {
    setError('')
    engineRef.current!.updateOptions(optionsRef.current)
    await engineRef.current!.startRecording()
  }, [])

  const stopRecording = useCallback(() => {
    engineRef.current!.stopRecording()
  }, [])

  const evaluate = useCallback(
    async (expected: string, keywords?: string[]): Promise<PronunciationAssessment> => {
      setError('')
      engineRef.current!.updateOptions(optionsRef.current)
      return engineRef.current!.finishAndEvaluate({ expected, keywords })
    },
    [],
  )

  return {
    phase,
    listening: phase === 'recording',
    processing: phase === 'processing',
    transcript,
    error,
    startRecording,
    stopRecording,
    evaluate,
  }
}
