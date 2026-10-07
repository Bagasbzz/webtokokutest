'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { adminGuard } from '@/lib/admin-guard'
import { revalidatePath } from 'next/cache'

export type NotificationType = 'info' | 'warning' | 'success' | 'error'

export interface SendNotificationResult {
  success: boolean
  error?: string
  count?: number
}

/**
 * Send notification to a single seller or broadcast to all
 * @param recipientSellerId - null = broadcast to all
 */
export async function sendAdminNotification(
  recipientSellerId: string | null,
  title: string,
  message: string,
  type: NotificationType = 'info',
  linkUrl?: string
): Promise<SendNotificationResult> {
  const { user } = await adminGuard()
  const supabase = createAdminClient()

  try {
    if (recipientSellerId === null) {
      // Broadcast: get all sellers
      const { data: sellers } = await supabase
        .from('sellers')
        .select('id')
        .eq('role', 'seller')

      if (!sellers || sellers.length === 0) {
        return { success: false, error: 'Tidak ada seller yang ditemukan.' }
      }

      const rows = sellers.map(s => ({
        recipient_seller_id: s.id,
        title,
        message,
        type,
        link_url: linkUrl || null,
        created_by: user.id,
      }))

      const { error } = await supabase.from('notifications').insert(rows)
      if (error) return { success: false, error: error.message }

      await supabase.from('admin_logs').insert({
        admin_id: user.id,
        action: 'BROADCAST_NOTIFICATION',
        description: `Broadcast to ${sellers.length} sellers: "${title}"`,
      })

      revalidatePath('/admin')
      return { success: true, count: sellers.length }
    } else {
      // Single notification
      const { error } = await supabase.from('notifications').insert({
        recipient_seller_id: recipientSellerId,
        title,
        message,
        type,
        link_url: linkUrl || null,
        created_by: user.id,
      })

      if (error) return { success: false, error: error.message }

      await supabase.from('admin_logs').insert({
        admin_id: user.id,
        action: 'SEND_NOTIFICATION',
        target_type: 'seller',
        description: `Notif sent to seller ${recipientSellerId}: "${title}"`,
      })

      revalidatePath('/admin')
      return { success: true, count: 1 }
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/**
 * Get platform analytics data for admin overview
 */
export async function getPlatformAnalytics() {
  await adminGuard()
  const supabase = createAdminClient()

  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - 7)
  const monthStart = new Date(now)
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [
    { count: viewsToday },
    { count: viewsWeek },
    { count: viewsMonth },
    { data: recentOrders },
    { data: salesData },
  ] = await Promise.all([
    supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
    supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', weekStart.toISOString()),
    supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', monthStart.toISOString()),
    supabase.from('orders').select('id, store_id, total, order_status, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('orders').select('total, order_status, store_id').gte('created_at', monthStart.toISOString()),
  ])

  const confirmedOrders = (salesData || []).filter(o =>
    ['selesai', 'dikirim', 'dikonfirmasi', 'dikemas'].includes(o.order_status)
  )
  const totalRevenue = confirmedOrders.reduce((acc, o) => acc + (o.total || 0), 0)

  return {
    views: {
      today: viewsToday || 0,
      week: viewsWeek || 0,
      month: viewsMonth || 0,
    },
    recentOrders: recentOrders || [],
    totalRevenue,
    confirmedOrderCount: confirmedOrders.length,
  }
}

/**
 * Get detailed stats for a single seller/user
 */
export async function getSellerDetails(sellerId: string) {
  await adminGuard()
  const supabase = createAdminClient()

  const [
    { data: seller },
    { data: stores },
    { data: orders },
    { data: notifications },
  ] = await Promise.all([
    supabase.from('sellers').select('*').eq('id', sellerId).single(),
    supabase.from('stores').select('id, nama_toko, slug, template, is_active, is_published, plan, plan_expires_at, pro_started_at, pro_notes, created_at').eq('seller_id', sellerId),
    supabase.from('orders').select('id, total, order_status, created_at, store_id').in(
      'store_id',
      (await supabase.from('stores').select('id').eq('seller_id', sellerId)).data?.map(s => s.id) || []
    ).order('created_at', { ascending: false }).limit(20),
    supabase.from('notifications').select('*').eq('recipient_seller_id', sellerId).order('created_at', { ascending: false }).limit(10),
  ])

  const storeIds = (stores || []).map(s => s.id)
  const viewsResult = storeIds.length > 0
    ? await supabase.from('page_views').select('*', { count: 'exact', head: true }).in('store_id', storeIds)
    : { count: 0 }

  const productCount = storeIds.length > 0
    ? (await supabase.from('products').select('*', { count: 'exact', head: true }).in('store_id', storeIds)).count
    : 0

  const allOrders = orders || []
  const confirmedOrders = allOrders.filter(o => ['selesai', 'dikirim', 'dikonfirmasi', 'dikemas'].includes(o.order_status))
  const totalRevenue = confirmedOrders.reduce((acc, o) => acc + (o.total || 0), 0)

  return {
    seller,
    stores: stores || [],
    orders: allOrders,
    notifications: notifications || [],
    stats: {
      totalViews: viewsResult.count || 0,
      totalProducts: productCount || 0,
      totalOrders: allOrders.length,
      confirmedOrders: confirmedOrders.length,
      totalRevenue,
    },
  }
}

/**
 * Get store analytics (traffic + sales)
 */
export async function getStoreAnalytics(storeId: string) {
  await adminGuard()
  const supabase = createAdminClient()

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - 7)
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [
    { count: totalViews },
    { count: weekViews },
    { count: totalOrders },
    { data: orders },
  ] = await Promise.all([
    supabase.from('page_views').select('*', { count: 'exact', head: true }).eq('store_id', storeId),
    supabase.from('page_views').select('*', { count: 'exact', head: true }).eq('store_id', storeId).gte('created_at', weekStart.toISOString()),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('store_id', storeId),
    supabase.from('orders').select('total, order_status').eq('store_id', storeId).gte('created_at', monthStart.toISOString()),
  ])

  const confirmedOrders = (orders || []).filter(o =>
    ['selesai', 'dikirim', 'dikonfirmasi', 'dikemas'].includes(o.order_status)
  )
  const monthRevenue = confirmedOrders.reduce((acc, o) => acc + (o.total || 0), 0)

  return {
    totalViews: totalViews || 0,
    weekViews: weekViews || 0,
    totalOrders: totalOrders || 0,
    monthRevenue,
  }
}

/**
 * Export platform data as JSON (backup)
 */
export async function exportPlatformData(table: 'sellers' | 'stores' | 'products' | 'orders') {
  await adminGuard()
  const supabase = createAdminClient()

  const { data, error } = await supabase.from(table).select('*').limit(5000)
  if (error) throw new Error(error.message)

  return data || []
}
