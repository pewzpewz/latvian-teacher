/** API base for web (relative) vs Capacitor native (absolute deployed server). */
export function getApiBase(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  return ''
}

export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  const base = getApiBase()
  return base ? `${base}${normalized}` : normalized
}

export function wsApiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  const base = getApiBase()
  if (!base) {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${proto}//${window.location.host}${normalized}`
  }
  const url = new URL(base)
  const wsProto = url.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${wsProto}//${url.host}${normalized}`
}
