import type { WebSocket } from 'ws'
import { chat } from './ai.js'

export type LiveSession = {
  id: string
  messages: { role: string; content: string }[]
  profile?: string
  clientKey?: string
  provider?: string
  model?: string
  lastUtteranceAt?: number
  ws?: WebSocket
}

type ClientMsg =
  | { type: 'session_start'; profile?: string; apiKey?: string; provider?: string; model?: string }
  | { type: 'user_utterance'; text: string }
  | { type: 'interrupt' }
  | { type: 'ping' }
  | { type: 'webrtc_signal'; signal: string; payload?: unknown }

type HandleOpts = {
  utteranceCooldownMs?: number
  onUtteranceAccepted?: () => void
}

function send(ws: WebSocket, data: Record<string, unknown>) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(data))
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function handleLiveMessage(
  ws: WebSocket,
  session: LiveSession,
  raw: string,
  opts: HandleOpts = {},
) {
  let msg: ClientMsg
  try {
    msg = JSON.parse(raw) as ClientMsg
  } catch {
    send(ws, { type: 'error', message: 'Invalid JSON' })
    return
  }

  switch (msg.type) {
    case 'ping':
      send(ws, { type: 'pong', t: Date.now() })
      return

    case 'session_start':
      session.profile = msg.profile
      session.clientKey = msg.apiKey
      session.provider = msg.provider
      session.model = msg.model
      session.messages = []
      send(ws, { type: 'session_ready', sessionId: session.id })
      send(ws, { type: 'state', phase: 'listening' })
      return

    case 'interrupt':
      send(ws, { type: 'state', phase: 'listening' })
      return

    case 'webrtc_signal':
      send(ws, { type: 'webrtc_ack', signal: msg.signal })
      return

    case 'user_utterance': {
      const text = msg.text?.trim()
      if (!text) return

      const cooldown = opts.utteranceCooldownMs ?? 1500
      const now = Date.now()
      if (session.lastUtteranceAt && now - session.lastUtteranceAt < cooldown) {
        send(ws, { type: 'error', message: 'Слишком часто. Подождите секунду.' })
        return
      }

      session.lastUtteranceAt = now
      opts.onUtteranceAccepted?.()

      session.messages.push({ role: 'user', content: text })
      send(ws, { type: 'user_echo', text })
      send(ws, { type: 'state', phase: 'thinking' })

      try {
        const content = await chat(session.messages, {
          clientKey: session.clientKey,
          profile: session.profile,
          provider: session.provider,
          model: session.model,
        })

        const chunks = content.match(/\S+\s*|\s+/g) ?? [content]
        let full = ''
        for (const chunk of chunks) {
          full += chunk
          send(ws, { type: 'assistant_delta', text: full })
          await sleep(25)
        }

        session.messages.push({ role: 'assistant', content: full })
        send(ws, { type: 'assistant_done', text: full })
        send(ws, { type: 'state', phase: 'speaking' })
      } catch (e) {
        console.error('Live AI error:', e)
        send(ws, { type: 'error', message: 'AI временно недоступен' })
        send(ws, { type: 'state', phase: 'listening' })
      }
      return
    }

    default:
      send(ws, { type: 'error', message: 'Unknown message type' })
  }
}

export function createLiveSession(id: string): LiveSession {
  return { id, messages: [] }
}
