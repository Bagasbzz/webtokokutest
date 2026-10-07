import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isPlatformAdmin } from '@/lib/admin-access'

/**
 * Feature Flags Keys
 */
export type FeatureKey = 
  | 'auto_shipping'
  | 'formal_region_address'
  | 'setup_wizard'
  | 'visual_editor'
  | 'qris_checkout'
  | 'product_gallery'
  | 'email_verification'
  | 'turnstile_captcha'
  | 'maintenance_mode'

const DEFAULT_FLAGS: Record<FeatureKey, boolean> = {
  auto_shipping: false,
  formal_region_address: false,
  setup_wizard: false,
  visual_editor: false,
  qris_checkout: true,
  product_gallery: true,
  email_verification: true,
  turnstile_captcha: true,
  maintenance_mode: false,
}

/**
 * Cek apakah fitur aktif secara global
 * Digunakan di Server Components / API Routes
 */
export async function isFeatureEnabled(key: FeatureKey): Promise<boolean> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('feature_flags')
      .select('enabled_globally')
      .eq('key', key)
      .single()

    if (error || !data) {
      console.error(`[FeatureFlags] Error checking global flag ${key}:`, error)
      return DEFAULT_FLAGS[key] ?? false
    }

    return data.enabled_globally
  } catch (err) {
    console.error(`[FeatureFlags] Exception checking global flag ${key}:`, err)
    return DEFAULT_FLAGS[key] ?? false
  }
}

/**
 * Cek apakah fitur aktif untuk toko tertentu (override global)
 */
export async function isStoreFeatureEnabled(storeId: string, key: FeatureKey): Promise<boolean> {
  try {
    const supabase = createClient()

    // 1. Cek global dulu
    const globalEnabled = await isFeatureEnabled(key)

    // 2. Cek override di level store
    const { data, error } = await supabase
      .from('store_feature_flags')
      .select('enabled')
      .eq('store_id', storeId)
      .eq('feature_key', key)
      .single()

    // Jika tidak ada override, pakai global
    if (error || !data) {
      return globalEnabled
    }

    return data.enabled
  } catch (err) {
    console.error(`[FeatureFlags] Exception checking store flag ${key}:`, err)
    return DEFAULT_FLAGS[key] ?? false
  }
}

/**
 * Helper untuk mendapatkan semua flags sekaligus (performance)
 */
export async function getAllFeatureFlags(): Promise<Record<FeatureKey, boolean>> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('feature_flags')
      .select('key, enabled_globally')

    if (error || !data) return { ...DEFAULT_FLAGS }

    const flags = { ...DEFAULT_FLAGS }
    data.forEach((curr) => {
      if (curr.key) {
        flags[curr.key as FeatureKey] = curr.enabled_globally
      }
    })
    return flags
  } catch (err) {
    console.error('[FeatureFlags] Exception checking all flags:', err)
    return { ...DEFAULT_FLAGS }
  }
}

/**
 * Cek apakah user saat ini adalah admin
 * Server-side only
 */
export async function isAdmin(): Promise<boolean> {
  return isPlatformAdmin()
}

/**
 * Log aksi admin ke admin_logs
 * Server-side only
 */
export async function logAdminAction(params: {
  action: string
  target_type?: string
  target_id?: string
  description?: string
  metadata?: Record<string, unknown>
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const adminClient = createAdminClient()
  await adminClient.from('admin_logs').insert({
    admin_id: user.id,
    ...params
  })
}

// Cache sederhana — flags tidak berubah sering
let flagCache: Record<string, boolean> = {}
let cacheTime = 0
const CACHE_TTL = 60 * 1000 // 1 menit

/**
 * Ambil semua flags dengan cache (untuk reduce DB calls)
 */
export async function getFeatureFlags(): Promise<Record<string, boolean>> {
  const now = Date.now()
  if (now - cacheTime < CACHE_TTL && Object.keys(flagCache).length > 0) {
    return flagCache
  }

  const flags = await getAllFeatureFlags()
  flagCache = flags
  cacheTime = now
  return flags
}
