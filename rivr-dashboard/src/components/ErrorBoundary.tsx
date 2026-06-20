import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
    if (import.meta.env.PROD) {
      console.error('[ErrorBoundary]', error, errorInfo)
    } else {
      console.error('[ErrorBoundary]', error, errorInfo)
    }
  }

  private handleReload = (): void => {
    window.location.reload()
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'var(--bg)',
            color: 'var(--text)',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              padding: '2.5rem',
              background: 'var(--glass-bg)',
              backdropFilter: 'var(--glass-blur-strong)',
              WebkitBackdropFilter: 'var(--glass-blur-strong)',
              border: '1px solid var(--glass-border)',
              borderRadius: '20px',
              boxShadow: 'var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,0.3)',
              textAlign: 'center',
            }}
          >
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Something went wrong
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              The page hit an unexpected error. You can try reloading, or reset this view.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre
                style={{
                  padding: '1rem',
                  background: 'rgba(30,50,90,0.04)',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  textAlign: 'left',
                  overflow: 'auto',
                  maxHeight: '180px',
                  marginBottom: '1.5rem',
                  color: 'var(--text-muted)',
                }}
              >
                {this.state.error.message}
              </pre>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '9999px',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  border: '1px solid var(--border-strong)',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                  boxShadow: '0 2px 8px rgba(59,93,191,0.15)',
                }}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
