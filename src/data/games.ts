import { vocabulary, type VocabWord } from './vocabulary'

export type GameId = 'laiva' | 'ligo' | 'match' | 'scramble'

export type GameWord = {
  lv: string
  ru: string
  hint?: string
  cultural?: boolean
}

/** Слова латышской культуры + базовый словарь */
export const culturalWords: GameWord[] = [
  { lv: 'laiva', ru: 'лодка', hint: 'Daugavas upē', cultural: true },
  { lv: 'Daugava', ru: 'Даугава', hint: 'Latvijas upe', cultural: true },
  { lv: 'Rīga', ru: 'Рига', hint: 'Galvaspilsēta', cultural: true },
  { lv: 'Jāņi', ru: 'Иванов день', hint: 'Līgo svētki', cultural: true },
  { lv: 'Līgo', ru: 'Лиго', hint: 'Jūnija svētki', cultural: true },
  { lv: 'pīrāgs', ru: 'пирог (с начинкой)', hint: 'Latviešu ēdiens', cultural: true },
  { lv: 'dziesma', ru: 'песня', hint: 'Dziesmu svētki', cultural: true },
  { lv: 'deja', ru: 'танец', hint: 'Apļa deja', cultural: true },
  { lv: 'Baltija', ru: 'Балтика', hint: 'Jūra', cultural: true },
  { lv: 'jūra', ru: 'море', cultural: true },
  { lv: 'mežs', ru: 'лес', cultural: true },
  { lv: 'saule', ru: 'солнце', cultural: true },
  { lv: 'vējš', ru: 'ветер', cultural: true },
  { lv: 'uguns', ru: 'огонь', hint: 'Līgo ugunskurs', cultural: true },
  { lv: 'vakars', ru: 'вечер', cultural: true },
  { lv: 'svētki', ru: 'праздник', cultural: true },
  { lv: 'maize', ru: 'хлеб', cultural: true },
  { lv: 'piens', ru: 'молоко', cultural: true },
  { lv: 'sveiki', ru: 'привет', cultural: true },
  { lv: 'paldies', ru: 'спасибо', cultural: true },
]

export const gameDefinitions = [
  {
    id: 'laiva' as const,
    title: 'Daugavas laiva',
    subtitle: 'Плывите по Daugava',
    description: 'Вводите латышские слова на скорость — лодка плывёт к Риге. Чем быстрее печатаете, тем дальше поплывёте!',
    icon: '⛵',
    theme: 'Daugava',
    color: 'text-info',
    skills: ['скорость печати', 'лексика'],
  },
  {
    id: 'ligo' as const,
    title: 'Līgo uguns',
    subtitle: 'Костёр на Līgo',
    description: 'Печатайте латышские буквы вовремя — огонь на празднике Līgo разгорается ярче. Особые буквы: ā, ē, ī, ū, č, š, ž!',
    icon: '🔥',
    theme: 'Jāņi',
    color: 'text-gold',
    skills: ['алфавит', 'реакция'],
  },
  {
    id: 'match' as const,
    title: 'Vārdu pāris',
    subtitle: 'Найди пару',
    description: 'Открывайте карточки и находите пары: латышское слово ↔ русский перевод. Тренирует память и словарный запас.',
    icon: '🃏',
    theme: 'Tradīcijas',
    color: 'text-accent',
    skills: ['память', 'перевод'],
  },
  {
    id: 'scramble' as const,
    title: 'Sakārto vārdu',
    subtitle: 'Собери слово',
    description: 'По переводу на русский соберите латышское слово из перемешанных букв. Кликайте по буквам или печатайте.',
    icon: '🧩',
    theme: 'Valoda',
    color: 'text-success',
    skills: ['орфография', 'лексика'],
  },
]

/** Буквы латышского алфавита для игры Līgo */
export const latvianLetters = [
  'a', 'ā', 'b', 'c', 'č', 'd', 'e', 'ē', 'f', 'g', 'ģ', 'h', 'i', 'ī', 'j', 'k', 'ķ', 'l', 'ļ', 'm',
  'n', 'ņ', 'o', 'p', 'r', 's', 'š', 't', 'u', 'ū', 'v', 'z', 'ž',
]

export function getAllGameWords(): GameWord[] {
  const fromVocab: GameWord[] = vocabulary.map((v) => ({
    lv: v.lv,
    ru: v.ru,
    hint: v.example,
  }))
  const seen = new Set<string>()
  const result: GameWord[] = []
  for (const w of [...culturalWords, ...fromVocab]) {
    const key = w.lv.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      result.push(w)
    }
  }
  return result
}

export function pickRandomWords(count: number, preferShort = false): GameWord[] {
  let pool = getAllGameWords()
  if (preferShort) {
    pool = pool.filter((w) => w.lv.length <= 8)
  }
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export function vocabToGameWord(v: VocabWord): GameWord {
  return { lv: v.lv, ru: v.ru, hint: v.example }
}
