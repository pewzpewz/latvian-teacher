# Мобильные сборки (Capacitor + TWA)

Приложение можно распространять как **PWA**, **Capacitor APK/IPA** или **TWA** в Google Play.

## Требования

| Платформа | Инструменты |
|-----------|-------------|
| Android (Capacitor / TWA) | Android Studio, JDK 17+ |
| iOS (Capacitor) | macOS, Xcode 15+ |

---

## 1. Capacitor (рекомендуется для Play Store + App Store)

Capacitor упаковывает `dist/` в нативный WebView с доступом к микрофону, статус-бару и splash screen.

### Первичная настройка

```bash
npm install
npm run cap:add:android   # один раз
npm run cap:add:ios       # один раз, только на macOS
```

### URL API для нативного приложения

В браузере Vite проксирует `/api` → `localhost:3001`. В APK/IPA нужен **деployed backend**.

Создайте `.env` в корне (см. `.env.example`):

```env
VITE_API_BASE_URL=https://your-app.fly.dev
VITE_API_ACCESS_TOKEN=your_token_if_set
```

Добавьте домен в `ALLOWED_ORIGINS` на сервере (`capacitor://localhost` не нужен — запросы идут на ваш HTTPS-хост).

### Сборка и синхронизация

```bash
npm run cap:sync          # build:cap + cap sync
npm run cap:android       # открыть Android Studio
npm run cap:ios           # открыть Xcode (macOS)
```

`build:cap` собирает фронт с `base: './'` (относительные пути для WebView).

### Release APK / AAB

1. Android Studio → **Build → Generate Signed Bundle / APK**
2. Выберите **Android App Bundle** для Google Play
3. Package: `lv.skolo.app`

### iOS

1. Xcode → Signing & Capabilities → Team
2. **Product → Archive** → App Store Connect

---

## 2. TWA (Trusted Web Activity) — лёгкий APK для Play Store

TWA — Chrome Custom Tab на полный экран, без локального `dist/`. Подходит, если PWA уже задеплоена.

См. [`twa/README.md`](../twa/README.md) — Bubblewrap + Digital Asset Links.

**Плюсы:** минимальный APK, автообновление через веб.  
**Минусы:** нужен HTTPS, offline только через Service Worker PWA.

---

## 3. Сравнение

| | PWA | Capacitor | TWA |
|---|-----|-----------|-----|
| Установка | браузер | Store | Play Store |
| Offline | SW cache | SW + assets | SW |
| API | same-origin / proxy | `VITE_API_BASE_URL` | deployed URL |
| iOS | ✅ Add to Home | ✅ App Store | ❌ |

---

## Скрипты npm

| Команда | Описание |
|---------|----------|
| `npm run build:cap` | Production build для Capacitor |
| `npm run cap:sync` | Сборка + копирование в android/ios |
| `npm run cap:android` | Sync + Android Studio |
| `npm run cap:ios` | Sync + Xcode |

---

## Troubleshooting

**Белый экран в APK** — проверьте `npm run build:cap` (относительные пути) и `cap sync`.

**API 404 / CORS** — задайте `VITE_API_BASE_URL` и добавьте origin в `ALLOWED_ORIGINS`.

**Микрофон** — разрешения уже в AndroidManifest (Capacitor). На iOS добавьте `NSMicrophoneUsageDescription` в `Info.plist` при необходимости.
