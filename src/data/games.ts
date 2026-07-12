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
    titleKey: 'games.defLaivaTitle',
    subtitleKey: 'games.defLaivaSubtitle',
    descriptionKey: 'games.defLaivaDescription',
    icon: '⛵',
    themeKey: 'games.defLaivaTheme',
    color: 'text-info',
    skillKeys: ['games.defLaivaSkill1', 'games.defLaivaSkill2'],
  },
  {
    id: 'ligo' as const,
    titleKey: 'games.defLigoTitle',
    subtitleKey: 'games.defLigoSubtitle',
    descriptionKey: 'games.defLigoDescription',
    icon: '🔥',
    themeKey: 'games.defLigoTheme',
    color: 'text-gold',
    skillKeys: ['games.defLigoSkill1', 'games.defLigoSkill2'],
  },
  {
    id: 'match' as const,
    titleKey: 'games.defMatchTitle',
    subtitleKey: 'games.defMatchSubtitle',
    descriptionKey: 'games.defMatchDescription',
    icon: '🃏',
    themeKey: 'games.defMatchTheme',
    color: 'text-accent',
    skillKeys: ['games.defMatchSkill1', 'games.defMatchSkill2'],
  },
  {
    id: 'scramble' as const,
    titleKey: 'games.defScrambleTitle',
    subtitleKey: 'games.defScrambleSubtitle',
    descriptionKey: 'games.defScrambleDescription',
    icon: '🧩',
    themeKey: 'games.defScrambleTheme',
    color: 'text-success',
    skillKeys: ['games.defScrambleSkill1', 'games.defScrambleSkill2'],
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
