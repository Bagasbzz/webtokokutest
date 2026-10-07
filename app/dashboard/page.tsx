'use client'

import type React from 'react'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getMyStore } from '@/lib/store'
import { getProducts, Product } from '@/lib/product'
import { getStorefrontDisplayUrl } from '@/lib/storefront-url'
import {
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Loader2,
  Package,
  Palette,
  Plus,
  Settings,
  ShoppingCart,
  Wallet,
  Users,
  MapPin,
  CreditCard,
  Truck,
  TrendingUp,
  Sparkles,
} from 'lucide-react'
import { isProPlan } from '@/lib/plan'
import { UpgradeProButton } from '@/components/plan/UpgradeProButton'
import styles from './page.module.css'

interface DashboardOrder {
  id: string
  order_code: string
  customer_name: string
  total: number
  order_status: string
  created_at: string
}

interface DashboardSummary {
  totalViews: number
  uniqueVisitors: number
  completedRevenue: number
  pendingConfirmation: number
  activeOrders: number
  dailyTrend: { date: string; views: number; sales: number }[]
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  menunggu_pembayaran: 'Menunggu pembayaran',
  menunggu_konfirmasi: 'Perlu konfirmasi',
  diproses: 'Diproses',
  dikirim: 'Dikirim',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
}

// -------------------------------------------------------------
// ANALYTICS & STATS HELPERS
// -------------------------------------------------------------

const EMPTY_SUMMARY: DashboardSummary = {
  totalViews: 0,
  uniqueVisitors: 0,
  completedRevenue: 0,
  pendingConfirmation: 0,
  activeOrders: 0,
  dailyTrend: [],
}

async function loadDashboardSummary(storeId: string): Promise<DashboardSummary> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.rpc('get_store_dashboard_analytics', {
      target_store_id: storeId,
    })
    if (error) throw error

    const summary = (data || {}) as Partial<DashboardSummary>
    return {
      totalViews: Number(summary.totalViews) || 0,
      uniqueVisitors: Number(summary.uniqueVisitors) || 0,
      completedRevenue: Number(summary.completedRevenue) || 0,
      pendingConfirmation: Number(summary.pendingConfirmation) || 0,
      activeOrders: Number(summary.activeOrders) || 0,
      dailyTrend: Array.isArray(summary.dailyTrend)
        ? summary.dailyTrend.map(item => ({
            date: new Date(`${item.date}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
            views: Number(item.views) || 0,
            sales: Number(item.sales) || 0,
          }))
        : [],
    }
  } catch (error) {
    console.warn('Dashboard analytics RPC unavailable, using paginated fallback:', error)
    return loadDashboardSummaryFallback(storeId)
  }
}

async function loadDashboardSummaryFallback(storeId: string): Promise<DashboardSummary> {
  const supabase = createClient()
  const dateLimit = new Date()
  dateLimit.setDate(dateLimit.getDate() - 30)
  const trafficRows: { visitor_id: string; created_at: string }[] = []
  const orderRows: { total: number; order_status: string; created_at: string }[] = []
  const pageSize = 1000

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('store_traffic')
      .select('visitor_id, created_at')
      .eq('store_id', storeId)
      .gte('created_at', dateLimit.toISOString())
      .order('created_at', { ascending: true })
      .range(from, from + pageSize - 1)
    if (error) throw error
    trafficRows.push(...(data || []))
    if (!data || data.length < pageSize) break
  }

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('orders')
      .select('total, order_status, created_at')
      .eq('store_id', storeId)
      .order('created_at', { ascending: true })
      .range(from, from + pageSize - 1)
    if (error) throw error
    orderRows.push(...(data || []))
    if (!data || data.length < pageSize) break
  }

  const dailyTrend = buildDailyTrend(trafficRows, orderRows)
  return {
    totalViews: trafficRows.length,
    uniqueVisitors: new Set(trafficRows.map(row => row.visitor_id)).size,
    completedRevenue: orderRows
      .filter(order => order.order_status === 'selesai')
      .reduce((sum, order) => sum + (Number(order.total) || 0), 0),
    pendingConfirmation: orderRows.filter(order =>
      ['menunggu_pembayaran', 'menunggu_konfirmasi'].includes(order.order_status)
    ).length,
    activeOrders: orderRows.filter(order => order.order_status !== 'dibatalkan').length,
    dailyTrend,
  }
}

function buildDailyTrend(
  trafficRows: { created_at: string }[],
  orderRows: { total: number; order_status: string; created_at: string }[],
) {
  const trend: { date: string; views: number; sales: number }[] = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    trend.push({ date: dateStr, views: 0, sales: 0 })
  }

  for (const item of trafficRows) {
    const dateStr = new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    const found = trend.find(day => day.date === dateStr)
    if (found) found.views++
  }

  for (const item of orderRows) {
    if (item.order_status !== 'selesai') continue
    const dateStr = new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    const found = trend.find(day => day.date === dateStr)
    if (found) found.sales += Number(item.total) || 0
  }

  return trend
}

// -------------------------------------------------------------
// SVG CHART COMPONENT
// -------------------------------------------------------------

function SVGChart({ data }: { data: { date: string; views: number; sales: number }[] }) {
  const maxViews = Math.max(...data.map(d => d.views), 1)
  const maxSales = Math.max(...data.map(d => d.sales), 1)

  const viewsPoints = data.map((d, i) => {
    const x = (i / 6) * 400 + 50
    const y = 140 - (d.views / maxViews) * 100
    return `${x},${y}`
  }).join(' ')

  const salesPoints = data.map((d, i) => {
    const x = (i / 6) * 400 + 50
    const y = 140 - (d.sales / maxSales) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', boxSizing: 'border-box', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Tren Kunjungan & Penjualan</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>Grafik aktivitas toko 7 hari terakhir</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', fontSize: '11px', fontWeight: 700 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#247a52' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#247a52', display: 'inline-block' }} /> Kunjungan ({data.reduce((sum, d) => sum + d.views, 0)})
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} /> Omzet Lunas (Rp {data.reduce((sum, d) => sum + d.sales, 0).toLocaleString('id-ID')})
          </span>
        </div>
      </div>
      
      <svg viewBox="0 0 500 170" width="100%" height="150" style={{ overflow: 'visible' }}>
        {[0, 0.25, 0.5, 0.75, 1].map((val, idx) => (
          <line
            key={idx}
            x1="40"
            y1={140 - val * 100}
            x2="460"
            y2={140 - val * 100}
            stroke="var(--border-color)"
            strokeOpacity="0.5"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}

        <polyline
          fill="none"
          stroke="#247a52"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={viewsPoints}
        />
        {data.map((d, i) => {
          const x = (i / 6) * 400 + 50
          const y = 140 - (d.views / maxViews) * 100
          return (
            <circle
              key={`v-${i}`}
              cx={x}
              cy={y}
              r="4.5"
              fill="var(--bg-surface)"
              stroke="#247a52"
              strokeWidth="2.5"
            >
              <title>{`${d.date}: ${d.views} Kunjungan`}</title>
            </circle>
          )
        })}

        <polyline
          fill="none"
          stroke="#10B981"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={salesPoints}
        />
        {data.map((d, i) => {
          const x = (i / 6) * 400 + 50
          const y = 140 - (d.sales / maxSales) * 100
          return (
            <circle
              key={`s-${i}`}
              cx={x}
              cy={y}
              r="4.5"
              fill="var(--bg-surface)"
              stroke="#10B981"
              strokeWidth="2.5"
            >
              <title>{`${d.date}: Rp ${d.sales.toLocaleString('id-ID')}`}</title>
            </circle>
          )
        })}

        {data.map((d, i) => {
          const x = (i / 6) * 400 + 50
          return (
            <text
              key={`lbl-${i}`}
              x={x}
              y="162"
              fontSize="10"
              fill="var(--text-secondary)"
              fontWeight="600"
              textAnchor="middle"
            >
              {d.date}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

// -------------------------------------------------------------
// MAIN DASHBOARD COMPONENT
// -------------------------------------------------------------

export default function DashboardPage() {
  const [store, setStore] = useState<any>(null)
  const isPro = useMemo(() => isProPlan(store), [store])
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<DashboardOrder[]>([])
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false)
  const [summary, setSummary] = useState<DashboardSummary>(EMPTY_SUMMARY)
  const [loading, setLoading] = useState(true)
  const [appealReason, setAppealReason] = useState('')
  const [appealContext, setAppealContext] = useState('')
  const [appealMessage, setAppealMessage] = useState<string | null>(null)
  const [appealSubmitting, setAppealSubmitting] = useState(false)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const myStore = await getMyStore()
        if (!myStore) return

        setStore(myStore)

        const [productList, orderList, paymentReady, dashboardSummary] = await Promise.all([
          getProducts(myStore.id),
          loadOrders(myStore.id),
          loadPaymentReadiness(myStore.id),
          loadDashboardSummary(myStore.id),
        ])

        setProducts(productList)
        setOrders(orderList)
        setHasPaymentMethod(paymentReady)
        setSummary(dashboardSummary)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const stats = useMemo(() => {
    return {
      revenue: summary.completedRevenue,
      newOrders: summary.pendingConfirmation,
      activeOrders: summary.activeOrders,
      products: products.length,
    }
  }, [products, summary])

  const checklist = useMemo(() => [
    {
      label: 'Profil toko lengkap',
      done: Boolean(store?.nama_toko && store?.deskripsi && store?.no_wa),
      href: '/dashboard/pengaturan',
    },
    {
      label: 'Minimal 1 produk aktif',
      done: products.length > 0,
      href: '/dashboard/produk/tambah',
    },
    {
      label: 'Template sudah siap diedit',
      done: Boolean(store?.template),
      href: '/dashboard/editor',
    },
    {
      label: 'Pembayaran disiapkan',
      done: hasPaymentMethod,
      href: '/dashboard/pengaturan/pembayaran',
    },
  ], [hasPaymentMethod, products.length, store])

  const isModerationVisible = Boolean(store?.moderation_status && store.moderation_status !== 'safe')
  const isModerationLocked = ['pending_review', 'suspended', 'blocked'].includes(store?.moderation_status)

  async function submitAppeal(e: React.FormEvent) {
    e.preventDefault()
    setAppealSubmitting(true)
    setAppealMessage(null)
    try {
      const res = await fetch('/api/moderation/appeals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: appealReason,
          context: appealContext,
          fixed_content: true,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || json.error) throw new Error(json.error || 'Gagal mengirim banding')
      setAppealReason('')
      setAppealContext('')
      setAppealMessage('Banding berhasil dikirim. Admin akan meninjau toko Anda.')
    } catch (err: any) {
      setAppealMessage(err.message || 'Gagal mengirim banding')
    } finally {
      setAppealSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <Loader2 size={32} style={{ color: '#10b981', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <section className={styles.heroPanel}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Dashboard toko</p>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {store?.nama_toko || 'Toko kamu'}
            {isPro ? (
              <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '4px 8px', borderRadius: '20px', background: 'linear-gradient(135deg, #247a52 0%, #145c39 100%)', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', boxShadow: '0 2px 4px rgba(36, 122, 82, 0.2)' }}>
                <Sparkles size={12} style={{ fill: '#fff' }} /> Pro
              </span>
            ) : (
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 8px', borderRadius: '20px', background: 'var(--border-color)', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Gratis
              </span>
            )}
          </h1>
          <p>
            Pantau pesanan, produk, dan statistik pengunjung toko Anda dari satu tempat.
          </p>
          <div className={styles.heroActions}>
            <Link href="/dashboard/editor" className={styles.btnPrimary}>
              <Palette size={16} /> Edit template
            </Link>
            <Link href="/dashboard/produk/tambah" className={styles.btnSecondary}>
              <Plus size={16} /> Tambah produk
            </Link>
            {!isPro && (
              <UpgradeProButton
                store={store}
                className={styles.btnSecondary}
                style={{ background: 'linear-gradient(135deg, #247a52, #145c39)', color: '#fff', borderColor: '#247a52', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Sparkles size={16} /> Upgrade Pro
              </UpgradeProButton>
            )}
            {store?.slug && (
              <Link href={getStorefrontDisplayUrl(store.slug)} target="_blank" className={styles.btnGhost}>
                <ExternalLink size={16} /> Lihat toko
              </Link>
            )}
          </div>
        </div>

        <div className={styles.storeHealth}>
          <div className={styles.healthHeader}>
            <span>Status kesiapan</span>
            <strong>{checklist.filter(item => item.done).length}/{checklist.length}</strong>
          </div>
          <div className={styles.healthList}>
            {checklist.map(item => (
              <Link key={item.label} href={item.href} className={styles.healthItem}>
                <CheckCircle2 size={16} className={item.done ? styles.doneIcon : styles.todoIcon} />
                <span>{item.label}</span>
                <ArrowRight size={14} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {isModerationVisible && (
        <section
          className={styles.card}
          style={{
            border: '1px solid #fde68a',
            background: '#fffbeb',
            padding: 18,
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <AlertCircle size={20} color="#b45309" />
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#92400e' }}>
                Status moderasi toko: {store.moderation_status}
              </h2>
              <p style={{ margin: '6px 0 0', color: '#78350f', fontSize: 13, lineHeight: 1.5 }}>
                {store.moderation_reason || 'Toko Anda sedang ditinjau karena ada konten yang perlu diperiksa.'}
              </p>
              {Array.isArray(store.moderation_matched_terms) && store.moderation_matched_terms.length > 0 && (
                <p style={{ margin: '6px 0 0', color: '#78350f', fontSize: 12 }}>
                  Kata/frasa yang perlu dicek: {store.moderation_matched_terms.slice(0, 5).join(', ')}.
                </p>
              )}
              {store.moderation_admin_note && (
                <p style={{ margin: '6px 0 0', color: '#78350f', fontSize: 12 }}>
                  Catatan admin: {store.moderation_admin_note}
                </p>
              )}

              {isModerationLocked && (
                <form onSubmit={submitAppeal} style={{ marginTop: 14, display: 'grid', gap: 10 }}>
                  <textarea
                    value={appealReason}
                    onChange={e => setAppealReason(e.target.value)}
                    placeholder="Alasan banding, contoh: kata slot yang saya maksud adalah slot rak barang."
                    style={{ minHeight: 70, borderRadius: 8, border: '1px solid #fcd34d', padding: 10 }}
                    required
                  />
                  <textarea
                    value={appealContext}
                    onChange={e => setAppealContext(e.target.value)}
                    placeholder="Konteks tambahan atau bagian yang sudah Anda perbaiki."
                    style={{ minHeight: 60, borderRadius: 8, border: '1px solid #fcd34d', padding: 10 }}
                  />
                  <button
                    type="submit"
                    disabled={appealSubmitting}
                    className={styles.btnPrimary}
                    style={{ width: 'fit-content' }}
                  >
                    {appealSubmitting ? 'Mengirim...' : 'Ajukan banding'}
                  </button>
                  {appealMessage && (
                    <span style={{ fontSize: 12, color: appealMessage.includes('berhasil') ? '#047857' : '#b91c1c' }}>
                      {appealMessage}
                    </span>
                  )}
                </form>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Stats Analitik */}
      <section className={styles.statsGrid}>
        <StatCard icon={<Wallet size={20} />} label="Omzet selesai" value={formatCurrency(stats.revenue)} tone="blue" />
        <StatCard icon={<Users size={20} />} label="Total Kunjungan (30 hari)" value={summary.totalViews.toLocaleString('id-ID')} tone="purple" />
        <StatCard icon={<TrendingUp size={20} />} label="Pengunjung Unik (30 hari)" value={summary.uniqueVisitors.toLocaleString('id-ID')} tone="green" />
        <StatCard icon={<ShoppingCart size={20} />} label="Perlu konfirmasi" value={String(stats.newOrders)} tone="orange" />
      </section>

      {/* SVG Chart Section */}
      {summary.dailyTrend.length > 0 && (
        <section>
          <SVGChart data={summary.dailyTrend} />
        </section>
      )}

      {/* Quick Actions */}
      <section style={{ display: 'grid', gap: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 700 }}>Aksi Cepat</h2>
        <div className={styles.quickActionsGrid}>
          <Link href="/dashboard/produk/tambah" className={styles.quickActionCard}>
            <div className={styles.quickActionIcon}><Plus size={20} /></div>
            <span>Tambah Produk</span>
          </Link>
          <Link href="/dashboard/editor" className={styles.quickActionCard}>
            <div className={styles.quickActionIcon}><Palette size={20} /></div>
            <span>Edit Tampilan</span>
          </Link>
          <Link href="/dashboard/pengaturan/alamat" className={styles.quickActionCard}>
            <div className={styles.quickActionIcon}><MapPin size={20} /></div>
            <span>Atur Alamat</span>
          </Link>
          <Link href="/dashboard/pengaturan/pembayaran" className={styles.quickActionCard}>
            <div className={styles.quickActionIcon}><CreditCard size={20} /></div>
            <span>Metode Bayar</span>
          </Link>
          <Link href="/dashboard/pengaturan/pengiriman" className={styles.quickActionCard}>
            <div className={styles.quickActionIcon}><Truck size={20} /></div>
            <span>Jasa Pengiriman</span>
          </Link>
        </div>
      </section>

      <section className={styles.contentGrid}>
        <div className={styles.panel}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Pesanan terbaru</h2>
              <p className={styles.cardSubtitle}>Prioritaskan order yang butuh konfirmasi.</p>
            </div>
            <Link href="/dashboard/pesanan" className={styles.viewAllLink}>Lihat semua</Link>
          </div>

          {orders.length > 0 ? (
            <div className={styles.orderList}>
              {orders.slice(0, 5).map(order => (
                <Link href="/dashboard/pesanan" key={order.id} className={styles.orderItem}>
                  <div>
                    <strong>{order.order_code}</strong>
                    <span>{order.customer_name || 'Pembeli'}</span>
                  </div>
                  <div className={styles.orderMeta}>
                    <strong>{formatCurrency(order.total)}</strong>
                    <span>{ORDER_STATUS_LABELS[order.order_status] || order.order_status}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Belum ada pesanan"
              desc="Saat pembeli checkout dari website toko, pesanan akan muncul di sini."
              href={store?.slug ? getStorefrontDisplayUrl(store.slug) : '/dashboard/produk'}
              cta={store?.slug ? 'Buka toko publik' : 'Tambah produk dulu'}
            />
          )}
        </div>

        <div className={styles.panel}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Produk terbaru</h2>
              <p className={styles.cardSubtitle}>Pastikan produk punya foto dan harga yang jelas.</p>
            </div>
            <Link href="/dashboard/produk" className={styles.viewAllLink}>Kelola</Link>
          </div>

          {products.length > 0 ? (
            <div className={styles.productList}>
              {products.slice(0, 4).map(product => (
                <Link href={`/dashboard/produk/${product.id}/edit`} key={product.id} className={styles.productItem}>
                  <div className={styles.productThumb}>
                    {product.foto_url ? <img src={product.foto_url} alt={product.nama} /> : <Package size={18} />}
                  </div>
                  <div>
                    <strong>{product.nama}</strong>
                    <span>{formatCurrency(product.harga)}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Katalog masih kosong"
              desc="Tambahkan produk pertama supaya template dan checkout bisa diuji."
              href="/dashboard/produk/tambah"
              cta="Tambah produk"
            />
          )}
        </div>
      </section>

      <section className={styles.tipPanel}>
        <div>
          <Settings size={20} />
          <strong>Urutan kerja</strong>
        </div>
        <p>
          Lengkapi profil toko, tambah 3-5 produk utama, lalu sesuaikan gambar dan teks di Edit Template. Setelah itu bagikan link toko ke pelanggan.
        </p>
      </section>
    </div>
  )
}

async function loadOrders(storeId: string): Promise<DashboardOrder[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('id, order_code, customer_name, total, order_status, created_at')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
    .limit(8)

  if (error) {
    console.error('Error loading dashboard orders:', error)
    return []
  }

  return (data || []) as DashboardOrder[]
}

async function loadPaymentReadiness(storeId: string): Promise<boolean> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('payment_methods')
    .select('id')
    .eq('store_id', storeId)
    .eq('is_active', true)
    .limit(1)

  if (error) {
    console.error('Error loading payment methods:', error)
    return false
  }

  return Boolean(data?.length)
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  tone: 'blue' | 'green' | 'orange' | 'purple'
}) {
  return (
    <div className={styles.statCard}>
      <div className={`${styles.iconWrapper} ${styles[tone]}`}>{icon}</div>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>{value}</p>
    </div>
  )
}

function EmptyState({ title, desc, href, cta }: { title: string; desc: string; href: string; cta: string }) {
  return (
    <div className={styles.emptyState}>
      <h3>{title}</h3>
      <p>{desc}</p>
      <Link href={href} className={styles.emptyAction}>{cta} <ArrowRight size={14} /></Link>
    </div>
  )
}

function formatCurrency(amount: number) {
  return 'Rp ' + (Number(amount) || 0).toLocaleString('id-ID')
}
