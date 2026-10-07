'use client'

import { useState, useEffect } from 'react'
import type { PublicStore, PublicProduct } from '@/lib/public-store'
import { ButikTemplate } from '@/components/templates/ButikTemplate'
import { DapurTemplate } from '@/components/templates/DapurTemplate'
import { GlowTemplate } from '@/components/templates/GlowTemplate'
import { LuxeTemplate } from '@/components/templates/LuxeTemplate'
import { HerbaTemplate } from '@/components/templates/HerbaTemplate'

interface PreviewClientProps {
  store: PublicStore
  products: PublicProduct[]
  initialCustomizations: Record<string, string>
  templateId: string
}

export function PreviewClient({ 
  store, 
  products, 
  initialCustomizations, 
  templateId 
}: PreviewClientProps) {
  const [customizations, setCustomizations] = useState(initialCustomizations)

  // Saat iframe selesai mount, beritahu parent (EditorClient) bahwa pratinjau sudah
  // siap menerima data kustomisasi terbaru. Parent akan langsung membalas dengan
  // mengirimkan formData draf terkini via PREVIEW_UPDATE - tanpa reload penuh.
  useEffect(() => {
    window.parent.postMessage({ type: 'PREVIEW_READY' }, window.location.origin)
  }, [])

  // The parent editor owns the form state. This iframe only mirrors updates so
  // the seller sees draft changes immediately without touching the live store.
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return

      if (event.data?.type === 'PREVIEW_UPDATE') {
        setCustomizations(event.data.customizations)
        window.parent.postMessage({ type: 'PREVIEW_ACK', messageId: event.data.messageId }, window.location.origin)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Preview mode is the only place where templates should render data-editable
  // attributes. Public storefront pages must stay free of editor metadata.
  // Render template directly based on templateId
  const renderTemplate = () => {
    const props = { store, products, customizations, previewMode: true }
    
    switch (templateId) {
      case 'dapur': return <DapurTemplate {...props} />
      case 'glow':  return <GlowTemplate {...props} />
      case 'luxe':  return <LuxeTemplate {...props} />
      case 'herba': return <HerbaTemplate {...props} />
      case 'butik':
      default:      return <ButikTemplate {...props} />
    }
  }

  return (
    <div className="preview-container">
      {renderTemplate()}
      <style dangerouslySetInnerHTML={{ __html: `
        body { margin: 0; padding: 0; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-thumb { background: rgba(15, 23, 42, 0.28); border-radius: 999px; }
        ::-webkit-scrollbar-track { background: rgba(148, 163, 184, 0.16); }
      `}} />
    </div>
  )
}
