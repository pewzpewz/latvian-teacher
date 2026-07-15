import { getModel, getProvider, resolveApiKey } from './ai.js'
import { pickStricterTranscription } from './pronunciationTextScore.js'

export type ServerPronunciationResult = {
  score: number
  accepted: boolean
  similarity: number
  chars: { char: string; status: 'match' | 'diacritic' | 'wrong' | 'missing' }[]
  tips: string[]
  spokenApprox: string
  source: 'gemini' | 'stt'
}

const PRONUNCIATION_PROMPT = (expected: string) => `You are a strict Latvian speech transcription assistant.

Step 1 — Transcribe ONLY what you hear in the audio into "spokenApprox".
Rules for spokenApprox:
- Write exactly what the speaker said, letter by letter.
- NEVER copy or auto-correct to the expected phrase.
- If a consonant or vowel is skipped, omit it (e.g. hearing "labien" write "labien", NOT "labdien").
- If pronunciation is unclear, write your best phonetic guess in Latin letters.

Step 2 — Compare spokenApprox to the expected phrase: "${expected}"
Fill "chars": one entry per character of the expected phrase (including spaces and punctuation).
Status per char: match | diacritic | wrong | missing
- missing = speaker skipped this sound/letter
- wrong = speaker said a different sound

Step 3 — "tips": max 3 short tips in Russian about concrete mistakes.

Respond ONLY with valid JSON (no markdown):
{
  "spokenApprox": "exactly what you heard",
  "chars": [{"char":"l","status":"match|diacritic|wrong|missing"}],
  "tips": ["..."]
}

Do NOT include accuracyScore or accepted — scoring is computed separately.
Focus on Latvian diacritics: ā, ē, ī, ū, č, š, ž, ģ, ķ, ļ, ņ.`

export async function assessPronunciationWithGemini(
  expected: string,
  audioBase64: string,
  mimeType: string,
  clientKey?: string,
  sttTranscript?: string,
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
            { text: PRONUNCIATION_PROMPT(expected) },
          ],
        },
      ],
      generationConfig: {
        temperature: 0,
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

  const geminiSpoken = parsed.spokenApprox?.trim() || ''
  const textAnalysis = pickStricterTranscription(expected, geminiSpoken, sttTranscript?.trim())

  const score = Math.round(textAnalysis.similarity * 100)
  const similarity = textAnalysis.similarity
  const accepted = textAnalysis.accepted

  const geminiChars = (parsed.chars ?? []).map((c) => ({
    char: c.char,
    status: (['match', 'diacritic', 'wrong', 'missing'].includes(c.status)
      ? c.status
      : 'wrong') as 'match' | 'diacritic' | 'wrong' | 'missing',
  }))

  const chars =
    textAnalysis.chars.some((c) => c.status !== 'match' && c.status !== 'diacritic')
      ? textAnalysis.chars
      : geminiChars.length > 0
        ? geminiChars
        : textAnalysis.chars

  const tips = [...new Set([...(parsed.tips ?? []), ...textAnalysis.tips])].slice(0, 3)

  return {
    score,
    accepted,
    similarity,
    chars: chars.length > 0 ? chars : expected.split('').map((char) => ({ char, status: 'wrong' as const })),
    tips,
    spokenApprox: textAnalysis.spokenDisplay,
    source: 'gemini',
  }
}
