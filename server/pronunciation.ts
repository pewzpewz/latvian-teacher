import { getModel, getProvider, resolveApiKey } from './ai.js'

export type ServerPronunciationResult = {
  score: number
  accepted: boolean
  similarity: number
  chars: { char: string; status: 'match' | 'diacritic' | 'wrong' | 'missing' }[]
  tips: string[]
  spokenApprox: string
  source: 'gemini' | 'stt'
}

const PRONunciation_PROMPT = (expected: string) => `You are a Latvian pronunciation examiner. Listen to the audio and compare it to the expected phrase.

Expected phrase (Latvian): "${expected}"

Respond ONLY with valid JSON (no markdown):
{
  "accuracyScore": 0-100,
  "accepted": boolean (true if clearly understandable and mostly correct),
  "spokenApprox": "what you heard, in Latin letters",
  "chars": [{"char":"l","status":"match|diacritic|wrong|missing"}, ... one entry per character of expected phrase including spaces],
  "tips": ["max 3 short tips in Russian about pronunciation issues"]
}

Focus on Latvian diacritics: ā, ē, ī, ū, č, š, ž, ģ, ķ, ļ, ņ. Mark diacritic errors as "diacritic".`

export async function assessPronunciationWithGemini(
  expected: string,
  audioBase64: string,
  mimeType: string,
  clientKey?: string,
): Promise<ServerPronunciationResult> {
  const provider = getProvider()
  if (provider !== 'gemini') {
    throw new Error('Pronunciation assessment requires Gemini provider')
  }

  const apiKey = resolveApiKey(provider, clientKey)
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured')

  const model = getModel(provider)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: mimeType || 'audio/webm',
                data: audioBase64,
              },
            },
            { text: PRONunciation_PROMPT(expected) },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `Gemini ${response.status}`)
  }

  const data = await response.json()
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!raw) throw new Error('Empty Gemini pronunciation response')

  let parsed: {
    accuracyScore?: number
    accepted?: boolean
    spokenApprox?: string
    chars?: { char: string; status: string }[]
    tips?: string[]
  }

  try {
    parsed = JSON.parse(raw.replace(/^```json\s*|```$/g, '').trim())
  } catch {
    throw new Error('Invalid JSON from Gemini pronunciation')
  }

  const score = Math.min(100, Math.max(0, Math.round(parsed.accuracyScore ?? 0)))
  const similarity = score / 100
  const accepted = parsed.accepted ?? similarity >= 0.85

  const chars = (parsed.chars ?? []).map((c) => ({
    char: c.char,
    status: (['match', 'diacritic', 'wrong', 'missing'].includes(c.status)
      ? c.status
      : 'wrong') as 'match' | 'diacritic' | 'wrong' | 'missing',
  }))

  return {
    score,
    accepted,
    similarity,
    chars: chars.length > 0 ? chars : expected.split('').map((char) => ({ char, status: 'wrong' as const })),
    tips: (parsed.tips ?? []).slice(0, 3),
    spokenApprox: parsed.spokenApprox?.trim() || '—',
    source: 'gemini',
  }
}
