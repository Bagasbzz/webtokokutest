'use client'

/**
 * ToastContainer - Komponen tampilan antrian toast notifikasi.
 *
 * Render daftar toast yang aktif di pojok kanan bawah layar.
 * Setiap toast bisa ditutup manual dengan klik tombol ×.
 *
 * Props:
 *   toasts   - daftar toast dari useToast()
 *   onDismiss - fungsi hapus toast dari useToast()
 *
 * Warna per tipe:
 *   success  → hijau
 *   error    → merah
 *   warning  → oranye
 *   info     → biru
 */

import React from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import type { ToastItem } from '@/hooks/useToast'

interface ToastContainerProps {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}

/** Peta ikon per tipe toast */
const ICONS: Record<string, React.ReactNode> = {
  success: <CheckCircle2 size={18} />,
  error:   <XCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info:    <Info size={18} />,
}

/** Peta warna per tipe (background, border, icon color) */
const COLORS: Record<string, { bg: string; border: string; icon: string; text: string }> = {
  success: { bg: '#f0fdf4', border: '#bbf7d0', icon: '#16a34a', text: '#14532d' },
  error:   { bg: '#fef2f2', border: '#fecaca', icon: '#dc2626', text: '#7f1d1d' },
  warning: { bg: '#fffbeb', border: '#fde68a', icon: '#d97706', text: '#78350f' },
  info:    { bg: '#eff6ff', border: '#bfdbfe', icon: '#2563eb', text: '#1e3a5f' },
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div
      role="region"
      aria-label="Notifikasi"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.625rem',
        maxWidth: '360px',
        width: '100%',
      }}
    >
      {toasts.map(t => {
        const c = COLORS[t.type] || COLORS.info
        return (
          <div
            key={t.id}
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.625rem',
              padding: '0.75rem 1rem',
              background: c.bg,
              border: `1px solid ${c.border}`,
              borderRadius: '0.625rem',
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
              animation: 'wt-toast-in 0.25s ease',
            }}
          >
            {/* Ikon */}
            <span style={{ color: c.icon, flexShrink: 0, marginTop: '1px' }}>
              {ICONS[t.type]}
            </span>

            {/* Pesan */}
            <p style={{
              flex: 1,
              margin: 0,
              fontSize: '0.875rem',
              lineHeight: '1.4',
              color: c.text,
              fontWeight: 500,
            }}>
              {t.message}
            </p>

            {/* Tombol tutup */}
            <button
              onClick={() => onDismiss(t.id)}
              aria-label="Tutup notifikasi"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: c.icon,
                padding: '0',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                opacity: 0.7,
              }}
            >
              <X size={14} />
            </button>
          </div>
        )
      })}

      {/* Animasi masuk */}
      <style>{`
        @keyframes wt-toast-in {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)  scale(1); }
        }
      `}</style>
    </div>
  )
}
