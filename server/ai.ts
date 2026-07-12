type ChatMessage = { role: string; content: string }

const SYSTEM_PROMPT = `Tu esi profesionāls latviešu valodas skolotājs. Studenta dzimtā valoda ir krievu.

Tavi uzdevumi:
- Skaidrot gramatiku vienkārši un saprotami
- Labot studenta frāzes un paskaidrot kļūdas
- Radīt vingrinājumus, dialogus un vārdu sarakstus
- GALVENOKĀRT atbildēt latviski — students mācās latviešu valodu
- Iedrošināt un pielāgoties studenta līmenim (A0-B1)

Noteikumi:
- Vienmēr izmanto pareizos latviešu diakritiskos zīmes (ā, ē, ī, ū, č, š, ž, ģ, ķ, ļ, ņ)
- Sniedz piemērus reālās dzīves situācijās
- Esi draudzīgs, bet precīzs
- NEDOD krievu tulkojumu iekavās () aiz latviešu teikumiem — lietotājs redzēs tulkojumu, uzvirzot peli uz vārda
- Latviešu teikumus un vārdu sarakstus raksti TIKAI latviski
- Krievu valodu izmanto TIKAI īsiem gramatikas skaidrojumiem (1–2 teikumi), NERAKSTI garus krievu paragrāfus
- Ja students raksta latviski — atbildi pilnībā latviski (bez krievu bloka)`

export type AiProvider = 'gemini' | 'openai' | 'anthropic' | 'local'

export function getProvider(override?: string): AiProvider {
  const p = override || process.env.AI_PROVIDER || 'gemini'
  if (p === 'gemini' || p === 'openai' || p === 'anthropic' || p === 'local') return p
  return 'gemini'
}

export function getModel(provider?: AiProvider, override?: string): string {
  if (override) return override
  const p = provider ?? getProvider()
  if (process.env.AI_MODEL) return process.env.AI_MODEL
  if (p === 'gemini') return 'gemini-3-flash-preview'
  if (p === 'anthropic') return 'claude-3-5-haiku-20241022'
  if (p === 'local') return 'gemma2:9b'
  return 'gpt-4o-mini'
}

export function resolveApiKey(provider: AiProvider, clientKey?: string): string | null {
  if (clientKey?.trim()) return clientKey.trim()

  switch (provider) {
    case 'gemini':
      return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || null
    case 'openai':
      return process.env.OPENAI_API_KEY || null
    case 'anthropic':
      return process.env.ANTHROPIC_API_KEY || null
    case 'local':
      return 'local'
    default:
      return null
  }
}

export function getKeyHint(provider: AiProvider): string {
  switch (provider) {
    case 'gemini':
      return 'Добавьте GEMINI_API_KEY в server/.env (бесплатно: aistudio.google.com/apikey)'
    case 'openai':
      return 'Добавьте OPENAI_API_KEY в server/.env или в настройках приложения'
    case 'anthropic':
      return 'Добавьте ANTHROPIC_API_KEY в server/.env'
    case 'local':
      return 'Запустите Ollama: ollama serve'
    default:
      return 'API ключ не настроен'
  }
}

function buildSystemContent(profile?: string): string {
  return profile ? `${SYSTEM_PROMPT}\n\nStudenta profils:\n${profile}` : SYSTEM_PROMPT
}

async function chatGemini(
  messages: ChatMessage[],
  systemContent: string,
  apiKey: string,
  model: string,
  options?: { maxOutputTokens?: number; temperature?: number },
): Promise<string> {
  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemContent }] },
      contents,
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxOutputTokens ?? 2048,
      },
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    const msg = err.error?.message || `Gemini API error (${response.status})`
    throw new Error(msg)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini returned empty response')
  return text
}

async function chatOpenAI(
  messages: ChatMessage[],
  systemContent: string,
  apiKey: string,
  model: string,
  jsonMode = false,
): Promise<string> {
  const body: Record<string, unknown> = {
    model,
    messages: [{ role: 'system', content: systemContent }, ...messages.filter((m) => m.role !== 'system')],
    max_tokens: 2048,
    temperature: jsonMode ? 0.8 : 0.7,
  }
  if (jsonMode) body.response_format = { type: 'json_object' }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: 'API error' } }))
    throw new Error(err.error?.message || 'OpenAI API error')
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function chatAnthropic(
  messages: ChatMessage[],
  systemContent: string,
  apiKey: string,
  model: string,
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      system: systemContent,
      messages: messages.filter((m) => m.role !== 'system'),
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(err)
  }

  const data = await response.json()
  return data.content[0].text
}

async function chatOllama(
  messages: ChatMessage[],
  systemContent: string,
  model: string,
): Promise<string> {
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434'
  const response = await fetch(`${ollamaUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: systemContent }, ...messages],
      stream: false,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(err)
  }

  const data = await response.json()
  return data.message.content
}

async function generateJsonGemini(
  prompt: string,
  apiKey: string,
  model: string,
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: 'You output only valid JSON, no markdown fences.' }],
      },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || 'Gemini JSON generation failed')
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini returned empty JSON')
  return text
}

function resolveConfig(options: { clientKey?: string; provider?: string; model?: string }) {
  const hasClientKey = !!options.clientKey?.trim()

  if (hasClientKey) {
    const provider = getProvider(options.provider)
    return {
      provider,
      model: getModel(provider, options.model),
      apiKey: options.clientKey!.trim(),
    }
  }

  // Без ключа в браузере — только server/.env (игнорируем старые настройки клиента)
  const provider = getProvider()
  const apiKey = resolveApiKey(provider)
  return {
    provider,
    model: getModel(provider),
    apiKey,
  }
}

export async function chat(
  messages: ChatMessage[],
  options: { clientKey?: string; profile?: string; provider?: string; model?: string } = {},
): Promise<string> {
  const { provider, model, apiKey } = resolveConfig(options)

  if (!apiKey) throw new Error(getKeyHint(provider))
  const systemContent = buildSystemContent(options.profile)

  switch (provider) {
    case 'gemini':
      return chatGemini(messages, systemContent, apiKey, model)
    case 'anthropic':
      return chatAnthropic(messages, systemContent, apiKey, model)
    case 'local':
      return chatOllama(messages, systemContent, model)
    default:
      return chatOpenAI(messages, systemContent, apiKey, model)
  }
}

export async function generateAdaptiveJson(
  prompt: string,
  options: { clientKey?: string; provider?: string; model?: string } = {},
): Promise<string> {
  const { provider, model, apiKey } = resolveConfig(options)

  if (!apiKey) throw new Error(getKeyHint(provider))

  if (provider === 'gemini') {
    return generateJsonGemini(prompt, apiKey, model)
  }

  if (provider === 'local') {
    const content = await chatOllama(
      [{ role: 'user', content: prompt }],
      'You output only valid JSON, no markdown fences.',
      model,
    )
    return content
  }

  if (provider === 'anthropic') {
    const content = await chatAnthropic(
      [{ role: 'user', content: prompt }],
      'You output only valid JSON, no markdown fences.',
      apiKey,
      model,
    )
    return content
  }

  return chatOpenAI(
    [{ role: 'user', content: prompt }],
    'You output only valid JSON, no markdown fences.',
    apiKey,
    model,
    true,
  )
}

export function getAiStatus() {
  const provider = getProvider()
  const apiKey = resolveApiKey(provider)
  return {
    provider,
    model: getModel(),
    configured: provider === 'local' || !!apiKey,
    keyHint: getKeyHint(provider),
  }
}

const glossCache = new Map<string, string>()

export async function glossWordInContext(word: string, sentence: string): Promise<string> {
  const key = `${word.toLowerCase()}|${sentence.slice(0, 100)}`
  const cached = glossCache.get(key)
  if (cached) return cached

  const { provider, model, apiKey } = resolveConfig({})
  if (!apiKey) throw new Error(getKeyHint(provider))

  const prompt = `Переведи латышское слово на русский В КОНТЕКСТЕ предложения.
Слово: "${word}"
Предложение: "${sentence}"

Правила:
- Учитывай грамматику (būs = будущее время от «быть», te = «здесь», не «вот»)
- Не дословная калькa — смысл в этом предложении
- Ответ: только перевод (1–4 слова), без пояснений`

  let translation: string
  switch (provider) {
    case 'gemini':
      translation = await chatGemini(
        [{ role: 'user', content: prompt }],
        'Ты переводчик lv→ru. Отвечай только переводом слова.',
        apiKey,
        model,
        { maxOutputTokens: 48, temperature: 0.1 },
      )
      break
    default:
      translation = await chat([{ role: 'user', content: prompt }], {})
  }

  const clean = translation.trim().replace(/^["«]|["»]$/g, '').slice(0, 80)
  glossCache.set(key, clean)
  return clean
}
