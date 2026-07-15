import { apiUrl } from '../apiBase'
import { apiHeaders } from '../apiHeaders'
import type { PronunciationAssessment } from './types'
import type { PhonemeChar } from '../phonemeFeedback'

type ApiResponse = {
  score: number
  accepted: boolean
  similarity: number
  chars: PhonemeChar[]
  tips: string[]
  spokenApprox?: string
  source: 'gemini' | 'stt'
}

export async function assessPronunciationAudio(
  expected: string,
  audioBlob: Blob,
  sttTranscript?: string,
): Promise<PronunciationAssessment> {
  const buffer = await audioBlob.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!)
  const audioBase64 = btoa(binary)

  const res = await fetch(apiUrl('/api/pronunciation'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...apiHeaders() },
    body: JSON.stringify({
      expected,
      audioBase64,
      mimeType: audioBlob.type || 'audio/webm',
      sttTranscript: sttTranscript?.trim() || undefined,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? `Pronunciation API ${res.status}`)
  }

  const data = (await res.json()) as ApiResponse
  return {
    score: data.score,
    accepted: data.accepted,
    similarity: data.similarity,
    chars: data.chars,
    tips: data.tips,
    spokenDisplay: data.spokenApprox ?? '—',
    source: data.source,
  }
}
