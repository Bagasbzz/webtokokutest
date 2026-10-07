'use client'

import { useEffect, useLayoutEffect } from 'react'

// Global state for reference counting to handle multiple open drawers/modals
let lockCount = 0
let originalOverflow = ''
let originalPaddingRight = ''

export function useScrollLock(lock: boolean) {
  useLayoutEffect(() => {
    if (!lock) return

    // On mount or when lock becomes true
    if (lockCount === 0) {
      // Store original values before locking
      originalOverflow = document.body.style.overflow
      originalPaddingRight = document.body.style.paddingRight
      
      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      
      document.body.style.overflow = 'hidden'
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }

      // iOS Safari specific: prevent rubber-band scroll
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    }
    
    lockCount++

    return () => {
      lockCount--
      if (lockCount === 0) {
        // Restore original values
        document.body.style.overflow = originalOverflow
        document.body.style.paddingRight = originalPaddingRight
        document.body.style.position = ''
        document.body.style.width = ''
      }
    }
  }, [lock])
}
