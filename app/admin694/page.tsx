import React from 'react'
import { adminGuard } from '@/lib/admin-guard'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPlatformAnalytics } from '../admin/actions'
import Admin694Client from './Admin694Client'

export const dynamic = 'force-dynamic'

export default async function SuperAdminPage() {
  await adminGuard()
  const supabase = createAdminClient()

  // Fetch all required data in parallel on the server
  const [
    { data: sellers },
    { data: stores },
    { data: flags },
    { data: logs },
    { data: appeals },
    analytics,
  ] = await Promise.all([
    supabase
      .from('sellers')
      .select('id, nama_lengkap, email, no_wa, role, created_at, stores(id, nama_toko, slug, is_active, is_published, plan, plan_expires_at, pro_started_at, pro_notes, moderation_status, moderation_reason)')
      .order('created_at', { ascending: false })
      .limit(200),
    supabase
      .from('stores')
      .select('id, nama_toko, slug, custom_domain, template, warna_tema, is_active, is_published, plan, plan_expires_at, pro_started_at, pro_notes, created_at, seller_id, moderation_status, moderation_reason, moderation_score, moderation_matched_terms, moderation_categories, moderation_admin_note, sellers(nama_lengkap, email)')
      .order('created_at', { ascending: false })
      .limit(250),
    supabase
      .from('feature_flags')
      .select('*')
      .order('key', { ascending: true }),
    supabase
      .from('admin_logs')
      .select('id, action, description, created_at, target_type, target_id, sellers(nama_lengkap, email)')
      .order('created_at', { ascending: false })
      .limit(80),
    supabase
      .from('moderation_appeals')
      .select('id, store_id, status, reason, context, fixed_content, admin_note, created_at, stores(nama_toko, slug, sellers(nama_lengkap, email))')
      .order('created_at', { ascending: false })
      .limit(50),
    getPlatformAnalytics(),
  ])

  // -------------------------------------------------------------
  // TRAFFIC ANALYTICS COMPILATION
  // -------------------------------------------------------------
  let globalTraffic = { totalViews: 0, uniqueVisitors: 0 }
  let storeTrafficRank: Record<string, { totalViews: number; uniqueVisitors: number; name: string; slug: string }> = {}
  let dailyPlatformTrend: { date: string; views: number }[] = []

  // Inisialisasi data tren harian untuk 7 hari terakhir
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    dailyPlatformTrend.push({ date: dateStr, views: 0 })
  }

  try {
    const dateLimit30 = new Date()
    dateLimit30.setDate(dateLimit30.getDate() - 30)

    const { data: trafficData } = await supabase
      .from('store_traffic')
      .select('store_id, visitor_id, created_at')
      .gte('created_at', dateLimit30.toISOString())
      .order('created_at', { ascending: false })
      .limit(3000)

    if (trafficData) {
      globalTraffic.totalViews = trafficData.length
      const globalUniqueSet = new Set(trafficData.map(t => t.visitor_id))
      globalTraffic.uniqueVisitors = globalUniqueSet.size

      // Kelompokkan traffic per toko & hitung tren harian platform
      trafficData.forEach(item => {
        const itemDate = new Date(item.created_at)
        const dateStr = itemDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
        const foundTrend = dailyPlatformTrend.find(t => t.date === dateStr)
        if (foundTrend) foundTrend.views++

        if (item.store_id) {
          if (!storeTrafficRank[item.store_id]) {
            storeTrafficRank[item.store_id] = { totalViews: 0, uniqueVisitors: 0, name: 'Toko Tidak Dikenal', slug: '' }
          }
          storeTrafficRank[item.store_id].totalViews++
        }
      })

      // Hitung unique visitor per toko
      const visitorStoreMap: Record<string, Set<string>> = {}
      trafficData.forEach(item => {
        if (item.store_id && item.visitor_id) {
          if (!visitorStoreMap[item.store_id]) {
            visitorStoreMap[item.store_id] = new Set()
          }
          visitorStoreMap[item.store_id].add(item.visitor_id)
        }
      })

      Object.keys(visitorStoreMap).forEach(sId => {
        if (storeTrafficRank[sId]) {
          storeTrafficRank[sId].uniqueVisitors = visitorStoreMap[sId].size
        }
      })
    }
  } catch (error) {
    console.warn('Admin page: Failed to fetch store_traffic (it might not exist yet):', error)
  }

  // Lengkapi info nama & slug toko pada tabel peringkat
  if (stores) {
    stores.forEach(s => {
      if (storeTrafficRank[s.id]) {
        storeTrafficRank[s.id].name = s.nama_toko
        storeTrafficRank[s.id].slug = s.slug
      } else {
        storeTrafficRank[s.id] = { totalViews: 0, uniqueVisitors: 0, name: s.nama_toko, slug: s.slug }
      }
    })
  }

  const rankedStores = Object.values(storeTrafficRank).sort((a, b) => b.totalViews - a.totalViews)

  return (
    <Admin694Client
      initialData={{
        sellers: sellers || [],
        stores: stores || [],
        featureFlags: flags || [],
        logs: logs || [],
        moderationAppeals: appeals || [],
        analytics,
        globalTraffic,
        rankedStores,
        dailyPlatformTrend,
      }}
    />
  )
}
