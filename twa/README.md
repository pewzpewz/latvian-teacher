# TWA — Trusted Web Activity для Google Play

TWA публикует уже задеплоенную PWA как Android-приложение через Chrome.

## Предварительные условия

1. PWA задеплоена по **HTTPS** (например Fly.io / Render)
2. `manifest.webmanifest` с `display: standalone` и иконками 512×512
3. [Digital Asset Links](https://developer.android.com/training/app-links/verify-android-applinks) — файл  
   `https://YOUR_DOMAIN/.well-known/assetlinks.json`

## Установка Bubblewrap

```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://YOUR_DOMAIN/manifest.webmanifest
```

Ответьте на вопросы (package name: `lv.skolo.app`, app name: `Latviešu Skolotājs`).

## Сборка APK / AAB

```bash
bubblewrap build
```

Артефакты: `app-release-signed.apk` или `.aab` для Play Console.

## assetlinks.json (пример)

После генерации keystore Bubblewrap покажет SHA-256 fingerprint:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "lv.skolo.app",
      "sha256_cert_fingerprints": ["AA:BB:..."]
    }
  }
]
```

Разместите на `https://YOUR_DOMAIN/.well-known/assetlinks.json`.

Express (production) — добавьте статику:

```javascript
app.use('/.well-known', express.static(join(__dirname, '../public/.well-known')))
```

## Обновление

При изменении PWA на сервере пользователи получают новую версию автоматически — пересборка TWA нужна только при смене package/signing.

## Документация

- [Bubblewrap CLI](https://github.com/GoogleChromeLabs/bubblewrap)
- [TWA Overview](https://developer.chrome.com/docs/android/trusted-web-activity)
