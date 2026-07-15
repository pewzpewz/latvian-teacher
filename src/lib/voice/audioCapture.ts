const MAX_MS = 30_000

export class AudioCapture {
  private stream: MediaStream | null = null
  private recorder: MediaRecorder | null = null
  private chunks: BlobPart[] = []
  private startedAt = 0
  private maxTimer: ReturnType<typeof setTimeout> | null = null

  async start(): Promise<void> {
    if (this.recorder?.state === 'recording') return
    this.chunks = []
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
      video: false,
    })

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : ''

    this.recorder = mimeType
      ? new MediaRecorder(this.stream, { mimeType })
      : new MediaRecorder(this.stream)

    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data)
    }

    this.recorder.start(250)
    this.startedAt = Date.now()

    this.maxTimer = setTimeout(() => {
      void this.stop()
    }, MAX_MS)
  }

  async stop(): Promise<Blob | null> {
    if (this.maxTimer) {
      clearTimeout(this.maxTimer)
      this.maxTimer = null
    }

    if (!this.recorder || this.recorder.state === 'inactive') {
      this.cleanupStream()
      return null
    }

    return new Promise((resolve) => {
      const rec = this.recorder!
      rec.onstop = () => {
        const type = rec.mimeType || 'audio/webm'
        const blob = this.chunks.length > 0 ? new Blob(this.chunks, { type }) : null
        this.chunks = []
        this.recorder = null
        this.cleanupStream()
        resolve(blob && blob.size > 0 ? blob : null)
      }
      rec.stop()
    })
  }

  private cleanupStream() {
    for (const t of this.stream?.getTracks() ?? []) t.stop()
    this.stream = null
  }

  durationMs() {
    return this.startedAt ? Date.now() - this.startedAt : 0
  }
}

export async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!)
  return btoa(binary)
}
