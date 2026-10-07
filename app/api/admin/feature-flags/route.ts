import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { isPlatformAdmin } from '@/lib/admin-access'

/**
 * API Route: Admin Feature Flags
 * 
 * GET  — Baca semua flags (admin only)
 * PATCH — Toggle flag (admin only)
 * 
 * Setiap toggle wajib insert ke admin_logs
 */

// Helper: Log admin action
async function logAdminAction(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  description: string,
  metadata?: Record<string, unknown>
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  await supabase.from('admin_logs').insert({
    admin_id: adminId,
    action,
    target_type: targetType,
    target_id: targetId,
    description,
    metadata,
  })
}

// GET — Read all feature flags
export async function GET() {
  // 1. Check admin
  const isUserAdmin = await isPlatformAdmin()
  if (!isUserAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // 2. Fetch all flags
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('feature_flags')
    .select('*')
    .order('key')

  if (error) {
    console.error('[Admin API] Error fetching feature flags:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json({ flags: data })
}

// PATCH — Toggle feature flag
export async function PATCH(request: NextRequest) {
  // 1. Check admin
  const isUserAdmin = await isPlatformAdmin()
  if (!isUserAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // 2. Parse body
  const body = await request.json()
  const { key, enabled } = body

  if (!key || typeof enabled !== 'boolean') {
    return NextResponse.json(
      { error: 'Invalid body. Required: key (string), enabled (boolean)' },
      { status: 400 }
    )
  }

  // 3. Get current user for logging
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
  if (!user) {
    return NextResponse.json({ error: 'Session error' }, { status: 401 })
  }

  // 4. Update flag using service role (bypass RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: currentFlag } = await supabase
    .from('feature_flags')
    .select('enabled_globally')
    .eq('key', key)
    .single()

  const previousValue = currentFlag?.enabled_globally ?? false

  const { error: updateError } = await supabase
    .from('feature_flags')
    .update({
      enabled_globally: enabled,
      updated_at: new Date().toISOString(),
    })
    .eq('key', key)

  if (updateError) {
    console.error('[Admin API] Error updating feature flag:', updateError)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  // 5. Log the action
  await logAdminAction(
    user.id,
    'toggle_feature_flag',
    'feature_flag',
    key,
    `Changed ${key} from ${previousValue} to ${enabled}`,
    { key, previousValue, newValue: enabled }
  )

  return NextResponse.json({
    success: true,
    key,
    enabled,
    previousValue,
  })
}
