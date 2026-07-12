import type { Response } from 'express'

const isProd = process.env.NODE_ENV === 'production'

export function clientErrorMessage(err: unknown, fallback: string): string {
  if (!isProd) {
    return err instanceof Error ? err.message : fallback
  }
  return fallback
}

export function sendServerError(res: Response, err: unknown, logLabel: string) {
  console.error(logLabel, err)
  res.status(500).json({ error: isProd ? 'Internal server error' : clientErrorMessage(err, 'Internal server error') })
}

export function sendAuthError(res: Response, err: unknown, logLabel: string) {
  console.error(logLabel, err)
  res.status(401).json({ error: isProd ? 'Authorization failed' : clientErrorMessage(err, 'Authorization failed') })
}

export function streamErrorPayload(err: unknown): string {
  const message = isProd ? 'Internal server error' : clientErrorMessage(err, 'Internal server error')
  return JSON.stringify({ error: message })
}
