import { ru } from './locales/ru'
import { en } from './locales/en'
import { lv } from './locales/lv'
import type { TranslationDict, UiLanguage, TFunction } from './types'

export type { TranslationDict, UiLanguage, TFunction }

const dictionaries: Record<UiLanguage, TranslationDict> = { ru, en, lv }

function getNested(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split('.')
  let cur: unknown = obj
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[p]
  }
  return typeof cur === 'string' ? cur : undefined
}

export function translate(
  lang: UiLanguage,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const dict = dictionaries[lang] ?? ru
  let text =
    getNested(dict as unknown as Record<string, unknown>, key) ??
    getNested(ru as unknown as Record<string, unknown>, key) ??
    key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{{${k}}}`, String(v))
    }
  }
  return text
}

export function createT(lang: UiLanguage): TFunction {
  return (key, vars) => translate(lang, key, vars)
}
