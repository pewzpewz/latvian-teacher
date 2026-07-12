import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'],
    coverage: {
        provider: 'v8',
        reporter: ['text', 'json-summary', 'lcov'],
        include: ['src/lib/**/*.ts'],
        exclude: ['**/*.test.ts'],
      },
    },
  }),
)
