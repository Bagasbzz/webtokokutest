'use client'

import React, { useEffect, useState } from 'react'
import { tokens } from '@/lib/design-tokens'

interface InlineSectionToolbarProps {
  sectionId: string
  rect: { left: number; top: number; width: number; height: number }
  onHide: () => void
}

export function InlineSectionToolbar({
  sectionId,
  rect,
  onHide,
}: InlineSectionToolbarProps) {
  const [visible, setVisible] = useState(false)

  // Fade in on mount - prevents jarring snap-in
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // Toolbar anchors to top-right corner of section, clamped to viewport
  const TOOLBAR_W = 42
  const TOOLBAR_H = 36
  const MIN_TOP = 8

  const toolbarLeft = Math.max(8, rect.left + rect.width - TOOLBAR_W - 12)
  const toolbarTop  = Math.max(MIN_TOP, rect.top + 12)

  const labelTop = Math.max(MIN_TOP, rect.top + 12)
  const labelLeft = rect.left + 12

  const transition = `opacity ${tokens.motion.duration.fast} ${tokens.motion.ease}, transform ${tokens.motion.duration.fast} ${tokens.motion.ease}`

  return (
    <>
      {/* Section outline - 1px, very subtle */}
      <div
        style={{
          position: 'fixed',
          left: rect.left,
          top:  rect.top,
          width:  rect.width,
          height: rect.height,
          outline: `1px solid ${tokens.editor.section.outline}`,
          outlineOffset: '-1px',
          pointerEvents: 'none',
          zIndex: tokens.z.toolbar,
          borderRadius: '2px',
          opacity: visible ? 1 : 0,
          transition,
        }}
      />

      {/* Section ID label - top left */}
      <div
        style={{
          position: 'fixed',
          left: labelLeft,
          top:  labelTop,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          color: 'rgba(255,255,255,0.5)',
          fontSize: tokens.font.size['2xs'],
          fontWeight: tokens.font.weight.semibold,
          padding: '2px 8px',
          borderRadius: tokens.radius.sm,
          letterSpacing: tokens.font.tracking.widest,
          textTransform: 'uppercase' as const,
          fontFamily: 'Inter, system-ui, sans-serif',
          pointerEvents: 'none',
          zIndex: tokens.z.editorHover,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(-4px)',
          transition,
          userSelect: 'none',
        }}
      >
        {sectionId}
      </div>

      {/* Toolbar - top right */}
      <div
        style={{
          position: 'fixed',
          left: toolbarLeft,
          top:  toolbarTop,
          height: TOOLBAR_H,
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          padding: '3px',
          background: tokens.editor.section.toolbar,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: tokens.radius.lg,
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: tokens.shadow.md,
          zIndex: tokens.z.editorLabel,
          pointerEvents: 'auto',
          fontFamily: 'Inter, system-ui, sans-serif',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(-4px) scale(0.96)',
          transition,
        }}
      >
        <ToolbarBtn
          label="✕"
          title="Sembunyikan section"
          onClick={(e) => { e.stopPropagation(); onHide() }}
          danger
        />
      </div>
    </>
  )
}

interface ToolbarBtnProps {
  label: string
  title: string
  onClick: (e: React.MouseEvent) => void
  danger?: boolean
}

function ToolbarBtn({ label, title, onClick, danger }: ToolbarBtnProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '26px',
        height: '26px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: hovered
          ? danger
            ? 'rgba(239,68,68,0.15)'
            : 'rgba(255,255,255,0.1)'
          : 'transparent',
        border: 'none',
        borderRadius: tokens.radius.md,
        color: hovered
          ? danger ? '#EF4444' : 'rgba(255,255,255,0.95)'
          : danger ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.5)',
        fontSize: '12px',
        cursor: 'pointer',
        transition: `all ${tokens.motion.duration.fast} ${tokens.motion.ease}`,
        fontFamily: 'Inter, system-ui, sans-serif',
        lineHeight: 1,
      }}
    >
      {label}
    </button>
  )
}
