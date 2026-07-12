import type { IncomingMessage } from 'http'
import type { WebSocket } from 'ws'
import { WebSocketServer } from 'ws'
import type { Server } from 'http'
import { verifyWsAccessToken } from './middleware/security.js'
import { createLiveSession, handleLiveMessage, type LiveSession } from './liveWs.js'

const MAX_CONNECTIONS = Number.parseInt(process.env.LIVE_MAX_CONNECTIONS ?? '20', 10)
const IDLE_TIMEOUT_MS = Number.parseInt(process.env.LIVE_IDLE_TIMEOUT_MS ?? '300000', 10)
const PING_INTERVAL_MS = Number.parseInt(process.env.LIVE_PING_INTERVAL_MS ?? '30000', 10)
const UTTERANCE_COOLDOWN_MS = Number.parseInt(process.env.LIVE_UTTERANCE_COOLDOWN_MS ?? '1500', 10)

type Tracked = {
  session: LiveSession
  lastActivity: number
  isAlive: boolean
  pingTimer: ReturnType<typeof setInterval>
  idleTimer: ReturnType<typeof setTimeout>
}

const connections = new Map<WebSocket, Tracked>()
let connectionCount = 0

function touch(tracked: Tracked) {
  tracked.lastActivity = Date.now()
  clearTimeout(tracked.idleTimer)
  tracked.idleTimer = setTimeout(() => {
    tracked.session.ws?.close(1000, 'Idle timeout')
  }, IDLE_TIMEOUT_MS)
}

function cleanup(ws: WebSocket) {
  const tracked = connections.get(ws)
  if (!tracked) return
  clearInterval(tracked.pingTimer)
  clearTimeout(tracked.idleTimer)
  connections.delete(ws)
  connectionCount = Math.max(0, connectionCount - 1)
}

function parseToken(req: IncomingMessage): string | null {
  try {
    const url = new URL(req.url ?? '', 'http://localhost')
    return url.searchParams.get('token')
  } catch {
    return null
  }
}

export function attachLiveWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/api/live/ws' })

  wss.on('connection', (ws, req) => {
    if (!verifyWsAccessToken(parseToken(req))) {
      ws.close(4401, 'Unauthorized')
      return
    }

    if (connectionCount >= MAX_CONNECTIONS) {
      ws.close(1013, 'Too many live sessions')
      return
    }

    connectionCount += 1
    const session = createLiveSession(`live-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
    session.ws = ws

    const tracked: Tracked = {
      session,
      lastActivity: Date.now(),
      isAlive: true,
      pingTimer: setInterval(() => {
        if (!tracked.isAlive) {
          ws.terminate()
          return
        }
        tracked.isAlive = false
        ws.ping()
      }, PING_INTERVAL_MS),
      idleTimer: setTimeout(() => ws.close(1000, 'Idle timeout'), IDLE_TIMEOUT_MS),
    }

    connections.set(ws, tracked)

    ws.on('pong', () => {
      tracked.isAlive = true
      touch(tracked)
    })

    ws.on('message', (data) => {
      touch(tracked)
      void handleLiveMessage(ws, session, data.toString(), {
        utteranceCooldownMs: UTTERANCE_COOLDOWN_MS,
        onUtteranceAccepted: () => touch(tracked),
      })
    })

    ws.on('close', () => cleanup(ws))
    ws.on('error', () => cleanup(ws))
  })

  return wss
}

export function getLiveConnectionStats() {
  return { active: connectionCount, max: MAX_CONNECTIONS }
}
