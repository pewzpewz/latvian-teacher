import type { Response } from 'express'

const isProd = process.env.NODE_ENV === 'production'

const SENSITIVE_KEY = /api[_-]?key|authorization|x-goog-api-key|token|secret|password/i

function redactString(value: string): string {
  return value.replace(/(?:api[_-]?key|token|secret|password)\s*[=:]\s*\S+/gi, '[REDACTED]')
}

function safeErrorDetail(err: unknown): string {
  if (err instanceof Error) {
    return redactString(err.message)
  }
  if (typeof err === 'string') {
    return redactString(err)
  }
  if (err && typeof err === 'object') {
    const rec = err as Record<string, unknown>
    const status = rec.status ?? rec.statusCode
    const message = rec.message ?? rec.error
    const parts: string[] = []
    if (status !== undefined) parts.push(`status=${String(status)}`)
    if (typeof message === 'string') parts.push(redactString(message))
    if (parts.length > 0) return parts.join(' ')
  }
  return 'unknown error'
}

/** Log server errors without dumping raw request configs (BYOK keys in headers/body). */
export function logServerError(logLabel: string, err: unknown): void {
  console.error(`${logLabel} ${safeErrorDetail(err)}`)
}

export function clientErrorMessage(err: unknown, fallback: string): string {
  if (!isProd) {
    return err instanceof Error ? redactString(err.message) : fallback
  }
  return fallback
}

export function sendServerError(res: Response, err: unknown, logLabel: string) {
  logServerError(logLabel, err)
  res.status(500).json({ error: isProd ? 'Internal server error' : clientErrorMessage(err, 'Internal server error') })
}

export function sendAuthError(res: Response, err: unknown, logLabel: string) {
  logServerError(logLabel, err)
  res.status(401).json({ error: isProd ? 'Authorization failed' : clientErrorMessage(err, 'Authorization failed') })
}

export function streamErrorPayload(err: unknown): string {
  const message = isProd ? 'Internal server error' : clientErrorMessage(err, 'Internal server error')
  return JSON.stringify({ error: message })
}

/** Strip sensitive fields before optional debug serialization. */
export function sanitizeForLog(value: unknown): unknown {
  if (value === null || typeof value !== 'object') {
    return typeof value === 'string' ? redactString(value) : value
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeForLog)
  }
  const out: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEY.test(key)) {
      out[key] = '[REDACTED]'
    } else {
      out[key] = sanitizeForLog(val)
    }
  }
  return out
}
