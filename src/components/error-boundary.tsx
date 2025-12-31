import { Component, type ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex min-h-screen flex-col items-center justify-center gap-6 p-8"
          style={{ backgroundColor: 'var(--theme-bg, #0c0a09)' }}
        >
          <div className="text-center">
            <h1
              className="mb-2 text-2xl font-bold"
              style={{ color: 'var(--theme-text, #fafaf9)' }}
            >
              Something went wrong
            </h1>
            <p
              className="max-w-md text-sm"
              style={{ color: 'var(--theme-sub, #78716c)' }}
            >
              The app encountered an unexpected error. Your solve data is safe in the cloud.
            </p>
          </div>

          {this.state.error && (
            <pre
              className="max-w-lg overflow-auto rounded-lg p-4 text-xs"
              style={{
                backgroundColor: 'var(--theme-bgSecondary, #1c1917)',
                color: 'var(--theme-error, #ef4444)',
              }}
            >
              {this.state.error.message}
            </pre>
          )}

          <button
            onClick={this.handleReload}
            className="flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-all hover:opacity-90"
            style={{
              backgroundColor: 'var(--theme-accent, #f97316)',
              color: 'var(--theme-bg, #0c0a09)',
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Reload App
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
