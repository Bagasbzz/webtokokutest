import { createClient } from '@/lib/supabase/client'
import { sanitizeCustomizationEntry } from './customization-security'

export interface TemplateRevision {
  id: string
  store_id: string
  revision_number: number
  snapshot: Record<string, string>
  created_by: string
  created_at: string
  is_published: boolean
}

/**
 * Create a new immutable revision snapshot for a store
 */
export async function createRevision(
  storeId: string,
  snapshot: Record<string, string>,
  isPublished: boolean = false
) {
  const supabase = createClient()
  
  // 1. Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Unauthorized' }

  // 2. Get latest revision number to increment
  const { data: latest } = await supabase
    .from('template_revisions')
    .select('revision_number')
    .eq('store_id', storeId)
    .order('revision_number', { ascending: false })
    .limit(1)
    .single()

  const nextNumber = (latest?.revision_number || 0) + 1

  const sanitizedSnapshot: Record<string, string> = {}
  for (const [key, value] of Object.entries(snapshot)) {
    const sanitized = sanitizeCustomizationEntry(key, value)
    if (!sanitized.ok) return { data: null, error: sanitized.error }
    sanitizedSnapshot[key] = sanitized.value
  }

  // 3. Insert new revision
  const { data, error } = await supabase
    .from('template_revisions')
    .insert({
      store_id: storeId,
      revision_number: nextNumber,
      snapshot: sanitizedSnapshot,
      created_by: user.id,
      is_published: isPublished
    })
    .select()
    .single()

  return { data, error }
}

/**
 * Get the latest revision for a store
 */
export async function getLatestRevision(storeId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('template_revisions')
    .select('*')
    .eq('store_id', storeId)
    .order('revision_number', { ascending: false })
    .limit(1)
    .single()

  return { data, error }
}

/**
 * List all revisions for a store
 */
export async function listRevisions(storeId: string, limit: number = 20) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('template_revisions')
    .select('id, revision_number, created_at, is_published')
    .eq('store_id', storeId)
    .order('revision_number', { ascending: false })
    .limit(limit)

  return { data, error }
}
/**
 * Restore a specific revision's snapshot to the current draft
 * Does NOT publish.
 */
export async function restoreRevisionToDraft(storeId: string, revisionId: string) {
  const supabase = createClient()
  
  // 1. Get the revision snapshot
  const { data: revision, error: fetchError } = await supabase
    .from('template_revisions')
    .select('snapshot')
    .eq('id', revisionId)
    .single()

  if (fetchError || !revision) return { error: 'Gagal mengambil data revisi.' }

  const snapshot = revision.snapshot as Record<string, string>

  // 2. Convert snapshot to template_customizations rows (is_draft = true)
  const rows = []
  for (const [compositeKey, value] of Object.entries(snapshot)) {
    const sanitized = sanitizeCustomizationEntry(compositeKey, value)
    if (!sanitized.ok) return { error: sanitized.error }

    const dotIdx = compositeKey.indexOf('.')
    const section_key = compositeKey.substring(0, dotIdx)
    const element_key = compositeKey.substring(dotIdx + 1)
    rows.push({
      store_id: storeId,
      section_key,
      element_key,
      value: sanitized.value,
      is_draft: true,
      updated_at: new Date().toISOString(),
    })
  }

  // 3. Upsert to draft layer
  const { error: upsertError } = await supabase
    .from('template_customizations')
    .upsert(rows, {
      onConflict: 'store_id,section_key,element_key,is_draft'
    })

  if (upsertError) return { error: upsertError.message }

  return { data: snapshot, error: null }
}
