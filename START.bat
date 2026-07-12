@echo off
chcp 65001 >nul
title Latviešu Skolotājs — Учитель латышского
echo.
echo  🇱🇻  Latviešu Skolotājs
echo  ========================
echo.

cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
    echo  [ОШИБКА] Node.js не найден. Установите: https://nodejs.org
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo  Устанавливаю зависимости фронтенда...
    call npm install
)

if not exist "server\node_modules\" (
    echo  Устанавливаю зависимости сервера...
    cd server
    call npm install
    cd ..
)

if not exist "server\.env" (
    echo  Создаю server\.env из примера...
    copy "server\.env.example" "server\.env" >nul
)

echo.
echo  Запускаю сервер API (порт 3001)...
start "LV-API" cmd /c "cd /d %~dp0server && npm run dev"

timeout /t 2 /nobreak >nul

echo  Запускаю приложение (порт 5173)...
echo.
echo  Откройте: http://localhost:5173
echo.
echo  AI-репетитор: Google Gemini (бесплатно)
echo  1. Откройте https://aistudio.google.com/apikey
echo  2. Создайте ключ и вставьте в server\.env:
echo     GEMINI_API_KEY=ваш_ключ
echo  3. Перезапустите START.bat
echo.

start "" "http://localhost:5173"
call npm run dev
