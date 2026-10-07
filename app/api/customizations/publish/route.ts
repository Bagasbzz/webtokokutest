import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { sanitizeCustomizationEntry } from '@/lib/customization-security'
import {
  customizationModerationInputs,
  isLockedModerationStatus,
  moderateContent,
  moderationPatch,
} from '@/lib/moderation'

/**
 * API Route: Publish Kustomisasi
 * 
 * Alur:
 * 1. Ambil semua baris is_draft = true
 * 2. Simpan snapshot ke template_revisions (Riwayat)
 * 3. Upsert data tersebut ke is_draft = false (Live)
 */

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { store_id } = await req.json()
    if (!store_id) return NextResponse.json({ error: 'store_id diperlukan' }, { status: 400 })

    const { data: seller } = await authClient
      .from('sellers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!seller) {
      return NextResponse.json({ error: 'Data seller tidak ditemukan' }, { status: 403 })
    }

    const { data: ownedStore } = await authClient
      .from('stores')
      .select('id, template, moderation_status')
      .eq('id', store_id)
      .eq('seller_id', seller.id)
      .single()

    if (!ownedStore) {
      return NextResponse.json({ error: 'Anda tidak memiliki akses ke toko ini' }, { status: 403 })
    }

    if (isLockedModerationStatus(ownedStore.moderation_status)) {
      return NextResponse.json({
        error: 'Toko sedang dalam peninjauan moderasi dan belum bisa dipublikasikan ulang.',
      }, { status: 403 })
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Ambil semua data Draft
    const { data: drafts, error: draftError } = await adminClient
      .from('template_customizations')
      .select('section_key, element_key, value')
      .eq('store_id', store_id)
      .eq('is_draft', true)

    if (draftError) throw draftError
    if (!drafts || drafts.length === 0) {
      return NextResponse.json({ error: 'Tidak ada draft untuk dipublikasikan' }, { status: 400 })
    }

    // 2. Buat Snapshot untuk Revisi
    const snapshot: Record<string, string> = {}
    const sanitizedDrafts = []
    for (const r of drafts) {
      const key = `${r.section_key}.${r.element_key}`
      const sanitized = sanitizeCustomizationEntry(key, r.value, ownedStore.template || 'butik')
      if (!sanitized.ok) {
        return NextResponse.json({ error: sanitized.error }, { status: 400 })
      }
      snapshot[key] = sanitized.value
      sanitizedDrafts.push({ ...r, value: sanitized.value })
    }

    const moderation = moderateContent(customizationModerationInputs(snapshot))
    if (moderation.shouldBlockPublish) {
      await adminClient
        .from('stores')
        .update({
          is_published: false,
          ...moderationPatch(moderation),
          updated_at: new Date().toISOString(),
        })
        .eq('id', store_id)

      await adminClient.from('moderation_events').insert({
        store_id,
        user_id: user.id,
        event_type: 'customization_publish_scan',
        risk_level: moderation.level,
        category: moderation.categories[0] || null,
        matched_terms: moderation.matchedTerms,
        reason: moderation.reason,
        action: 'hold_publish',
      })

      return NextResponse.json({
        error: moderation.sellerMessage || 'Konten toko perlu ditinjau sebelum dipublikasikan.',
        moderation: {
          level: moderation.level,
          status: moderation.status,
          matched_terms: moderation.matchedTerms,
        },
      }, { status: 400 })
    }

    // Cari nomor revisi terakhir
    const { data: lastRev } = await adminClient
      .from('template_revisions')
      .select('revision_number')
      .eq('store_id', store_id)
      .order('revision_number', { ascending: false })
      .limit(1)
      .single()

    const nextRevNumber = (lastRev?.revision_number || 0) + 1

    // Simpan ke tabel revisi
    const { error: revisionError } = await adminClient.from('template_revisions').insert({
      store_id,
      revision_number: nextRevNumber,
      snapshot,
      is_auto_save: false
    })

    if (revisionError) throw revisionError

    // 3. Update ke Live (is_draft = false)
    const liveRows = sanitizedDrafts.map(r => ({
      store_id,
      section_key: r.section_key,
      element_key: r.element_key,
      value: r.value,
      is_draft: false,
      updated_at: new Date().toISOString()
    }))

    const { error: liveError } = await adminClient
      .from('template_customizations')
      .upsert(liveRows, {
        onConflict: 'store_id,section_key,element_key,is_draft'
      })

    if (liveError) throw liveError

    // Set store status to published
    const { data: storeData } = await adminClient
      .from('stores')
      .update({
        is_published: true,
        ...moderationPatch(moderation),
        updated_at: new Date().toISOString(),
      })
      .eq('id', store_id)
      .select('slug')
      .single()

    if (storeData?.slug) {
      revalidatePath(`/${storeData.slug}`)
      revalidatePath(`/${storeData.slug}`, 'page')
      revalidatePath(`/${storeData.slug}/produk`)
      revalidatePath(`/dashboard/editor/preview`)
    }

    return NextResponse.json({ 
      success: true, 
      revision_number: nextRevNumber 
    })

  } catch (err: any) {
    console.error('Publish Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
