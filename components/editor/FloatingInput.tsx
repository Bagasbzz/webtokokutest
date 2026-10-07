'use client'

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { tokens } from '@/lib/design-tokens'

interface FloatingInputProps {
  editKey: string
  initialValue: string
  label: string
  rect: { left: number; top: number; width: number; height: number }
  onCommit: (key: string, value: string) => void
  onCancel: () => void
}

const PADDING = 10
const MIN_WIDTH = 280

export function FloatingInput({
  editKey,
  initialValue,
  label,
  rect,
  onCommit,
  onCancel,
}: FloatingInputProps) {
  const [value, setValue] = useState(initialValue)
  const [visible, setVisible] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const finishedRef = useRef(false)

  // Mount: fade in then focus
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(t)
  }, [])

  // Auto-focus and place cursor at end
  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.focus()
    el.setSelectionRange(el.value.length, el.value.length)
  }, [])

  // Auto-resize height based on content
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }, [value])

  const [viewportHeight, setViewportHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 900)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return
    const vv = window.visualViewport
    const handleResize = () => setViewportHeight(vv.height)
    vv.addEventListener('resize', handleResize)
    vv.addEventListener('scroll', handleResize)
    return () => {
      vv.removeEventListener('resize', handleResize)
      vv.removeEventListener('scroll', handleResize)
    }
  }, [])

  const commit = () => {
    if (finishedRef.current) return
    finishedRef.current = true
    setVisible(false)
    setTimeout(() => onCommit(editKey, value.trim()), 120)
  }

  const cancel = () => {
    if (finishedRef.current) return
    finishedRef.current = true
    setVisible(false)
    setTimeout(() => onCancel(), 120)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      commit()
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      cancel()
    }
  }

  // Clamp position so it never goes off-screen
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1440
  
  const floatWidth = Math.min(Math.max(rect.width, MIN_WIDTH), vw - PADDING * 2)
  const floatLeft  = Math.max(PADDING, Math.min(rect.left, vw - floatWidth - PADDING))
  
  // Position adjustment for mobile keyboard
  const floatTop = rect.top - 8 > PADDING 
    ? Math.min(rect.top - 8, viewportHeight - 120) // Adjust if keyboard is up
    : rect.top + rect.height + 4

  return (
    <div
      style={{
        position: 'fixed',
        left: floatLeft,
        top: floatTop,
        width: floatWidth,
        zIndex: tokens.z.floatInput,
        pointerEvents: 'auto',
        fontFamily: 'Inter, system-ui, sans-serif',
        // Fade in / out
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(4px)',
        transition: `opacity 120ms ${tokens.motion.ease}, transform 120ms ${tokens.motion.ease}`,
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Label chip */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          background: '#111827',
          color: 'rgba(255,255,255,0.8)',
          fontSize: tokens.font.size['2xs'],
          fontWeight: tokens.font.weight.semibold,
          padding: '3px 10px',
          borderRadius: `${tokens.radius.md} ${tokens.radius.md} 0 0`,
          letterSpacing: tokens.font.tracking.wide,
          userSelect: 'none',
        }}
      >
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.6 }}>
          <path d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5Z" stroke="white" strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
        {label}
      </div>

      {/* Glass textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        rows={1}
        style={{
          display: 'block',
          width: '100%',
          padding: '10px 14px',
          border: 'none',
          borderRadius: `0 ${tokens.radius.md} ${tokens.radius.md} ${tokens.radius.md}`,
          fontSize: tokens.font.size.md,
          fontFamily: 'inherit',
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          color: '#111827',
          resize: 'none',
          outline: `1.5px solid ${tokens.editor.text.outline}`,
          boxShadow: tokens.shadow.float,
          lineHeight: String(tokens.font.leading.normal),
          boxSizing: 'border-box',
          overflowY: 'hidden',
          minHeight: '40px',
          transition: `outline-color ${tokens.motion.duration.fast} ${tokens.motion.ease}`,
        }}
      />

      {/* Keyboard hint - minimal */}
      <div
        style={{
          marginTop: '5px',
          fontSize: tokens.font.size['2xs'],
          color: '#9CA3AF',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '14px',
          letterSpacing: tokens.font.tracking.wide,
        }}
      >
        <span>↵ Simpan</span>
        <span style={{ opacity: 0.5 }}>Esc Batal</span>
      </div>
    </div>
  )
}
