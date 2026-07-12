/**
 * Content pipeline: JSON → generated TypeScript
 * Run: npm run build:content
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const contentDir = join(root, 'content')
const lessonsDir = join(contentDir, 'lessons')

mkdirSync(lessonsDir, { recursive: true })

function writeGeneratedVocabulary(words) {
  const body = words
    .map((w) => {
      const parts = [
        `  { id: '${w.id}', lv: '${w.lv.replace(/'/g, "\\'")}', ru: '${w.ru.replace(/'/g, "\\'")}', category: '${w.category}', level: '${w.level}'`,
      ]
      if (w.example) parts[0] += `, example: '${w.example.replace(/'/g, "\\'")}'`
      if (w.exampleRu) parts[0] += `, exampleRu: '${w.exampleRu.replace(/'/g, "\\'")}'`
      parts[0] += ' },'
      return parts[0]
    })
    .join('\n')

  const ts = `/** AUTO-GENERATED — edit content/vocabulary.json, then npm run build:content */
export type VocabWord = {
  id: string
  lv: string
  ru: string
  pronunciation?: string
  category: string
  example?: string
  exampleRu?: string
  level: 'A0' | 'A1' | 'A2' | 'B1'
}

export const vocabulary: VocabWord[] = [
${body}
]

export const categories = [...new Set(vocabulary.map((v) => v.category))]

export function getWordById(id: string): VocabWord | undefined {
  return vocabulary.find((v) => v.id === id)
}
`
  writeFileSync(join(root, 'src/data/vocabulary.ts'), ts)
}

function writeGeneratedLessonsExtra(lessons) {
  const ts = `/** AUTO-GENERATED — edit content/lessons/*.json, then npm run build:content */
import type { Lesson } from './lessons'

export const lessonsExtra: Lesson[] = ${JSON.stringify(lessons, null, 2)} as Lesson[]
`
  writeFileSync(join(root, 'src/data/lessonsExtra.ts'), ts)
}

// --- vocabulary ---
const vocabPath = join(contentDir, 'vocabulary.json')
let words
try {
  words = JSON.parse(readFileSync(vocabPath, 'utf8'))
} catch {
  console.error('content/vocabulary.json missing or invalid — run: node scripts/gen-vocab-json.mjs')
  process.exit(1)
}

if (!Array.isArray(words)) {
  console.error('content/vocabulary.json must be an array')
  process.exit(1)
}

words = words.map((w) => ({ ...w, lv: w.lv.trim() }))
writeGeneratedVocabulary(words)
console.log(`vocabulary.ts ← ${words.length} words`)

// --- extra lessons ---
const lessonFiles = readdirSync(lessonsDir)
  .filter((f) => f.endsWith('.json'))
  .sort()

const extraLessons = lessonFiles.map((f) => {
  const raw = readFileSync(join(lessonsDir, f), 'utf8')
  return JSON.parse(raw)
})

writeGeneratedLessonsExtra(extraLessons)
console.log(`lessonsExtra.ts ← ${extraLessons.length} lessons from content/lessons/`)

if (words.length < 150) {
  console.warn(`WARN: vocabulary has ${words.length} words (target ≥150)`)
}
if (extraLessons.length < 7) {
  console.warn(`WARN: only ${extraLessons.length} extra lessons (target ≥7)`)
}
