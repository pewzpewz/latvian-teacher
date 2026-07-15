# Voice Engine

Unified speech input and pronunciation assessment for Latviešu Skolotājs.

## Architecture

```
src/lib/voice/
  types.ts           — VoiceMode, PronunciationAssessment
  sttAdapter.ts      — Web Speech API (lv-LV)
  audioCapture.ts    — MediaRecorder → Blob
  scoring.ts         — STT text scoring by mode
  pronunciationClient.ts — POST /api/pronunciation
  voiceEngine.ts     — state machine
  useVoiceEngine.ts  — React hook
```

## Modes

| Mode | Pages | Audio to Gemini | STT |
|------|-------|-----------------|-----|
| `pronunciation` | `/practice` | Yes (auto/gemini) | Fallback |
| `dialogTurn` | `/dialogs` practice | Short lines (≤8 words) | Fallback |
| `examSpeaking` | `/exam` | No | Yes |
| `conversation` | Live AI, chat mic | No | Yes |

## Settings

**Settings → Speech → Pronunciation check**

- **Auto** (default): Gemini audio on server, STT fallback offline
- **Gemini**: audio only (requires API + network)
- **STT only**: browser speech recognition (legacy behavior)

## Server

`POST /api/pronunciation` — sends audio to Gemini multimodal, returns JSON score 0–100, phoneme highlights, tips.

Requires `GEMINI_API_KEY` on the server (Render secrets).

Rate limit: 20 req/min.

## Limitations

- Browser STT quality varies (Chrome recommended)
- Gemini pronunciation is approximate, not a certified phonetic engine
- Live dialog uses STT only (no grading)
- Dictations remain listen-and-type (no voice output check)

## Phase C (future)

Diction metrics (pace, pauses, “repeat after speaker”) — planned as a separate Practice tab.
