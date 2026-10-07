'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface VisualEditorClientProps {
  storeSlug: string
}

export default function VisualEditorClient({ storeSlug }: VisualEditorClientProps) {
  const router = useRouter()

  // Legacy route guard: the old slug-based editor rendered a mock store preview
  // and did not edit the real template. Keep this lightweight redirect so old
  // links do not break while the iframe-based inline editor remains canonical.
  useEffect(() => {
    router.replace('/dashboard/editor')
  }, [router])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      color: '#334155',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: 24,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        padding: 28,
        boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)',
        textAlign: 'center',
      }}>
        <Loader2 size={28} style={{ color: '#10b981', animation: 'spin 1s linear infinite', marginBottom: 14 }} />
        <h1 style={{ fontSize: 18, margin: '0 0 8px', color: '#0f172a' }}>Membuka editor template</h1>
        <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>
          Route lama untuk <strong>{storeSlug}</strong> dialihkan ke editor inline utama.
        </p>
        <style dangerouslySetInnerHTML={{ __html: '@keyframes spin { to { transform: rotate(360deg); } }' }} />
      </div>
    </div>
  )
}
