import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireStoreOwner } from '@/lib/api-auth'
import { getUpgradeWhatsAppUrl } from '@/lib/plan'

/**
 * POST /api/stores/upgrade
 * Body: { storeId: string }
 *
 * Membuat request upgrade dan mengembalikan link WhatsApp.
 * Plan tidak langsung diubah di endpoint seller; aktivasi Pro tetap lewat admin.
 */
export async function POST(request: Request) {
  try {
    const { storeId } = await request.json()
    if (!storeId) {
      return NextResponse.json({ error: 'storeId diperlukan' }, { status: 400 })
    }

    const auth = await requireStoreOwner(storeId)
    if (!auth.ok) return auth.response

    const supabase = createAdminClient()

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, nama_toko, slug, plan, plan_expires_at')
      .eq('id', storeId)
      .single()

    if (storeError || !store) {
      return NextResponse.json({ error: 'Toko tidak ditemukan' }, { status: 404 })
    }

    try {
      await supabase.from('admin_logs').insert({
        admin_id: auth.user.id,
        action: 'REQUEST_UPGRADE_PRO',
        target_type: 'store',
        target_id: storeId,
        description: 'Seller requested Pro upgrade via API',
      })
    } catch (logError) {
      console.warn('Gagal mencatat request upgrade:', logError)
    }

    return NextResponse.json({
      success: true,
      plan: store.plan || 'free',
      whatsappLink: getUpgradeWhatsAppUrl(store),
    })
  } catch (err: any) {
    console.error('Upgrade endpoint error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
