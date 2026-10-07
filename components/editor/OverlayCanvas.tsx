'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useOverlaySync } from '@/hooks/useOverlaySync'
import { FloatingInput } from './FloatingInput'
import { InlineSectionToolbar } from './InlineSectionToolbar'
import { logEditorError } from '@/lib/editor-logger'
import { tokens } from '@/lib/design-tokens'

interface OverlayCanvasProps {
  iframeRef: React.RefObject<HTMLIFrameElement>
  enabled: boolean
  onElementSelect?: (key: string) => void
  onQuickEdit?: (key: string, value: string) => void
  onImageReplace?: (key: string) => void
  onSectionHide?: (sectionId: string) => void
  formData?: Record<string, string>
}

interface QuickEditState {
  key: string
  initialValue: string
  rect: { left: number; top: number; width: number; height: number }
}

interface SectionHoverState {
  sectionId: string
  rect: { left: number; top: number; width: number; height: number }
}

function getLabelForKey(key: string): string {
  const field = key.split('.').pop() ?? key
  const labels: Record<string, string> = {
    title: 'Judul', subtitle: 'Deskripsi', badge: 'Badge',
    description: 'Teks', image_url: 'Gambar', text1: 'Teks 1',
    text2: 'Teks 2', text3: 'Teks 3',
    step1_title: 'Langkah 1', step2_title: 'Langkah 2', step3_title: 'Langkah 3',
    step1_desc: 'Keterangan 1', step2_desc: 'Keterangan 2', step3_desc: 'Keterangan 3',
    feat1_title: 'Fitur 1', feat2_title: 'Fitur 2', feat3_title: 'Fitur 3',
  }
  return labels[field] ?? field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function isImageKey(key: string): boolean {
  return key.endsWith('_url') || key.endsWith('image') || key.includes('image_url')
}

function getIframePoint(event: MouseEvent, iframe: HTMLIFrameElement, doc: Document) {
  let x = event.clientX
  let y = event.clientY
  const docEl = doc.documentElement

  // Normalize parent-page coordinates to iframe-local coordinates before calling
  // elementFromPoint inside the iframe document.
  if (x > docEl.clientWidth || y > docEl.clientHeight || x < 0 || y < 0) {
    const iframeRect = iframe.getBoundingClientRect()
    x -= iframeRect.left
    y -= iframeRect.top
  }

  return { x, y }
}

function getIframeScale(iframe: HTMLIFrameElement) {
  const rect = iframe.getBoundingClientRect()
  return {
    x: rect.width / Math.max(iframe.clientWidth, 1),
    y: rect.height / Math.max(iframe.clientHeight, 1),
  }
}

export function OverlayCanvas({
  iframeRef, enabled,
  onElementSelect, onQuickEdit, onImageReplace,
  onSectionHide,
  formData = {},
}: OverlayCanvasProps) {
  const [quickEdit, setQuickEdit]       = useState<QuickEditState | null>(null)
  const [sectionHover, setSectionHover] = useState<SectionHoverState | null>(null)
  const [hoverVisible, setHoverVisible] = useState(false)
  const hoverFadeRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { hoveredKey, overlayRect, trackPointer, clearOverlay } = useOverlaySync(iframeRef, enabled, quickEdit?.key)

  const isImg        = hoveredKey ? isImageKey(hoveredKey) : false
  const showHover    = enabled && hoveredKey && overlayRect && !quickEdit
  const showSection  = enabled && sectionHover && !quickEdit

  // ── Fade-in hover overlay (prevents flicker on fast mouse moves) ──────────
  useEffect(() => {
    if (hoverFadeRef.current) clearTimeout(hoverFadeRef.current)
    if (showHover) {
      // Tiny delay so overlay doesn't flash on quick traversal
      hoverFadeRef.current = setTimeout(() => setHoverVisible(true), 30)
    } else {
      setHoverVisible(false)
    }
    return () => { if (hoverFadeRef.current) clearTimeout(hoverFadeRef.current) }
  }, [showHover, hoveredKey])

  // ── Section hover tracking ────────────────────────────────────────────────
  const sectionRafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) return
    const iframe = iframeRef.current
    if (!iframe) return

    const handleMove = (e: MouseEvent) => {
      if (sectionRafRef.current) return
      sectionRafRef.current = requestAnimationFrame(() => {
        sectionRafRef.current = null
        const iframeDoc = iframe.contentDocument
        if (!iframeDoc) return
        const point = getIframePoint(e, iframe, iframeDoc)
        const target = iframeDoc.elementFromPoint(point.x, point.y) as HTMLElement | null
        const sectionEl = target?.closest('[data-section-id]') as HTMLElement | null

        if (!sectionEl) { setSectionHover(null); return }

        const sid = sectionEl.getAttribute('data-section-id') || ''
        const ir  = iframe.getBoundingClientRect()
        const sr  = sectionEl.getBoundingClientRect()
        const scale = getIframeScale(iframe)
        setSectionHover({
          sectionId: sid,
          rect: {
            left: ir.left + sr.left * scale.x,
            top: ir.top + sr.top * scale.y,
            width: sr.width * scale.x,
            height: sr.height * scale.y,
          },
        })
      })
    }

    const handleLeave = () => setSectionHover(null)

    const attach = (doc: Document) => {
      doc.addEventListener('mousemove', handleMove)
      doc.addEventListener('mouseleave', handleLeave)
      return () => {
        doc.removeEventListener('mousemove', handleMove)
        doc.removeEventListener('mouseleave', handleLeave)
      }
    }

    let detach: (() => void) | undefined
    
    const setup = () => {
      if (detach) detach()
      const doc = iframe.contentDocument
      if (doc) detach = attach(doc)
    }

    setup()
    iframe.addEventListener('load', setup)

    return () => {
      if (detach) detach()
      iframe.removeEventListener('load', setup)
      if (sectionRafRef.current) cancelAnimationFrame(sectionRafRef.current)
    }
  }, [enabled, iframeRef])

  // ── Event handlers ────────────────────────────────────────────────────────
  const findEditableAtPoint = (clientX: number, clientY: number) => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument
    if (!iframe || !doc) return null

    const iframeRect = iframe.getBoundingClientRect()
    const scale = getIframeScale(iframe)
    const x = (clientX - iframeRect.left) / Math.max(scale.x, 0.01)
    const y = (clientY - iframeRect.top) / Math.max(scale.y, 0.01)
    const target = doc.elementFromPoint(x, y) as HTMLElement | null
    const el = target?.closest('[data-editable]') as HTMLElement | null
    const key = el?.getAttribute('data-editable')

    if (!el || !key) return null

    const rect = el.getBoundingClientRect()
    return {
      key,
      value: el.innerText || el.textContent || '',
      rect: {
        left: iframeRect.left + rect.left * scale.x,
        top: iframeRect.top + rect.top * scale.y,
        width: rect.width * scale.x,
        height: rect.height * scale.y,
      },
    }
  }

  const openQuickEdit = (key: string, rect: { left: number; top: number; width: number; height: number }, fallbackValue = '') => {
    if (isImageKey(key)) { onImageReplace?.(key); return }
    setQuickEdit({ key, initialValue: formData[key] ?? fallbackValue, rect })
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const directHit = findEditableAtPoint(e.clientX, e.clientY)
      if (directHit?.key && onElementSelect) onElementSelect(directHit.key)
      else if (hoveredKey && onElementSelect) onElementSelect(hoveredKey)

      if (e.detail === 2 && directHit) {
        openQuickEdit(directHit.key, directHit.rect, directHit.value)
      }
    }
    catch (err) { logEditorError({ context: 'OverlayCanvas.click', message: String(err) }) }
  }

  const handleDblClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const directHit = findEditableAtPoint(e.clientX, e.clientY)
      if (directHit) {
        openQuickEdit(directHit.key, directHit.rect, directHit.value)
        return
      }

      if (!hoveredKey || !overlayRect) return
      openQuickEdit(hoveredKey, { ...overlayRect })
    } catch (err) { logEditorError({ context: 'OverlayCanvas.dblclick', message: String(err) }) }
  }

  const handleImageBtn = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hoveredKey) onImageReplace?.(hoveredKey)
  }

  const handlePreviewWheel = (e: React.WheelEvent) => {
    const iframe = iframeRef.current
    const iframeWindow = iframe?.contentWindow
    if (!iframe || !iframeWindow) return
    const scale = getIframeScale(iframe)
    iframeWindow.scrollBy({
      left: e.deltaX / Math.max(scale.x, 0.01),
      top: e.deltaY / Math.max(scale.y, 0.01),
      behavior: 'auto',
    })
  }

  const handleCommit = (key: string, value: string) => {
    try { setQuickEdit(null); onQuickEdit?.(key, value) }
    catch (err) { logEditorError({ context: 'OverlayCanvas.commit', message: String(err) }); setQuickEdit(null) }
  }

  // ── Positioning helpers ───────────────────────────────────────────────────
  const badgeTop = overlayRect
    ? overlayRect.top - 28 > 4 ? overlayRect.top - 28 : overlayRect.top + 8
    : 0

  const color = isImg ? tokens.editor.image : tokens.editor.text
  const easing = `${tokens.motion.duration.fast} ${tokens.motion.ease}`

  return (
    <>
      {enabled && !quickEdit && (
        <div
          style={{
            position: 'absolute',
            inset: '0 16px 0 0',
            zIndex: tokens.z.editorHover - 1,
            background: 'transparent',
            pointerEvents: 'auto',
            cursor: isImg ? 'pointer' : hoveredKey ? 'text' : 'default',
          }}
          onMouseMove={(e) => trackPointer(e.clientX, e.clientY)}
          onMouseLeave={clearOverlay}
          onWheel={handlePreviewWheel}
          onClick={handleClick}
          onDoubleClick={handleDblClick}
        />
      )}

      {/* ── Element hover overlay ── */}
      {showHover && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: tokens.z.editorHover }}>
          {/* Outline box */}
          <div
            style={{
              position: 'absolute',
              left: overlayRect!.left,
              top:  overlayRect!.top,
              width:  overlayRect!.width,
              height: overlayRect!.height,
              outline: `1.5px solid ${color.outline}`,
              outlineOffset: '2px',
              backgroundColor: color.fill,
              borderRadius: '2px',
              pointerEvents: 'none',
              cursor: isImg ? 'pointer' : 'text',
              opacity: hoverVisible ? 1 : 0,
              transition: `opacity ${easing}`,
            }}
          />

          {/* Label badge */}
          <div
            style={{
              position: 'absolute',
              left: overlayRect!.left,
              top:  badgeTop,
              background: isImg ? '#1f7a4d' : '#247a52',
              color: 'white',
              fontSize: tokens.font.size['2xs'],
              fontWeight: tokens.font.weight.semibold,
              padding: '3px 10px',
              borderRadius: tokens.radius.sm,
              fontFamily: 'Inter, system-ui, sans-serif',
              whiteSpace: 'nowrap',
              letterSpacing: tokens.font.tracking.wide,
              boxShadow: tokens.shadow.sm,
              pointerEvents: 'none',
              opacity: hoverVisible ? 1 : 0,
              transform: hoverVisible ? 'translateY(0)' : 'translateY(3px)',
              transition: `opacity ${easing}, transform ${easing}`,
            }}
          >
            {isImg ? '↑ Replace Image' : `✎ ${getLabelForKey(hoveredKey!)}`}
          </div>

          {/* Image replace pill */}
          {isImg && hoverVisible && (
            <button
              style={{
                position: 'absolute',
                left: overlayRect!.left + overlayRect!.width - 130,
                top:  overlayRect!.top + 12,
                background: 'rgba(0,0,0,0.72)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                color: 'white',
                fontSize: tokens.font.size.sm,
                fontWeight: tokens.font.weight.semibold,
                padding: '6px 16px',
                borderRadius: tokens.radius.full,
                border: '1px solid rgba(255,255,255,0.18)',
                cursor: 'pointer',
                pointerEvents: 'auto',
                fontFamily: 'Inter, system-ui, sans-serif',
                letterSpacing: tokens.font.tracking.wide,
                transition: `all ${easing}`,
              }}
              onClick={handleImageBtn}
            >
              Replace Image
            </button>
          )}
        </div>
      )}

      {/* ── Section toolbar ── */}
      {showSection && sectionHover && (
        <InlineSectionToolbar
          sectionId={sectionHover.sectionId}
          rect={sectionHover.rect}
          onHide={() => onSectionHide?.(sectionHover.sectionId)}
        />
      )}

      {/* ── Floating quick edit ── */}
      {quickEdit && (
        <FloatingInput
          editKey={quickEdit.key}
          initialValue={quickEdit.initialValue}
          label={getLabelForKey(quickEdit.key)}
          rect={overlayRect || quickEdit.rect}
          onCommit={handleCommit}
          onCancel={() => setQuickEdit(null)}
        />
      )}
    </>
  )
}
