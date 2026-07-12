# Contributing

## Workflow

1. Создайте ветку от `main`: `feat/padezi`, `fix/cors`, `chore/ci`
2. Коммитьте логическими порциями (не один squash на всё)
3. Откройте **Pull Request** — CI должен быть зелёным
4. Merge только после прохождения checks

## Локальные проверки

```bash
npm test
npm run test:coverage
npm run build
cd server && npm run typecheck && npm run build
npm run test:e2e          # Playwright
```

## Branch protection (настройка на GitHub)

Рекомендуемые правила для `main`:

- Require pull request before merging
- Require status checks: `frontend`, `server`, `docker`, `e2e`
- Require branches to be up to date

Настройка: **Settings → Branches → Add rule → Branch name pattern `main`**

## Структура проекта

| Путь | Назначение |
|------|------------|
| `src/` | React PWA |
| `server/` | Express API + Live WS |
| `content/` | JSON-пайплайн |
| `e2e/` | Playwright-тесты |
| `docs/` | DEPLOY, MARKET_COMPARISON |

## Хранилище прогресса

С версии Sprint 3 прогресс в **IndexedDB** (`idb-keyval`). При первом запуске данные мигрируют из `localStorage` автоматически.

## Лицензия

MIT — см. [LICENSE](../LICENSE)
