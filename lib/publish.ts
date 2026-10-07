import { createClient } from '@/lib/supabase/client'
import { createRevision } from './revisions'
import { sanitizeCustomizationEntry } from './customization-security'

interface CustomizationRow {
  section_key: string
  element_key: string
  value: string
}

/**
 * Publishes the current draft state to the live storefront
 * 1. Takes a full snapshot of the draft
 * 2. Creates a record in template_revisions
 * 3. Overwrites all is_draft=false rows with data from is_draft=true
 */
export async function publishDraft(storeId: string): Promise<{ success: boolean; revisionNumber?: number; error?: string }> {
  const supabase = createClient()

  try {
    // 1. Fetch current draft rows
    const { data: draftRows, error: fetchError } = await supabase
      .from('template_customizations')
      .select('section_key, element_key, value')
      .eq('store_id', storeId)
      .eq('is_draft', true) as { data: CustomizationRow[] | null, error: any }

    if (fetchError) throw fetchError
    if (!draftRows || draftRows.length === 0) {
      return { success: false, error: 'Tidak ada draft untuk dipublikasikan.' }
    }

    // 2. Create snapshot object for revision
    const snapshot: Record<string, string> = {}
    const sanitizedDraftRows = []
    for (const row of draftRows) {
      const key = `${row.section_key}.${row.element_key}`
      const sanitized = sanitizeCustomizationEntry(key, row.value)
      if (!sanitized.ok) throw new Error(sanitized.error)
      snapshot[key] = sanitized.value
      sanitizedDraftRows.push({ ...row, value: sanitized.value })
    }

    // 3. Create revision record (immutable)
    const { data: revision, error: revError } = await createRevision(storeId, snapshot, true)
    if (revError) throw new Error(revError)

    // 4. Update Published State:
    // We'll use a simple approach: Upsert draft data as is_draft=false
    const publishedRows = sanitizedDraftRows.map((row: CustomizationRow) => ({
      store_id: storeId,
      section_key: row.section_key,
      element_key: row.element_key,
      value: row.value,
      is_draft: false,
      updated_at: new Date().toISOString()
    }))

    const { error: upsertError } = await supabase
      .from('template_customizations')
      .upsert(publishedRows, {
        onConflict: 'store_id,section_key,element_key,is_draft'
      })

    if (upsertError) throw upsertError

    // 5. Update store status if needed
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .update({ is_published: true, updated_at: new Date().toISOString() })
      .eq('id', storeId)
      .select('slug')
      .single()

    if (!storeError && store?.slug) {
      try {
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: store.slug })
        })
      } catch (revalErr) {
        console.error('Failed to trigger revalidation:', revalErr)
      }
    }

    return { 
      success: true, 
      revisionNumber: revision?.revision_number 
    }
  } catch (err: any) {
    console.error('Publish error:', err)
    return { success: false, error: err.message || 'Gagal mempublikasikan perubahan.' }
  }
}
