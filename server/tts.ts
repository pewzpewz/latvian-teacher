import { createHash } from 'crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { EdgeTTS } from 'edge-tts-universal'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CACHE_DIR = join(__dirname, 'cache', 'tts')

export const LATVIAN_VOICES = [
  { id: 'lv-LV-EveritaNeural', name: 'Everita', gender: 'female', desc: 'Женский, дружелюбный' },
  { id: 'lv-LV-NilsNeural', name: 'Nils', gender: 'male', desc: 'Мужской, нейтральный' },
] as const

export type TtsOptions = {
  voice?: string
  rate?: number // 0.5 - 1.5 (1.0 = normal)
}

function ensureCacheDir() {
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true })
}

function cacheKey(text: string, voice: string, rate: number): string {
  return createHash('sha256').update(`${text}|${voice}|${rate}`).digest('hex')
}

function rateToProsody(rate: number): string {
  const pct = Math.round((rate - 1) * 100)
  return pct >= 0 ? `+${pct}%` : `${pct}%`
}

export async function synthesizeSpeech(text: string, options: TtsOptions = {}): Promise<Buffer> {
  const voice = options.voice ?? 'lv-LV-EveritaNeural'
  const rate = options.rate ?? 0.9
  const trimmed = text.trim().slice(0, 500)

  if (!trimmed) throw new Error('Empty text')

  ensureCacheDir()
  const key = cacheKey(trimmed, voice, rate)
  const cachePath = join(CACHE_DIR, `${key}.mp3`)

  if (existsSync(cachePath)) {
    return readFileSync(cachePath)
  }

  const tts = new EdgeTTS(trimmed, voice, {
    rate: rateToProsody(rate),
    volume: '+0%',
    pitch: '+0Hz',
  })

  const result = await tts.synthesize()
  const audioBuffer = Buffer.from(await result.audio.arrayBuffer())

  writeFileSync(cachePath, audioBuffer)
  return audioBuffer
}
