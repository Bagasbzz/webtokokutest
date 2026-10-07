'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMyStore } from '@/lib/store'
import { fetchEditorCustomizations } from '@/lib/customizations'
import { TEMPLATE_EDITABLES } from '@/lib/template-editables'
import { EditorClient } from '@/components/editor/EditorClient'
import { Loader2 } from 'lucide-react'

/**
 * Dashboard Template Editor
 *
 * Client component - fetches store, schema, and saved customizations,
 * then passes them to EditorClient.
 */
export default function EditorPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // This is the preferred inline editor entry point. It loads the seller store,
  // resolves the selected template schema, then hands everything to EditorClient
  // for iframe preview, overlay selection, draft save, and publish.
  useEffect(() => {
    async function loadData() {
      try {
        const store = await getMyStore()
        if (!store) {
          // Fix: onboarding is at root level, not under dashboard
          router.push('/onboarding')
          return
        }

        const templateId: string = store.template || 'butik'
        const savedCustomizations = await fetchEditorCustomizations(store.id)
        
        setData({
          store,
          templateId,
          schema: TEMPLATE_EDITABLES[templateId] || [],
          savedCustomizations
        })
      } catch (err) {
        console.error('Failed to load editor data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '60vh', 
        gap: '16px',
        color: '#64748b'
      }}>
        <Loader2 size={40} style={{ color: '#10b981', animation: 'spin 1s linear infinite' }} />
        <p style={{ fontWeight: 500 }}>Menyiapkan Editor Visual...</p>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}} />
      </div>
    )
  }

  if (!data) return null

  return (
    <EditorClient
      storeId={data.store.id}
      storeSlug={data.store.slug}
      templateId={data.templateId}
      schema={data.schema}
      savedCustomizations={data.savedCustomizations}
    />
  )
}
