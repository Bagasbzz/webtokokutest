import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireApiAdmin } from '@/lib/api-auth'

/**
 * POST /api/stores/downgrade
 * Body: { storeId: string }
 *
 * Downgrades a store from Pro → Free.
 * Graceful: does NOT delete extra products/categories — they are hidden on the
 * storefront by the existing `applyPublicProductLimit` / `applyPublicCategoryLimit`
 * helpers in lib/plan.ts.
 */
export async function POST(request: Request) {
  try {
    const { storeId } = await request.json()
    if (!storeId) {
      return NextResponse.json({ error: 'storeId diperlukan' }, { status: 400 })
    }

    const auth = await requireApiAdmin()
    if (!auth.ok) return auth.response

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('stores')
      .update({
        plan: 'free',
        plan_expires_at: null,
        pro_started_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', storeId)

    if (error) {
      console.error('Downgrade error:', error)
      return NextResponse.json({ error: 'Gagal downgrade plan' }, { status: 500 })
    }

    // Log the action (non-critical)
    try {
      await supabase.from('admin_logs').insert({
        admin_id: auth.user.id,
        action: 'DOWNGRADE_STORE_FREE',
        target_type: 'store',
        target_id: storeId,
        description: 'Store downgraded to Free via API',
      })
    } catch (logError) {
      console.warn('Gagal mencatat log downgrade:', logError)
    }

    return NextResponse.json({ success: true, plan: 'free' })
  } catch (err: any) {
    console.error('Downgrade endpoint error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
