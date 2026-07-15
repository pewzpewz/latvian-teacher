/** Text-only pronunciation scoring (mirrors client phonemeFeedback). */

export type PhonemeStatus = 'match' | 'diacritic' | 'wrong' | 'missing'

export type PhonemeChar = {
  char: string
  status: PhonemeStatus
}

export type TextPronunciationAnalysis = {
  similarity: number
  accepted: boolean
  chars: PhonemeChar[]
  tips: string[]
  spokenDisplay: string
}

const PRONUNCIATION_THRESHOLD = 0.9

const DIACRITIC_FOLD: Record<string, string> = {
  ā: 'a',
  ē: 'e',
  ī: 'i',
  ū: 'u',
  ō: 'o',
  č: 'c',
  š: 's',
  ž: 'z',
  ģ: 'g',
  ķ: 'k',
  ļ: 'l',
  ņ: 'n',
}

const DIACRITIC_PAIRS: [string, string][] = [
  ['ā', 'a'],
  ['ē', 'e'],
  ['ī', 'i'],
  ['ū', 'u'],
  ['ō', 'o'],
  ['č', 'c'],
  ['š', 's'],
  ['ž', 'z'],
  ['ģ', 'g'],
  ['ķ', 'k'],
  ['ļ', 'l'],
  ['ņ', 'n'],
]

function foldDiacritics(text: string): string {
  return text.replace(/[āēīūōčšžģķļņ]/g, (ch) => DIACRITIC_FOLD[ch] ?? ch)
}

function normalizeForSpeech(text: string): string {
  return foldDiacritics(
    text
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:«»"']/g, '')
      .replace(/\s+/g, ' '),
  )
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  const row = Array.from({ length: b.length + 1 }, (_, i) => i)

  for (let i = 1; i <= a.length; i++) {
    let prev = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      const next = Math.min(row[j] + 1, prev + 1, row[j - 1] + cost)
      row[j - 1] = prev
      prev = next
    }
    row[b.length] = prev
  }

  return row[b.length]
}

function pronunciationSimilarity(spoken: string, expected: string): number {
  const a = normalizeForSpeech(spoken)
  const b = normalizeForSpeech(expected)
  if (!a && !b) return 1
  if (!a || !b) return 0
  const dist = levenshtein(a, b)
  const maxLen = Math.max(a.length, b.length)
  return 1 - dist / maxLen
}

function matchPronunciation(spoken: string, expected: string, threshold = PRONUNCIATION_THRESHOLD): boolean {
  return pronunciationSimilarity(spoken, expected) >= threshold
}

type AlignOp = 'match' | 'sub' | 'ins' | 'del'

function alignNormalized(expectedNorm: string, spokenNorm: string): AlignOp[] {
  const m = expectedNorm.length
  const n = spokenNorm.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  const bt: AlignOp[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill('match' as AlignOp))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = expectedNorm[i - 1] === spokenNorm[j - 1] ? 0 : 1
      const del = dp[i - 1][j] + 1
      const ins = dp[i][j - 1] + 1
      const sub = dp[i - 1][j - 1] + cost
      dp[i][j] = Math.min(del, ins, sub)
      if (dp[i][j] === sub) bt[i][j] = cost === 0 ? 'match' : 'sub'
      else if (dp[i][j] === del) bt[i][j] = 'del'
      else bt[i][j] = 'ins'
    }
  }

  const ops: AlignOp[] = []
  let i = m
  let j = n
  while (i > 0 || j > 0) {
    if (i === 0) {
      ops.push('ins')
      j -= 1
      continue
    }
    if (j === 0) {
      ops.push('del')
      i -= 1
      continue
    }
    const op = bt[i][j]
    ops.push(op)
    if (op === 'match' || op === 'sub') {
      i -= 1
      j -= 1
    } else if (op === 'del') i -= 1
    else j -= 1
  }
  return ops.reverse()
}

function isDiacriticOnlyDiff(expectedChar: string, spokenChar: string): boolean {
  if (!spokenChar) return false
  return foldDiacritics(expectedChar.toLowerCase()) === spokenChar.toLowerCase()
}

function collectDiacriticTips(expected: string, spokenNorm: string): string[] {
  const tips = new Set<string>()
  let si = 0
  for (const ch of expected) {
    if (/\s/.test(ch)) continue
    const folded = foldDiacritics(ch.toLowerCase())
    if (ch !== folded && si < spokenNorm.length) {
      if (spokenNorm[si] === folded && spokenNorm[si] !== ch.toLowerCase()) {
        tips.add(`«${ch}» — не «${folded}»`)
      }
      si += 1
    } else if (/[a-zāēīūōčšžģķļņ]/i.test(ch)) {
      if (si < spokenNorm.length && spokenNorm[si] === ch.toLowerCase()) si += 1
    }
  }
  for (const [di, plain] of DIACRITIC_PAIRS) {
    if (expected.includes(di) && spokenNorm.includes(plain) && !spokenNorm.includes(di)) {
      tips.add(`Проверьте звук «${di}» (не как «${plain}»)`)
    }
  }
  return [...tips].slice(0, 3)
}

export function analyzePronunciationFromText(spoken: string, expected: string): TextPronunciationAnalysis {
  const similarity = pronunciationSimilarity(spoken, expected)
  const accepted = matchPronunciation(spoken, expected)
  const expectedNorm = normalizeForSpeech(expected)
  const spokenNorm = normalizeForSpeech(spoken)
  const ops = alignNormalized(expectedNorm, spokenNorm)

  const chars: PhonemeChar[] = []
  let ei = 0
  let sj = 0

  for (const op of ops) {
    if (op === 'match') {
      const orig = expected[ei] ?? expectedNorm[ei] ?? ''
      const sChar = spokenNorm[sj] ?? ''
      const status: PhonemeStatus =
        orig && isDiacriticOnlyDiff(orig, sChar) ? 'diacritic' : 'match'
      if (orig) chars.push({ char: orig, status })
      ei += 1
      sj += 1
    } else if (op === 'sub') {
      const orig = expected[ei] ?? expectedNorm[ei] ?? ''
      const sChar = spokenNorm[sj] ?? ''
      const status: PhonemeStatus = isDiacriticOnlyDiff(orig, sChar) ? 'diacritic' : 'wrong'
      if (orig) chars.push({ char: orig, status })
      ei += 1
      sj += 1
    } else if (op === 'del') {
      const orig = expected[ei] ?? expectedNorm[ei] ?? ''
      if (orig && !/\s/.test(orig)) chars.push({ char: orig, status: 'missing' })
      else if (orig) chars.push({ char: orig, status: 'match' })
      ei += 1
    } else if (op === 'ins') {
      sj += 1
    }
  }

  const tips = collectDiacriticTips(expected, spokenNorm)
  if (!accepted && similarity < 0.9 && levenshtein(spokenNorm, expectedNorm) <= 3) {
    tips.push('Близко! Обратите внимание на выделенные буквы.')
  }
  if (!accepted && ops.includes('del')) {
    tips.unshift('Пропущена буква или звук — произнесите слово полностью.')
  }

  return {
    similarity,
    accepted,
    chars: chars.length > 0 ? chars : expected.split('').map((char) => ({ char, status: 'wrong' as const })),
    tips: tips.slice(0, 3),
    spokenDisplay: spoken.trim() || '—',
  }
}

/** Pick the stricter of two transcriptions (lower similarity to expected). */
export function pickStricterTranscription(
  expected: string,
  primary: string,
  secondary?: string,
): TextPronunciationAnalysis {
  const a = analyzePronunciationFromText(primary, expected)
  if (!secondary?.trim()) return a
  const b = analyzePronunciationFromText(secondary, expected)
  return a.similarity <= b.similarity ? a : b
}
