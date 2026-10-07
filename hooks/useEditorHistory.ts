import { useState, useCallback, useRef } from 'react'

export interface HistoryState<T> {
  past: T[]
  present: T
  future: T[]
}

export function useEditorHistory<T>(initialPresent: T, limit = 50) {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialPresent,
    future: [],
  })

  // We use a ref for the timer to debounce typing commits
  const commitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const canUndo = history.past.length > 0
  const canRedo = history.future.length > 0

  const undo = useCallback(() => {
    setHistory((curr) => {
      if (curr.past.length === 0) return curr

      const previous = curr.past[curr.past.length - 1]
      const newPast = curr.past.slice(0, curr.past.length - 1)

      return {
        past: newPast,
        present: previous,
        future: [curr.present, ...curr.future],
      }
    })
  }, [])

  const redo = useCallback(() => {
    setHistory((curr) => {
      if (curr.future.length === 0) return curr

      const next = curr.future[0]
      const newFuture = curr.future.slice(1)

      return {
        past: [...curr.past, curr.present],
        present: next,
        future: newFuture,
      }
    })
  }, [])

  // Commit a new state to history immediately (for toggles, uploads, etc)
  const commit = useCallback((newPresent: T) => {
    setHistory((curr) => {
      // Don't commit if identical to present
      if (JSON.stringify(newPresent) === JSON.stringify(curr.present)) return curr

      return {
        past: [...curr.past, curr.present].slice(-limit),
        present: newPresent,
        future: [],
      }
    })
  }, [limit])

  // Reset history (useful when loading a draft or initial data)
  const reset = useCallback((newPresent: T) => {
    setHistory({
      past: [],
      present: newPresent,
      future: [],
    })
  }, [])

  return {
    state: history.present,
    setPresent: (newPresent: T | ((current: T) => T)) => setHistory(h => ({
      ...h,
      present: typeof newPresent === 'function'
        ? (newPresent as (current: T) => T)(h.present)
        : newPresent,
      future: [],
    })),
    undo,
    redo,
    commit,
    reset,
    canUndo,
    canRedo,
  }
}
