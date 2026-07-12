# Latviešu Skolotājs — сравнение с рынком

> **Позиционирование:** не «ещё один Duolingo», а **AI-репетитор латышского для русскоязычных** с локальной программой (LVA), нейро-озвучкой LV и подготовкой к B1/VISC.

**Дата:** июль 2026 · **Версия продукта:** Фазы 1–3 roadmap

---

## Краткий вывод

| Критерий | Latviešu Skolotājs | Типичный топ-10 (Duolingo, Babbel…) |
|----------|-------------------|-------------------------------------|
| Язык интерфейса и объяснений | **RU + LV**, билингвальный AI | EN или язык страны; LV часто слабый |
| Курс LVA / valoda.lv | **Да** — skill tree, B1 mock | Редко или поверхностно |
| Live-диалог с AI | **WebSocket + WebRTC + TTS** | Speak/ELSA — да; Duolingo Max — ограничено |
| Neural TTS на латышском | **Everita/Nils (Edge)** | Часто generic или нет LV |
| Приватность / self-host | **Локальный сервер, свой Gemini-ключ** | Облако, подписка, трекинг |
| Цена | **Open-source stack, API по факту** | $7–20+/мес |
| Gamification | Умеренный (streak, кольца) | Сильный (Duolingo) |
| Живые репетиторы | Нет (AI-only) | italki, Preply — да |

**Ниша:** русскоязычный learner → интеграция в Латвию → экзамен B1 → ежедневный цикл «Сегодня» с AI, а не глобальный mass-market курс на 40 языков.

---

## Международный топ-10 (2025–2026)

Рейтинг по популярности, выручке и узнаваемости в сегменте language learning apps (не включая чистые словари вроде Google Translate).

| # | Продукт | Сильные стороны | Слабости для LV + RU |
|---|---------|-----------------|----------------------|
| 1 | **Duolingo** | Бесплатный tier, streak, огромная база | LV курс поверхностный; AI (Max) не заточен под LVA/B1; мало RU-объяснений |
| 2 | **Babbel** | Структурированные диалоги, грамматика | LV нет в топ-языках; подписка; нет live AI tutor |
| 3 | **Memrise** | Видео носителей, мнемоника | LV контент ограничен; нет VISC/B1 track |
| 4 | **Busuu** | Сообщество, writing correction | LV слабый; AI tutor generic |
| 5 | **Rosetta Stone** | Immersion-метод | Дорого; LV редко; без RU bridge |
| 6 | **Pimsleur** | Аудио-метод, произношение | Нет интерактивного AI; LV курс отдельно покупать |
| 7 | **italki** | Живые учителя LV | $15–40/час; не self-paced app |
| 8 | **Speak** | Разговорный AI, голос | Фокус EN/KO/JP; LV — нет или beta |
| 9 | **ELSA Speak** | Произношение, phoneme scoring | Не полный курс; LV support ограничен |
| 10 | **Mondly** | VR/AR gimmicks, много языков | «Широко, но мелко»; слабая LVA программа |

**Дополнительно (контекст Baltics):** Drops, Lingvist, Clozemaster — хороши для слов, но не закрывают путь до B1 + русскоязычный AI-репетитор.

---

## Детальное сравнение по осям

### 1. AI-репетитор и live-диалог

| | Latviešu Skolotājs | Duolingo Max | Speak | ChatGPT/Gemini web |
|--|-------------------|--------------|-------|-------------------|
| Streaming ответов | ✅ SSE / WS | ✅ | ✅ | ✅ |
| Live голос (hands-free) | ✅ **Live tab** | Video Call (огранич.) | ✅ core | ❌ / эксперимент |
| Контекст прогресса (SRS, уроки) | ✅ adaptive profile | Частично | ❌ | Только если вручную |
| Промпт под LVA + RU | ✅ system prompt | Generic | Generic | Зависит от user |
| Прерывание ответа (barge-in) | ✅ interrupt | ? | ✅ | ❌ |

**Вывод:** ближе всего к **Speak + персональный curriculum**, но с **локальной LVA-программой**, которой у Speak нет для латышского.

### 2. Озвучка и STT

| | Наш продукт | Duolingo | Babbel | Browser-only apps |
|--|-------------|----------|--------|---------------------|
| TTS LV neural | ✅ Edge Everita/Nils | Синтез Duolingo | Записи + TTS | Web Speech API |
| Скорость / голос настраиваются | ✅ Settings | Ограничено | Да | Зависит от ОС |
| STT lv-LV | ✅ continuous (Chrome) | В упражнениях | Редко | ✅ |
| Offline TTS cache | PWA partial | ✅ app | ✅ app | ❌ |

### 3. Учебная программа и контент

| | Latviešu Skolotājs | Duolingo LV | Memrise | Учебники LVA |
|--|-------------------|-------------|---------|--------------|
| Словарь | **553+** слов, FSRS | ~2000+ но gamified | User decks | PDF |
| Уроки | **20+** (grammar, culture, travel) | Units | Decks | Главы |
| Skill tree LVA | ✅ A1→B1 path | Linear tree | ❌ | ✅ бумага |
| Диалоги сценарии | ✅ + AI генерация | Fixed | Fixed | Текст |
| Экзамен B1 / VISC mock | ✅ `/exam` | ❌ | ❌ | Официальные PDF |

### 4. Мотивация и аналитика

| | Наш продукт | Duolingo | Busuu |
|--|-------------|----------|-------|
| Streak | ✅ | ✅✅✅ | ✅ |
| D7 retention analytics | ✅ | Internal only | ❌ |
| Leaderboards | ❌ | ✅ | ✅ |
| Daily «Сегодня» loop | ✅ **North Star** | Home screen | Plan |

Сознательно **не клонируем** агрессивную gamification Duolingo — фокус на взрослом learner с целью (ВНЖ, работа, B1).

### 5. Технология и приватность

| | Latviešu Skolotājs | SaaS конкуренты |
|--|-------------------|-----------------|
| Self-hosted backend | ✅ Express local | ❌ |
| Export/import прогресса | ✅ JSON | Редко |
| Rate limiting / API hardening | ✅ | N/A (их infra) |
| PWA offline | ✅ уроки, слова | Native apps лучше |
| Open stack | React, Vite, Gemini | Closed |

---

## Матрица «кто для кого»

```
                    Глубина LV / LVA
                         ▲
                         │
    Учебники LVA ────────┼──────── Latviešu Skolotājs ★
                         │
    Mondly / Drops ──────┤
                         │
    Duolingo LV ─────────┤
                         │
    Memrise decks ───────┴──────────────────────────► AI / Live
                              italki          Speak
```

- **Duolingo** — если нужен «5 минут в день» и не цель B1.
- **italki** — если нужен живой человек и бюджет на занятия.
- **Speak** — если язык English/Korean и важен только разговор.
- **Latviešu Skolotājs** — русскоязычный, путь A1→B1, AI 24/7, neural LV, mock VISC, без vendor lock-in.

---

## Конкурентные преимущества (moat)

1. **Билингвальный AI** — объясняет падежи на русском, практикует на латышском.
2. **LVA-aligned content** — не перевод английского курса, а latviešu valoda + интеграция.
3. **Full stack voice loop** — Live: mic → STT → Gemini stream → Edge TTS LV.
4. **FSRS + adaptive profile** — AI знает ваши слабые слова и уроки.
5. **B1/VISC mock** — уникально среди consumer apps для LV.
6. **Self-host / privacy** — прогресс локально, ключ свой.

---

## Честные слабости (vs рынок)

| Слабость | Кто делает лучше |
|----------|------------------|
| Нет iOS/Android native | Duolingo, Babbel |
| Нет marketplace учителей | italki, Preply |
| STT зависит от Chrome / lv-LV | ELSA (phonemes) |
| Контент 553 слов vs 2000+ | Duolingo, Clozemaster |
| Нет social / leagues | Duolingo |
| Нужен свой Gemini key / server | Duolingo free tier |
| WebRTC live — v1, не Gemini Live API | Google AI Studio native |

---

## Roadmap vs конкуренты (куда расти)

| Фаза | Фича | Догоняет / обгоняет |
|------|------|---------------------|
| 3 ✅ | PWA, backup, B1 mock, **Live WebRTC** | Speak (LV niche) |
| 4 | Mobile wrappers, push reminders | Duolingo retention |
| 4 | Gemini Live API native audio | Google/OpenAI realtime |
| 4 | ELSA-like pronunciation score | ELSA |
| 5 | Community decks, teacher dashboard | Memrise / italki hybrid |

---

## Итог одной фразой

**Latviešu Skolotājs** — это **Speak + Anki + LVA учебник + русскоязычный репетитор**, собранные в один PWA для людей, которым Duolingo слишком поверхностен, а italki слишком дорог для ежедневной практики, а готового **RU→LV AI-курса до B1** на рынке просто нет.

---

*Документ для внутреннего позиционирования и landing copy. Обновлять при изменении roadmap.*
