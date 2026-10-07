import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Customization {
  id?: string;
  store_id: string;
  section_key: string;
  element_key: string;
  value: string;
}

export function useCustomizations(storeId: string | undefined, initialCustomizations?: Record<string, string>) {
  const [customizations, setCustomizations] = useState<Record<string, string>>(initialCustomizations || {})
  const [loading, setLoading] = useState(!initialCustomizations)
  const supabase = createClient()

  useEffect(() => {
    // If we already have initialCustomizations, skip fetching to avoid flash
    if (!storeId || initialCustomizations) {
      setLoading(false)
      return
    }
    
    async function fetchCustomizations() {
      const { data, error } = await supabase
        .from('template_customizations')
        .select('section_key, element_key, value')
        .eq('store_id', storeId)
      
      if (data && !error) {
        const map: Record<string, string> = {}
        data.forEach((item: any) => {
          map[`${item.section_key}.${item.element_key}`] = item.value
        })
        setCustomizations(map)
      }
      setLoading(false)
    }
    
    fetchCustomizations()
  }, [storeId, supabase, initialCustomizations])

  const saveCustomization = async (section: string, element: string, value: string) => {
    if (!storeId) return

    // Optimistic update
    setCustomizations(prev => ({ ...prev, [`${section}.${element}`]: value }))

    const res = await fetch('/api/customizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_id: storeId,
        data: { [`${section}.${element}`]: value },
      }),
    })

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}))
      throw new Error(payload.error || 'Gagal menyimpan kustomisasi')
    }
  }

  return { customizations, loading, saveCustomization }
}
