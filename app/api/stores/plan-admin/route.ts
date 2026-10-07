import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { StorePlan } from '@/lib/types'
import { isProPlan, formatPlanExpiry } from '@/lib/plan'
import { requireApiAdmin } from '@/lib/api-auth'

/**
 * GET  /api/stores/plan-admin?storeId=xxx   → return plan info for a store
 * POST /api/stores/plan-admin               → update plan for a store (super-admin)
 *
 * POST body:
 * {
 *   storeId: string
 *   plan: 'free' | 'pro'
 *   plan_expires_at?: string | null   // ISO date string
 *   pro_notes?: string | null
 * }
 */

export async function GET(request: Request) {
  try {
    const auth = await requireApiAdmin()
    if (!auth.ok) return auth.response

    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')

    if (!storeId) {
      return NextResponse.json({ error: 'storeId diperlukan' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('stores')
      .select('id, nama_toko, slug, plan, plan_expires_at, pro_started_at, pro_notes')
      .eq('id', storeId)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Toko tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({
      ...data,
      effective_plan: isProPlan(data) ? 'pro' : 'free',
      plan_expiry_label: formatPlanExpiry(data.plan_expires_at),
    })
  } catch (err: any) {
    console.error('plan-admin GET error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiAdmin()
    if (!auth.ok) return auth.response

    const body = await request.json()
    const { storeId, plan, plan_expires_at, pro_notes } = body

    if (!storeId) {
      return NextResponse.json({ error: 'storeId diperlukan' }, { status: 400 })
    }

    if (plan !== 'free' && plan !== 'pro') {
      return NextResponse.json({ error: 'Plan harus "free" atau "pro"' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Check current store state
    const { data: currentStore, error: fetchErr } = await supabase
      .from('stores')
      .select('pro_started_at')
      .eq('id', storeId)
      .single()

    if (fetchErr) {
      return NextResponse.json({ error: 'Toko tidak ditemukan' }, { status: 404 })
    }

    // Normalize expiry date
    let normalizedExpiry: string | null = null
    if (plan === 'pro' && plan_expires_at) {
      const d = new Date(plan_expires_at)
      if (!isNaN(d.getTime())) {
        normalizedExpiry = d.toISOString()
      }
    }

    const payload = plan === 'pro'
      ? {
          plan: 'pro' as StorePlan,
          plan_expires_at: normalizedExpiry,
          pro_started_at: currentStore?.pro_started_at || new Date().toISOString(),
          pro_notes: pro_notes?.trim() || null,
          updated_at: new Date().toISOString(),
        }
      : {
          plan: 'free' as StorePlan,
          plan_expires_at: null,
          pro_started_at: null,
          pro_notes: pro_notes?.trim() || null,
          updated_at: new Date().toISOString(),
        }

    const { error } = await supabase
      .from('stores')
      .update(payload)
      .eq('id', storeId)

    if (error) {
      console.error('plan-admin update error:', error)
      return NextResponse.json({ error: 'Gagal update plan' }, { status: 500 })
    }

    // Log the action (non-critical)
    try {
      await supabase.from('admin_logs').insert({
        admin_id: auth.user.id,
        action: plan === 'pro' ? 'UPGRADE_STORE_PRO' : 'DOWNGRADE_STORE_FREE',
        target_type: 'store',
        target_id: storeId,
        description: `Plan changed to ${plan} via API${normalizedExpiry ? ` (expires: ${normalizedExpiry})` : ''}`,
      })
    } catch (logError) {
      console.warn('Gagal mencatat log admin plan:', logError)
    }

    return NextResponse.json({ success: true, plan, plan_expires_at: normalizedExpiry })
  } catch (err: any) {
    console.error('plan-admin POST error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
