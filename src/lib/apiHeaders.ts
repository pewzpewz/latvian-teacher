/** Shared fetch headers for API calls (access token when exposed via tunnel). */
export function apiHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...extra }
  const token = import.meta.env.VITE_API_ACCESS_TOKEN?.trim()
  if (token) {
    headers['X-Access-Token'] = token
  }
  return headers
}

export function apiAccessTokenQuery(): string {
  const token = import.meta.env.VITE_API_ACCESS_TOKEN?.trim()
  return token ? `token=${encodeURIComponent(token)}` : ''
}
