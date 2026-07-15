export type MinimalPair = {
  phonemeId: string
  lv: string
  ru: string
  hint?: string
}

/** Minimal pairs for targeted pronunciation drills */
export const minimalPairs: MinimalPair[] = [
  { phonemeId: 'phoneme-sh', lv: 'sāls', ru: 'соль (sāls, не š)', hint: 'š/s' },
  { phonemeId: 'phoneme-sh', lv: 'šalle', ru: 'шаль', hint: 'š' },
  { phonemeId: 'phoneme-sh', lv: 'saule', ru: 'солнце', hint: 's' },
  { phonemeId: 'phoneme-zh', lv: 'zāle', ru: 'лужайка', hint: 'z' },
  { phonemeId: 'phoneme-zh', lv: 'žāve', ru: 'засуха', hint: 'ž' },
  { phonemeId: 'phoneme-zh', lv: 'zeme', ru: 'земля', hint: 'z' },
  { phonemeId: 'phoneme-long-a', lv: 'māte', ru: 'мать', hint: 'ā' },
  { phonemeId: 'phoneme-long-a', lv: 'mate', ru: 'товарищ (mate)', hint: 'a' },
  { phonemeId: 'phoneme-long-e', lv: 'ēst', ru: 'есть', hint: 'ē' },
  { phonemeId: 'phoneme-long-i', lv: 'īss', ru: 'короткий', hint: 'ī' },
  { phonemeId: 'phoneme-ch', lv: 'četri', ru: 'четыре', hint: 'č' },
  { phonemeId: 'phoneme-rolled-r', lv: 'rīga', ru: 'Рига', hint: 'r' },
]
