import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient as createAuthClient } from '@/lib/supabase/server'
import {
  isLockedModerationStatus,
  type ModerationResult,
  moderateContent,
  moderationPatch,
  productModerationInputs,
  storeModerationInputs,
} from '@/lib/moderation'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

export const runtime = 'nodejs'

function configError() {
  return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
}

function safeModerationResponse(moderation: ModerationResult) {
  const recommendedAction = moderation.level === 'safe'
    ? 'allow'
    : moderation.level === 'low'
      ? 'warn'
      : moderation.level === 'medium'
        ? 'pending_review'
        : 'suspend'

  return {
    level: moderation.level,
    recommendedAction,
    message: moderation.sellerMessage,
    detectedTerms: moderation.matchedTerms.slice(0, 5),
    categoryLabels: moderation.categories.slice(0, 3),
    canContinue: moderation.level === 'safe' || moderation.level === 'low',
    canPublish: !moderation.shouldBlockPublish,
    blocked: moderation.shouldBlockPublish,
  }
}

export async function POST(request: NextRequest) {
  const limited = checkRateLimit(request, {
    key: 'moderation:scan',
    limit: 30,
    windowMs: 10 * 60 * 1000,
  })
  if (!limited.ok) return rateLimitResponse(limited)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) return configError()

  const authClient = createAuthClient()
  const { data: { user }, error: authError } = await authClient.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userLimited = checkRateLimit(request, {
    key: 'moderation:scan:user',
    identifier: user.id,
    limit: 60,
    windowMs: 10 * 60 * 1000,
  })
  if (!userLimited.ok) return rateLimitResponse(userLimited)

  const { storeId, productId } = await request.json().catch(() => ({}))
  if (!storeId && !productId) {
    return NextResponse.json({ error: 'Data moderasi tidak lengkap' }, { status: 400 })
  }

  const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey)
  const { data: seller } = await serviceClient
    .from('sellers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!seller) {
    return NextResponse.json({ error: 'Seller tidak ditemukan' }, { status: 403 })
  }

  if (productId) {
    const { data: product, error: productError } = await serviceClient
      .from('products')
      .select('*, stores!inner(id, seller_id, moderation_status)')
      .eq('id', productId)
      .single()

    if (productError || !product || product.stores?.seller_id !== seller.id) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })
    }

    const moderation = moderateContent(productModerationInputs(product))
    await serviceClient
      .from('products')
      .update({
        ...moderationPatch(moderation),
        updated_at: new Date().toISOString(),
      })
      .eq('id', product.id)

    if (moderation.level !== 'safe') {
      if (moderation.shouldBlockPublish && !isLockedModerationStatus(product.stores?.moderation_status)) {
        await serviceClient
          .from('stores')
          .update({
            is_published: false,
            ...moderationPatch(moderation),
            updated_at: new Date().toISOString(),
          })
          .eq('id', product.store_id)
      }

      await serviceClient.from('moderation_events').insert({
        store_id: product.store_id,
        product_id: product.id,
        event_type: 'product_scan',
        risk_level: moderation.level,
        category: moderation.categories[0] || null,
        matched_terms: moderation.matchedTerms,
        reason: moderation.reason,
        action: moderation.shouldBlockPublish ? 'pending_review' : 'warning',
      })
    }

    return NextResponse.json(safeModerationResponse(moderation))
  }

  const { data: store, error: storeError } = await serviceClient
    .from('stores')
    .select('*')
    .eq('id', storeId)
    .eq('seller_id', seller.id)
    .single()

  if (storeError || !store) {
    return NextResponse.json({ error: 'Toko tidak ditemukan' }, { status: 404 })
  }

  const moderation = moderateContent(storeModerationInputs(store))
  if (!isLockedModerationStatus(store.moderation_status)) {
    await serviceClient
      .from('stores')
      .update({
        ...moderationPatch(moderation),
        ...(moderation.shouldBlockPublish ? { is_published: false } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', store.id)
  }

  if (moderation.level !== 'safe') {
    await serviceClient.from('moderation_events').insert({
      store_id: store.id,
      event_type: 'store_scan',
      risk_level: moderation.level,
      category: moderation.categories[0] || null,
      matched_terms: moderation.matchedTerms,
      reason: moderation.reason,
      action: moderation.shouldBlockPublish ? 'hold_publish' : 'warning',
    })
  }

  return NextResponse.json(safeModerationResponse(moderation))
}
