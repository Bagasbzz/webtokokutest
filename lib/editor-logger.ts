/**
 * editor-logger.ts
 * In-memory error log for the dashboard editor only.
 * Never imported by storefront routes — zero-overhead by design.
 */

export interface EditorLogEntry {
  context: string
  message: string
  stack?: string
  componentStack?: string | null
  timestamp: number
}

const MAX_LOG_SIZE = 100
const _log: EditorLogEntry[] = []

export function logEditorError(entry: Omit<EditorLogEntry, 'timestamp'>): void {
  const full: EditorLogEntry = { ...entry, timestamp: Date.now() }
  _log.push(full)

  // Keep bounded
  if (_log.length > MAX_LOG_SIZE) {
    _log.splice(0, _log.length - MAX_LOG_SIZE)
  }

  // Also persist to sessionStorage so it survives soft refreshes
  if (typeof window !== 'undefined') {
    try {
      const existing = getEditorLogs()
      const merged = [...existing, full].slice(-MAX_LOG_SIZE)
      sessionStorage.setItem('editor-error-log', JSON.stringify(merged))
    } catch {}
  }
}

export function getEditorLogs(): EditorLogEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = sessionStorage.getItem('editor-error-log')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function clearEditorLogs(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem('editor-error-log')
    _log.length = 0
  } catch {}
}

/**
 * Registers the logger onto the window so EditorErrorBoundary
 * can call it without a circular import.
 */
export function registerEditorLogger(): void {
  if (typeof window === 'undefined') return
  ;(window as any).__editorLogError = logEditorError
}
