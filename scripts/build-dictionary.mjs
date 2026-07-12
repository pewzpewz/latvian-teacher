/**
 * Сборка офлайн-словаря lv→ru из Wikidata (open-dsl-dict/wikidict-dsl-ru)
 * Запуск: node scripts/build-dictionary.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CACHE = join(__dirname, 'cache')
const OUT = join(__dirname, '..', 'public', 'dict', 'lv-ru.json')

/** Формат DSL: строка lv, строка ru, пустая строка */
function parseDsl(text) {
  const map = {}
  const lines = text.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i].trim()
    if (!line || line.startsWith('#')) {
      i++
      continue
    }
    if (line.startsWith('\t') || line.startsWith('[')) {
      i++
      continue
    }

    const lv = line
    i++
    while (i < lines.length && (!lines[i].trim() || lines[i].trim().startsWith('['))) {
      i++
    }
    if (i >= lines.length) break

    const ruLine = lines[i].trim()
    if (ruLine && !ruLine.startsWith('#') && !ruLine.startsWith('[')) {
      const key = lv.toLowerCase()
      const ru = ruLine.split(/[,;|]/)[0].trim()
      if (key.length > 0 && ru.length > 0 && !map[key]) {
        map[key] = ru
      }
      i++
    }
  }

  return map
}

function main() {
  const dslPath = join(CACHE, 'lv-ru_wikidict.dsl')
  if (!existsSync(dslPath)) {
    console.log(`Файл не найден: ${dslPath}`)
    console.log('Скачайте: https://github.com/open-dsl-dict/wikidict-dsl-ru/raw/master/data/lv-ru_wikidict.dsl')
    process.exit(1)
  }

  const raw = readFileSync(dslPath, 'utf8')
  const dict = parseDsl(raw)
  const count = Object.keys(dict).length

  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, JSON.stringify(dict))

  const sizeMb = (Buffer.byteLength(JSON.stringify(dict)) / 1024 / 1024).toFixed(2)
  console.log(`OK: ${count} entries, ${sizeMb} MB -> ${OUT}`)
}

main()
