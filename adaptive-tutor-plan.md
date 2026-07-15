# План: превращение Latvian Teacher в адаптивного репетитора

Опирается на реальную структуру репозитория `pewzpewz/latvian-teacher`. Все имена файлов/типов — существующие, если не помечено как «новый файл».

---

## Принцип

Сейчас: `progress.categoryStats` (7-8 крупных категорий, "правильно/всего" без учёта времени) → эвристический список `actions` в `analyzeLearning`.

Нужно: граф навыков (skills) → для каждого навыка вероятность "ученик знает" (обновляется по Bayesian Knowledge Tracing) → очередь next-best-action, отсортированная по риску забывания и важности → тот же профиль уходит в AI-репетитора, который реально видит, что вести дальше.

Всё считается на клиенте, без ML-инфраструктуры и без новых платных сервисов.

---

## Фаза 1 — Реестр навыков (skill graph)

**Новый файл `src/data/skills.ts`:**

```ts
export type SkillType = 'grammar' | 'phoneme' | 'vocab-set' | 'topic'

export type Skill = {
  id: string                // 'noun-dat-pl', 'phoneme-sh', 'topic-cafe'
  type: SkillType
  label: string              // человеко-читаемое имя (для UI/AI-профиля)
  weight: number             // важность 1-10 (частотность в языке/экзамене)
  prerequisites?: string[]   // необязательно: что должно быть освоено раньше
}

export const skills: Skill[] = [
  { id: 'phoneme-sh', type: 'phoneme', label: 'š / s', weight: 8 },
  { id: 'phoneme-zh', type: 'phoneme', label: 'ž / z', weight: 6 },
  { id: 'phoneme-long-a', type: 'phoneme', label: 'долгая ā', weight: 7 },
  { id: 'phoneme-rolled-r', type: 'phoneme', label: 'вибрант r', weight: 9 },
  { id: 'noun-dat-sg', type: 'grammar', label: 'дательный, ед.ч.', weight: 8 },
  { id: 'verb-past', type: 'grammar', label: 'прошедшее время', weight: 9 },
  // ... остальные грамматические темы и фонемы латышского
]
```

**Связка с существующим контентом.** У `Exercise` (в `src/data/lessons.ts`) и у элементов `content/vocabulary.json` сейчас есть только `category: string`. Добавляем необязательное поле:

```ts
// расширение существующего типа Exercise
skillIds?: string[]   // например ['verb-past', 'noun-dat-sg']
```

Заполнять не нужно сразу для всех 20+ уроков — начните с 5-6 самых частых грамматических тем, остальное можно доразмечать постепенно (поле опционально, деградация мягкая: если `skillIds` нет, упражнение просто не участвует в новой модели, но продолжает писать в старый `categoryStats` — обратная совместимость).

**Оценка:** 1-2 вечера на файл + разметка первых уроков.

---

## Фаза 2 — Bayesian Knowledge Tracing вместо category-average

**Новый файл `src/lib/knowledgeTracing.ts`:**

```ts
export type SkillState = {
  skillId: string
  pKnow: number       // 0..1, вероятность "ученик знает навык"
  reps: number
  lastSeen: number    // timestamp
}

// Дефолтные параметры BKT — можно не тюнить, стандартные из литературы
const P_INIT = 0.3   // априорная вероятность знания у нового навыка
const P_LEARN = 0.15 // вероятность "выучил с этой попытки", если не знал
const P_SLIP = 0.1   // вероятность ошибиться, даже если знает
const P_GUESS = 0.2  // вероятность угадать, даже если не знает

export function updateSkillState(prev: SkillState | undefined, skillId: string, correct: boolean, now = Date.now()): SkillState {
  const pKnowPrior = prev?.pKnow ?? P_INIT

  // Байесовское обновление по результату попытки
  const pCorrectGivenKnow = 1 - P_SLIP
  const pCorrectGivenNotKnow = P_GUESS
  const pCorrect = pKnowPrior * pCorrectGivenKnow + (1 - pKnowPrior) * pCorrectGivenNotKnow

  const pKnowPosterior = correct
    ? (pKnowPrior * pCorrectGivenKnow) / pCorrect
    : (pKnowPrior * P_SLIP) / (1 - pCorrect)

  // Плюс вероятность научиться в процессе (learning transition)
  const pKnowAfterLearning = pKnowPosterior + (1 - pKnowPosterior) * P_LEARN

  return {
    skillId,
    pKnow: Math.min(0.99, Math.max(0.01, pKnowAfterLearning)),
    reps: (prev?.reps ?? 0) + 1,
    lastSeen: now,
  }
}

// Забывание со временем (простая экспонента, отдельно от FSRS для слов)
export function decayedPKnow(state: SkillState, now = Date.now()): number {
  const daysSince = (now - state.lastSeen) / 86_400_000
  const decayRate = 0.02 // подобрать эмпирически
  return state.pKnow * Math.exp(-decayRate * daysSince)
}
```

**Интеграция.** В `useStore.ts` рядом с `categoryStats` добавляем:

```ts
skillStats: Record<string, SkillState>
```

и в местах, где сейчас пишется `categoryStats[category].total += 1` (строки ~266-270 `useStore.ts`), добавляем вызов для каждого `skillIds` упражнения:

```ts
for (const skillId of exercise.skillIds ?? []) {
  progress.skillStats[skillId] = updateSkillState(progress.skillStats[skillId], skillId, correct)
}
```

Старый `categoryStats` не трогаем — он остаётся источником данных, пока не размечены все уроки; постепенно `analyzeLearning` переключается на `skillStats` там, где разметка есть, и падает обратно на `categoryStats` там, где нет.

**Оценка:** 1 день на реализацию + тесты (`knowledgeTracing.test.ts`, покрыть краевые случаи — 0 попыток, 100% верно/неверно подряд).

---

## Фаза 3 — Персистентность произношения по звукам (главный "вау"-пункт)

Сейчас `server/pronunciation.ts` уже возвращает `chars: [{char, status}]` — это выбрасывается после показа `PronunciationFeedback`. Чиним это.

**Шаг 1 — маппинг символов в устойчивые ключи фонем.**
Новый файл `src/lib/phonemeMap.ts`:

```ts
// группируем похожие ошибки в один навык, а не по каждой букве отдельно
export const CHAR_TO_PHONEME: Record<string, string> = {
  š: 'phoneme-sh', s: 'phoneme-sh',
  ž: 'phoneme-zh', z: 'phoneme-zh',
  č: 'phoneme-ch', c: 'phoneme-ch',
  ā: 'phoneme-long-a', a: 'phoneme-long-a',
  ē: 'phoneme-long-e', e: 'phoneme-long-e',
  ī: 'phoneme-long-i', i: 'phoneme-long-i',
  ū: 'phoneme-long-u', u: 'phoneme-long-u',
  ģ: 'phoneme-palatal-g', ķ: 'phoneme-palatal-k',
  ļ: 'phoneme-palatal-l', ņ: 'phoneme-palatal-n',
  r: 'phoneme-rolled-r',
}
```

**Шаг 2 — расширить `recordPronunciation`.**
Сейчас (`useStore.ts`):
```ts
recordPronunciation: (correct: boolean) => void
```
Меняем сигнатуру, не ломая вызовы (второй параметр опционален):

```ts
recordPronunciation: (correct: boolean, chars?: { char: string; status: string }[]) => void
```

В реализации — помимо старого `pronunciationAttempts.total/correct`, для каждого `char` со статусом `wrong`/`missing`/`diacritic` инкрементим `progress.phonemeStats[phonemeId]`, используя ту же `updateSkillState` логику из Фазы 2 (произношение — это тоже skill, просто источник сигнала другой):

```ts
phonemeStats: Record<string, SkillState>
```

**Шаг 3 — прокинуть данные из UI.**
В `PracticePage.tsx` (строка ~87, `recordPronunciation(report.accepted)`) заменить на `recordPronunciation(report.accepted, report.chars)` — `report` (тип `ServerPronunciationResult`) уже содержит `chars`, просто сейчас это поле не используется на этом шаге.

**Оценка:** 0.5-1 день. Самая дешёвая и самая ценная часть плана — вся тяжёлая работа (анализ по буквам) уже сделана в `server/pronunciation.ts`, не хватает только сохранения результата.

---

## Фаза 4 — Таргетированные дрилли по слабым звукам

Как только `phonemeStats` наполняется, генерируем упражнения именно под слабые звуки, а не общие "фразы".

**Разметка `src/data/practiceItems.ts`.** Добавить полю `PracticeItem` необязательный `phonemes?: string[]` — какие звуки тренирует фраза (можно проставить автоматически: пройтись по `lv`-строке и найти совпадения с ключами `CHAR_TO_PHONEME`, вместо ручной разметки всех фраз).

**Минимальные пары.** Для латышского самое полезное — списки minimal pairs (`sāls/žāls`-типа, реальные латышские примеры нужно будет подобрать: `zāle/žāle`, `sirds/širds` и т.п. — стоит свериться с носителем или учебником, автоматически такие пары не сгенерировать корректно). Хранить как отдельный небольшой датасет `src/data/minimalPairs.ts`, по одному-два звука на старте (`š/s`, `ž/z`, долгота гласных), расширять по мере данных о реальных ошибках пользователей.

**В `adaptive.ts`, функция `getAdaptivePracticeItems`.** Добавить блок (аналогично существующему блоку `weakAreas`, строки ~255-259):

```ts
const weakPhonemes = Object.values(progress.phonemeStats)
  .filter((s) => decayedPKnow(s) < 0.5 && s.reps >= 3)
  .sort((a, b) => decayedPKnow(a) - decayedPKnow(b))
  .slice(0, 2)

for (const ph of weakPhonemes) {
  const pairs = minimalPairs.filter((p) => p.phonemeId === ph.skillId)
  pairs.slice(0, 3).forEach((p) => items.push({ lv: p.lv, ru: p.ru, reason: `Слабый звук: ${skillLabel(ph.skillId)}` }))
}
```

**Оценка:** 1-2 дня, основное время уйдёт на подбор реальных минимальных пар для латышского (лингвистическая, не программистская работа).

---

## Фаза 5 — Переписать `analyzeLearning` на очередь по риску забывания

Сейчас приоритеты — magic numbers (`priority: 90`, `priority: 85 - area.score`). Меняем на единую формулу для всех источников (skills, phonemes, srs-слова):

```ts
function urgency(pKnowDecayed: number, weight: number): number {
  // чем меньше уверенность и чем важнее навык — тем выше приоритет
  return (1 - pKnowDecayed) * weight
}
```

`actions` строятся так же, как сейчас (по типам: vocabulary/review/practice/lesson), но `priority` для review/practice-действий вычисляется через `urgency(...)`, а не через захардкоженные числа. Это не меняет UI/API `PlanAction` — меняется только то, откуда берётся `priority`, так что фронтенд (страница `/plan`) переписывать не нужно.

**Оценка:** 0.5 дня — это рефакторинг существующей функции, не новая архитектура.

---

## Фаза 6 — Обогатить профиль для AI-репетитора

`buildProfileSummary` (`adaptive.ts`, строка ~333) уже собирает JSON для системного промпта AI. Добавить туда:

```ts
weakSkills: Object.values(progress.skillStats)
  .filter((s) => decayedPKnow(s) < 0.5)
  .map((s) => ({ skill: skillLabel(s.skillId), confidence: Math.round(decayedPKnow(s) * 100) })),
weakPhonemes: Object.values(progress.phonemeStats)
  .filter((s) => decayedPKnow(s) < 0.5)
  .map((s) => skillLabel(s.skillId)),
```

И в системном промпте (`server/ai.ts`, `SYSTEM_PROMPT`) явно указать модели, что делать с этими данными — сейчас промпт хороший, но не говорит модели активно вести ученика по слабым местам. Добавить пункт:

```
- Если в профиле студента указаны weakSkills/weakPhonemes — приоритетно включай их в упражнения и объяснения, но не упоминай сам факт "я вижу твою статистику" явно, веди себя как учитель, который просто помнит ученика.
```

**Оценка:** пара часов, чисто промпт-инжиниринг + прокидывание полей.

---

## Фаза 7 — UI: карта навыков вместо процентов

Небольшое дополнение к `RetentionAnalyticsCard.tsx` / плану (`/plan`): вместо "грамматика 62%" показывать список навыков с индикатором уверенности (можно переиспользовать текущие progress-виджеты, просто источник данных — `skillStats`/`phonemeStats` вместо `categoryStats`). Не обязательно на первой итерации — можно оставить старый UI поверх новых данных, ничего не потеряется.

---

## Миграция данных

В `src/lib/storage.ts` уже есть `version: 2` со схемой миграции (`migrateFromLocalStorage`). Добавление `skillStats`/`phonemeStats` — не breaking change (новые опциональные поля с дефолтом `{}`), версию схемы можно не поднимать, если в `useStore.ts` при чтении просто подставлять `raw.skillStats ?? {}` (как уже сделано для `categoryStats` на строке 158).

---

## Порядок работ (рекомендуемый)

1. **Фаза 3** (персистентность фонем) — самая дешёвая, сразу даёт видимую ценность, ничего не ломает.
2. **Фаза 1 + 2** (skill graph + BKT) — фундамент для всего остального.
3. **Фаза 5** (единая формула приоритета) — использует то, что построено в 1-2.
4. **Фаза 4** (минимальные пары) — можно делать параллельно с 1-2, это в основном контентная работа.
5. **Фаза 6** (профиль для AI) — быстрая, делается после 1-2-3.
6. **Фаза 7** (UI карты навыков) — полировка, в конце.

Итого по грубой оценке — 5-8 дней работы одного разработчика, из которых половина — контент (подбор минимальных пар, разметка skillIds по урокам), а не код.

---

## Что осознанно не включено

- Обучение собственной ML-модели (акустической/языковой) — не нужно для латышского при текущем масштабе, Gemini уже справляется с фонемным разбором.
- BKT с индивидуально откалиброванными параметрами (P_SLIP/P_GUESS через EM-алгоритм) — оверинжиниринг для одного пользователя/семьи; дефолтные константы дадут 80% пользы за 5% усилий.
