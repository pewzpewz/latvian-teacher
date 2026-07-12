/**
 * Client-side error log (ring buffer in localStorage for debugging).
 */

export type ClientErrorEntry = {
  id: string
  message: string
  stack?: string
  componentStack?: string
  url: string
  timestamp: string
}

const LOG_KEY = 'lv-error-log'
const MAX_ENTRIES = 20

function readLog(): ClientErrorEntry[] {
  try {
    const raw = localStorage.getItem(LOG_KEY)
    return raw ? (JSON.parse(raw) as ClientErrorEntry[]) : []
  } catch {
    return []
  }
}

function writeLog(entries: ClientErrorEntry[]) {
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)))
  } catch {
    /* quota — ignore */
  }
}

export function logClientError(
  error: unknown,
  info?: { componentStack?: string | null },
): ClientErrorEntry {
  const entry: ClientErrorEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    componentStack: info?.componentStack ?? undefined,
    url: typeof window !== 'undefined' ? window.location.href : '',
    timestamp: new Date().toISOString(),
  }

  const log = readLog()
  log.push(entry)
  writeLog(log)

  if (import.meta.env.DEV) {
    console.error('[lv-error-log]', entry)
  }

  return entry
}

export function getClientErrorLog(): ClientErrorEntry[] {
  return readLog()
}

export function clearClientErrorLog(): void {
  localStorage.removeItem(LOG_KEY)
}
