import { apiHeaders } from './apiHeaders'
import { apiUrl } from './apiBase'

export type TtsVoice = {
  id: string
  name: string
  gender: string
  desc: string
}

const audioCache = new Map<string, string>() // key -> blob URL

function cacheKey(text: string, voice: string, rate: number) {
  return `${voice}:${rate}:${text}`
}

export async function fetchSpeech(
  text: string,
  voice: string,
  rate: number,
): Promise<string> {
  const key = cacheKey(text, voice, rate)
  const cached = audioCache.get(key)
  if (cached) return cached

  const params = new URLSearchParams({
    text,
    voice,
    rate: rate.toString(),
  })

  const response = await fetch(`${apiUrl('/api/tts')}?${params}`, { headers: apiHeaders() })
  if (!response.ok) {
    throw new Error(`TTS failed: ${response.status}`)
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  audioCache.set(key, url)
  return url
}

export async function getAvailableVoices(): Promise<TtsVoice[]> {
  try {
    const res = await fetch(apiUrl('/api/tts/voices'), { headers: apiHeaders() })
    if (!res.ok) return []
    const data = await res.json()
    return data.voices
  } catch {
    return []
  }
}

export async function checkTtsHealth(): Promise<boolean> {
  try {
    const res = await fetch(apiUrl('/api/tts/health'))
    return res.ok
  } catch {
    return false
  }
}

export function clearAudioCache() {
  for (const url of audioCache.values()) {
    URL.revokeObjectURL(url)
  }
  audioCache.clear()
}

export function playAudioUrl(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url)
    audio.onended = () => resolve()
    audio.onerror = () => reject(new Error('Audio playback failed'))
    audio.play().catch(reject)
  })
}
