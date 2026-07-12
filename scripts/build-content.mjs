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
      if (w.freqRank != null) parts[0] += `, freqRank: ${w.freqRank}`
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
  freqRank?: number
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

words = words.map((w, i) => ({
  ...w,
  lv: w.lv.trim(),
  freqRank: w.freqRank ?? (i < 553 ? i + 1 : undefined),
}))
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

// --- declension drills ---
function writeGeneratedDeclensions(items) {
  const ts = `/** AUTO-GENERATED — edit content/declensions.json, then npm run build:content */
export type LatvianCaseId = 'nom' | 'gen' | 'dat' | 'acc' | 'ins' | 'loc'

export type DeclensionDrill = {
  id: string
  lemma: string
  lemmaRu: string
  declension: 1 | 2 | 3 | 4 | 5 | 6
  gender: 'm' | 'f'
  case: LatvianCaseId
  form: string
  promptRu: string
  hint?: string
  sentence?: { lv: string; ru: string }
}

export const LATVIAN_CASES: { id: LatvianCaseId; lv: string; ru: string; question: string }[] = [
  { id: 'nom', lv: 'Nominatīvs', ru: 'Именительный', question: 'kas?' },
  { id: 'gen', lv: 'Ģenitīvs', ru: 'Родительный', question: 'kā?' },
  { id: 'dat', lv: 'Datīvs', ru: 'Дательный', question: 'kam?' },
  { id: 'acc', lv: 'Akuzatīvs', ru: 'Винительный', question: 'ko?' },
  { id: 'ins', lv: 'Instruments', ru: 'Творительный', question: 'ar ko?' },
  { id: 'loc', lv: 'Lokatīvs', ru: 'Местный', question: 'kur?' },
]

export const declensionDrills: DeclensionDrill[] = ${JSON.stringify(items, null, 2)} as DeclensionDrill[]

export function getDrillById(id: string): DeclensionDrill | undefined {
  return declensionDrills.find((d) => d.id === id)
}
`
  writeFileSync(join(root, 'src/data/declensions.ts'), ts)
}

const declPath = join(contentDir, 'declensions.json')
let declensions
try {
  declensions = JSON.parse(readFileSync(declPath, 'utf8'))
} catch {
  console.error('content/declensions.json missing or invalid')
  process.exit(1)
}

if (!Array.isArray(declensions)) {
  console.error('content/declensions.json must be an array')
  process.exit(1)
}

writeGeneratedDeclensions(declensions)
console.log(`declensions.ts ← ${declensions.length} drills`)

// --- naturalization quiz ---
function writeGeneratedNaturalization(data) {
  const ts = `/** AUTO-GENERATED — edit content/naturalization.json, then npm run build:content */
export type NaturalizationQuestion = {
  id: string
  type: 'choose' | 'fill' | 'translate'
  question: string
  passage?: string
  answer: string
  options?: string[]
  hint?: string
  explanation?: string
}

export type NaturalizationSectionType = 'history' | 'constitution' | 'symbols' | 'society'

export type NaturalizationSection = {
  id: string
  title: string
  type: NaturalizationSectionType
  description: string
  timeMinutes: number
  questions: NaturalizationQuestion[]
}

export type OfficialLink = {
  title: string
  url: string
  description: string
}

export const NATURALIZATION_OFFICIAL_LINKS: OfficialLink[] = ${JSON.stringify(data.officialLinks, null, 2)}

export const naturalizationSections: NaturalizationSection[] = ${JSON.stringify(data.sections, null, 2)} as NaturalizationSection[]

export function getNaturalizationSection(id: string): NaturalizationSection | undefined {
  return naturalizationSections.find((s) => s.id === id)
}

export const NATURALIZATION_QUESTION_COUNT = naturalizationSections.reduce(
  (n, s) => n + s.questions.length,
  0,
)
`
  writeFileSync(join(root, 'src/data/naturalization.ts'), ts)
}

const natPath = join(contentDir, 'naturalization.json')
let naturalization
try {
  naturalization = JSON.parse(readFileSync(natPath, 'utf8'))
} catch {
  console.error('content/naturalization.json missing or invalid')
  process.exit(1)
}

if (!naturalization?.sections || !Array.isArray(naturalization.sections)) {
  console.error('content/naturalization.json must have a sections array')
  process.exit(1)
}

writeGeneratedNaturalization(naturalization)
const natQ = naturalization.sections.reduce((n, s) => n + s.questions.length, 0)
console.log(`naturalization.ts ← ${naturalization.sections.length} sections, ${natQ} questions`)

// --- verb conjugation drills ---
function writeGeneratedConjugations(items) {
  const ts = `/** AUTO-GENERATED — edit content/conjugations.json, then npm run build:content */
export type ConjugationGroup = 'irregular' | 'conj1' | 'conj2' | 'reflexive'
export type ConjugationPerson = '1sg' | '2sg' | '3sg' | '1pl' | '2pl' | '3pl'

export type ConjugationDrill = {
  id: string
  lemma: string
  lemmaRu: string
  group: ConjugationGroup
  tense: 'present'
  person: ConjugationPerson
  pronoun: string
  form: string
  promptRu: string
  hint?: string
  sentence?: { lv: string; ru: string }
}

export const CONJUGATION_PERSONS: { id: ConjugationPerson; pronoun: string; ru: string }[] = [
  { id: '1sg', pronoun: 'es', ru: '1 л. ед.' },
  { id: '2sg', pronoun: 'tu', ru: '2 л. ед.' },
  { id: '3sg', pronoun: 'viņš/viņa', ru: '3 л. ед.' },
  { id: '1pl', pronoun: 'mēs', ru: '1 л. мн.' },
  { id: '2pl', pronoun: 'jūs', ru: '2 л. мн.' },
  { id: '3pl', pronoun: 'viņi/viņas', ru: '3 л. мн.' },
]

export const CONJUGATION_GROUPS: { id: ConjugationGroup; label: string }[] = [
  { id: 'irregular', label: 'Неправильные' },
  { id: 'conj1', label: 'I (-āt)' },
  { id: 'conj2', label: 'II (-īt/-ēt)' },
  { id: 'reflexive', label: 'Возвратные (-ties)' },
]

export const conjugationDrills: ConjugationDrill[] = ${JSON.stringify(items, null, 2)} as ConjugationDrill[]

export function getConjugationDrillById(id: string): ConjugationDrill | undefined {
  return conjugationDrills.find((d) => d.id === id)
}
`
  writeFileSync(join(root, 'src/data/conjugations.ts'), ts)
}

const conjPath = join(contentDir, 'conjugations.json')
let conjugations
try {
  conjugations = JSON.parse(readFileSync(conjPath, 'utf8'))
} catch {
  console.error('content/conjugations.json missing — run: node scripts/gen-conjugations-json.mjs')
  process.exit(1)
}

if (!Array.isArray(conjugations)) {
  console.error('content/conjugations.json must be an array')
  process.exit(1)
}

writeGeneratedConjugations(conjugations)
console.log(`conjugations.ts ← ${conjugations.length} drills`)

// --- dictations ---
function writeGeneratedDictations(items) {
  const ts = `/** AUTO-GENERATED — edit content/dictations.json, then npm run build:content */
export type DictationItem = {
  id: string
  title: string
  level: 'A0' | 'A1' | 'A2' | 'B1'
  text: string
  hintRu: string
  slowRate: number
}

export const dictations: DictationItem[] = ${JSON.stringify(items, null, 2)} as DictationItem[]

export function getDictationById(id: string): DictationItem | undefined {
  return dictations.find((d) => d.id === id)
}
`
  writeFileSync(join(root, 'src/data/dictations.ts'), ts)
}

const dictPath = join(contentDir, 'dictations.json')
let dictations
try {
  dictations = JSON.parse(readFileSync(dictPath, 'utf8'))
} catch {
  console.error('content/dictations.json missing or invalid')
  process.exit(1)
}

if (!Array.isArray(dictations)) {
  console.error('content/dictations.json must be an array')
  process.exit(1)
}

writeGeneratedDictations(dictations)
console.log(`dictations.ts ← ${dictations.length} items`)

if (words.length < 150) {
  console.warn(`WARN: vocabulary has ${words.length} words (target ≥150)`)
}
if (extraLessons.length < 7) {
  console.warn(`WARN: only ${extraLessons.length} extra lessons (target ≥7)`)
}
