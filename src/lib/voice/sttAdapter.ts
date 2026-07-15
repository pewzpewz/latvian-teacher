import type { SttCallbacks, SttOptions } from './types'

export function isSttSupported(): boolean {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}

export class SttAdapter {
  private recognition: SpeechRecognition | null = null
  private listening = false
  private destroyed = false
  private resumeTimer: ReturnType<typeof setTimeout> | null = null
  private callbacks: SttCallbacks
  private options: SttOptions

  constructor(callbacks: SttCallbacks, options: SttOptions = {}) {
    this.callbacks = callbacks
    this.options = options
  }

  private createRecognition(): SpeechRecognition {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) throw new Error('Браузер не поддерживает распознавание речи')

    const rec = new SR()
    rec.lang = this.options.lang ?? 'lv-LV'
    rec.interimResults = this.options.interimResults ?? true
    rec.continuous = this.options.continuous ?? false

    rec.onstart = () => {
      this.listening = true
      this.callbacks.onStart?.()
    }

    rec.onresult = (event) => {
      if (this.options.canAcceptResults && !this.options.canAcceptResults()) return

      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) final += t
        else interim += t
      }

      const preview = (final || interim).trim()
      if (preview) this.callbacks.onInterim?.(preview)
      if (final.trim()) this.callbacks.onFinal?.(final.trim())
    }

    rec.onend = () => {
      this.listening = false
      this.callbacks.onEnd?.()
      if (
        !this.destroyed &&
        this.options.autoResume &&
        this.options.canAcceptResults?.() !== false
      ) {
        this.resumeTimer = setTimeout(() => this.start(), 300)
      }
    }

    rec.onerror = () => {
      this.listening = false
      this.callbacks.onError?.('Speech recognition error')
    }

    return rec
  }

  start() {
    if (this.listening || this.destroyed) return
    if (!this.recognition) this.recognition = this.createRecognition()
    try {
      this.recognition.start()
      this.listening = true
    } catch {
      /* already started */
    }
  }

  stop() {
    if (this.resumeTimer) {
      clearTimeout(this.resumeTimer)
      this.resumeTimer = null
    }
    if (!this.listening) return
    this.recognition?.stop()
    this.listening = false
  }

  isListening() {
    return this.listening
  }

  destroy() {
    this.destroyed = true
    this.stop()
    this.recognition = null
  }

  /** Reset instance for a new single-shot session */
  reset() {
    this.destroyed = false
    this.recognition = null
    this.listening = false
  }
}
