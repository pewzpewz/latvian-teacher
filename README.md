# 🇱🇻 Latviešu Skolotājs — Персональный учитель латышского

Локальный веб-сервис для изучения латышского языка (письменного и разговорного). Интерфейс на русском, контент на латышском.

**Лицензия:** [MIT](LICENSE)

## Возможности

- **20+ уроков** — алфавит, грамматика, культура, путешествия, работа
- **553+ слов** с интервальным повторением (FSRS) и карточками
- **5 диалогов** — кафе, знакомство, магазин, дорога, погода
- **Neural TTS** — латышские голоса Microsoft (Everita / Nils)
- **AI-репетитор** — чат + **Live WebRTC**-диалог (STT → Gemini → TTS)
- **Mock B1/VISC** — подготовка к экзамену
- **PWA** — офлайн-кеш уроков и словаря, export/import прогресса
- **Capacitor / TWA** — сборки для Google Play и App Store ([`docs/MOBILE.md`](docs/MOBILE.md))

## Быстрый старт (Windows / Linux / macOS)

**Windows:** дважды кликните **`START.bat`**

**Linux / macOS:**
```bash
chmod +x start.sh && ./start.sh
# или
npm run dev:all
```

Откройте: **http://localhost:5173**

## Ручной запуск

```bash
# Фронтенд
npm install
npm run dev

# API-сервер (в другом терминале)
cd server
npm install
cp .env.example .env   # добавьте GEMINI_API_KEY
npm run dev
```

## AI-репетитор (Google Gemini — бесплатно)

1. Откройте https://aistudio.google.com/apikey
2. Создайте API-ключ (без карты)
3. Вставьте в `server/.env`:

```env
GEMINI_API_KEY=AIza...
AI_PROVIDER=gemini
AI_MODEL=gemini-2.5-flash
```

4. Перезапустите START.bat

Подробнее: **GEMINI-SETUP.txt**

### Альтернативы

- **OpenAI** — `OPENAI_API_KEY` + `AI_PROVIDER=openai`
- **Anthropic** — `ANTHROPIC_API_KEY` + `AI_PROVIDER=anthropic`
- **Ollama** — `AI_PROVIDER=local` (локально, без интернета)

## Production

```bash
npm run build          # фронтенд → dist/
cd server && npm run build && npm start
# API + статика на порту 3001 (NODE_ENV=production)
```

Сервер компилируется через `tsc` → `node dist/index.js` (без dev-only `tsx`).

## Доступ из интернета (ngrok / Cloudflare Tunnel)

**Обязательно** настройте в `server/.env`:

```env
ALLOWED_ORIGINS=https://your-tunnel.example.com
API_ACCESS_TOKEN=случайная-длинная-строка
```

И во фронтенде (`.env` или `.env.production`):

```env
VITE_API_ACCESS_TOKEN=та-же-строка
```

Без этого любой сайт сможет использовать ваш API и расходовать квоту Gemini.

Для production-деплоя см. **`docs/DEPLOY.md`** (Docker, Fly.io, Render).

## Структура

```
latvian-teacher/
├── ROADMAP.md          # План развития (фазы 0–4+)
├── docs/               # MARKET_COMPARISON.md и др.
├── content/            # JSON-пайплайн (уроки, словарь)
├── src/                # React PWA
├── server/             # Express API + Live WebSocket
└── START.bat           # Запуск одной кнопкой (Windows)
```

## Технологии

- React 19 + TypeScript + Vite + PWA
- Zustand + FSRS (ts-fsrs)
- Express + WebSocket + WebRTC (Live)
- Google Gemini + Edge TTS
- Vitest + GitHub Actions CI

## Добавление контента

```bash
npm run build:content   # content/*.json → src/data/
```

Уроки: `content/lessons/*.json` · Словарь: `content/vocabulary.json`

---

*Veiksmi mācībās! — Удачи в учёбе!*
