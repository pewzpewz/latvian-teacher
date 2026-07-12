import type { UiLanguage } from './types'

/** Read UI language from localStorage (for class components / error boundary). */
export function readUiLanguage(): UiLanguage {
  try {
    const raw = localStorage.getItem('lv-settings')
    if (raw) {
      const parsed = JSON.parse(raw) as { uiLanguage?: string }
      if (parsed.uiLanguage === 'en' || parsed.uiLanguage === 'lv' || parsed.uiLanguage === 'ru') {
        return parsed.uiLanguage
      }
    }
  } catch {
    /* ignore */
  }
  return 'ru'
}
