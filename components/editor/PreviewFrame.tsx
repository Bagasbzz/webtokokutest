'use client'

import { useState, useRef, forwardRef, useImperativeHandle, useEffect, useMemo } from 'react'
import { OverlayCanvas } from './OverlayCanvas'
import { EditorErrorBoundary } from './EditorErrorBoundary'
import { logEditorError } from '@/lib/editor-logger'
import { AlertTriangle } from 'lucide-react'

interface PreviewFrameProps {
  src: string
  deviceMode: 'desktop' | 'mobile'
  onElementSelect?: (key: string) => void
  onQuickEdit?: (key: string, value: string) => void
  onImageReplace?: (key: string) => void
  onSectionHide?: (sectionId: string) => void
  formData?: Record<string, string>
}

export interface PreviewFrameHandle {
  getIframe(): HTMLIFrameElement | null
}

const MAX_RETRIES = 3
const DESKTOP_VIEWPORT = 1440
const MOBILE_VIEWPORT = 390

export const PreviewFrame = forwardRef<PreviewFrameHandle, PreviewFrameProps>(
  ({ src, deviceMode, onElementSelect, onQuickEdit, onImageReplace, onSectionHide, formData }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [frameKey, setFrameKey] = useState(0)
    const [retryCount, setRetryCount] = useState(0)
    const [containerSize, setContainerSize] = useState({ width: 960, height: 720 })

    useImperativeHandle(ref, () => ({
      getIframe: () => iframeRef.current
    }))

    useEffect(() => {
      setLoading(true)
      setError(false)
    }, [src, frameKey])

    useEffect(() => {
      const el = containerRef.current
      if (!el) return

      const update = () => {
        const rect = el.getBoundingClientRect()
        setContainerSize({ width: rect.width, height: rect.height })
      }

      update()
      const ro = new ResizeObserver(update)
      ro.observe(el)
      return () => ro.disconnect()
    }, [])

    const previewMetrics = useMemo(() => {
      const viewportWidth = deviceMode === 'mobile' ? MOBILE_VIEWPORT : DESKTOP_VIEWPORT
      const outerGap = deviceMode === 'mobile' ? 40 : 24
      const availableWidth = Math.max(280, containerSize.width - outerGap)
      const availableHeight = Math.max(360, containerSize.height - outerGap)
      const scale = Math.min(1, availableWidth / viewportWidth)
      const stageWidth = viewportWidth * scale
      const iframeHeight = Math.max(availableHeight / scale, deviceMode === 'mobile' ? 844 : 900)
      const stageHeight = availableHeight

      return { viewportWidth, scale, stageWidth, stageHeight, iframeHeight }
    }, [containerSize, deviceMode])

    const containerStyle: React.CSSProperties = {
      position: 'relative',
      flex: 1,
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column',
      background: '#F3F4F6',
      borderRadius: '0 0 10px 10px',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: deviceMode === 'mobile' ? '20px' : '12px',
      boxSizing: 'border-box',
    }

    const frameWrapperStyle: React.CSSProperties = deviceMode === 'mobile'
      ? {
          width: previewMetrics.stageWidth,
          height: previewMetrics.stageHeight,
          minHeight: previewMetrics.stageHeight,
          background: '#fff',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 0 0 10px #111827, 0 20px 40px rgba(0,0,0,0.2)',
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }
      : {
          width: previewMetrics.stageWidth,
          height: previewMetrics.stageHeight,
          minHeight: previewMetrics.stageHeight,
          background: '#fff',
          boxShadow: '0 14px 40px rgba(15, 23, 42, 0.16)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
        }

    if (error) {
      const exhausted = retryCount >= MAX_RETRIES
      return (
        <div style={{ ...containerStyle, alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
          <div style={{ textAlign: 'center' }}>
            <AlertTriangle size={24} color="#F59E0B" style={{ margin: '0 auto 8px' }} />
            <p style={{ color: '#374151', fontWeight: 600, marginBottom: '4px' }}>Preview gagal dimuat</p>
            {exhausted ? (
              <p style={{ color: '#EF4444', fontSize: '12px', marginBottom: '16px' }}>
                Gagal setelah {MAX_RETRIES}x percobaan. Periksa koneksi atau refresh halaman.
              </p>
            ) : (
              <p style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '16px' }}>
                Percobaan ke-{retryCount} dari {MAX_RETRIES}.
              </p>
            )}
            <button
              disabled={exhausted}
              onClick={() => {
                setRetryCount(c => c + 1)
                setFrameKey(k => k + 1)
              }}
              style={{
                padding: '8px 16px',
                background: exhausted ? '#9CA3AF' : '#111827',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: exhausted ? 'not-allowed' : 'pointer',
                fontSize: '13px'
              }}
            >
              ↻ Reload Preview
            </button>
          </div>
        </div>
      )
    }

    return (
      <div ref={containerRef} style={containerStyle}>
        {loading && <LoadingSkeleton />}
        <div style={{ ...frameWrapperStyle, opacity: loading ? 0 : 1 }}>
          <iframe
            key={frameKey}
            ref={iframeRef}
            src={src}
            style={{
              width: previewMetrics.viewportWidth,
              height: previewMetrics.iframeHeight,
              border: 'none',
              transform: `scale(${previewMetrics.scale})`,
              transformOrigin: 'top left',
              display: 'block',
            }}
            onLoad={() => { setLoading(false); setRetryCount(0) }}
            onError={() => {
              setLoading(false)
              setError(true)
              logEditorError({
                context: 'PreviewFrame',
                message: `iframe failed to load: ${src}`,
              })
            }}
            title="Preview Content"
          />
          {!loading && (
            // Overlay crash = silent fallback (null). Editor sidebar still fully works.
            <EditorErrorBoundary context="OverlayCanvas" fallback={null}>
              <OverlayCanvas
                iframeRef={iframeRef}
                enabled={true}
                onElementSelect={onElementSelect}
                onQuickEdit={onQuickEdit}
                onImageReplace={onImageReplace}
                onSectionHide={onSectionHide}
                formData={formData}
              />
            </EditorErrorBoundary>
          )}
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}} />
      </div>
    )
  }
)

PreviewFrame.displayName = 'PreviewFrame'

function LoadingSkeleton() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#fff', zIndex: 10, padding: '24px' }}>
      {/* Navbar skeleton */}
      <div style={{ height: '50px', background: '#F3F4F6', borderRadius: '8px', marginBottom: '24px', animation: 'pulse 1.5s infinite' }} />
      {/* Hero skeleton */}
      <div style={{ height: '240px', background: '#F3F4F6', borderRadius: '12px', marginBottom: '24px', animation: 'pulse 1.5s infinite' }} />
      {/* Cards skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: '160px', background: '#F3F4F6', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
        <div style={{
          width: '24px',
          height: '24px',
          border: '3px solid #F3F4F6',
          borderTopColor: '#111827',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
      </div>
    </div>
  )
}
