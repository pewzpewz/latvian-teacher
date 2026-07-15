import type { PhonemeChar } from '../phonemeFeedback'

export type VoiceMode = 'pronunciation' | 'dialogTurn' | 'examSpeaking' | 'conversation'

export type VoicePhase = 'idle' | 'recording' | 'processing' | 'error'

export type PronunciationSource = 'gemini' | 'stt'

export type SttOptions = {
  continuous?: boolean
  interimResults?: boolean
  lang?: string
  autoResume?: boolean
  /** When false, ignore STT results (e.g. while AI is speaking). */
  canAcceptResults?: () => boolean
}

export type SttCallbacks = {
  onInterim?: (text: string) => void
  onFinal?: (text: string) => void
  onError?: (message: string) => void
  onStart?: () => void
  onEnd?: () => void
}

export type PronunciationAssessment = {
  score: number
  accepted: boolean
  similarity: number
  chars: PhonemeChar[]
  tips: string[]
  spokenDisplay: string
  source: PronunciationSource
}

export type VoiceEvaluateInput = {
  expected: string
  keywords?: string[]
  transcript: string
  mode: VoiceMode
}

export type VoiceEngineOptions = {
  mode: VoiceMode
  /** pronunciation: record audio for Gemini; conversation: STT only */
  captureAudio?: boolean
  stt?: SttOptions
  /** Use Gemini for short dialog lines (≤8 words) when mode is dialogTurn */
  geminiForShortDialog?: boolean
  pronunciationPreference?: 'auto' | 'gemini' | 'stt'
}
