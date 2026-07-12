export type UiLanguage = 'ru' | 'en' | 'lv'

export type TranslationSection = Record<string, string>

export type TranslationDict = Record<string, TranslationSection>

export type TFunction = (key: string, vars?: Record<string, string | number>) => string
