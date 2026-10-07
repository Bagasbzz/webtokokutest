import React, { useState, useEffect, useCallback, useRef } from 'react'

interface OverlayRect {
  left: number
  top: number
  width: number
  height: number
}

interface OverlaySyncState {
  hoveredKey: string | null
  overlayRect: OverlayRect | null
  trackPointer: (clientX: number, clientY: number) => void
  clearOverlay: () => void
}

function getIframeScale(iframe: HTMLIFrameElement) {
  const rect = iframe.getBoundingClientRect()
  return {
    x: rect.width / Math.max(iframe.clientWidth, 1),
    y: rect.height / Math.max(iframe.clientHeight, 1),
  }
}

function getIframePoint(event: MouseEvent, iframe: HTMLIFrameElement, doc: Document) {
  let x = event.clientX
  let y = event.clientY
  const docEl = doc.documentElement

  // Browser automation and some iframe event paths may report parent-page coordinates.
  // elementFromPoint inside the iframe needs iframe-local viewport coordinates.
  if (x > docEl.clientWidth || y > docEl.clientHeight || x < 0 || y < 0) {
    const iframeRect = iframe.getBoundingClientRect()
    x -= iframeRect.left
    y -= iframeRect.top
  }

  return { x, y }
}

/**
 * useOverlaySync — 60fps stable overlay positioning.
 *
 * Changes vs previous version:
 * - RAF-throttled sync (no double-fire, no stale closures)
 * - ResizeObserver on iframe body for instant layout-shift correction
 * - Scroll events use passive listener with RAF throttle
 * - Cleanup is guaranteed (no leaked observers)
 * - lockedKey syncs via MutationObserver if element moves
 */
export function useOverlaySync(
  iframeRef: React.RefObject<HTMLIFrameElement>,
  enabled: boolean,
  lockedKey: string | null = null
): OverlaySyncState {
  const [state, setState] = useState<OverlaySyncState>({
    hoveredKey: null,
    overlayRect: null,
    trackPointer: () => {},
    clearOverlay: () => {},
  })

  const activeElementRef = useRef<HTMLElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const isScheduledRef = useRef(false)

  /** Single RAF-gated sync call — never fires twice per frame */
  const scheduleSync = useCallback(() => {
    if (isScheduledRef.current) return
    isScheduledRef.current = true

    rafRef.current = requestAnimationFrame(() => {
      isScheduledRef.current = false

      const iframe = iframeRef.current
      const el = activeElementRef.current
      if (!iframe || !el) return

      try {
        const elementRect = el.getBoundingClientRect()
        const iframeRect = iframe.getBoundingClientRect()
        const scale = getIframeScale(iframe)

        // Guard against invisible or zero-sized elements
        if (elementRect.width === 0 && elementRect.height === 0) return

        setState(prev => ({
          ...prev,
          hoveredKey: el.getAttribute('data-editable'),
          overlayRect: {
            left: iframeRect.left + elementRect.left * scale.x,
            top:  iframeRect.top  + elementRect.top * scale.y,
            width: elementRect.width * scale.x,
            height: elementRect.height * scale.y,
          },
        }))
      } catch {
        // Element may have been removed during layout — silently skip
      }
    })
  }, [iframeRef])

  const clearOverlay = useCallback(() => {
    if (lockedKey) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    isScheduledRef.current = false
    activeElementRef.current = null
    setState(prev => ({ ...prev, hoveredKey: null, overlayRect: null }))
  }, [lockedKey])

  const trackPointer = useCallback((clientX: number, clientY: number) => {
    if (lockedKey) return

    const iframe = iframeRef.current
    const iframeDoc = iframe?.contentDocument
    if (!iframe || !iframeDoc) return

    const iframeRect = iframe.getBoundingClientRect()
    const scale = getIframeScale(iframe)
    const x = (clientX - iframeRect.left) / Math.max(scale.x, 0.01)
    const y = (clientY - iframeRect.top) / Math.max(scale.y, 0.01)

    if (x < 0 || y < 0 || x > iframe.clientWidth || y > iframe.clientHeight) {
      if (activeElementRef.current) clearOverlay()
      return
    }

    const target = iframeDoc.elementFromPoint(x, y) as HTMLElement | null
    const editableEl = target?.closest('[data-editable]') as HTMLElement | null

    if (!editableEl) {
      if (activeElementRef.current) clearOverlay()
      return
    }

    if (activeElementRef.current !== editableEl) {
      activeElementRef.current = editableEl
      scheduleSync()
    }
  }, [clearOverlay, iframeRef, lockedKey, scheduleSync])

  useEffect(() => {
    if (!enabled) return

    const iframe = iframeRef.current
    if (!iframe) return

    const handleMouseMove = (e: MouseEvent) => {
      if (lockedKey) return

      const iframeDoc = iframe.contentDocument
      if (!iframeDoc) return

      const point = getIframePoint(e, iframe, iframeDoc)
      const target = iframeDoc.elementFromPoint(point.x, point.y) as HTMLElement | null
      const editableEl = target?.closest('[data-editable]') as HTMLElement | null

      if (!editableEl) {
        if (activeElementRef.current) clearOverlay()
        return
      }

      if (activeElementRef.current !== editableEl) {
        activeElementRef.current = editableEl
        scheduleSync()
      }
    }

    const handleScroll = () => scheduleSync()
    const handleResize = () => scheduleSync()

    const attachListeners = () => {
      const iframeDoc = iframe.contentDocument
      const iframeWin = iframe.contentWindow
      if (!iframeDoc || !iframeWin) return () => {}

      iframeDoc.addEventListener('mousemove', handleMouseMove)
      iframeDoc.addEventListener('mouseleave', clearOverlay)
      iframeWin.addEventListener('scroll', handleScroll, { passive: true })
      window.addEventListener('resize', handleResize, { passive: true })

      // ResizeObserver for layout shifts inside iframe (e.g., images loading)
      const ro = new ResizeObserver(() => scheduleSync())
      if (iframeDoc.body) ro.observe(iframeDoc.body)

      // MutationObserver to handle DOM changes that might move observed elements
      const mo = new MutationObserver(() => {
        if (activeElementRef.current) scheduleSync()
      })
      if (iframeDoc.body) {
        mo.observe(iframeDoc.body, {
          childList: true,
          subtree: true,
          attributes: false,
        })
      }

      return () => {
        iframeDoc.removeEventListener('mousemove', handleMouseMove)
        iframeDoc.removeEventListener('mouseleave', clearOverlay)
        iframeWin.removeEventListener('scroll', handleScroll)
        window.removeEventListener('resize', handleResize)
        ro.disconnect()
        mo.disconnect()
      }
    }

    let cleanup: (() => void) | undefined

    const setup = () => {
      if (cleanup) cleanup()
      cleanup = attachListeners()
    }

    setup()
    iframe.addEventListener('load', setup)

    // If locked, find and sync immediately
    if (lockedKey) {
      const iframeDoc = iframe.contentDocument
      if (iframeDoc) {
        const el = iframeDoc.querySelector(`[data-editable="${lockedKey}"]`) as HTMLElement | null
        if (el) {
          activeElementRef.current = el
          scheduleSync()
        }
      }
    }

    return () => {
      if (cleanup) cleanup()
      iframe.removeEventListener('load', setup)
      window.removeEventListener('resize', handleResize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      isScheduledRef.current = false
    }
  }, [enabled, iframeRef, lockedKey, scheduleSync, clearOverlay])

  return {
    ...state,
    trackPointer,
    clearOverlay,
  }
}
