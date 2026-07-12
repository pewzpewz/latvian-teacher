module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:4173/'],
      startServerCommand: 'npm run preview -- --port 4173 --host',
      startServerReadyPattern: 'Local:',
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        'categories:pwa': ['error', { minScore: 0.9 }],
        'installable-manifest': 'error',
        'service-worker': 'error',
        'maskable-icon': 'off',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
