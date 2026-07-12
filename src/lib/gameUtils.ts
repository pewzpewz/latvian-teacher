/** Сравнение ввода с латышским словом (без учёта регистра) */
export function matchesLatvian(input: string, target: string): boolean {
  return normalizeLatvian(input) === normalizeLatvian(target)
}

export function normalizeLatvian(s: string): string {
  return s.trim().toLowerCase()
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function scrambleWord(word: string): string[] {
  const letters = word.split('')
  let scrambled = shuffle(letters)
  let attempts = 0
  while (scrambled.join('') === word && attempts < 10) {
    scrambled = shuffle(letters)
    attempts++
  }
  return scrambled
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
