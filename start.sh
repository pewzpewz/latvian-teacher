#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

echo ""
echo "  🇱🇻  Latviešu Skolotājs"
echo "  ========================"
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "  [ОШИБКА] Node.js не найден. Установите: https://nodejs.org"
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "  Устанавливаю зависимости фронтенда..."
  npm install
fi

if [ ! -d server/node_modules ]; then
  echo "  Устанавливаю зависимости сервера..."
  (cd server && npm install)
fi

if [ ! -f server/.env ]; then
  echo "  Создаю server/.env из примера..."
  cp server/.env.example server/.env
fi

echo ""
echo "  Запускаю API + фронтенд..."
echo "  Откройте: http://localhost:5173"
echo ""
echo "  AI: добавьте GEMINI_API_KEY в server/.env"
echo ""

npm run dev:all
