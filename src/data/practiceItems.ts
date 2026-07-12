import { vocabulary } from './vocabulary'
import { lessons } from './lessons'
import type { Level } from '../lib/adaptive'

export type PracticeItem = {
  lv: string
  ru: string
  reason?: string
}

/** Готовые фразы и предложения для произношения */
export const PRACTICE_PHRASES: PracticeItem[] = [
  { lv: 'Labdien!', ru: 'Добрый день!' },
  { lv: 'Paldies!', ru: 'Спасибо!' },
  { lv: 'Es runāju latviski.', ru: 'Я говорю по-латышски.' },
  { lv: 'Kā Tevi sauc?', ru: 'Как тебя зовут?' },
  { lv: 'Es esmu no Latvijas.', ru: 'Я из Латвии.' },
  { lv: 'Lūdzu, atkārtojiet.', ru: 'Пожалуйста, повторите.' },
  { lv: 'Es mācos latviešu valodu.', ru: 'Я учу латышский язык.' },
  { lv: 'Cik pulkstenis?', ru: 'Который час?' },
  { lv: 'Uz redzēšanos!', ru: 'До свидания!' },
  { lv: 'Man patīk Rīga.', ru: 'Мне нравится Рига.' },
  { lv: 'Sveiki, kā iet?', ru: 'Привет, как дела?' },
  { lv: 'Prieks iepazīties!', ru: 'Приятно познакомиться!' },
  { lv: 'Es esmu students.', ru: 'Я студент.' },
  { lv: 'Vai jūs runājat angliski?', ru: 'Вы говорите по-английски?' },
  { lv: 'Kur ir tuvākais veikals?', ru: 'Где ближайший магазин?' },
]

const LEVEL_ORDER: Level[] = ['A0', 'A1', 'A2', 'B1']

function levelsUpTo(level: Level): Level[] {
  const idx = LEVEL_ORDER.indexOf(level)
  return LEVEL_ORDER.slice(0, idx + 1)
}

function dedupeItems(items: PracticeItem[]): PracticeItem[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = item.lv.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/** Отдельные слова из словаря (без предложений) */
export function getWordPracticeItems(level: Level): PracticeItem[] {
  const allowed = new Set(levelsUpTo(level))
  return dedupeItems(
    vocabulary
      .filter((w) => allowed.has(w.level))
      .map((w) => ({ lv: w.lv, ru: w.ru })),
  )
}

/** Фразы: базовый список + примеры из словаря и уроков */
export function getPhrasePracticeItems(): PracticeItem[] {
  const fromVocab = vocabulary
    .filter((w) => w.example && w.exampleRu)
    .map((w) => ({ lv: w.example!, ru: w.exampleRu! }))

  const fromLessons = lessons.flatMap((lesson) =>
    lesson.sections.flatMap((section) =>
      (section.examples ?? []).map((ex) => ({ lv: ex.lv, ru: ex.ru })),
    ),
  )

  return dedupeItems([...PRACTICE_PHRASES, ...fromVocab, ...fromLessons])
}
