'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface Props {
  storeId?: string | null // NULL jika landing page utama webtokoku.id
}

export function AnalyticsTracker({ storeId = null }: Props) {
  const pathname = usePathname()

  useEffect(() => {
    // Abaikan logging untuk halaman internal admin, dashboard, auth, dan api
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/auth')
    ) {
      return
    }

    const trackVisit = async () => {
      try {
        // Cek/buat UUID unik pengunjung di localStorage untuk menghitung unique visitors
        let visitorId = localStorage.getItem('wt_visitor_id')
        if (!visitorId) {
          visitorId = typeof crypto.randomUUID === 'function' 
            ? crypto.randomUUID() 
            : Math.random().toString(36).substring(2) + Date.now().toString(36)
          localStorage.setItem('wt_visitor_id', visitorId)
        }

        await fetch('/api/traffic', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            store_id: storeId,
            visitor_id: visitorId,
            path: pathname,
            referrer: typeof document !== 'undefined' ? document.referrer : '',
          }),
        })
      } catch (err) {
        // Cukup log error ringan, jangan biarkan tracker merusak user experience utama
        console.warn('Analytics logging skipped:', err)
      }
    }

    // Berikan sedikit delay 800ms agar tracker tidak memblokir render awal halaman
    const timer = setTimeout(trackVisit, 800)
    return () => clearTimeout(timer)
  }, [pathname, storeId])

  return null
}
