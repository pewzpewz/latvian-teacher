import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { synthesizeSpeech, LATVIAN_VOICES } from './tts.js'
import { chat, generateAdaptiveJson, getAiStatus, glossWordInContext } from './ai.js'
import { createLiveSession, handleLiveMessage } from './liveWs.js'

dotenv.config()

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '1mb' }))

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
    const text = String(req.query.text ?? '')
    const voice = String(req.query.voice ?? 'lv-LV-EveritaNeural')
    const rate = parseFloat(String(req.query.rate ?? '0.9'))

    if (!text.trim()) {
      return res.status(400).json({ error: 'Text required' })
    }

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
    const { messages, apiKey: clientKey, profile, provider, model } = req.body as {
      messages: { role: string; content: string }[]
      apiKey?: string
      profile?: string
      provider?: string
      model?: string
    }

    if (!messages?.length) {
      return res.status(400).json({ error: 'Messages required' })
    }

    const content = await chat(messages, { clientKey, profile, provider, model })
    res.json({ content })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal server error'
    const status = message.includes('API') || message.includes('ключ') ? 401 : 500
    console.error('Chat error:', e)
    res.status(status).json({ error: message })
  }
})

app.post('/api/chat/stream', chatLimiter, async (req, res) => {
  try {
    const { messages, apiKey: clientKey, profile, provider, model } = req.body as {
      messages: { role: string; content: string }[]
      apiKey?: string
      profile?: string
      provider?: string
      model?: string
    }

    if (!messages?.length) {
      return res.status(400).json({ error: 'Messages required' })
    }

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
    const message = e instanceof Error ? e.message : 'Internal server error'
    console.error('Chat stream error:', e)
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`)
    res.end()
  }
})

app.post('/api/gloss', glossLimiter, async (req, res) => {
  try {
    const { word, sentence } = req.body as { word?: string; sentence?: string }
    if (!word?.trim() || !sentence?.trim()) {
      return res.status(400).json({ error: 'word and sentence required' })
    }
    const translation = await glossWordInContext(word.trim(), sentence.trim())
    res.json({ translation })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Gloss failed'
    console.error('Gloss error:', e)
    res.status(500).json({ error: message })
  }
})

app.post('/api/adapt', chatLimiter, async (req, res) => {
  try {
    const { profile, apiKey: clientKey, provider, model } = req.body as {
      profile: string
      apiKey?: string
      provider?: string
      model?: string
    }

    if (!profile) {
      return res.status(400).json({ error: 'Profile required' })
    }

    const raw = await generateAdaptiveJson(ADAPT_PROMPT(profile), { clientKey, provider, model })
    const parsed = JSON.parse(raw.replace(/^```json\s*|```$/g, '').trim())

    parsed.exercises = (parsed.exercises || []).map(
      (e: { id?: string; [key: string]: unknown }, i: number) => ({
        ...e,
        id: e.id || `gen-${Date.now()}-${i}`,
      }),
    )

    res.json(parsed)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to generate adaptive content'
    console.error('Adapt error:', e)
    res.status(500).json({ error: message })
  }
})

if (process.env.NODE_ENV === 'production') {
  const distPath = join(__dirname, '..', 'dist')
  app.use(express.static(distPath))
  app.get('*', (_req, res) => {
    res.sendFile(join(distPath, 'index.html'))
  })
}

const httpServer = createServer(app)

const liveWss = new WebSocketServer({ server: httpServer, path: '/api/live/ws' })
liveWss.on('connection', (ws) => {
  const session = createLiveSession(`live-${Date.now()}`)
  ws.on('message', (data) => {
    void handleLiveMessage(ws, session, data.toString())
  })
})

httpServer.listen(PORT, () => {
  const status = getAiStatus()
  console.log(`🇱🇻 Latvian Teacher API → http://localhost:${PORT}`)
  console.log(`   Live WS → ws://localhost:${PORT}/api/live/ws`)
  console.log(`   AI: ${status.provider} / ${status.model} ${status.configured ? '✓' : '(ключ не задан)'}`)
})
