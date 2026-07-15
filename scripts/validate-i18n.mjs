#!/usr/bin/env node
/**
 * Ensures ru/en/lv locale files expose the same translation key paths.
 * Usage: node scripts/validate-i18n.mjs
 */
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const localesDir = join(root, 'src/i18n/locales')

const LOCALES = ['en', 'ru', 'lv']

function flattenKeys(obj, prefix = '') {
  const keys = []
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...flattenKeys(value, path))
    } else {
      keys.push(path)
    }
  }
  return keys
}

async function loadLocale(id) {
  const mod = await import(pathToFileURL(join(localesDir, `${id}.ts`)).href)
  const dict = mod[id]
  if (!dict || typeof dict !== 'object') {
    throw new Error(`Locale module ${id}.ts must export \`${id}\``)
  }
  return dict
}

function diff(a, b) {
  const setB = new Set(b)
  return a.filter((k) => !setB.has(k)).sort()
}

const keySets = {}
for (const id of LOCALES) {
  const dict = await loadLocale(id)
  keySets[id] = flattenKeys(dict).sort()
}

const base = keySets.en
let failed = false

for (const id of LOCALES) {
  if (id === 'en') continue
  const missing = diff(base, keySets[id])
  const extra = diff(keySets[id], base)
  if (missing.length || extra.length) {
    failed = true
    console.error(`\n✗ Locale "${id}" out of sync with "en":`)
    if (missing.length) {
      console.error(`  Missing (${missing.length}):`)
      for (const k of missing.slice(0, 30)) console.error(`    - ${k}`)
      if (missing.length > 30) console.error(`    … and ${missing.length - 30} more`)
    }
    if (extra.length) {
      console.error(`  Extra (${extra.length}):`)
      for (const k of extra.slice(0, 30)) console.error(`    + ${k}`)
      if (extra.length > 30) console.error(`    … and ${extra.length - 30} more`)
    }
  }
}

if (failed) {
  process.exit(1)
}

console.log(`✓ i18n keys in sync (${base.length} keys × ${LOCALES.length} locales)`)
