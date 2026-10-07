import { createClient as createPublicClient } from '@supabase/supabase-js'
import { TEMPLATE_EDITABLES } from './template-editables'
import {
  sanitizeCustomizationEntry,
} from './customization-security'

export type StoreCustomizations = Record<string, string>

/**
 * Fetch published customization data for the public storefront
 * HANYA load rows where is_draft = false
 */
export async function fetchStoreCustomizations(storeId: string): Promise<StoreCustomizations> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return {}
    const supabase = createPublicClient(url, key)

    const { data } = await supabase
      .from('template_customizations')
      .select('section_key, element_key, value')
      .eq('store_id', storeId)
      .eq('is_draft', false)

    const map: StoreCustomizations = {}
    if (data) {
      data.forEach(item => {
        map[`${item.section_key}.${item.element_key}`] = item.value
      })
    }
    return map
  } catch {
    return {}
  }
}

/**
 * Fetch customization data for the Dashboard Editor
 * Logic: Draft > Published
 */
export async function fetchEditorCustomizations(storeId: string): Promise<StoreCustomizations> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return {}
    const supabase = createPublicClient(url, key)

    const { data } = await supabase
      .from('template_customizations')
      .select('section_key, element_key, value, is_draft')
      .eq('store_id', storeId)

    if (!data) return {}

    // Process: group by key, then decide (draft wins)
    const draftMap: Record<string, string> = {}
    const publishedMap: Record<string, string> = {}

    data.forEach(item => {
      const key = `${item.section_key}.${item.element_key}`
      if (item.is_draft) {
        draftMap[key] = item.value
      } else {
        publishedMap[key] = item.value
      }
    })

    // Final merge: Published first, then Draft overwrites
    return { ...publishedMap, ...draftMap }
  } catch {
    return {}
  }
}

/**
 * Merge fetched DB customizations with fallback defaults defined in template-editables.ts
 */
export function mergeWithDefaults(
  customizations: StoreCustomizations, 
  templateId: string,
  storeData: any 
): StoreCustomizations {
  const merged: StoreCustomizations = { ...customizations }
  const templateConfig = TEMPLATE_EDITABLES[templateId] || []

  templateConfig.forEach(field => {
    const key = `${field.section}.${field.element}`
    if (!(key in merged) && field.default_value !== undefined) {
      let defaultVal = field.default_value
      if (storeData?.nama_toko) {
        // Replace placeholder names dari semua template dengan nama toko asli
        const namesToReplace = ['Butik Hana', 'Glow Lab', 'Bazzhealth', 'Luna Beauty', 'Dapur Nusantara']
        for (const placeholder of namesToReplace) {
          if (defaultVal.includes(placeholder)) {
            defaultVal = defaultVal.replace(new RegExp(placeholder, 'g'), storeData.nama_toko)
            break
          }
        }
      }
      merged[key] = defaultVal
    }
  })

  if (storeData) {
    if (!merged['hero.title'] && storeData.hero_title) {
      merged['hero.title'] = storeData.hero_title
    }
    if (!merged['hero.subtitle'] && storeData.hero_subtitle) {
      merged['hero.subtitle'] = storeData.hero_subtitle
    }
    if (!merged['hero.image_url'] && storeData.hero_image_url) {
      merged['hero.image_url'] = storeData.hero_image_url
    }
  }

  return merged
}

/**
 * Upsert Draft customizations to DB
 * This only updates the DRAFT state (is_draft = true)
 */
export async function upsertAllCustomizations(
  storeId: string,
  data: Record<string, string>
): Promise<{ error: string | null }> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return { error: 'Konfigurasi Supabase tidak ditemukan' }
    const supabase = createPublicClient(url, key)

    const rows = []
    for (const [compositeKey, value] of Object.entries(data)) {
      const sanitized = sanitizeCustomizationEntry(compositeKey, value)
      if (!sanitized.ok) {
        return { error: sanitized.error }
      }

      const dotIdx = compositeKey.indexOf('.')
      const section_key = compositeKey.substring(0, dotIdx)
      const element_key = compositeKey.substring(dotIdx + 1)
      rows.push({
        store_id: storeId,
        section_key,
        element_key,
        value: sanitized.value,
        is_draft: true, // Always save as draft from editor
        updated_at: new Date().toISOString(),
      })
    }

    if (rows.length === 0) return { error: null }

    const { error } = await supabase
      .from('template_customizations')
      .upsert(rows, {
        onConflict: 'store_id,section_key,element_key,is_draft',
        ignoreDuplicates: false,
      })

    if (error) return { error: error.message }
    return { error: null }
  } catch (err: any) {
    return { error: err?.message || 'Terjadi kesalahan' }
  }
}
