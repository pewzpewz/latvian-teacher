# Content pipeline

Контент приложения хранится в JSON и генерируется в TypeScript перед сборкой.

**Текущий объём:** 553 слова, 20 уроков (8 базовых + 12 в `content/lessons/`).

## Структура

```
content/
  vocabulary.json      # словарь (553 слова)
  declensions.json     # тренажёр падежей (42 drill)
  lessons/
    family-1.json      # дополнительные уроки (12 шт.)
    work-1.json
    ...
```

Базовые 8 уроков остаются в `src/data/lessons.ts` (с полем `lvaTheme`).

## Добавление слов

1. Отредактируйте `content/vocabulary.json` **или** добавьте пары в `scripts/vocab-extra.mjs` и запустите:

```bash
npm run vocab:merge
npm run build:content
```

Это обновит `src/data/vocabulary.ts`.

## Добавление урока

1. Создайте `content/lessons/my-lesson.json` по образцу существующих файлов.
2. Обязательные поля: `id`, `title`, `subtitle`, `level`, `category`, `lvaTheme`, `duration`, `sections`.
3. `lvaTheme` — одна из 7 тем LVA: `identity`, `education`, `environment`, `daily`, `leisure`, `culture`, `science`.
4. Запустите `npm run build:content` — обновится `src/data/lessonsExtra.ts`.

## Сборка

`npm run build` автоматически вызывает `build:content` через `prebuild`.

## Темы LVA

См. `src/data/lvaThemes.ts` — skill tree на странице «Уроки» группирует уроки по этим темам.
