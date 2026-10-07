import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sanitizePlainText } from '@/lib/customization-security'

export const runtime = 'nodejs'

async function getOwnedStore() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, seller: null, store: null }

  const { data: seller } = await supabase
    .from('sellers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!seller) return { supabase, user, seller: null, store: null }

  const { data: store } = await supabase
    .from('stores')
    .select('id, moderation_status')
    .eq('seller_id', seller.id)
    .single()

  return { supabase, user, seller, store }
}

export async function GET() {
  const { supabase, user, seller, store } = await getOwnedStore()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!seller || !store) return NextResponse.json({ error: 'Toko tidak ditemukan' }, { status: 404 })

  const [{ data: appeals }, { data: events }] = await Promise.all([
    supabase
      .from('moderation_appeals')
      .select('id, status, reason, context, fixed_content, admin_note, created_at, updated_at, reviewed_at')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('moderation_events')
      .select('id, event_type, risk_level, category, matched_terms, reason, action, admin_note, created_at')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  return NextResponse.json({ appeals: appeals || [], events: events || [] })
}

export async function POST(request: NextRequest) {
  const { supabase, user, seller, store } = await getOwnedStore()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!seller || !store) return NextResponse.json({ error: 'Toko tidak ditemukan' }, { status: 404 })

  const body = await request.json().catch(() => ({}))
  const reason = sanitizePlainText(body.reason)
  const context = sanitizePlainText(body.context)
  const fixedContent = Boolean(body.fixed_content)

  if (!reason || reason.length < 10) {
    return NextResponse.json({ error: 'Alasan banding minimal 10 karakter.' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('moderation_appeals')
    .select('id')
    .eq('store_id', store.id)
    .in('status', ['submitted', 'under_review'])
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'Masih ada banding yang sedang diproses.' }, { status: 409 })
  }

  const { data, error } = await supabase
    .from('moderation_appeals')
    .insert({
      store_id: store.id,
      seller_id: seller.id,
      user_id: user.id,
      reason,
      context: context || null,
      fixed_content: fixedContent,
    })
    .select('id, status, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabase.from('moderation_events').insert({
    store_id: store.id,
    user_id: user.id,
    event_type: 'appeal_submitted',
    risk_level: 'medium',
    category: 'seller appeal',
    matched_terms: [],
    reason,
    action: 'appeal_submitted',
  })

  return NextResponse.json({ success: true, appeal: data })
}
