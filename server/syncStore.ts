import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const SYNC_DIR = join(dirname(fileURLToPath(import.meta.url)), 'data', 'sync')
mkdirSync(SYNC_DIR, { recursive: true })

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export type EncryptedSyncBlob = {
  v: 1
  alg: 'AES-GCM'
  kdf: 'PBKDF2'
  salt: string
  iv: string
  data: string
}

export type StoredSyncRecord = {
  updatedAt: string
  blob: EncryptedSyncBlob
}

export function isValidSyncId(id: string): boolean {
  return UUID_RE.test(id)
}

function recordPath(syncId: string): string {
  return join(SYNC_DIR, `${syncId}.json`)
}

export function saveSyncRecord(syncId: string, blob: EncryptedSyncBlob): string {
  const updatedAt = new Date().toISOString()
  const record: StoredSyncRecord = { updatedAt, blob }
  writeFileSync(recordPath(syncId), JSON.stringify(record))
  return updatedAt
}

export function loadSyncRecord(syncId: string): StoredSyncRecord | null {
  const path = recordPath(syncId)
  if (!existsSync(path)) return null
  return JSON.parse(readFileSync(path, 'utf8')) as StoredSyncRecord
}
