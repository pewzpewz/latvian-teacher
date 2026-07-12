/**
 * Validate content/*.json — run: npm run validate:content
 * Used in CI and prebuild.
 */
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const contentDir = join(root, 'content')
const errors = []

function fail(msg) {
  errors.push(msg)
}

function isStr(v, name) {
  return typeof v === 'string' && v.trim().length > 0
}

function isLevel(v) {
  return v === 'A0' || v === 'A1' || v === 'A2' || v === 'B1' || v === 'B2'
}

function validateVocabulary() {
  const path = join(contentDir, 'vocabulary.json')
  let data
  try {
    data = JSON.parse(readFileSync(path, 'utf8'))
  } catch (e) {
    fail(`vocabulary.json: ${e.message}`)
    return
  }
  if (!Array.isArray(data)) {
    fail('vocabulary.json must be an array')
    return
  }
  const ids = new Set()
  for (const [i, w] of data.entries()) {
    const p = `vocabulary[${i}]`
    if (!isStr(w.id, 'id')) fail(`${p}.id invalid`)
    if (ids.has(w.id)) fail(`${p}.id duplicate: ${w.id}`)
    ids.add(w.id)
    if (!isStr(w.lv, 'lv')) fail(`${p}.lv invalid`)
    if (!isStr(w.ru, 'ru')) fail(`${p}.ru invalid`)
    if (!isStr(w.category, 'category')) fail(`${p}.category invalid`)
    if (!isLevel(w.level)) fail(`${p}.level invalid`)
    if (w.freqRank != null && (typeof w.freqRank !== 'number' || w.freqRank < 1)) {
      fail(`${p}.freqRank must be positive number`)
    }
  }
}

function validateDeclensions() {
  const path = join(contentDir, 'declensions.json')
  let data
  try {
    data = JSON.parse(readFileSync(path, 'utf8'))
  } catch (e) {
    fail(`declensions.json: ${e.message}`)
    return
  }
  if (!Array.isArray(data)) {
    fail('declensions.json must be an array')
    return
  }
  for (const [i, d] of data.entries()) {
    const p = `declensions[${i}]`
    if (!isStr(d.id, 'id')) fail(`${p}.id invalid`)
    if (!isStr(d.form, 'form')) fail(`${p}.form invalid`)
    if (!['nom', 'gen', 'dat', 'acc', 'ins', 'loc'].includes(d.case)) fail(`${p}.case invalid`)
  }
}

function validateConjugations() {
  const path = join(contentDir, 'conjugations.json')
  let data
  try {
    data = JSON.parse(readFileSync(path, 'utf8'))
  } catch (e) {
    fail(`conjugations.json: ${e.message}`)
    return
  }
  if (!Array.isArray(data)) {
    fail('conjugations.json must be an array')
    return
  }
  for (const [i, d] of data.entries()) {
    const p = `conjugations[${i}]`
    if (!isStr(d.id, 'id')) fail(`${p}.id invalid`)
    if (!isStr(d.form, 'form')) fail(`${p}.form invalid`)
    if (!['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'].includes(d.person)) fail(`${p}.person invalid`)
  }
}

function validateNaturalization() {
  const path = join(contentDir, 'naturalization.json')
  let data
  try {
    data = JSON.parse(readFileSync(path, 'utf8'))
  } catch (e) {
    fail(`naturalization.json: ${e.message}`)
    return
  }
  if (!Array.isArray(data?.sections)) {
    fail('naturalization.json must have sections array')
    return
  }
  for (const [i, s] of data.sections.entries()) {
    if (!isStr(s.id, 'id')) fail(`naturalization.sections[${i}].id invalid`)
    if (!Array.isArray(s.questions) || s.questions.length === 0) {
      fail(`naturalization.sections[${i}] needs questions`)
    }
  }
}

function validateDictations() {
  const path = join(contentDir, 'dictations.json')
  let data
  try {
    data = JSON.parse(readFileSync(path, 'utf8'))
  } catch (e) {
    fail(`dictations.json: ${e.message}`)
    return
  }
  if (!Array.isArray(data)) {
    fail('dictations.json must be an array')
    return
  }
  for (const [i, d] of data.entries()) {
    const p = `dictations[${i}]`
    if (!isStr(d.id, 'id')) fail(`${p}.id invalid`)
    if (!isStr(d.text, 'text')) fail(`${p}.text invalid`)
    if (!isLevel(d.level)) fail(`${p}.level invalid`)
  }
}

function validateLessons() {
  const lessonsDir = join(contentDir, 'lessons')
  const files = readdirSync(lessonsDir).filter((f) => f.endsWith('.json'))
  for (const f of files) {
    let data
    try {
      data = JSON.parse(readFileSync(join(lessonsDir, f), 'utf8'))
    } catch (e) {
      fail(`lessons/${f}: ${e.message}`)
      continue
    }
    if (!isStr(data.id, 'id')) fail(`lessons/${f}: id invalid`)
    if (data.id !== f.replace('.json', '')) fail(`lessons/${f}: id mismatch filename`)
    if (!Array.isArray(data.exercises)) fail(`lessons/${f}: exercises required`)
  }
}

validateVocabulary()
validateDeclensions()
validateConjugations()
validateNaturalization()
validateDictations()
validateLessons()

if (errors.length > 0) {
  console.error('Content validation failed:')
  for (const e of errors) console.error('  ✗', e)
  process.exit(1)
}

console.log('✓ content/*.json validation passed')
