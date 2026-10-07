'use client'

/**
 * useToast — Hook manajemen notifikasi toast.
 *
 * Menyediakan fungsi toast() untuk menampilkan pesan sukses/error/info/warning
 * yang muncul sementara di pojok layar, menggantikan dialog bawaan browser (alert/confirm).
 *
 * Cara pakai:
 *   const { toasts, toast } = useToast()
 *   toast.success('Produk berhasil disimpan!')
 *   toast.error('Gagal menghapus data.')
 *   toast.info('Belum ada notifikasi.')
 *   toast.warning('Stok hampir habis.')
 */

import { useState, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: string
  type: ToastType
  message: string
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  /**
   * Tampilkan toast baru. Otomatis hilang setelah `duration` ms (default 4000ms).
   */
  const show = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  /**
   * Hapus toast tertentu secara manual (misal saat diklik).
   */
  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Shorthand helpers agar penggunaan lebih ringkas
  const toast = {
    success: (msg: string, duration?: number) => show(msg, 'success', duration),
    error:   (msg: string, duration?: number) => show(msg, 'error',   duration ?? 6000),
    info:    (msg: string, duration?: number) => show(msg, 'info',    duration),
    warning: (msg: string, duration?: number) => show(msg, 'warning', duration),
  }

  return { toasts, toast, dismiss }
}
