/**
 * Production build for Capacitor (relative asset paths).
 * Run: npm run build:cap
 */
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const result = spawnSync('npm', ['run', 'build'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, VITE_CAPACITOR: '1' },
})

process.exit(result.status ?? 1)
