import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AppBootstrap } from './components/AppBootstrap'
import { hydrateStore, useStore } from './store/useStore'
import { initNativeShell, isNativeApp } from './lib/native'

if (!isNativeApp()) {
  registerSW({ immediate: true })
} else {
  void initNativeShell()
}

function AppShell() {
  const hydrated = useStore((s) => s.hydrated)

  return (
    <ErrorBoundary>
      <AppBootstrap ready={hydrated}>
        <App />
      </AppBootstrap>
    </ErrorBoundary>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppShell />
  </StrictMode>,
)

void hydrateStore()
