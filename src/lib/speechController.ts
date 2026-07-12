/** Глобальный контроллер озвучки */

type Listener = () => void

let sessionActive = false
let paused = false
let aborted = false
let currentAudio: HTMLAudioElement | null = null
const listeners = new Set<Listener>()
const pauseWaiters: (() => void)[] = []

function notify() {
  for (const fn of listeners) fn()
}

export type SpeechUiState = {
  sessionActive: boolean
  paused: boolean
}

export function getSessionActiveSnapshot(): boolean {
  return sessionActive
}

export function getPausedSnapshot(): boolean {
  return paused
}

/** @deprecated */
export function getSpeechUiSnapshot(): SpeechUiState {
  return { sessionActive, paused }
}

export function subscribeSpeech(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function isSpeechAborted(): boolean {
  return aborted
}

export function isSpeechPaused(): boolean {
  return paused
}

export function isSessionActive(): boolean {
  return sessionActive
}

export function resetSpeechAbort(): void {
  aborted = false
}

export function abortSpeech(): void {
  aborted = true
  paused = false
  sessionActive = false
  window.speechSynthesis?.cancel()
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
  }
  while (pauseWaiters.length) pauseWaiters.pop()?.()
  notify()
}

export function pauseSpeech(): void {
  if (!sessionActive || paused) return
  paused = true
  if (currentAudio && !currentAudio.paused) {
    currentAudio.pause()
  }
  try {
    window.speechSynthesis?.pause()
  } catch {
    /* not supported */
  }
  notify()
}

export function resumeSpeech(): void {
  if (!sessionActive || !paused) return
  paused = false
  while (pauseWaiters.length) pauseWaiters.pop()?.()
  if (currentAudio?.paused) {
    currentAudio.play().catch(() => {})
  }
  try {
    window.speechSynthesis?.resume()
  } catch {
    /* not supported */
  }
  notify()
}

export function setSessionActive(active: boolean): void {
  sessionActive = active
  if (!active) paused = false
  notify()
}

export function setCurrentAudio(audio: HTMLAudioElement | null): void {
  currentAudio = audio
}

export function getCurrentAudio(): HTMLAudioElement | null {
  return currentAudio
}

/** Ждать снятия паузы (между фрагментами или во время воспроизведения) */
export function waitWhilePaused(): Promise<void> {
  if (!paused || aborted) return Promise.resolve()
  return new Promise((resolve) => {
    pauseWaiters.push(resolve)
  })
}

/** @deprecated use getSpeechUiSnapshot */
export function getSpeechSnapshot(): boolean {
  return sessionActive
}
