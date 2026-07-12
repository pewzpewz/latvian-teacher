import { apiHeaders } from './apiHeaders'
import { apiUrl } from './apiBase'
import type { EncryptedSyncBlob } from './syncCrypto'

export type SyncRemotePayload = {
  updatedAt: string
  blob: EncryptedSyncBlob
}

export async function pushSyncBlob(syncId: string, blob: EncryptedSyncBlob): Promise<string> {
  const res = await fetch(apiUrl(`/api/sync/${encodeURIComponent(syncId)}`), {
    method: 'PUT',
    headers: { ...apiHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ blob }),
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error ?? `Upload failed (${res.status})`)
  }
  const data = (await res.json()) as { updatedAt: string }
  return data.updatedAt
}

export async function pullSyncBlob(syncId: string): Promise<SyncRemotePayload | null> {
  const res = await fetch(apiUrl(`/api/sync/${encodeURIComponent(syncId)}`), {
    headers: apiHeaders(),
  })
  if (res.status === 404) return null
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error ?? `Download failed (${res.status})`)
  }
  return (await res.json()) as SyncRemotePayload
}
