import cors from 'cors'
import type { NextFunction, Request, Response } from 'express'
import helmet from 'helmet'

const PUBLIC_API_PATHS = new Set(['/api/health', '/api/tts/health'])

function parseAllowedOrigins(): string[] {
  const raw = process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173,http://localhost:3001'
  return raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
}

export function createCorsMiddleware() {
  const allowed = parseAllowedOrigins()
  return cors({
    origin(origin, callback) {
      // Same-origin / curl / server-side requests
      if (!origin || allowed.includes(origin)) {
        callback(null, true)
        return
      }
      callback(null, false)
    },
    credentials: true,
  })
}

export function accessTokenMiddleware(req: Request, res: Response, next: NextFunction) {
  const required = process.env.API_ACCESS_TOKEN?.trim()
  if (!required) {
    next()
    return
  }

  if (PUBLIC_API_PATHS.has(req.path)) {
    next()
    return
  }

  const header = req.headers['x-access-token']
  const provided = typeof header === 'string' ? header : typeof req.query.token === 'string' ? req.query.token : ''

  if (provided === required) {
    next()
    return
  }

  res.status(401).json({ error: 'Unauthorized' })
}

export function createHelmetMiddleware() {
  return helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
}

export function verifyWsAccessToken(tokenFromQuery: string | null): boolean {
  const required = process.env.API_ACCESS_TOKEN?.trim()
  if (!required) return true
  return tokenFromQuery === required
}
