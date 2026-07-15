import { SttAdapter } from './sttAdapter'
import { AudioCapture } from './audioCapture'
import { assessPronunciationAudio } from './pronunciationClient'
import { scoreTranscript, shouldUseGeminiForDialog } from './scoring'
import type {
  PronunciationAssessment,
  VoiceEngineOptions,
  VoiceEvaluateInput,
  VoicePhase,
} from './types'

export type VoiceEngineListeners = {
  onPhase?: (phase: VoicePhase) => void
  onTranscript?: (text: string) => void
  onError?: (message: string) => void
}

export class VoiceEngine {
  private phase: VoicePhase = 'idle'
  private stt: SttAdapter | null = null
  private audio: AudioCapture | null = null
  private transcript = ''
  private listeners: VoiceEngineListeners = {}
  private acceptingResults = true
  private options: VoiceEngineOptions

  constructor(options: VoiceEngineOptions) {
    this.options = options
  }

  updateOptions(partial: Partial<VoiceEngineOptions>) {
    this.options = { ...this.options, ...partial }
  }

  setListeners(listeners: VoiceEngineListeners) {
    this.listeners = listeners
  }

  getPhase() {
    return this.phase
  }

  getTranscript() {
    return this.transcript
  }

  clearTranscript() {
    this.transcript = ''
    this.listeners.onTranscript?.('')
  }

  private setPhase(phase: VoicePhase) {
    this.phase = phase
    this.listeners.onPhase?.(phase)
  }

  setAcceptingResults(accept: boolean) {
    this.acceptingResults = accept
  }

  async startRecording() {
    if (this.phase === 'recording') return
    this.transcript = ''
    this.setPhase('recording')

    const sttOpts = this.options.stt ?? {}
    this.stt = new SttAdapter(
      {
        onInterim: (text) => {
          this.transcript = text
          this.listeners.onTranscript?.(text)
        },
        onFinal: (text) => {
          this.transcript = text
          this.listeners.onTranscript?.(text)
        },
        onStart: () => this.setPhase('recording'),
        onEnd: () => {
          if (this.phase === 'recording' && !sttOpts.continuous) {
            this.setPhase('idle')
          }
        },
        onError: (msg) => this.listeners.onError?.(msg),
      },
      {
        lang: sttOpts.lang ?? 'lv-LV',
        continuous: sttOpts.continuous ?? false,
        interimResults: sttOpts.interimResults ?? true,
        autoResume: sttOpts.autoResume ?? false,
        canAcceptResults: () => this.acceptingResults && (sttOpts.canAcceptResults?.() ?? true),
      },
    )

    if (this.options.captureAudio) {
      this.audio = new AudioCapture()
      try {
        await this.audio.start()
      } catch (e) {
        this.listeners.onError?.(e instanceof Error ? e.message : 'Microphone denied')
        this.setPhase('error')
        throw e
      }
    }

    this.stt.start()
  }

  stopRecording() {
    this.stt?.stop()
  }

  async finishAndEvaluate(input: Omit<VoiceEvaluateInput, 'transcript' | 'mode'>): Promise<PronunciationAssessment> {
    this.stopRecording()
    this.setPhase('processing')

    const audioBlob = this.options.captureAudio ? await this.audio?.stop() : null
    const mode = this.options.mode
    const pref = this.options.pronunciationPreference ?? 'auto'

    const useGemini =
      pref === 'gemini' ||
      (pref === 'auto' &&
        audioBlob &&
        (mode === 'pronunciation' ||
          (mode === 'dialogTurn' &&
            this.options.geminiForShortDialog &&
            shouldUseGeminiForDialog(input.expected))))

    if (useGemini && audioBlob) {
      try {
        const result = await assessPronunciationAudio(input.expected, audioBlob)
        this.setPhase('idle')
        return result
      } catch (e) {
        if (pref === 'gemini') {
          this.setPhase('error')
          throw e
        }
        /* auto → STT fallback */
      }
    }

    const result = scoreTranscript({
      mode,
      expected: input.expected,
      keywords: input.keywords,
      transcript: this.transcript,
    })
    this.setPhase('idle')
    return result
  }

  /** Continuous conversation: start STT with auto-resume */
  startConversation(onFinal: (text: string) => void) {
    this.transcript = ''
    this.stt?.destroy()
    this.stt = new SttAdapter(
      {
        onInterim: (text) => {
          this.transcript = text
          this.listeners.onTranscript?.(text)
        },
        onFinal: (text) => {
          this.transcript = text
          this.listeners.onTranscript?.(text)
          onFinal(text)
        },
        onError: (msg) => this.listeners.onError?.(msg),
      },
      {
        continuous: true,
        interimResults: true,
        autoResume: true,
        canAcceptResults: () => this.acceptingResults,
      },
    )
    this.stt.start()
    this.setPhase('recording')
  }

  resumeConversationListening() {
    if (this.stt && !this.stt.isListening()) this.stt.start()
    this.setPhase('recording')
  }

  pauseConversationListening() {
    this.stt?.stop()
    this.setPhase('idle')
  }

  destroy() {
    this.stt?.destroy()
    this.stt = null
    void this.audio?.stop()
    this.audio = null
    this.setPhase('idle')
  }
}
