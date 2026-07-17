import express from 'express'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { synthesizeSpeech, LATVIAN_VOICES } from './tts.js'
import { chat, generateAdaptiveJson, getAiStatus, glossWordInContext, translateChatMessage, extractJsonObject } from './ai.js'
import { attachLiveWebSocket } from './liveServer.js'
import {
  accessTokenMiddleware,
  createCorsMiddleware,
  createHelmetMiddleware,
} from './middleware/security.js'
import { sendAuthError, sendServerError, streamErrorPayload, logServerError } from './middleware/errors.js'
import {
  adaptBodySchema,
  chatBodySchema,
  formatZodError,
  glossBodySchema,
  translateBodySchema,
  pronunciationBodySchema,
  syncBodySchema,
  ttsQuerySchema,
} from './validation/schemas.js'
import { isValidSyncId, loadSyncRecord, saveSyncRecord } from './syncStore.js'
import { assessPronunciationWithGemini } from './pronunciation.js'

dotenv.config()

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

app.use(createHelmetMiddleware())
app.use(createCorsMiddleware())
app.use(express.json({ limit: '2mb' }))
app.use('/api', accessTokenMiddleware)

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Слишком много запросов к чату. Подождите минуту.' },
})

const glossLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Слишком много запросов gloss. Подождите.' },
})

const ttsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 90,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Слишком много запросов TTS. Подождите.' },
})

const syncLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Слишком много запросов sync. Подождите.' },
})

const pronunciationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Слишком много запросов pronunciation. Подождите.' },
})

const ADAPT_PROMPT = (profile: string) => `Tu esi latviešu valodas skolotājs. Analizē studenta profilu un izveido personalizētu mācību saturu.

Studenta profils:
${profile}

Atbildi TIKAI ar derīgu JSON (bez markdown):
{
  "words": [
    { "lv": "latviešu vārds", "ru": "krievu tulkojums", "category": "tēma", "reason": "kāpēc šis vārds" }
  ],
  "exercises": [
    {
      "id": "unique-id",
      "type": "translate",
      "question": "uzdevums krieviski",
      "answer": "pareizā atbilde latviski",
      "hint": "padoms (optional)",
      "topic": "tēma"
    }
  ],
  "tip": "personalizēts padoms studentam krieviski"
}

Noteikumi:
- 3-5 vārdi, 2-4 vingrinājumi
- Prioritāri weakSkills / weakPhonemes / weakAreas no profila
- Pielāgo grūtību studenta līmenim
- Izmanto pareizos diakritiskos zīmes
- type: "translate", "fill" vai "choose" (choose jāpievieno "options" masīvs)`

const MAX_ADAPT_PROFILE_CHARS = 6_000

function truncateAdaptProfile(profile: string): string {
  if (profile.length <= MAX_ADAPT_PROFILE_CHARS) return profile
  return `${profile.slice(0, MAX_ADAPT_PROFILE_CHARS)}…`
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/api/ai/status', (_req, res) => {
  res.json(getAiStatus())
})

app.get('/api/tts/health', (_req, res) => {
  res.json({ status: 'ok', engine: 'edge-neural' })
})

app.get('/api/tts/voices', (_req, res) => {
  res.json({ voices: LATVIAN_VOICES })
})

app.get('/api/tts', ttsLimiter, async (req, res) => {
  try {
    const parsed = ttsQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      return res.status(400).json({ error: formatZodError(parsed.error) })
    }

    const { text, voice, rate } = parsed.data
    const audio = await synthesizeSpeech(text, { voice, rate })

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audio.length,
      'Cache-Control': 'public, max-age=86400',
    })
    res.send(audio)
  } catch (e) {
    logServerError('TTS error:', e)
    res.status(500).json({ error: 'TTS synthesis failed' })
  }
})

app.post('/api/chat', chatLimiter, async (req, res) => {
  try {
    const parsed = chatBodySchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: formatZodError(parsed.error) })
    }

    const { messages, apiKey: clientKey, profile, provider, model } = parsed.data
    const content = await chat(messages, { clientKey, profile, provider, model })
    res.json({ content })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal server error'
    const isAuth = message.includes('API') || message.includes('ключ')
    if (isAuth) {
      sendAuthError(res, e, 'Chat auth error')
    } else {
      sendServerError(res, e, 'Chat error')
    }
  }
})

app.post('/api/chat/stream', chatLimiter, async (req, res) => {
  try {
    const parsed = chatBodySchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: formatZodError(parsed.error) })
    }

    const { messages, apiKey: clientKey, profile, provider, model } = parsed.data

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders?.()

    const content = await chat(messages, { clientKey, profile, provider, model })
    const chunks = content.match(/\S+\s*|\s+/g) ?? [content]

    for (const chunk of chunks) {
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`)
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
    res.end()
  } catch (e) {
    logServerError('Chat stream error:', e)
    res.write(`data: ${streamErrorPayload(e)}\n\n`)
    res.end()
  }
})

app.post('/api/gloss', glossLimiter, async (req, res) => {
  try {
    const parsed = glossBodySchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: formatZodError(parsed.error) })
    }

    const { word, sentence } = parsed.data
    const translation = await glossWordInContext(word, sentence)
    res.json({ translation })
  } catch (e) {
    sendServerError(res, e, 'Gloss error')
  }
})

app.post('/api/translate-message', glossLimiter, async (req, res) => {
  try {
    const parsed = translateBodySchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: formatZodError(parsed.error) })
    }

    const translation = await translateChatMessage(parsed.data.text)
    res.json({ translation })
  } catch (e) {
    sendServerError(res, e, 'Translate error')
  }
})

app.post('/api/adapt', chatLimiter, async (req, res) => {
  try {
    const parsed = adaptBodySchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: formatZodError(parsed.error) })
    }

    const { profile, apiKey: clientKey, provider, model } = parsed.data
    const compactProfile = truncateAdaptProfile(profile)
    const raw = await generateAdaptiveJson(ADAPT_PROMPT(compactProfile), { clientKey, provider, model })

    let json: {
      words?: unknown[]
      exercises?: { id?: string; [key: string]: unknown }[]
      tip?: string
      [key: string]: unknown
    }
    try {
      json = JSON.parse(extractJsonObject(raw)) as typeof json
    } catch {
      logServerError('Adapt JSON parse failed:', raw.slice(0, 200))
      return res.status(502).json({ error: 'AI returned invalid JSON. Try again.' })
    }

    if (!Array.isArray(json.words) || !Array.isArray(json.exercises)) {
      return res.status(502).json({ error: 'AI response missing words/exercises. Try again.' })
    }

    json.exercises = json.exercises.map((e, i) => ({
      ...e,
      id: e.id || `gen-${Date.now()}-${i}`,
    }))

    res.json(json)
  } catch (e) {
    sendServerError(res, e, 'Adapt error')
  }
})

app.post('/api/pronunciation', pronunciationLimiter, async (req, res) => {
  try {
    const parsed = pronunciationBodySchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: formatZodError(parsed.error) })
    }

    const { expected, audioBase64, mimeType, sttTranscript, apiKey: clientKey } = parsed.data
    const result = await assessPronunciationWithGemini(
      expected,
      audioBase64,
      mimeType,
      clientKey,
      sttTranscript,
    )
    res.json(result)
  } catch (e) {
    sendServerError(res, e, 'Pronunciation error')
  }
})

app.get('/api/sync/:id', syncLimiter, (req, res) => {
  const syncId = String(req.params.id ?? '')
  if (!isValidSyncId(syncId)) {
    return res.status(400).json({ error: 'Invalid sync ID' })
  }
  const record = loadSyncRecord(syncId)
  if (!record) {
    return res.status(404).json({ error: 'Sync record not found' })
  }
  res.json(record)
})

app.put('/api/sync/:id', syncLimiter, (req, res) => {
  const syncId = String(req.params.id ?? '')
  if (!isValidSyncId(syncId)) {
    return res.status(400).json({ error: 'Invalid sync ID' })
  }
  const parsed = syncBodySchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: formatZodError(parsed.error) })
  }
  const updatedAt = saveSyncRecord(syncId, parsed.data.blob)
  res.json({ ok: true, updatedAt })
})

if (process.env.NODE_ENV === 'production') {
  // Compiled server lives in server/dist/ — frontend build is at repo root dist/
  const distPath = join(__dirname, '..', '..', 'dist')
  app.use(express.static(distPath))
  app.get('*', (_req, res) => {
    res.sendFile(join(distPath, 'index.html'))
  })
}

const httpServer = createServer(app)
attachLiveWebSocket(httpServer)

httpServer.listen(PORT, () => {
  const status = getAiStatus()
  console.log(`🇱🇻 Latvian Teacher API → http://localhost:${PORT}`)
  console.log(`   Live WS → ws://localhost:${PORT}/api/live/ws`)
  console.log(`   AI: ${status.provider} / ${status.model} ${status.configured ? '✓' : '(ключ не задан)'}`)
  if (process.env.API_ACCESS_TOKEN) {
    console.log('   API access token: enabled')
  }
  const origins = process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173,http://localhost:3001'
  console.log(`   CORS origins: ${origins}`)
})
