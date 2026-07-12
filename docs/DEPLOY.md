# Деплой Latviešu Skolotājs

Production-образ: **один контейнер** — Express отдаёт API + статику из `dist/`.

## Docker (локально)

```bash
docker build -t latvian-teacher .
docker run -p 3001:3001 \
  -e GEMINI_API_KEY=your_key \
  -e NODE_ENV=production \
  latvian-teacher
```

Откройте: http://localhost:3001

### Переменные окружения

| Переменная | Обязательно | Описание |
|------------|-------------|----------|
| `GEMINI_API_KEY` | да | Ключ Google Gemini |
| `NODE_ENV` | да | `production` |
| `PORT` | нет | По умолчанию `3001` |
| `ALLOWED_ORIGINS` | при публичном URL | `https://your-app.example.com` |
| `API_ACCESS_TOKEN` | рекомендуется | Защита API от сторонних сайтов |

---

## Fly.io

```bash
fly launch --no-deploy
fly secrets set GEMINI_API_KEY=your_key
fly secrets set NODE_ENV=production
fly deploy
```

Пример `fly.toml` уже в корне репозитория.

---

## Railway

1. New Project → Deploy from GitHub
2. Root Directory: `/`
3. Dockerfile: auto-detected
4. Variables: `GEMINI_API_KEY`, `NODE_ENV=production`, `PORT=3001`
5. Public domain → добавьте в `ALLOWED_ORIGINS`

---

## Render

1. New → Web Service → подключите репозиторий
2. Environment: **Docker**
3. Env vars: `GEMINI_API_KEY`, `NODE_ENV=production`
4. Health Check Path: `/api/health`

Пример `render.yaml` в корне (Blueprint).

---

## Сборка без Docker

```bash
npm run start:prod
# или
npm run build && cd server && npm run build && NODE_ENV=production npm start
```

---

## PWA / Lighthouse

После деплоя проверьте installability:

```bash
npm run build
npm run lighthouse:pwa
```

Цель: PWA score ≥ 90 (иконки 192/512, manifest, service worker).
