import { apiHeaders } from './apiHeaders'
import { apiUrl } from './apiBase'

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export type AdaptiveContentResponse = {
  words: { lv: string; ru: string; category: string; reason: string }[]
  exercises: {
    id: string
    type: 'translate' | 'fill' | 'choose'
    question: string
    answer: string
    options?: string[]
    hint?: string
    topic: string
  }[]
  tip: string
}

export async function sendToAiTutor(
  messages: ChatMessage[],
  options?: { apiKey?: string; provider?: string; model?: string; profile?: string },
): Promise<string> {
  const hasClientKey = !!options?.apiKey?.trim()
  const response = await fetch(apiUrl('/api/chat'), {
    method: 'POST',
    headers: apiHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      messages,
      profile: options?.profile,
      ...(hasClientKey
        ? { apiKey: options!.apiKey, provider: options?.provider, model: options?.model }
        : {}),
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || `HTTP ${response.status}`)
  }

  const data = await response.json()
  return data.content
}

export async function streamToAiTutor(
  messages: ChatMessage[],
  options: { apiKey?: string; provider?: string; model?: string; profile?: string },
  onChunk: (fullText: string) => void,
): Promise<string> {
  const hasClientKey = !!options?.apiKey?.trim()
  const response = await fetch(apiUrl('/api/chat/stream'), {
    method: 'POST',
    headers: apiHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      messages,
      profile: options?.profile,
      ...(hasClientKey
        ? { apiKey: options!.apiKey, provider: options?.provider, model: options?.model }
        : {}),
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || `HTTP ${response.status}`)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    return sendToAiTutor(messages, options)
  }

  const decoder = new TextDecoder()
  let buffer = ''
  let full = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      try {
        const data = JSON.parse(line.slice(6)) as { text?: string; error?: string; done?: boolean }
        if (data.error) throw new Error(data.error)
        if (data.text) {
          full += data.text
          onChunk(full)
        }
      } catch (parseErr) {
        if (parseErr instanceof Error && parseErr.message !== 'Unexpected end of JSON input') {
          throw parseErr
        }
      }
    }
  }

  return full
}

export async function generateAdaptiveContent(
  profileSummary: string,
  options?: { apiKey?: string; provider?: string; model?: string },
): Promise<AdaptiveContentResponse> {
  const hasClientKey = !!options?.apiKey?.trim()
  const response = await fetch(apiUrl('/api/adapt'), {
    method: 'POST',
    headers: apiHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      profile: profileSummary,
      ...(hasClientKey
        ? { apiKey: options!.apiKey, provider: options?.provider, model: options?.model }
        : {}),
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || `HTTP ${response.status}`)
  }

  return response.json()
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(apiUrl('/api/health'))
    return res.ok
  } catch {
    return false
  }
}

export type AiStatus = {
  provider: string
  model: string
  configured: boolean
  keyHint: string
}

export async function getAiStatus(): Promise<AiStatus | null> {
  try {
    const res = await fetch(apiUrl('/api/ai/status'))
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function fetchWordGloss(word: string, sentence: string): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const response = await fetch(apiUrl('/api/gloss'), {
      method: 'POST',
      headers: apiHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ word, sentence }),
      signal: controller.signal,
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error((err as { error?: string }).error || 'Gloss failed')
    }
    const data = await response.json()
    return (data.translation as string)?.trim() || ''
  } finally {
    clearTimeout(timeout)
  }
}
