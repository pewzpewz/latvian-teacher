# Latviešu Skolotājs — Roadmap улучшений

> **Статус:** активный план разработки  
> **Создан:** 2026-07-12  
> **North Star:** ежедневный цикл «Сегодня» (15 мин): 5 SRS → 1 урок → 1 диалог → 5 мин AI → streak ✓

**Правило выполнения:** идём **строго по фазам**, задачи **по порядку**, каждую мелочь не пропускаем.  
После завершения задачи — отметить `[x]` и указать дату в скобках.

---

## Позиционирование

**НЕ:** «Duolingo для латышского»  
**ДА:** персональный AI-репетитор латышского для русскоязычных + программа LVA + neural TTS + privacy-first

**Целевая аудитория:** экспаты в Латвии, подготовка к VISC B1 (натурализация).

---

## Методология оценки сроков

Оценки ниже — **календарное время** при работе **1 разработчик + AI-ассистент**, **~2–4 часа в день** (не full-time).

| Сложность | Описание | Типично |
|-----------|----------|---------|
| S | 1–2 файла, локальная логика | 2–4 ч |
| M | 3–5 файлов, UI + store | 4–8 ч |
| L | Новая подсистема, много edge cases | 1–3 дня |
| XL | Контент + архитектура | 1–2 нед+ |

**Буфер:** к каждой фазе +20–30% на тестирование и неожиданные баги.

**Фаза 0 = 1–2 недели** потому что: 5 задач × (S–M) ≈ 20–35 часов чистой работы ÷ 2–4 ч/день ≈ 7–14 календарных дней.

---

## Текущее состояние (baseline, июль 2026)

| Метрика | Значение |
|---------|----------|
| Уроки | 20 |
| Слова (встроенный словарь) | 553 |
| Большой словарь (Wikidata) | 41 835 |
| Диалоги | 8 (5 read + 3 новых) |
| Игры | 4 |
| Достижения | 22 |
| Тесты / CI | vitest + GitHub Actions |

### Сильные стороны
- AI-репетитор (Gemini) + hover-перевод
- Neural TTS (Everita / Nils)
- Адаптивный план + практика произношения
- Культурные игры (Līgo, Daugava)
- Local-first (localStorage)

### Известные баги (P0)
- [x] `culture-1` нельзя завершить (нет упражнений) — 2026-07-12
- [x] Урок: «Следующее» без проверки ответа — 2026-07-12
- [x] `/vocabulary?mode=cards` не обрабатывается — 2026-07-12
- [x] `getDueCards()` не используется в UI — 2026-07-12
- [x] `dailyGoal` не отслеживается — 2026-07-12
- [x] Mobile: sidebar 256px без collapse — 2026-07-12

---

# ФАЗА 0 — Починить сломанное

**Срок:** 1–2 недели (~20–35 ч)  
**Цель:** приложение работает честно, usable на телефоне, SRS daily loop виден

## 0.1 — Завершение урока culture-1
- **Сложность:** S–M | **Оценка:** 3–5 ч
- **Файлы:** `src/data/lessons.ts`, `src/pages/LessonView.tsx`
- **Задачи:**
  - [x] Добавить 2–3 упражнения в `culture-1` **ИЛИ** кнопку «Завершить урок» для уроков без exercises
  - [x] Проверить achievement «все уроки»
  - [x] Пройти урок end-to-end в браузере

## 0.2 — Блок «Следующее» до проверки ответа
- **Сложность:** S | **Оценка:** 2–3 ч
- **Файлы:** `src/pages/LessonView.tsx`, `src/components/ExerciseCard.tsx`
- **Задачи:**
  - [x] Кнопка «Следующее» disabled пока `result === null`
  - [x] Визуальная подсказка «Сначала ответьте»
  - [x] Edge case: последнее упражнение → завершение урока

## 0.3 — SRS due-queue + ?mode=cards
- **Сложность:** M | **Оценка:** 6–8 ч
- **Файлы:** `src/pages/VocabularyPage.tsx`, `src/pages/Dashboard.tsx`, `src/store/useStore.ts`
- **Задачи:**
  - [x] Использовать `getDueCards()` — показать «N карточек на сегодня»
  - [x] Обработать URL `?mode=cards` — сразу режим карточек
  - [x] Блок на Dashboard: «Повторить сегодня: N слов» → ссылка в словарь
  - [x] Проверить adaptive plan link `/vocabulary?mode=cards`

## 0.4 — Mobile layout
- **Сложность:** M–L | **Оценка:** 8–12 ч
- **Файлы:** `src/components/Sidebar.tsx`, `src/components/Layout.tsx`
- **Задачи:**
  - [x] Hamburger menu на `< md` breakpoint
  - [x] Sidebar overlay / slide-in, не fixed 256px
  - [x] Main content без `ml-64` на mobile
  - [x] Проверить: Dashboard responsive grids
  - [ ] (Опционально) bottom nav — отложено

## 0.5 — dailyGoal: трекинг минут за сегодня
- **Сложность:** M | **Оценка:** 4–6 ч
- **Файлы:** `src/store/useStore.ts`, `src/pages/Dashboard.tsx`
- **Задачи:**
  - [x] Поле `todayStudyMinutes` + `todayStudyDate` в progress
  - [x] Сброс при смене дня
  - [x] Инкремент: уроки, произношение, игры, карточки (каждые 3)
  - [x] Progress bar: сегодня X / dailyGoal мин
  - [x] Показать на Dashboard

### Критерий завершения Фазы 0
- [x] Все 5 задач отмечены
- [x] Mobile: sidebar не ломает layout на 375px
- [x] Можно завершить все 8 уроков
- [x] Due cards видны на Dashboard

---

# ФАЗА 1 — Замкнуть цикл обучения

**Срок:** 3–6 недель (~40–70 ч)  
**Цель:** единый daily loop, диалоги интерактивны, AI живее

## 1.1 — Диалоги: role-play + STT + прогресс
- **Сложность:** L | **Оценка:** 12–16 ч
- **Файлы:** `src/pages/DialogsPage.tsx`, `src/store/useStore.ts`
- **Задачи:**
  - [x] Режим «Практика»: пользователь говорит реплику (STT)
  - [x] STT проверка (fuzzy matchPronunciation)
  - [x] Запись `dialogsCompleted` в progress
  - [x] Achievement `dialog-first`

## 1.2 — Fuzzy pronunciation matching
- **Сложность:** M | **Оценка:** 4–6 ч
- **Файлы:** `src/lib/pronunciationMatch.ts`, `src/lib/pronunciationMatch.test.ts`
- **Задачи:**
  - [x] Levenshtein distance после normalize
  - [x] Порог similarity ≥0.85
  - [x] Учёт diacritics (fold)
  - [x] Unit-тесты (vitest, 9 tests)
  - [x] Применить в Practice + Dialogs

## 1.3 — Авто-adapt при needsAiRefresh
- **Сложность:** M | **Оценка:** 4–6 ч
- **Задачи:**
  - [x] Баннер на Dashboard «Обновить персональный план»
  - [x] `/plan?adapt=1` с confirm → `/api/adapt`
  - [ ] Не чаще 1 раза в сутки — отложено

## 1.4 — Блок «Сегодня» на Dashboard
- **Файлы:** `src/lib/todayPlan.ts`, `src/pages/Dashboard.tsx`
- **Задачи:**
  - [x] Единая карточка: SRS + урок + диалог + AI + plan
  - [x] `buildTodayPlan()` с приоритетами
  - [x] Главный CTA на главной

## 1.5 — Streaming AI chat + persist history
- **Файлы:** `server/index.ts`, `src/lib/api.ts`, `src/pages/AiTutorPage.tsx`
- **Задачи:**
  - [x] SSE `/api/chat/stream`
  - [x] Постепенный рендер в UI
  - [x] `chatHistory` в progress (до 50 сообщений)
  - [x] Кнопка «Очистить историю»

## 1.6 — Adaptive-упражнения в поток обучения
- **Задачи:**
  - [x] ExerciseCard на PlanPage с проверкой ответа
  - [x] Запись в `exerciseScores`
  - [x] Ссылка из Dashboard «Сегодня» и `/plan`

### Критерий завершения Фазы 1
- [x] Dashboard «Сегодня» — главный блок
- [x] Диалог можно пройти с STT
- [x] AI ответы стримятся
- [x] D7 retention analytics — 2026-07-12

---

# ФАЗА 2 — Контент и качество

**Срок:** 2–3 месяца (~80–120 ч)  
**Цель:** легитимный A1–A2 path, надёжный код

## 2.1 — Curriculum по LVA (7 тем)
- **Сложность:** XL | **Оценка:** 20–30 ч (структура) + контент отдельно
- **Темы LVA:** идентичность, образование/работа, среда, быт, досуг, культура, наука
- **Задачи:**
  - [x] Skill tree UI (или grouped lessons по темам) — 2026-07-12
  - [x] Маппинг существующих 8 уроков на темы — 2026-07-12
  - [x] План новых уроков A1 (минимум +7) — 2026-07-12

## 2.2 — Расширение контента
- **Сложность:** XL | **Оценка:** 40–60 ч
- **Задачи:**
  - [x] 150+ слов в vocabulary — 2026-07-12 (176)
  - [x] 15+ уроков — 2026-07-12 (15)
  - [x] +3 диалога (работа, врач, банк) — 2026-07-12
  - [x] Путь до B1 намечен в типах — 2026-07-12

## 2.3 — FSRS вместо SM-2
- **Сложность:** L | **Оценка:** 8–12 ч
- **Файлы:** `src/store/useStore.ts`, npm `ts-fsrs`
- **Задачи:**
  - [x] Заменить/обернуть `sm2()` — 2026-07-12
  - [x] Миграция существующих srsCards — 2026-07-12
  - [x] Тесты алгоритма — 2026-07-12

## 2.4 — Vitest
- **Сложность:** M | **Оценка:** 8–12 ч
- **Покрыть:**
  - [x] `adaptive.ts` — estimateLevel, analyzeLearning — 2026-07-12
  - [x] `pronunciationMatch.ts` — 2026-07-12 (Фаза 1)
  - [x] FSRS — 2026-07-12
  - [x] `wordGloss.ts` — stem, cache — 2026-07-12
  - [x] `compareLatvian` — 2026-07-12

## 2.5 — CI pipeline
- **Сложность:** M | **Оценка:** 3–5 ч
- **Задачи:**
  - [x] `.github/workflows/ci.yml`: lint + build + test — 2026-07-12
  - [ ] Блокировка merge при fail (если используете PR) — на стороне GitHub settings

## 2.6 — Content pipeline (JSON/YAML)
- **Сложность:** L | **Оценка:** 12–16 ч
- **Задачи:**
  - [x] `content/lessons/*.json`, `content/vocabulary.json` — 2026-07-12
  - [x] Build script → TS (`scripts/build-content.mjs`) — 2026-07-12
  - [x] README для добавления контента без правки кода — 2026-07-12

### Критерий завершения Фазы 2
- [x] ≥15 уроков, ≥150 слов — 2026-07-12
- [x] CI green (workflow добавлен) — 2026-07-12
- [x] FSRS работает — 2026-07-12
- [x] Skill tree по 7 темам LVA — 2026-07-12

---

# ФАЗА 3 — Продукт и масштаб

**Срок:** 3–6 месяцев (~100–160 ч)  
**Цель:** production-ready, VISC prep, voice AI

## 3.1 — PWA + offline
- [x] vite-plugin-pwa — 2026-07-12
- [x] Кеш: уроки, vocabulary, lv-ru.json — 2026-07-12
- [x] Offline indicator в UI — 2026-07-12

## 3.2 — Export/import прогресса
- [x] JSON export: progress + settings — 2026-07-12
- [x] Import с merge/replace — 2026-07-12
- [x] Settings → «Резервная копия» — 2026-07-12

## 3.3 — Rate limiting + API hardening
- [x] express-rate-limit на /api/chat, /api/tts, /api/gloss — 2026-07-12
- [x] Max body size (есть 1mb) — 2026-07-12
- [x] Явный `server/.env` в .gitignore — 2026-07-12
- [x] Не логировать API keys в URL (Gemini → header) — 2026-07-12

## 3.4 — Голосовой AI (Live mode)
- [x] WebSocket + WebRTC для real-time live-диалога — 2026-07-12
- [x] STT + TTS (push-to-talk в чате) — 2026-07-12
- [x] UI: вкладки «Чат» | «Live» — 2026-07-12

## 3.5 — VISC B1 preparation
- [x] Mock-тесты: reading, grammar (формат LVA) — 2026-07-12
- [x] Раздел «Экзамен» в sidebar — 2026-07-12
- [x] Ссылки на официальные материалы valoda.lv — 2026-07-12

## 3.6 — Touch-friendly hover в чате
- [x] Long-press → tooltip перевода — 2026-07-12
- [x] Tap outside закрывает — 2026-07-12

## 3.7 — Onboarding
- [x] 3 шага: уровень → цель → первый урок — 2026-07-12
- [x] Сохранить в settings, влияет на adaptive — 2026-07-12

### Критерий завершения Фазы 3
- [x] PWA installable — 2026-07-12
- [x] Backup/restore работает — 2026-07-12
- [x] Rate limit на API — 2026-07-12
- [x] Mock B1 доступен — 2026-07-12

---

## Конкурентная матрица (reference)

| Область | Мы | Duolingo/Babbel |
|---------|-----|-----------------|
| AI-репетитор | ✅ Сильно | Частично |
| Neural LV TTS | ✅ Сильно | Редко |
| Privacy / local | ✅ Сильно | Слабо |
| Культурные игры | ✅ Уникально | Нет |
| Объём контента | ⚠️ 553 слова, 20 уроков | ✅ Сильно |
| SRS daily UX | ✅ FSRS + «Сегодня» | ✅ Сильно |
| Mobile | ⚠️ PWA responsive | ✅ Native apps |
| Live AI voice | ✅ WebRTC + WS | Частично (Max/Speak) |
| B1 / VISC prep | ✅ Mock | ❌ |
| Подробнее | → `docs/MARKET_COMPARISON.md` | — |

---

## Метрики успеха (6 месяцев)

| Метрика | Сейчас | Цель |
|---------|--------|------|
| Уроки | **20** | 20+ ✅ |
| Слова | **553** | 500+ ✅ |
| Daily loop | **«Сегодня»** | Единый «Сегодня» ✅ |
| Mobile | **PWA** | PWA responsive ✅ |
| Тесты | **33** | CI green ✅ |
| Экзамен | **VISC B1 mock** | VISC B1 mock ✅ |
| Live AI | **WebRTC + WS** | Real-time voice ✅ |

---

## Журнал прогресса

| Дата | Задача | Статус | Заметки |
|------|--------|--------|---------|
| 2026-07-12 | ROADMAP создан | ✅ | Baseline зафиксирован |
| 2026-07-12 | **Фаза 0 завершена** | ✅ | culture-1, уроки, SRS, mobile, dailyGoal |
| 2026-07-12 | **Фаза 1 завершена** | ✅ | диалоги, fuzzy STT, Сегодня, streaming AI, adapt |
| 2026-07-12 | **Фаза 2 завершена** | ✅ | LVA skill tree, 15 уроков, 176 слов, FSRS, CI, content pipeline |
| 2026-07-12 | **Фаза 3 завершена** | ✅ | PWA, backup, rate limit, B1 mock, onboarding, voice mode |
| 2026-07-12 | D7 retention analytics | ✅ | studyDayLog, Progress page, 7 tests |
| 2026-07-12 | Контент 500+ / 20+ уроков | ✅ | 553 слова, 20 уроков |
| 2026-07-12 | WebRTC Live AI-диалог | ✅ | WS + WebRTC, вкладка Live |
| 2026-07-12 | Сравнение с рынком | ✅ | `docs/MARKET_COMPARISON.md` |

---

## Связанные файлы

- Canvas: `~/.cursor/projects/d-cursor/canvases/latvian-teacher-roadmap.canvas.tsx`
- Cursor rule: `.cursor/rules/roadmap.mdc`
- Аудит: см. чат 2026-07-11 / agent transcript
- Рынок: `docs/MARKET_COMPARISON.md`
