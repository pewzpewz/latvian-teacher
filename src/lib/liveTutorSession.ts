import { apiAccessTokenQuery } from './apiHeaders'
import { wsApiUrl } from './apiBase'
import { fetchSpeech, playAudioUrl } from './tts'
import { abortSpeech } from './speechController'
import { SttAdapter } from './voice/sttAdapter'

export type LivePhase = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'error'

export type LiveCallbacks = {
  onPhase: (phase: LivePhase) => void
  onUserText: (text: string) => void
  onAssistantPartial: (text: string) => void
  onAssistantDone: (text: string) => void
  onError: (message: string) => void
  onWebrtcReady: (ready: boolean) => void
}

export type LiveSessionOptions = {
  profile?: string
  apiKey?: string
  provider?: string
  model?: string
  voice?: string
  speechRate?: number
  autoResumeListen?: boolean
}

export class LiveTutorSession {
  private ws: WebSocket | null = null
  private pc: RTCPeerConnection | null = null
  private dc: RTCDataChannel | null = null
  private mediaStream: MediaStream | null = null
  private stt: SttAdapter | null = null
  private callbacks: LiveCallbacks
  private options: LiveSessionOptions
  private phase: LivePhase = 'idle'
  private destroyed = false

  constructor(callbacks: LiveCallbacks, options: LiveSessionOptions = {}) {
    this.callbacks = callbacks
    this.options = options
  }

  getPhase() {
    return this.phase
  }

  private setPhase(phase: LivePhase) {
    this.phase = phase
    this.callbacks.onPhase(phase)
  }

  private wsUrl() {
    const tokenQ = apiAccessTokenQuery()
    const path = `/api/live/ws${tokenQ ? `?${tokenQ}` : ''}`
    return wsApiUrl(path)
  }

  /** WebRTC: захват микрофона через RTCPeerConnection + DataChannel для сигналов */
  private async setupWebRTC(): Promise<void> {
    this.pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    })

    this.dc = this.pc.createDataChannel('lv-live-control')
    this.dc.onopen = () => {
      this.callbacks.onWebrtcReady(true)
      this.dc?.send(JSON.stringify({ type: 'client_ready' }))
    }
    this.dc.onclose = () => this.callbacks.onWebrtcReady(false)

    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
      video: false,
    })

    for (const track of this.mediaStream.getTracks()) {
      this.pc.addTrack(track, this.mediaStream)
    }

    this.callbacks.onWebrtcReady(true)

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'webrtc_signal', signal: 'connected' }))
    }
  }

  private setupContinuousSTT() {
    this.stt = new SttAdapter(
      {
        onInterim: (text) => {
          if (this.phase === 'thinking' || this.phase === 'speaking') return
          this.callbacks.onUserText(text)
        },
        onFinal: (text) => {
          if (this.phase === 'thinking' || this.phase === 'speaking') return
          this.callbacks.onUserText(text)
          if (text.trim() && this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'user_utterance', text: text.trim() }))
            this.stopListening()
          }
        },
      },
      {
        continuous: true,
        interimResults: true,
        autoResume: true,
        canAcceptResults: () => this.phase === 'listening' && !this.destroyed,
      },
    )
  }

  startListening() {
    if (this.phase !== 'listening' || !this.stt) return
    this.stt.start()
  }

  stopListening() {
    this.stt?.stop()
  }

  private async speak(text: string) {
    const voice = this.options.voice ?? 'lv-LV-EveritaNeural'
    const rate = this.options.speechRate ?? 0.85
    abortSpeech()
    try {
      const url = await fetchSpeech(text, voice, rate)
      await playAudioUrl(url)
    } catch {
      /* TTS optional fallback silent */
    }
  }

  private handleServerMessage(raw: string) {
    let msg: Record<string, unknown>
    try {
      msg = JSON.parse(raw) as Record<string, unknown>
    } catch {
      return
    }

    switch (msg.type) {
      case 'session_ready':
        this.setPhase('listening')
        this.startListening()
        break
      case 'state':
        if (msg.phase === 'listening') {
          this.setPhase('listening')
          this.startListening()
        } else if (msg.phase === 'thinking') {
          this.stopListening()
          this.setPhase('thinking')
        } else if (msg.phase === 'speaking') {
          this.setPhase('speaking')
        }
        break
      case 'user_echo':
        if (typeof msg.text === 'string') this.callbacks.onUserText(msg.text)
        break
      case 'assistant_delta':
        if (typeof msg.text === 'string') this.callbacks.onAssistantPartial(msg.text)
        break
      case 'assistant_done':
        if (typeof msg.text === 'string') {
          this.callbacks.onAssistantDone(msg.text)
          void this.speak(msg.text).then(() => {
            if (!this.destroyed) {
              this.setPhase('listening')
              this.startListening()
            }
          })
        }
        break
      case 'error':
        this.callbacks.onError(String(msg.message ?? 'Ошибка'))
        this.setPhase('error')
        break
    }
  }

  async start(): Promise<void> {
    if (this.phase !== 'idle' && this.phase !== 'error') return
    this.destroyed = false
    this.setPhase('connecting')

    try {
      await new Promise<void>((resolve, reject) => {
        const ws = new WebSocket(this.wsUrl())
        this.ws = ws

        ws.onopen = () => {
          ws.send(
            JSON.stringify({
              type: 'session_start',
              profile: this.options.profile,
              apiKey: this.options.apiKey || undefined,
              provider: this.options.provider,
              model: this.options.model,
            }),
          )
        }
        ws.onerror = () => reject(new Error('WebSocket не подключился'))
        ws.onmessage = (ev) => {
          const raw = String(ev.data)
          try {
            const parsed = JSON.parse(raw) as { type?: string }
            if (parsed.type === 'session_ready') {
              resolve()
              return
            }
          } catch {
            /* continue */
          }
          this.handleServerMessage(raw)
        }
        ws.onclose = () => {
          if (!this.destroyed) this.setPhase('idle')
        }
      })

      await this.setupWebRTC()
      this.setupContinuousSTT()
      this.setPhase('listening')
      this.startListening()
    } catch (e) {
      this.setPhase('error')
      this.callbacks.onError(e instanceof Error ? e.message : 'Не удалось начать live-сессию')
      throw e
    }
  }

  interrupt() {
    abortSpeech()
    this.ws?.send(JSON.stringify({ type: 'interrupt' }))
    this.setPhase('listening')
    this.startListening()
  }

  stop() {
    this.destroyed = true
    this.stopListening()
    this.stt?.destroy()
    this.stt = null
    abortSpeech()
    this.ws?.close()
    this.ws = null
    this.dc?.close()
    this.pc?.close()
    for (const t of this.mediaStream?.getTracks() ?? []) t.stop()
    this.mediaStream = null
    this.setPhase('idle')
  }
}
