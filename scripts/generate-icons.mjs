/**
 * Generates PNG PWA icons from public/favicon.svg
 * Run: node scripts/generate-icons.mjs
 */
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const svg = readFileSync(join(root, 'public', 'favicon.svg'))

const sizes = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
]

for (const { name, size } of sizes) {
  const out = join(root, 'public', name)
  await sharp(svg).resize(size, size).png().toFile(out)
  console.log(`✓ public/${name} (${size}×${size})`)
}
