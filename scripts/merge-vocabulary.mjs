/** Объединяет базовый словарь + extra batches → content/vocabulary.json (500+) */
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { EXTRA_BATCHES } from './vocab-extra.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const vocabPath = join(root, 'content/vocabulary.json')

const existing = JSON.parse(readFileSync(vocabPath, 'utf8'))
const seenLv = new Set(existing.map((w) => w.lv.toLowerCase()))
const seenId = new Set(existing.map((w) => w.id))

let nextNum = 300
function nextId() {
  while (seenId.has(`v${nextNum}`)) nextNum++
  const id = `v${nextNum}`
  nextNum++
  seenId.add(id)
  return id
}

const added = []
for (const item of EXTRA_BATCHES) {
  const lv = item.lv.trim()
  const key = lv.toLowerCase()
  if (seenLv.has(key)) continue
  seenLv.add(key)
  added.push({
    id: nextId(),
    lv,
    ru: item.ru,
    category: item.category,
    level: item.level,
  })
}

const merged = [...existing, ...added]
writeFileSync(vocabPath, JSON.stringify(merged, null, 2))
console.log(`vocabulary.json: ${existing.length} + ${added.length} = ${merged.length} words`)

if (merged.length < 500) {
  console.warn(`WARN: only ${merged.length} words, need 500+`)
  process.exit(1)
}
