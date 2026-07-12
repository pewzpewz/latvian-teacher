import type { AppBackup } from './backup'

export type EncryptedSyncBlob = {
  v: 1
  alg: 'AES-GCM'
  kdf: 'PBKDF2'
  salt: string
  iv: string
  data: string
}

const ITERATIONS = 100_000
const SALT_BYTES = 16
const IV_BYTES = 12

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64)
  const out = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i)
  return out
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const saltBuf = new Uint8Array(salt)
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuf,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export function validateSyncPassphrase(passphrase: string): string | null {
  if (passphrase.length < 8) return 'Пароль синхронизации — минимум 8 символов'
  return null
}

export async function encryptBackup(
  backup: AppBackup,
  passphrase: string,
): Promise<EncryptedSyncBlob> {
  const err = validateSyncPassphrase(passphrase)
  if (err) throw new Error(err)

  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES))
  const key = await deriveKey(passphrase, salt)
  const plaintext = new TextEncoder().encode(JSON.stringify(backup))
  const ivBuf = new Uint8Array(iv)
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: ivBuf }, key, plaintext)

  return {
    v: 1,
    alg: 'AES-GCM',
    kdf: 'PBKDF2',
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(ciphertext)),
  }
}

export async function decryptBackup(
  blob: EncryptedSyncBlob,
  passphrase: string,
): Promise<AppBackup> {
  if (blob.v !== 1 || blob.alg !== 'AES-GCM') {
    throw new Error('Неподдерживаемый формат шифрования')
  }

  const salt = base64ToBytes(blob.salt)
  const iv = new Uint8Array(base64ToBytes(blob.iv))
  const data = new Uint8Array(base64ToBytes(blob.data))
  const key = await deriveKey(passphrase, salt)

  let plaintext: ArrayBuffer
  try {
    plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)
  } catch {
    throw new Error('Неверный пароль или повреждённые данные')
  }

  const parsed = JSON.parse(new TextDecoder().decode(plaintext)) as AppBackup
  if (parsed.app !== 'latvian-teacher' || !parsed.progress || !parsed.settings) {
    throw new Error('Расшифрованные данные повреждены')
  }
  return parsed
}

export function generateSyncId(): string {
  return crypto.randomUUID()
}
