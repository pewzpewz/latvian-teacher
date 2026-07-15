/** Убирает русские переводы в скобках из текста чата */
export function stripBracketTranslations(text: string): string {
  return text
    .split('\n')
    .map((line) =>
      line
        .replace(/\(\s*\*{0,2}[^)]*[а-яА-ЯёЁ][^)]*\*{0,2}\s*\)/g, '')
        .replace(/\s{2,}/g, ' ')
        .trimEnd(),
    )
    .join('\n')
}

export function countCyrillic(text: string): number {
  return (text.match(/[а-яА-ЯёЁ]/g) || []).length
}

export function countLatin(text: string): number {
  return (text.match(/[a-zA-ZāčēģīķļņšūžĀČĒĢĪĶĻŅŠŪŽ]/g) || []).length
}

const LATVIAN_DIACRITIC = /[āčēģīķļņšūžĀČĒĢĪĶĻŅŠŪŽ]/

export function isLatvianWord(word: string, lineContext?: string): boolean {
  if (/[а-яА-ЯёЁ]/.test(word)) return false
  if (!/^[\p{L}][\p{L}'’-]*$/u.test(word)) return false
  if (LATVIAN_DIACRITIC.test(word)) return true
  const common = new Set([
    'es', 'tu', 'viņš', 'viņa', 'mēs', 'jūs', 'viņi', 'mans', 'tavs', 'man', 'tev',
    'un', 'ir', 'esmu', 'esi', 'esam', 'esat', 'nav', 'bet', 'ka', 'kas', 'kur',
    'labdien', 'labvakar', 'sveiki', 'paldies', 'ja', 'ne', 'jā', 'nē', 'mani', 'sauc',
    'gribu', 'uzzinat', 'uzzināt', 'valodu', 'valodas', 'latviesu', 'latviešu',
  ])
  if (common.has(word.toLowerCase())) return true
  if (lineContext && LATVIAN_DIACRITIC.test(lineContext) && /^[a-zA-Z]+$/.test(word)) {
    return word.length > 1
  }
  return false
}

export function isHoverableLine(line: string): boolean {
  const cyr = countCyrillic(line)
  const lat = countLatin(line)
  if (lat === 0) return false
  if (cyr > lat * 2) return false
  return LATVIAN_DIACRITIC.test(line) || lat >= cyr
}

export function cleanMarkdown(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').replace(/`/g, '')
}

/** Готовит текст для естественной озвучки (только латышские фрагменты) */
export function prepareSpeechText(content: string): string {
  let text = stripBracketTranslations(content)
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/#{1,6}\s+/g, '')

  const parts: string[] = []

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim()
    if (!line) continue

    const cyr = countCyrillic(line)
    const lat = countLatin(line)
    if (cyr > lat && lat < 5) continue

    let segment = line.replace(/^[\-*•]\s*/, '').replace(/^\d+\.\s*/, '')
    segment = cleanMarkdown(segment)

    // "Es – esmu" / "Tu – esi"
    const dashParts = segment.split(/\s*[–—-]\s*/)
    if (dashParts.length >= 2) {
      const left = dashParts[0].replace(/[«»"']/g, '').trim()
      const right = dashParts.slice(1).join(' ').replace(/\([^)]*\)/g, '').trim()
      const rightCyr = countCyrillic(right)
      const rightLat = countLatin(right)

      if (countLatin(left) > 0 && rightCyr > rightLat) {
        segment = left
      } else if (rightLat > rightCyr) {
        segment = right
      } else if (countLatin(left) > 0) {
        segment = `${left} ${right.split(/\s+/).filter((w) => isLatvianWord(w) || LATVIAN_DIACRITIC.test(w)).join(' ')}`.trim()
      }
    }

    segment = segment.replace(/\([^)]*\)/g, '').replace(/[«»]/g, '').trim()
    segment = segment.replace(/🇱🇻|✅|🌟|🎯/g, '').trim()

    if (segment && countLatin(segment) > 0 && countCyrillic(segment) < countLatin(segment)) {
      parts.push(segment)
    }
  }

  const joined = parts
    .join('. ')
    .replace(/\.\s*\./g, '.')
    .replace(/\s+/g, ' ')
    .trim()

  return joined || extractLatvianFallback(content)
}

function extractLatvianFallback(content: string): string {
  const words = content.match(/[\p{L}āčēģīķļņšūžĀČĒĢĪĶĻŅŠŪŽ]+/gu) || []
  const latvian = words.filter((w) => isLatvianWord(w) || LATVIAN_DIACRITIC.test(w))
  return latvian.slice(0, 80).join(' ')
}

/** Разбивает длинный текст на части для TTS (лимит ~500 символов) */
export function splitForTts(text: string, maxLen = 450): string[] {
  if (text.length <= maxLen) return text.trim() ? [text.trim()] : []

  const chunks: string[] = []
  const sentences = text.split(/(?<=[.!?…])\s+/)
  let current = ''

  for (const sentence of sentences) {
    if (sentence.length > maxLen) {
      if (current.trim()) {
        chunks.push(current.trim())
        current = ''
      }
      for (let i = 0; i < sentence.length; i += maxLen) {
        chunks.push(sentence.slice(i, i + maxLen).trim())
      }
      continue
    }
    if ((current + ' ' + sentence).trim().length > maxLen) {
      if (current.trim()) chunks.push(current.trim())
      current = sentence
    } else {
      current = current ? `${current} ${sentence}` : sentence
    }
  }
  if (current.trim()) chunks.push(current.trim())
  return chunks
}

export function needsMessageTranslation(text: string): boolean {
  const stripped = stripBracketTranslations(text)
  const cyr = countCyrillic(stripped)
  const lat = countLatin(stripped)
  return lat >= 3 && lat >= cyr
}

export const WORD_TOKEN_RE = /([\p{L}][\p{L}'’-]*|[^\p{L}\s]+|\s+)/gu
