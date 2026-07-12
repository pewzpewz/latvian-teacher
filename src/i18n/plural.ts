import type { UiLanguage } from './types'

/** Word count label: 1 / 2-4 / 5+ (RU) or generic (EN/LV). */
export function wordCountLabel(lang: UiLanguage, count: number): string {
  if (lang === 'ru') {
    const mod10 = count % 10
    const mod100 = count % 100
    if (mod10 === 1 && mod100 !== 11) return 'слово'
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'слова'
    return 'слов'
  }
  return count === 1 ? 'word' : 'words'
}

export function dayCountLabel(lang: UiLanguage, count: number): string {
  if (lang === 'ru') {
    const mod10 = count % 10
    const mod100 = count % 100
    if (mod10 === 1 && mod100 !== 11) return 'день'
    return 'дней'
  }
  return count === 1 ? 'day' : 'days'
}

export function lessonCountLabel(lang: UiLanguage, count: number): string {
  if (lang === 'ru') {
    const mod10 = count % 10
    const mod100 = count % 100
    if (mod10 === 1 && mod100 !== 11) return 'урок'
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'урока'
    return 'уроков'
  }
  return count === 1 ? 'lesson' : 'lessons'
}

export function cardCountLabel(lang: UiLanguage, count: number): string {
  if (lang === 'ru') {
    const mod10 = count % 10
    const mod100 = count % 100
    if (mod10 === 1 && mod100 !== 11) return 'карточка'
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'карточки'
    return 'карточек'
  }
  return count === 1 ? 'card' : 'cards'
}
