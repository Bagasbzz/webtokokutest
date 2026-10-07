'use server'

import { revalidatePath } from 'next/cache'
import { adminGuard } from '@/lib/admin-guard'
import { createAdminClient } from '@/lib/supabase/admin'
import type { StorePlan } from '@/lib/types'

type ModerationAdminAction = 'approve' | 'reject' | 'request_edit' | 'suspend' | 'unsuspend' | 'block'

export async function setStorePublished(storeId: string, published: boolean) {
  const { user } = await adminGuard()
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('stores')
    .update({
      is_published: published,
      updated_at: new Date().toISOString(),
    })
    .eq('id', storeId)

  if (error) throw new Error(error.message)

  await supabase.from('admin_logs').insert({
    admin_id: user.id,
    action: published ? 'PUBLISH_STORE' : 'UNPUBLISH_STORE',
    target_type: 'store',
    target_id: storeId,
    description: `Admin ${published ? 'published' : 'unpublished'} store`,
  })

  revalidatePath('/admin')
  revalidatePath('/admin/stores')
}

export async function setStoreActive(storeId: string, active: boolean) {
  const { user } = await adminGuard()
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('stores')
    .update({
      is_active: active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', storeId)

  if (error) throw new Error(error.message)

  await supabase.from('admin_logs').insert({
    admin_id: user.id,
    action: active ? 'ACTIVATE_STORE' : 'SUSPEND_STORE',
    target_type: 'store',
    target_id: storeId,
    description: `Admin ${active ? 'activated' : 'suspended'} store`,
  })

  revalidatePath('/admin')
  revalidatePath('/admin/stores')
}

export async function updateStoreDomain(storeId: string, customDomain: string | null) {
  const { user } = await adminGuard()
  const supabase = createAdminClient()

  // Normalize custom domain to be lowercase and without protocol/www
  const domain = customDomain ? customDomain.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '') : null

  const { error } = await supabase
    .from('stores')
    .update({
      custom_domain: domain,
      updated_at: new Date().toISOString(),
    })
    .eq('id', storeId)

  if (error) throw new Error(error.message)

  await supabase.from('admin_logs').insert({
    admin_id: user.id,
    action: 'UPDATE_STORE_DOMAIN',
    target_type: 'store',
    target_id: storeId,
    description: `Admin updated custom domain to ${domain || 'none'}`,
  })

  revalidatePath('/admin')
  revalidatePath('/admin/stores')
}

export async function updateStorePlan(
  storeId: string,
  plan: StorePlan,
  planExpiresAt?: string | null,
  proNotes?: string | null
) {
  const { user } = await adminGuard()
  const supabase = createAdminClient()

  if (!storeId) throw new Error('Store ID tidak valid')
  if (plan !== 'free' && plan !== 'pro') throw new Error('Plan tidak valid')

  const { data: currentStore, error: currentError } = await supabase
    .from('stores')
    .select('pro_started_at')
    .eq('id', storeId)
    .single()

  if (currentError) throw new Error(currentError.message)

  let normalizedExpiry: string | null = null
  if (plan === 'pro' && planExpiresAt) {
    const expiry = new Date(planExpiresAt)
    if (Number.isNaN(expiry.getTime())) throw new Error('Tanggal expired Pro tidak valid')
    normalizedExpiry = expiry.toISOString()
  }
  const payload = plan === 'pro'
    ? {
        plan,
        plan_expires_at: normalizedExpiry,
        pro_started_at: currentStore?.pro_started_at || new Date().toISOString(),
        pro_notes: proNotes?.trim() || null,
        updated_at: new Date().toISOString(),
      }
    : {
        plan,
        plan_expires_at: null,
        pro_started_at: null,
        pro_notes: proNotes?.trim() || null,
        updated_at: new Date().toISOString(),
      }

  const { error } = await supabase
    .from('stores')
    .update(payload)
    .eq('id', storeId)

  if (error) throw new Error(error.message)

  await supabase.from('admin_logs').insert({
    admin_id: user.id,
    action: plan === 'pro' ? 'UPGRADE_STORE_PRO' : 'DOWNGRADE_STORE_FREE',
    target_type: 'store',
    target_id: storeId,
    description: `Admin changed store plan to ${plan}${normalizedExpiry ? ` until ${normalizedExpiry}` : ''}`,
  })

  revalidatePath('/admin')
  revalidatePath('/admin/stores')
  revalidatePath('/admin694')
}

export async function updateStorePlanForm(formData: FormData) {
  const storeId = String(formData.get('storeId') || '')
  const plan = String(formData.get('plan') || 'free') as StorePlan
  const expiryDate = String(formData.get('plan_expires_at') || '')
  const notes = String(formData.get('pro_notes') || '')

  await updateStorePlan(storeId, plan, expiryDate ? `${expiryDate}T23:59:59.000+07:00` : null, notes || null)
}

export async function reviewStoreModeration(
  storeId: string,
  action: ModerationAdminAction,
  adminNote?: string,
  appealId?: string | null
) {
  const { user } = await adminGuard()
  const supabase = createAdminClient()

  if (!storeId) throw new Error('Store ID tidak valid')

  const note = adminNote?.trim() || null
  const now = new Date().toISOString()
  const storePatch: Record<string, any> = {
    moderation_reviewed_by: user.id,
    moderation_reviewed_at: now,
    moderation_admin_note: note,
    updated_at: now,
  }

  if (action === 'approve' || action === 'unsuspend') {
    storePatch.moderation_status = 'safe'
    storePatch.moderation_reason = null
    storePatch.moderation_score = 0
    storePatch.moderation_matched_terms = []
    storePatch.moderation_categories = []
    storePatch.is_active = true
    storePatch.is_published = true
  } else if (action === 'reject' || action === 'request_edit') {
    storePatch.moderation_status = 'pending_review'
    storePatch.is_published = false
  } else if (action === 'suspend') {
    storePatch.moderation_status = 'suspended'
    storePatch.is_active = false
    storePatch.is_published = false
  } else if (action === 'block') {
    storePatch.moderation_status = 'blocked'
    storePatch.is_active = false
    storePatch.is_published = false
  }

  const { error } = await supabase
    .from('stores')
    .update(storePatch)
    .eq('id', storeId)

  if (error) throw new Error(error.message)

  if (appealId) {
    const appealStatus = action === 'approve' || action === 'unsuspend'
      ? 'approved'
      : action === 'request_edit'
        ? 'request_edit'
        : 'rejected'

    await supabase
      .from('moderation_appeals')
      .update({
        status: appealStatus,
        admin_note: note,
        reviewed_by: user.id,
        reviewed_at: now,
        updated_at: now,
      })
      .eq('id', appealId)
  }

  await supabase.from('moderation_events').insert({
    store_id: storeId,
    user_id: user.id,
    event_type: 'admin_review',
    risk_level: action === 'approve' || action === 'unsuspend' ? 'safe' : 'high',
    category: 'admin moderation',
    matched_terms: [],
    reason: note,
    action,
    reviewed_by: user.id,
    reviewed_at: now,
    admin_note: note,
  })

  await supabase.from('admin_logs').insert({
    admin_id: user.id,
    action: `MODERATION_${action.toUpperCase()}`,
    target_type: 'store',
    target_id: storeId,
    description: `Admin moderation action: ${action}${note ? ` - ${note}` : ''}`,
  })

  revalidatePath('/admin')
  revalidatePath('/admin/stores')
  revalidatePath('/admin694')
}
