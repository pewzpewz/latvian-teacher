# 🇱🇻 Latviešu Skolotājs — Персональный учитель латышского

Локальный веб-сервис для изучения латышского языка (письменного и разговорного). Интерфейс на русском, контент на латышском.

## Возможности

- **8 структурированных уроков** — алфавит, приветствия, грамматика, числа, падежи, письмо, культура
- **Словарь (~60 слов)** с интервальным повторением (SRS) и карточками
- **5 диалогов** — кафе, знакомство, магазин, дорога, погода
- **Практика произношения** — TTS + распознавание речи через браузер
- **Neural TTS** — натуральные латышские голоса Microsoft (Everita / Nils)
- **AI-репетитор** — объясняет грамматику, проверяет фразы, создаёт упражнения
- **Прогресс и серии** — всё хранится локально в браузере

## Быстрый старт (Windows)

Дважды кликните **`START.bat`** — всё установится и запустится автоматически.

Откройте: **http://localhost:5173**

## Ручной запуск

```bash
# Фронтенд
npm install
npm run dev

# API-сервер (в другом терминале)
cd server
npm install
cp .env.example .env   # добавьте OPENAI_API_KEY
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

## Структура

```
latvian-teacher/
├── ROADMAP.md          # ← План развития (фазы 0–3), выполняем шаг за шагом
├── src/
│   ├── data/          # Уроки, словарь, диалоги
│   ├── pages/         # Страницы приложения
│   ├── components/    # UI-компоненты
│   ├── store/         # Прогресс (localStorage)
│   └── hooks/         # TTS, распознавание речи
├── server/            # Express API для AI
└── START.bat          # Запуск одной кнопкой
```

## Технологии

- React 19 + TypeScript + Vite
- Tailwind CSS 4
- Zustand (состояние)
- Framer Motion (анимации)
- Web Speech API (озвучка)
- Express (API-прокси для AI)

## Доступ из интернета (опционально)

Для доступа с других устройств:

```bash
# Сборка
npm run build

# Запуск production
cd server && npm start
# Сервер отдаёт и API, и фронтенд на порту 3001
```

Можно использовать ngrok, Cloudflare Tunnel или проброс порта на роутере.

## Добавление контента

Уроки: `src/data/lessons.ts`
Слова: `src/data/vocabulary.ts`
Диалоги: `src/data/dialogs.ts`

Формат простой — добавляйте объекты в массивы.

---

*Veiksmi mācībās! — Удачи в учёбе!*
