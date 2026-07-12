import { Component, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { translate } from '../i18n'
import { readUiLanguage } from '../i18n/lang'

type Props = {
  ready: boolean
  children: ReactNode
}

type State = {
  timedOut: boolean
}

/** Waits for IndexedDB hydration before rendering the app shell. */
export class AppBootstrap extends Component<Props, State> {
  private timer: ReturnType<typeof setTimeout> | null = null

  state: State = { timedOut: false }

  componentDidMount() {
    this.timer = setTimeout(() => this.setState({ timedOut: true }), 8000)
  }

  componentDidUpdate(prev: Props) {
    if (!prev.ready && this.props.ready && this.timer) {
      clearTimeout(this.timer)
    }
  }

  componentWillUnmount() {
    if (this.timer) clearTimeout(this.timer)
  }

  render() {
    if (!this.props.ready && !this.state.timedOut) {
      const lang = readUiLanguage()
      return (
        <div
          className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg text-muted"
          data-testid="app-loading"
        >
          <Loader2 className="animate-spin text-accent" size={32} />
          <p className="text-sm">{translate(lang, 'bootstrap.loading')}</p>
        </div>
      )
    }

    return (
      <div data-testid="app-ready">
        {this.props.children}
      </div>
    )
  }
}
