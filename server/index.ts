import express from 'express'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { synthesizeSpeech, LATVIAN_VOICES } from './tts.js'
import { chat, generateAdaptiveJson, getAiStatus, glossWordInContext } from './ai.js'
import { attachLiveWebSocket } from './liveServer.js'
import {
  accessTokenMiddleware,
  createCorsMiddleware,
  createHelmetMiddleware,
} from './middleware/security.js'
import { sendAuthError, sendServerError, streamErrorPayload } from './middleware/errors.js'
import {
  adaptBodySchema,
  chatBodySchema,
  formatZodError,
  glossBodySchema,
  syncBodySchema,
  ttsQuerySchema,
} from './validation/schemas.js'
import { isValidSyncId, loadSyncRecord, saveSyncRecord } from './syncStore.js'

dotenv.config()

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

app.use(createHelmetMiddleware())
app.use(createCorsMiddleware())
app.use(express.json({ limit: '1mb' }))
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
- Fokuss uz vājajām tēmām
- Pielāgo grūtību studenta līmenim
- Izmanto pareizos diakritiskos zīmes
- type: "translate", "fill" vai "choose" (choose jāpievieno "options" masīvs)`

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
    console.error('TTS error:', e)
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
    console.error('Chat error:', e)
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
    console.error('Chat stream error:', e)
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

app.post('/api/adapt', chatLimiter, async (req, res) => {
  try {
    const parsed = adaptBodySchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: formatZodError(parsed.error) })
    }

    const { profile, apiKey: clientKey, provider, model } = parsed.data
    const raw = await generateAdaptiveJson(ADAPT_PROMPT(profile), { clientKey, provider, model })
    const json = JSON.parse(raw.replace(/^```json\s*|```$/g, '').trim()) as {
      exercises?: { id?: string; [key: string]: unknown }[]
      [key: string]: unknown
    }

    json.exercises = (json.exercises || []).map((e, i) => ({
      ...e,
      id: e.id || `gen-${Date.now()}-${i}`,
    }))

    res.json(json)
  } catch (e) {
    sendServerError(res, e, 'Adapt error')
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
  const distPath = join(__dirname, '..', 'dist')
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
