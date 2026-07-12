import { useCallback } from 'react'
import { translate, type UiLanguage, type TFunction } from '../i18n'
import { useStore } from '../store/useStore'

export function useTranslation() {
  const uiLanguage = useStore((s) => s.settings.uiLanguage)

  const t = useCallback<TFunction>(
    (key, vars) => translate(uiLanguage as UiLanguage, key, vars),
    [uiLanguage],
  )

  return { t, lang: uiLanguage as UiLanguage }
}
