import { z } from 'zod'
import { LATVIAN_VOICES } from '../tts.js'

const voiceIds = LATVIAN_VOICES.map((v) => v.id)

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(32_000),
})

export const chatBodySchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(100),
  apiKey: z.string().max(512).optional(),
  profile: z.string().max(16_000).optional(),
  provider: z.string().max(64).optional(),
  model: z.string().max(128).optional(),
})

export const glossBodySchema = z.object({
  word: z.string().trim().min(1).max(128),
  sentence: z.string().trim().min(1).max(4_000),
})

export const adaptBodySchema = z.object({
  profile: z.string().trim().min(1).max(16_000),
  apiKey: z.string().max(512).optional(),
  provider: z.string().max(64).optional(),
  model: z.string().max(128).optional(),
})

export const ttsQuerySchema = z.object({
  text: z.string().trim().min(1).max(500),
  voice: z.enum(voiceIds as [string, ...string[]]).default('lv-LV-EveritaNeural'),
  rate: z.coerce.number().min(0.5).max(1.5).default(0.9),
})

export const syncBodySchema = z.object({
  blob: z.object({
    v: z.literal(1),
    alg: z.literal('AES-GCM'),
    kdf: z.literal('PBKDF2'),
    salt: z.string().min(8).max(128),
    iv: z.string().min(8).max(64),
    data: z.string().min(1).max(700_000),
  }),
})

export const pronunciationBodySchema = z.object({
  expected: z.string().trim().min(1).max(500),
  audioBase64: z.string().min(16).max(1_400_000),
  mimeType: z.string().max(64).default('audio/webm'),
  sttTranscript: z.string().max(500).optional(),
  apiKey: z.string().max(512).optional(),
})

export function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Invalid request'
}
