'use client'

import React from 'react'
import { Shield, RefreshCw } from 'lucide-react'

declare global {
  interface Window {
    __editorLogError?: (error: {
      context: string
      message: string
      stack?: string
      componentStack?: string | null
    }) => void
  }
}

interface EditorErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  context?: string // e.g. "EditorSidebar", "OverlayCanvas"
}

interface EditorErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class EditorErrorBoundary extends React.Component<
  EditorErrorBoundaryProps,
  EditorErrorBoundaryState
> {
  constructor(props: EditorErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<EditorErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo })

    // Log to editor logger (never to storefront)
    if (typeof window !== 'undefined') {
      const ctx = this.props.context || 'Unknown'
      console.error(`[EditorBoundary:${ctx}]`, error, errorInfo.componentStack)
      
      // Emit to editor-logger for in-memory audit trail
      try {
        window.__editorLogError?.({
          context: ctx,
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
        })
      } catch {}
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div style={s.wrapper}>
          <span style={s.icon}><Shield size={28} /></span>
          <p style={s.title}>Komponen mengalami error</p>
          <p style={s.context}>
            {this.props.context && <code style={s.code}>{this.props.context}</code>}
          </p>
          {this.state.error && (
            <p style={s.msg}>{this.state.error.message}</p>
          )}
          <button style={s.btn} onClick={this.handleReset}>
            <RefreshCw size={14} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} /> Coba Lagi
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

const s: Record<string, React.CSSProperties> = {
  wrapper: {
    padding: '24px 16px',
    textAlign: 'center',
    border: '1px dashed #FCA5A5',
    borderRadius: '10px',
    background: '#FEF2F2',
    margin: '12px',
  },
  icon: { fontSize: '28px', display: 'block', marginBottom: '8px' },
  title: { fontWeight: 600, color: '#991B1B', fontSize: '14px', margin: '0 0 4px' },
  context: { margin: '0 0 6px' },
  code: {
    background: '#FEE2E2',
    color: '#7F1D1D',
    padding: '1px 6px',
    borderRadius: '4px',
    fontSize: '11px',
    fontFamily: 'monospace',
  },
  msg: { color: '#6B7280', fontSize: '12px', margin: '0 0 12px' },
  btn: {
    background: '#991B1B',
    color: '#fff',
    border: 'none',
    padding: '6px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
  },
}
