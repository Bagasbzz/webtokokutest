import { FREE_PLAN_LIMITS, isProPlan } from '@/lib/plan';
import { createClient } from '@/lib/supabase/client';

/**
 * Middleware utility to enforce plan limits for Free tier.
 * Used in API routes that create or modify products and categories.
 * Throws an Error with a user‑friendly message when the action would exceed limits.
 */
export async function enforcePlanLimits({
  storeId,
  action, // 'addProduct' | 'addCategory'
}: {
  storeId: string;
  action: 'addProduct' | 'addCategory';
}) {
  const supabase = createClient();
  const { data: planData, error: planErr } = await supabase
    .from('stores')
    .select('plan, plan_expires_at')
    .eq('id', storeId)
    .single();

  if (planErr) {
    console.error('Failed to fetch store plan', planErr);
    throw new Error('Tidak dapat memeriksa paket toko');
  }

  // If Pro (or no limit), simply return.
  if (isProPlan(planData)) return;

  // For Free tier we need to count existing items.
  if (action === 'addProduct') {
    const { count, error } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('store_id', storeId)
      .eq('is_active', true);
    if (error) {
      console.error('Count products error', error);
      throw new Error('Tidak dapat menghitung produk');
    }
    if ((count ?? 0) >= FREE_PLAN_LIMITS.products) {
      throw new Error(`Paket Gratis maksimal ${FREE_PLAN_LIMITS.products} produk aktif. Upgrade Pro untuk produk unlimited.`);
    }
  }

  if (action === 'addCategory') {
    const { count, error } = await supabase
      .from('product_categories')
      .select('id', { count: 'exact', head: true })
      .eq('store_id', storeId)
      .eq('is_active', true);
    if (error) {
      console.error('Count categories error', error);
      throw new Error('Tidak dapat menghitung kategori');
    }
    if ((count ?? 0) >= FREE_PLAN_LIMITS.categories) {
      throw new Error(`Paket Gratis maksimal ${FREE_PLAN_LIMITS.categories} kategori aktif. Upgrade Pro untuk kategori unlimited.`);
    }
  }
}
