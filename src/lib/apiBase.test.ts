import { describe, it, expect, vi, afterEach } from 'vitest'
import { apiUrl, getApiBase, wsApiUrl } from './apiBase'

describe('apiBase', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('getApiBase returns empty when env unset', () => {
    vi.stubEnv('VITE_API_BASE_URL', '')
    expect(getApiBase()).toBe('')
  })

  it('getApiBase strips trailing slash', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://app.example.com/')
    expect(getApiBase()).toBe('https://app.example.com')
  })

  it('apiUrl joins base and path', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://app.example.com')
    expect(apiUrl('/api/health')).toBe('https://app.example.com/api/health')
  })

  it('apiUrl keeps relative path without base', () => {
    vi.stubEnv('VITE_API_BASE_URL', '')
    expect(apiUrl('/api/health')).toBe('/api/health')
  })

  it('wsApiUrl uses wss for https base', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://app.example.com')
    expect(wsApiUrl('/api/live/ws')).toBe('wss://app.example.com/api/live/ws')
  })
})
