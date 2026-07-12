import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { logClientError } from '../lib/errorLog'
import { translate } from '../i18n'
import { readUiLanguage } from '../i18n/lang'

type Props = {
  children: ReactNode
}

type State = {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logClientError(error, { componentStack: info.componentStack })
  }

  private reload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.error) {
      const lang = readUiLanguage()
      return (
        <div className="flex min-h-dvh items-center justify-center bg-bg p-6">
          <div className="max-w-md rounded-2xl border border-border bg-surface p-8 text-center">
            <AlertTriangle className="mx-auto mb-4 text-gold" size={40} />
            <h1 className="text-xl font-semibold">{translate(lang, 'error.title')}</h1>
            <p className="mt-2 text-sm text-muted">{translate(lang, 'error.description')}</p>
            {import.meta.env.DEV && (
              <pre className="mt-4 max-h-32 overflow-auto rounded-lg bg-surface-2 p-3 text-left text-xs text-red-400">
                {this.state.error.message}
              </pre>
            )}
            <button
              type="button"
              onClick={this.reload}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white"
            >
              <RefreshCw size={16} />
              {translate(lang, 'error.reload')}
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
