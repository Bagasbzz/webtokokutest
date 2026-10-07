'use client'

import React, { useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import {
  Bell, ChevronRight, Database, Flag, History,
  LayoutDashboard, LogOut, Store, Users, Zap,
  Search, ShieldCheck, ShieldMinus, User,
  Mail, Phone, ExternalLink, Eye, Package,
  DollarSign, CheckCircle2, XCircle, Send,
  Loader2, Download, FileJson, Table2, Info, ArrowLeft,
  PauseCircle, PlayCircle, Lock, Trash2, Crown,
  Wifi, BatteryFull, ShoppingCart
} from 'lucide-react'
import { getStorefrontDisplayUrl } from '@/lib/storefront-url'
import { sendAdminNotification, getSellerDetails, exportPlatformData } from '../admin/actions'
import { setSellerRole, deleteUserAccount } from '../admin/users/actions'
import { reviewStoreModeration, setStoreActive, setStorePublished, updateStoreDomain, updateStorePlan } from '../admin/stores/actions'
import { toggleGlobalFeature } from '../admin/feature-flags/actions'
import { quickSetupStore } from '../admin/quick-setup/actions'
import styles from '../admin/admin.module.css'
import { formatPlanExpiry, getEffectivePlan } from '@/lib/plan'
import { TEMPLATES } from '@/lib/templates'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/ToastContainer'

interface Admin694ClientProps {
  initialData: {
    sellers: any[]
    stores: any[]
    featureFlags: any[]
    logs: any[]
    moderationAppeals?: any[]
    analytics: any
    globalTraffic?: { totalViews: number; uniqueVisitors: number }
    rankedStores?: Array<{ totalViews: number; uniqueVisitors: number; name: string; slug: string }>
    dailyPlatformTrend?: Array<{ date: string; views: number }>
  }
}

// -------------------------------------------------------------
// GRAPHIC SVG & RANKING COMPONENT FOR SUPER ADMIN
// -------------------------------------------------------------

function AdminSVGChart({ data }: { data: { date: string; views: number }[] }) {
  const maxViews = Math.max(...data.map(d => d.views), 1)

  const viewsPoints = data.map((d, i) => {
    const x = (i / 6) * 400 + 50
    const y = 140 - (d.views / maxViews) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxSizing: 'border-box', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>Tren Kunjungan Platform</h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0' }}>Lalu lintas platform 7 hari terakhir (Landing page + Storefronts)</p>
        </div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#247a52', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#247a52', display: 'inline-block' }} /> total: {data.reduce((sum, d) => sum + d.views, 0)} views
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
            stroke="#f1f5f9"
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
              fill="#fff"
              stroke="#247a52"
              strokeWidth="2.5"
            >
              <title>{`${d.date}: ${d.views} Kunjungan`}</title>
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
              fill="#94a3b8"
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

function PopularStoresTable({ stores }: { stores: Array<{ totalViews: number; uniqueVisitors: number; name: string; slug: string }> }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>Peringkat Kunjungan Toko (30 Hari)</h3>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', margin: 0 }}>
          <thead>
            <tr style={{ background: '#fafbfd', borderBottom: '1px solid #f1f5f9' }}>
              <th style={{ padding: '12px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textAlign: 'left' }}>Nama Toko</th>
              <th style={{ padding: '12px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textAlign: 'right' }}>Total Kunjungan</th>
              <th style={{ padding: '12px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textAlign: 'right' }}>Pengunjung Unik</th>
            </tr>
          </thead>
          <tbody>
            {stores.slice(0, 10).map((s, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 24px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ display: 'inline-grid', width: '22px', height: '22px', borderRadius: '50%', background: idx === 0 ? '#e8f6ee' : '#f1f5f9', color: idx === 0 ? '#247a52' : '#64748b', placeItems: 'center', fontSize: '10px', fontWeight: 800 }}>
                      {idx + 1}
                    </span>
                    <div>
                      <strong style={{ color: '#0f172a' }}>{s.name}</strong>
                      <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8' }}>/{s.slug}</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 24px', fontSize: '12px', fontWeight: 700, color: '#247a52', textAlign: 'right' }}>
                  {s.totalViews.toLocaleString('id-ID')}
                </td>
                <td style={{ padding: '14px 24px', fontSize: '12px', fontWeight: 700, color: '#059669', textAlign: 'right' }}>
                  {s.uniqueVisitors.toLocaleString('id-ID')}
                </td>
              </tr>
            ))}
            {stores.length === 0 && (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '12px' }}>
                  Belum ada data kunjungan toko.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const MOCK_PREVIEW_PRODUCTS: Record<string, Array<{ name: string; price: number; image: string; tag: string }>> = {
  butik: [
    { name: 'Dress Cantik A-Line', price: 189000, image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=400&auto=format&fit=crop', tag: 'Best Seller' },
    { name: 'Kemeja Linen Premium', price: 145000, image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=400&auto=format&fit=crop', tag: 'New Arrival' },
    { name: 'Hijab Voal Ultrafine', price: 65000, image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=400&auto=format&fit=crop', tag: 'Promo' }
  ],
  dapur: [
    { name: 'Rendang Daging Sapi 250g', price: 85000, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=400&auto=format&fit=crop', tag: 'Menu Utama' },
    { name: 'Rice Bowl Ayam Mentai', price: 35000, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop', tag: 'Terlaris' },
    { name: 'Sambal Bawang Pedas Mantap', price: 25000, image: 'https://images.unsplash.com/photo-1627042633145-b780d842ba45?q=80&w=400&auto=format&fit=crop', tag: 'Varian Sambal' }
  ],
  glow: [
    { name: 'Hydrating Hyaluronic Serum', price: 120000, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop', tag: 'Treatment' },
    { name: 'Gentle Amino Acid Cleanser', price: 79000, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=400&auto=format&fit=crop', tag: 'Daily Care' },
    { name: 'Sunscreen SPF 50 PA++++', price: 95000, image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=400&auto=format&fit=crop', tag: 'Protektor' }
  ],
  luxe: [
    { name: 'Velvet Lip Tint Glossy', price: 89000, image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=400&auto=format&fit=crop', tag: 'Lips' },
    { name: 'Matte Cushion SPF 30', price: 155000, image: 'https://images.unsplash.com/photo-1596462502277-27bfdc40334a?q=80&w=400&auto=format&fit=crop', tag: 'Base Makeup' },
    { name: 'Cheek Blush Shimmer', price: 75000, image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=400&auto=format&fit=crop', tag: 'Eyes' }
  ],
  herba: [
    { name: 'Vitamin C Booster 1000mg', price: 65000, image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=400&auto=format&fit=crop', tag: 'Vitamin' },
    { name: 'Madu Asli Hutan Tropis', price: 125000, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=400&auto=format&fit=crop', tag: 'Herbal' },
    { name: 'Omega-3 Fish Oil 1000mg', price: 180000, image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?q=80&w=900&auto=format&fit=crop', tag: 'Suplemen' }
  ]
}

export default function Admin694Client({ initialData }: Admin694ClientProps) {
  const {
    globalTraffic = { totalViews: 0, uniqueVisitors: 0 },
    rankedStores = [],
    dailyPlatformTrend = [],
  } = initialData as any

  // Tab state: 'overview' | 'users' | 'stores' | 'quick-setup' | 'feature-flags' | 'logs' | 'backup'
  const [activeTab, setActiveTab] = useState<string>('overview')
  const { toasts, toast, dismiss } = useToast()

  // Search & Filter States
  const [searchUser, setSearchUser] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [searchStore, setSearchStore] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')

  // Local sync lists to allow instant UI updates
  const [sellersList, setSellersList] = useState(initialData.sellers)
  const [storesList, setStoresList] = useState(initialData.stores)
  const [flagsList, setFlagsList] = useState(initialData.featureFlags)
  const [logsList, setLogsList] = useState(initialData.logs)
  const [appealsList, setAppealsList] = useState(initialData.moderationAppeals || [])

  // Selected User Detail State (Interactive Side Drawer)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [userDetail, setUserDetail] = useState<any | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // Submitting States
  const [sendingNotifId, setSendingNotifId] = useState<string | null>(null) // specific user id or 'broadcast'
  const [notifForm, setNotifForm] = useState({ title: '', message: '', type: 'info' as any, linkUrl: '' })
  const [isPendingRole, startTransitionRole] = useTransition()
  const [isPendingStore, startTransitionStore] = useTransition()
  const [isPendingModeration, startTransitionModeration] = useTransition()
  const [isPendingFlag, startTransitionFlag] = useTransition()
  const [isDeletingUser, setIsDeletingUser] = useState(false)

  // Seeding/Quick Setup state
  const [quickSetupPending, setQuickSetupPending] = useState(false)
  const [quickSetupMsg, setQuickSetupMsg] = useState<{ success: boolean; text: string } | null>(null)

  // Quick Setup Live States
  const [warnaTema, setWarnaTema] = useState('#10b981')
  const [previewNamaToko, setPreviewNamaToko] = useState('')
  const [previewSlug, setPreviewSlug] = useState('')
  const [previewTemplate, setPreviewTemplate] = useState('butik')
  const [previewDeskripsi, setPreviewDeskripsi] = useState('')
  const [planEditor, setPlanEditor] = useState<{
    storeId: string
    storeName: string
    plan: 'free' | 'pro'
    expiresAt: string
    notes: string
  } | null>(null)

  const isValidHex = (hex: string) => {
    return /^#[0-9A-Fa-f]{6}$/i.test(hex) || /^#[0-9A-Fa-f]{3}$/i.test(hex)
  }

  const handleHexChange = (val: string) => {
    let formatted = val
    if (formatted && !formatted.startsWith('#')) {
      formatted = '#' + formatted
    }
    if (formatted.length > 7) {
      formatted = formatted.substring(0, 7)
    }
    setWarnaTema(formatted)
  }

  const handleColorPickerChange = (val: string) => {
    setWarnaTema(val)
  }

  const handleSlugInput = (val: string) => {
    const lowercase = val.toLowerCase()
    const safe = lowercase.replace(/[^a-z0-9-]/g, '').replace(/\s+/g, '-')
    setPreviewSlug(safe)
  }

  // Backup states
  const [backupPending, setBackupPending] = useState<string | null>(null)
  const [backupExported, setBackupExported] = useState<string[]>([])

  // Load user details when selectedUserId changes
  useEffect(() => {
    if (!selectedUserId) {
      setUserDetail(null)
      return
    }

    const fetchDetail = async () => {
      setLoadingDetail(true)
      try {
        const detail = await getSellerDetails(selectedUserId)
        setUserDetail(detail)
      } catch (err) {
        console.error('Failed to load seller details:', err)
        toast.error('Gagal memuat detail data seller. Silakan coba lagi.')
      } finally {
        setLoadingDetail(false)
      }
    }

    fetchDetail()
  }, [selectedUserId, toast])

  // Handlers
  const handleToggleRole = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === 'admin' ? 'seller' : 'admin'
    if (confirm(`Apakah Anda yakin ingin ${nextRole === 'admin' ? 'mempromosikan user ini menjadi Admin' : 'menurunkan role user ini menjadi Seller'}?`)) {
      startTransitionRole(async () => {
        try {
          await setSellerRole(userId, nextRole)
          // Update local sellersList
          setSellersList(prev => prev.map(u => u.id === userId ? { ...u, role: nextRole } : u))
          // Update selected user detail if open
          if (userDetail && userDetail.seller.id === userId) {
            setUserDetail((prev: any) => prev ? { ...prev, seller: { ...prev.seller, role: nextRole } } : null)
          }
          // Log locally
          const userObj = sellersList.find(u => u.id === userId)
          addLocalLog(
            nextRole === 'admin' ? 'PROMOTE_ADMIN' : 'DEMOTE_SELLER',
            `Admin changed seller role to ${nextRole} for ${userObj?.nama_lengkap || userObj?.email}`,
            'user',
            userId
          )
        } catch (err: any) {
          toast.error(`Gagal merubah role user: ${err.message}`)
        }
      })
    }
  }

  const handleDeleteUser = async (userId: string, email: string, namaLengkap: string) => {
    const confirm1 = confirm(
      `Apakah Anda yakin ingin menghapus akun user "${namaLengkap || '(Tanpa Nama)'}" (${email}) secara permanen?\n\n` +
      `Seluruh data toko, katalog produk, dan transaksi penjualan milik user ini akan DIBERSIHKAN secara permanen dari database.`
    )
    if (!confirm1) return

    const confirm2 = prompt(
      `Aksi ini tidak dapat dibatalkan.\n` +
      `Ketik "HAPUS" (tanpa tanda kutip) untuk mengonfirmasi:`
    )
    if (confirm2 !== 'HAPUS') {
      toast.warning('Konfirmasi salah! Penghapusan akun dibatalkan.')
      return
    }

    setIsDeletingUser(true)
    try {
      const res = await deleteUserAccount(userId)
      if (res.success) {
        toast.success(`Akun user ${namaLengkap || email} berhasil dihapus permanen dari sistem.`)
        
        // Clear selected user state
        setSelectedUserId(null)
        
        // Remove user from local sellers list
        setSellersList(prev => prev.filter(u => u.id !== userId))
        
        // Remove stores owned by the user from local stores list
        setStoresList(prev => prev.filter(s => s.seller_id !== userId))
        
        // Log action locally in the UI
        addLocalLog(
          'DELETE_USER_ACCOUNT',
          `Admin permanently deleted account: ${namaLengkap || email} (${email})`,
          'user',
          userId
        )
      }
    } catch (err: any) {
      toast.error(`Gagal menghapus user: ${err.message}`)
    } finally {
      setIsDeletingUser(false)
    }
  }

  const handleToggleStoreStatus = async (storeId: string, actionType: 'active' | 'published', currentValue: boolean) => {
    const nextValue = !currentValue
    startTransitionStore(async () => {
      try {
        if (actionType === 'active') {
          await setStoreActive(storeId, nextValue)
          setStoresList(prev => prev.map(s => s.id === storeId ? { ...s, is_active: nextValue } : s))
          setSellersList(prev => prev.map(u => {
            const hasStore = u.stores?.some((st: any) => st.id === storeId)
            if (hasStore) {
              return {
                ...u,
                stores: u.stores.map((st: any) => st.id === storeId ? { ...st, is_active: nextValue } : st)
              }
            }
            return u
          }))
          if (userDetail && userDetail.stores?.some((st: any) => st.id === storeId)) {
            setUserDetail((prev: any) => prev ? {
              ...prev,
              stores: prev.stores.map((st: any) => st.id === storeId ? { ...st, is_active: nextValue } : st)
            } : null)
          }
          addLocalLog(
            nextValue ? 'ACTIVATE_STORE' : 'SUSPEND_STORE',
            `Admin ${nextValue ? 'activated' : 'suspended'} store with ID ${storeId}`,
            'store',
            storeId
          )
        } else {
          await setStorePublished(storeId, nextValue)
          setStoresList(prev => prev.map(s => s.id === storeId ? { ...s, is_published: nextValue } : s))
          setSellersList(prev => prev.map(u => {
            const hasStore = u.stores?.some((st: any) => st.id === storeId)
            if (hasStore) {
              return {
                ...u,
                stores: u.stores.map((st: any) => st.id === storeId ? { ...st, is_published: nextValue } : st)
              }
            }
            return u
          }))
          if (userDetail && userDetail.stores?.some((st: any) => st.id === storeId)) {
            setUserDetail((prev: any) => prev ? {
              ...prev,
              stores: prev.stores.map((st: any) => st.id === storeId ? { ...st, is_published: nextValue } : st)
            } : null)
          }
          addLocalLog(
            nextValue ? 'PUBLISH_STORE' : 'UNPUBLISH_STORE',
            `Admin ${nextValue ? 'published' : 'unpublished'} store with ID ${storeId}`,
            'store',
            storeId
          )
        }
      } catch (err: any) {
        toast.error(`Gagal merubah status toko: ${err.message}`)
      }
    })
  }

  const handleModerationAction = (
    storeId: string,
    action: 'approve' | 'reject' | 'request_edit' | 'suspend' | 'unsuspend' | 'block',
    appealId?: string | null
  ) => {
    const note = window.prompt('Catatan admin untuk seller (opsional):') || ''
    startTransitionModeration(async () => {
      try {
        await reviewStoreModeration(storeId, action, note, appealId || null)
        const nextStatus = action === 'approve' || action === 'unsuspend'
          ? 'safe'
          : action === 'request_edit' || action === 'reject'
            ? 'pending_review'
            : action === 'block'
              ? 'blocked'
              : 'suspended'
        const active = action === 'approve' || action === 'unsuspend'
          ? true
          : action === 'suspend' || action === 'block'
            ? false
            : undefined
        const published = action === 'approve' || action === 'unsuspend'
          ? true
          : action === 'reject' || action === 'request_edit' || action === 'suspend' || action === 'block'
            ? false
            : undefined

        setStoresList(prev => prev.map(s => s.id === storeId ? {
          ...s,
          moderation_status: nextStatus,
          moderation_admin_note: note || s.moderation_admin_note,
          ...(active === undefined ? {} : { is_active: active }),
          ...(published === undefined ? {} : { is_published: published }),
        } : s))
        if (appealId) {
          const appealStatus = action === 'approve' || action === 'unsuspend'
            ? 'approved'
            : action === 'request_edit'
              ? 'request_edit'
              : 'rejected'
          setAppealsList(prev => prev.map(a => a.id === appealId ? { ...a, status: appealStatus, admin_note: note } : a))
        }
        addLocalLog('MODERATION_ACTION', `Admin moderation action ${action} for store ${storeId}`, 'store', storeId)
        toast.success('Aksi moderasi berhasil disimpan.')
      } catch (err: any) {
        toast.error(err.message || 'Gagal menjalankan aksi moderasi.')
      }
    })
  }

  const handleSaveCustomDomain = async (storeId: string, customDomain: string | null) => {
    startTransitionStore(async () => {
      try {
        await updateStoreDomain(storeId, customDomain)
        
        // Clean custom domain input
        const domain = customDomain ? customDomain.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '') : null

        setStoresList(prev => prev.map(s => s.id === storeId ? { ...s, custom_domain: domain } : s))
        setSellersList(prev => prev.map(u => {
          const hasStore = u.stores?.some((st: any) => st.id === storeId)
          if (hasStore) {
            return {
              ...u,
              stores: u.stores.map((st: any) => st.id === storeId ? { ...st, custom_domain: domain } : st)
            }
          }
          return u
        }))
        if (userDetail && userDetail.stores?.some((st: any) => st.id === storeId)) {
          setUserDetail((prev: any) => prev ? {
            ...prev,
            stores: prev.stores.map((st: any) => st.id === storeId ? { ...st, custom_domain: domain } : st)
          } : null)
        }
        addLocalLog(
          'UPDATE_STORE_DOMAIN',
          `Admin updated custom domain to ${domain || 'none'} for store ID ${storeId}`,
          'store',
          storeId
        )
        toast.success('Custom domain berhasil disimpan dan diperbarui!')
      } catch (err: any) {
        toast.error(`Gagal menyimpan custom domain: ${err.message}`)
      }
    })
  }

  const openPlanEditor = (store: any, nextPlan?: 'free' | 'pro') => {
    const currentPlan = getEffectivePlan(store)
    setPlanEditor({
      storeId: store.id,
      storeName: store.nama_toko || store.slug || 'Toko',
      plan: nextPlan || currentPlan,
      expiresAt: store.plan_expires_at ? store.plan_expires_at.slice(0, 10) : '',
      notes: store.pro_notes || '',
    })
  }

  const handleSaveStorePlan = async () => {
    if (!planEditor) return
    const { storeId, plan, expiresAt, notes, storeName } = planEditor
    const targetStore = storesList.find(s => s.id === storeId) || userDetail?.stores?.find((s: any) => s.id === storeId)
    startTransitionStore(async () => {
      try {
        const expiryIso = plan === 'pro' && expiresAt ? `${expiresAt}T23:59:59.000+07:00` : null
        await updateStorePlan(storeId, plan, expiryIso, notes)

        const patch = {
          plan,
          plan_expires_at: expiryIso,
          pro_started_at: plan === 'pro' ? (targetStore?.pro_started_at || new Date().toISOString()) : null,
          pro_notes: notes || null,
        }

        setStoresList(prev => prev.map(s => s.id === storeId ? { ...s, ...patch } : s))
        setSellersList(prev => prev.map(u => {
          const hasStore = u.stores?.some((st: any) => st.id === storeId)
          if (!hasStore) return u
          return {
            ...u,
            stores: u.stores.map((st: any) => st.id === storeId ? { ...st, ...patch } : st)
          }
        }))
        if (userDetail?.stores?.some((st: any) => st.id === storeId)) {
          setUserDetail((prev: any) => prev ? {
            ...prev,
            stores: prev.stores.map((st: any) => st.id === storeId ? { ...st, ...patch } : st)
          } : null)
        }
        addLocalLog(
          plan === 'pro' ? 'UPGRADE_STORE_PRO' : 'DOWNGRADE_STORE_FREE',
          `Admin changed store plan to ${plan} for ${storeName || targetStore?.nama_toko || storeId}`,
          'store',
          storeId
        )
        toast.success(`Plan toko berhasil diubah ke ${plan.toUpperCase()}.`)
        setPlanEditor(null)
      } catch (err: any) {
        toast.error(`Gagal mengubah plan toko: ${err.message}`)
      }
    })
  }

  const handleToggleFeatureFlag = async (flagId: string, flagKey: string, currentValue: boolean) => {
    const nextValue = !currentValue
    startTransitionFlag(async () => {
      try {
        await toggleGlobalFeature(flagId, nextValue, flagKey)
        setFlagsList(prev => prev.map(f => f.id === flagId ? { ...f, enabled_globally: nextValue } : f))
        addLocalLog(
          'TOGGLE_FEATURE_FLAG',
          `Admin changed global flag '${flagKey}' to ${nextValue ? 'ENABLED' : 'DISABLED'}`,
          'feature_flag',
          flagId
        )
      } catch (err: any) {
        toast.error(`Gagal mengubah flag fitur global: ${err.message}`)
      }
    })
  }

  const handleSendNotification = async (e: React.FormEvent, recipientId: string | null) => {
    e.preventDefault()
    setSendingNotifId(recipientId || 'broadcast')
    try {
      const res = await sendAdminNotification(
        recipientId,
        notifForm.title,
        notifForm.message,
        notifForm.type,
        notifForm.linkUrl
      )

      if (res.success) {
        toast.success(recipientId ? 'Notifikasi sukses dikirim ke seller!' : `Broadcast notifikasi sukses dikirim ke ${res.count} seller!`)
        setNotifForm({ title: '', message: '', type: 'info', linkUrl: '' })

        // Refetch user detail to update notification logs if relevant
        if (recipientId && selectedUserId === recipientId) {
          const detail = await getSellerDetails(recipientId)
          setUserDetail(detail)
        }

        addLocalLog(
          recipientId ? 'SEND_NOTIFICATION' : 'BROADCAST_NOTIFICATION',
          recipientId ? `Notif sent to seller: "${notifForm.title}"` : `Broadcast sent: "${notifForm.title}"`,
          recipientId ? 'seller' : undefined,
          recipientId || undefined
        )
      } else {
        toast.error(`Gagal mengirim pesan: ${res.error}`)
      }
    } catch (err: any) {
      toast.error(`Terjadi kesalahan sistem saat mengirim: ${err.message}`)
    } finally {
      setSendingNotifId(null)
    }
  }

  const handleQuickSetupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formElement = e.currentTarget
    setQuickSetupPending(true)
    setQuickSetupMsg(null)

    const formData = new FormData(formElement)
    try {
      const res = await quickSetupStore(formData)
      if (res.success) {
        setQuickSetupMsg({
          success: true,
          text: `Sukses! Toko baru /${res.storeSlug} dengan katalog lengkap berhasil dibuat untuk seller ${res.sellerEmail}.`
        })
        formElement.reset()

        // Fetch fresh list of sellers and stores to update client view
        // In clean way: we can just refresh the page or update list. To keep SPA smooth:
        // We'll alert user that layout is dynamic
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setQuickSetupMsg({ success: false, text: res.error || 'Terjadi kesalahan.' })
      }
    } catch (err: any) {
      setQuickSetupMsg({ success: false, text: err.message || 'Gagal membuat toko instan.' })
    } finally {
      setQuickSetupPending(false)
    }
  }

  const handleExportTable = async (table: 'sellers' | 'stores' | 'products' | 'orders') => {
    setBackupPending(table)
    try {
      const data = await exportPlatformData(table)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const timestamp = new Date().toISOString().split('T')[0]
      a.href = url
      a.download = `webtokoku-${table}-${timestamp}.json`
      a.click()
      URL.revokeObjectURL(url)
      setBackupExported(prev => [...prev, table])
      setTimeout(() => setBackupExported(prev => prev.filter(t => t !== table)), 3000)
    } catch (err: any) {
      toast.error(`Gagal melakukan ekspor data tabel ${table}: ${err.message}`)
    } finally {
      setBackupPending(null)
    }
  }

  const handleExportUserDetail = () => {
    if (!userDetail) return
    const payload = {
      timestamp: new Date().toISOString(),
      seller: userDetail.seller,
      stores: userDetail.stores,
      stats: userDetail.stats,
      orders: userDetail.orders,
      notifications: userDetail.notifications
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `webtokoku-seller-${userDetail.seller.nama_lengkap?.replace(/\s+/g, '_') || 'detail'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSaveToLocalStorage = async (table: 'sellers' | 'stores' | 'products' | 'orders') => {
    setBackupPending(`ls-${table}`)
    try {
      const data = await exportPlatformData(table)
      localStorage.setItem(`wt_backup_${table}`, JSON.stringify({ timestamp: new Date().toISOString(), data }))
      toast.success(`Data ${table} berhasil dicadangkan ke Local Storage browser!`)
    } catch (err: any) {
      toast.error(`Gagal mencadangkan data ke Local Storage: ${err.message}`)
    } finally {
      setBackupPending(null)
    }
  }

  // Helper to add mock log to current view locally
  const addLocalLog = (action: string, description: string, targetType?: string, targetId?: string) => {
    const newLog = {
      id: Math.random().toString(),
      action,
      description,
      created_at: new Date().toISOString(),
      target_type: targetType || null,
      target_id: targetId || null,
      sellers: { nama_lengkap: 'Super Admin', email: 'admin@webtokoku.com' }
    }
    setLogsList(prev => [newLog, ...prev])
  }

  // Computed / Filtered Data
  const filteredUsers = sellersList.filter(user => {
    const matchSearch =
      (user.nama_lengkap || '').toLowerCase().includes(searchUser.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchUser.toLowerCase())
    const matchRole = roleFilter === 'all' || user.role === roleFilter
    return matchSearch && matchRole
  })

  const filteredStores = storesList.filter(store => {
    const matchSearch =
      (store.nama_toko || '').toLowerCase().includes(searchStore.toLowerCase()) ||
      (store.slug || '').toLowerCase().includes(searchStore.toLowerCase())

    let matchStatus = true
    if (statusFilter === 'active') matchStatus = store.is_active
    if (statusFilter === 'suspended') matchStatus = !store.is_active
    if (statusFilter === 'published') matchStatus = store.is_published
    if (statusFilter === 'draft') matchStatus = !store.is_published

    const effectivePlan = getEffectivePlan(store)
    const matchPlan = planFilter === 'all' || effectivePlan === planFilter

    return matchSearch && matchStatus && matchPlan
  })

  const adminCount = sellersList.filter(u => u.role === 'admin').length
  const sellerCount = sellersList.filter(u => u.role === 'seller').length

  const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className={styles.shell}>
      {/* SIDEBAR TABS NAVIGATOR */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandMark} style={{ background: '#176b49' }}>
            <Lock size={15} />
          </div>
          <span>WebTokoku Super Admin</span>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navSection}>Navigasi Terpusat</div>
          <button
            onClick={() => setActiveTab('overview')}
            className={`${styles.navLink} ${activeTab === 'overview' ? styles.navLinkActive : ''}`}
            style={{ background: activeTab === 'overview' ? 'rgba(36, 122, 82, 0.14)' : '', color: activeTab === 'overview' ? '#247a52' : '', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}
          >
            <span className={styles.navInner}><LayoutDashboard size={17} /> Ringkasan</span>
            <ChevronRight size={13} />
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`${styles.navLink} ${activeTab === 'users' ? styles.navLinkActive : ''}`}
            style={{ background: activeTab === 'users' ? 'rgba(36, 122, 82, 0.14)' : '', color: activeTab === 'users' ? '#247a52' : '', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}
          >
            <span className={styles.navInner}><Users size={17} /> User & Seller</span>
            <ChevronRight size={13} />
          </button>
          <button
            onClick={() => setActiveTab('stores')}
            className={`${styles.navLink} ${activeTab === 'stores' ? styles.navLinkActive : ''}`}
            style={{ background: activeTab === 'stores' ? 'rgba(36, 122, 82, 0.14)' : '', color: activeTab === 'stores' ? '#247a52' : '', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}
          >
            <span className={styles.navInner}><Store size={17} /> Toko & Plan</span>
            <ChevronRight size={13} />
          </button>

          <div className={styles.navSection}>Sistem & Alat</div>
          <button
            onClick={() => setActiveTab('quick-setup')}
            className={`${styles.navLink} ${activeTab === 'quick-setup' ? styles.navLinkActive : ''}`}
            style={{ background: activeTab === 'quick-setup' ? 'rgba(36, 122, 82, 0.14)' : '', color: activeTab === 'quick-setup' ? '#247a52' : '', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}
          >
            <span className={styles.navInner}><Zap size={17} /> Setup Instan</span>
            <ChevronRight size={13} />
          </button>
          <button
            onClick={() => setActiveTab('feature-flags')}
            className={`${styles.navLink} ${activeTab === 'feature-flags' ? styles.navLinkActive : ''}`}
            style={{ background: activeTab === 'feature-flags' ? 'rgba(36, 122, 82, 0.14)' : '', color: activeTab === 'feature-flags' ? '#247a52' : '', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}
          >
            <span className={styles.navInner}><Flag size={17} /> Feature Flag</span>
            <ChevronRight size={13} />
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`${styles.navLink} ${activeTab === 'logs' ? styles.navLinkActive : ''}`}
            style={{ background: activeTab === 'logs' ? 'rgba(36, 122, 82, 0.14)' : '', color: activeTab === 'logs' ? '#247a52' : '', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}
          >
            <span className={styles.navInner}><History size={17} /> Audit Log</span>
            <ChevronRight size={13} />
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`${styles.navLink} ${activeTab === 'backup' ? styles.navLinkActive : ''}`}
            style={{ background: activeTab === 'backup' ? 'rgba(36, 122, 82, 0.14)' : '', color: activeTab === 'backup' ? '#247a52' : '', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}
          >
            <span className={styles.navInner}><Database size={17} /> Backup & Broadcast</span>
            <ChevronRight size={13} />
          </button>
        </nav>

        <div className={styles.backWrap}>
          <Link href="/dashboard" className={styles.backLink}>
            <span className={styles.navInner}><LogOut size={17} /> Dashboard Seller</span>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={styles.content}>
        {/* ==========================================
            TAB: OVERVIEW
            ========================================== */}
        {activeTab === 'overview' && (
          <div className={styles.page}>
            <header className={styles.pageHeader}>
              <div>
                <h1 className={styles.pageTitle}>Dashboard Super Admin</h1>
                <p className={styles.pageSubtitle}>Semua fitur kontrol platform WebTokoku dalam satu genggaman di `/admin694`.</p>
              </div>
            </header>

            {/* METRICS */}
            <section className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon} style={{ background: '#e8f6ee', color: '#247a52' }}><Eye size={18} /></div>
                <div className={styles.metricBody}>
                  <p className={styles.metricLabel}>Hari Ini</p>
                  <p className={styles.metricValue} style={{ color: '#247a52' }}>{initialData.analytics.views.today || 0}</p>
                  <p className={styles.metricSub}>Kunjungan Toko</p>
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon} style={{ background: '#e8f6ee', color: '#247a52' }}><Eye size={18} /></div>
                <div className={styles.metricBody}>
                  <p className={styles.metricLabel}>7 Hari Terakhir</p>
                  <p className={styles.metricValue} style={{ color: '#247a52' }}>{initialData.analytics.views.week || 0}</p>
                  <p className={styles.metricSub}>Total Kunjungan</p>
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon} style={{ background: '#f0fdf4', color: '#247a52' }}><Eye size={18} /></div>
                <div className={styles.metricBody}>
                  <p className={styles.metricLabel}>Platform Views (30 hari)</p>
                  <p className={styles.metricValue} style={{ color: '#247a52' }}>{globalTraffic.totalViews}</p>
                  <p className={styles.metricSub}>{globalTraffic.uniqueVisitors} Unique Visitors</p>
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon} style={{ background: '#ecfdf5', color: '#059669' }}><DollarSign size={18} /></div>
                <div className={styles.metricBody}>
                  <p className={styles.metricLabel}>Omzet Bulan Ini</p>
                  <p className={styles.metricValue} style={{ color: '#059669', fontSize: '1.4rem' }}>Rp {(initialData.analytics.totalRevenue || 0).toLocaleString('id-ID')}</p>
                  <p className={styles.metricSub}>{initialData.analytics.confirmedOrderCount} pesanan selesai</p>
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon} style={{ background: '#edf8f1', color: '#1f7a4d' }}><Store size={18} /></div>
                <div className={styles.metricBody}>
                  <p className={styles.metricLabel}>Total Toko</p>
                  <p className={styles.metricValue} style={{ color: '#1f7a4d' }}>{storesList.length}</p>
                  <p className={styles.metricSub}>{storesList.filter(s => s.is_active).length} Toko Aktif</p>
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon} style={{ background: '#e8f6ee', color: '#145c39' }}><Crown size={18} /></div>
                <div className={styles.metricBody}>
                  <p className={styles.metricLabel}>Toko Pro</p>
                  <p className={styles.metricValue} style={{ color: '#145c39' }}>{storesList.filter(s => getEffectivePlan(s) === 'pro').length}</p>
                  <p className={styles.metricSub}>{storesList.filter(s => getEffectivePlan(s) === 'free').length} toko Free</p>
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon} style={{ background: '#e8f6ee', color: '#247a52' }}><Users size={18} /></div>
                <div className={styles.metricBody}>
                  <p className={styles.metricLabel}>Total Users</p>
                  <p className={styles.metricValue} style={{ color: '#247a52' }}>{sellersList.length}</p>
                  <p className={styles.metricSub}>{adminCount} Admin, {sellerCount} Seller</p>
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon} style={{ background: '#fef2f2', color: '#dc2626' }}><Zap size={18} /></div>
                <div className={styles.metricBody}>
                  <p className={styles.metricLabel}>Setup Cepat</p>
                  <p className={styles.metricValue} style={{ color: '#dc2626', fontSize: '1.2rem' }}>1-Klik</p>
                  <p className={styles.metricSub}>Buat Toko Demo Instan</p>
                </div>
              </div>
            </section>

            <div className={styles.grid2}>
              {/* PLATFORM QUICK SHORTCUTS */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Pintasan Aksi Terpusat</h2>
                </div>
                <div className={styles.shortcutGrid} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                  <button onClick={() => setActiveTab('users')} className={styles.shortcut} style={{ border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
                    <div className={styles.shortcutIcon} style={{ background: '#e8f6ee', color: '#247a52' }}><Users size={18} /></div>
                    <strong>Kelola Users & Role</strong>
                    <span>Lihat detail omzet per seller, ubah role admin, kirim notif personal, & backup data user.</span>
                  </button>
                  <button onClick={() => setActiveTab('stores')} className={styles.shortcut} style={{ border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
                    <div className={styles.shortcutIcon} style={{ background: '#edf8f1', color: '#1f7a4d' }}><Store size={18} /></div>
                    <strong>Kelola Status Toko</strong>
                    <span>Aktifkan/Suspend dan Publish/Unpublish toko-toko di platform.</span>
                  </button>
                  <button onClick={() => setActiveTab('quick-setup')} className={styles.shortcut} style={{ border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
                    <div className={styles.shortcutIcon} style={{ background: '#e8f6ee', color: '#247a52' }}><Zap size={18} /></div>
                    <strong>Setup Toko Instan</strong>
                    <span>Buat dummy seller & toko estetik instan beserta data produk lengkap untuk pengujian.</span>
                  </button>
                  <button onClick={() => setActiveTab('backup')} className={styles.shortcut} style={{ border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
                    <div className={styles.shortcutIcon} style={{ background: '#ecfdf5', color: '#059669' }}><Database size={18} /></div>
                    <strong>Backup & Notif Global</strong>
                    <span>Download data backup seluruh platform & kirim broadcast notifikasi massal ke semua seller.</span>
                  </button>
                </div>
              </div>

              {/* RECENT PLATFORM ORDERS */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Pesanan Terbaru (Platform)</h2>
                </div>
                <div className={styles.cardBody}>
                  {initialData.analytics.recentOrders.length > 0 ? (
                    <div className={styles.list}>
                      {initialData.analytics.recentOrders.map((order: any) => {
                        const targetStore = storesList.find(s => s.id === order.store_id)
                        return (
                          <div key={order.id} className={styles.listItem}>
                            <div>
                              <strong style={{ fontSize: 13 }}>ID Pesanan: {order.id.slice(0, 8)}</strong>
                              <span style={{ fontSize: 12, color: '#64748b' }}>Toko: {targetStore?.nama_toko || 'Toko tidak dikenal'} (/{targetStore?.slug})</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', marginTop: 2 }}>Rp {(order.total || 0).toLocaleString('id-ID')}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                              <span className={`${styles.badge} ${['selesai', 'dikonfirmasi', 'dikirim'].includes(order.order_status) ? styles.badgeOn : styles.badgeOff}`} style={{ fontSize: 10 }}>
                                {order.order_status?.toUpperCase()}
                              </span>
                              <span style={{ fontSize: 10, color: '#94a3b8' }}>{formatDate(order.created_at)}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className={styles.empty}>Belum ada transaksi di platform.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Platform Traffic Analytics Section */}
            {dailyPlatformTrend.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <AdminSVGChart data={dailyPlatformTrend} />
              </div>
            )}

            {/* Popular Stores Ranking Table Section */}
            {rankedStores.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <PopularStoresTable stores={rankedStores} />
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            TAB: USERS & SELLERS (CONSOLIDATED INTERACTIVE VIEW)
            ========================================== */}
        {activeTab === 'users' && (
          <div className={styles.page}>
            <header className={styles.pageHeader}>
              <div>
                <h1 className={styles.pageTitle}>Kelola Users & Sellers</h1>
                <p className={styles.pageSubtitle}>Total terdaftar: <strong>{sellersList.length}</strong> pengguna &mdash; <strong>{adminCount}</strong> admin, <strong>{sellerCount}</strong> seller</p>
              </div>
            </header>

            {/* SPLIT SCREEN LAYOUT */}
            <div style={{ display: 'grid', gridTemplateColumns: selectedUserId ? '1.2fr 1.3fr' : '1fr', gap: '20px', alignItems: 'start', transition: 'all 0.3s' }}>
              
              {/* LEFT COLUMN: USERS LIST */}
              <div className={styles.card} style={{ minWidth: 0 }}>
                {/* Search & Filter Header */}
                <div style={{ display: 'flex', gap: 10, padding: 16, background: '#fafbfd', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: 13, color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="Cari nama atau email..."
                      value={searchUser}
                      onChange={e => setSearchUser(e.target.value)}
                      className={styles.inputField}
                      style={{ paddingLeft: 36 }}
                    />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)}
                    className={styles.selectField}
                    style={{ width: '130px', padding: '10px' }}
                  >
                    <option value="all">Semua Role</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table className={styles.table} style={{ width: '100%', minWidth: '500px' }}>
                    <thead>
                      <tr>
                        <th>Seller</th>
                        <th>Toko</th>
                        <th>Role</th>
                        <th>Gabung</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => {
                        const store = Array.isArray(user.stores) ? user.stores[0] : user.stores
                        const isSelected = selectedUserId === user.id

                        return (
                          <tr
                            key={user.id}
                            onClick={() => setSelectedUserId(user.id === selectedUserId ? null : user.id)}
                            style={{
                              cursor: 'pointer',
                              background: isSelected ? '#fffbeb' : '',
                              borderLeft: isSelected ? '4px solid #247a52' : 'none'
                            }}
                          >
                            <td>
                              <strong style={{ color: '#0f172a', display: 'block', fontSize: 13 }}>{user.nama_lengkap || '(Tanpa Nama)'}</strong>
                              <span className={styles.tableHint}>{user.email}</span>
                            </td>
                            <td>
                              {store ? (
                                <div>
                                  <span style={{ fontSize: 12, fontWeight: 700, color: '#247a52' }}>{store.nama_toko}</span>
                                  <span className={styles.tableHint}>/{store.slug}</span>
                                </div>
                              ) : (
                                <span className={styles.muted} style={{ fontSize: 11 }}>Belum buat toko</span>
                              )}
                            </td>
                            <td>
                              <span className={`${styles.badge} ${user.role === 'admin' ? styles.badgeOn : styles.badgeOff}`} style={{ fontSize: 10 }}>
                                {user.role === 'admin' && <ShieldCheck size={10} />} {user.role}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: 11 }}>{formatDate(user.created_at)}</span>
                            </td>
                          </tr>
                        )
                      })}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={4} className={styles.empty}>Tidak ada user yang cocok dengan pencarian.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* RIGHT COLUMN: INTERACTIVE DETAILS */}
              <div style={{ position: 'sticky', top: '20px' }}>
                {!selectedUserId ? (
                  <div className={styles.card} style={{ padding: 40, textAlign: 'center', background: '#fafbfd', border: '2px dashed #cbd5e1' }}>
                    <Users size={48} style={{ color: '#cbd5e1', margin: '0 auto 16px' }} />
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#475569', marginBottom: 8 }}>Pilih Seller Untuk Aksi Terpadu</h3>
                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, maxWidth: 300, margin: '0 auto' }}>
                      Klik pada salah satu baris seller di tabel sebelah kiri untuk membuka detail statistik toko, kelola role, kirim notifikasi langsung, dan ekspor data backup user.
                    </p>
                  </div>
                ) : loadingDetail ? (
                  <div className={styles.card} style={{ padding: 60, textAlign: 'center' }}>
                    <Loader2 size={36} className="animate-spin" style={{ color: '#247a52', margin: '0 auto 16px' }} />
                    <p style={{ fontSize: 14, color: '#64748b' }}>Memuat data lengkap seller...</p>
                  </div>
                ) : userDetail ? (
                  <div className={styles.page} style={{ gap: 16 }}>
                    {/* Header Panel */}
                    <div className={styles.card} style={{ padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <h2 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>{userDetail.seller.nama_lengkap || '(Tanpa Nama)'}</h2>
                          <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>Terdaftar sejak: {formatDate(userDetail.seller.created_at)}</p>
                        </div>
                        <button
                          onClick={() => setSelectedUserId(null)}
                          className={styles.actionButton}
                          style={{ minHeight: 28, padding: '4px 10px', fontSize: 11 }}
                        >
                          Tutup detail
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className={`${styles.badge} ${userDetail.seller.role === 'admin' ? styles.badgeOn : styles.badgeOff}`} style={{ fontSize: 11 }}>
                          {userDetail.seller.role === 'admin' && <ShieldCheck size={12} />} {userDetail.seller.role?.toUpperCase()}
                        </span>
                        
                        {/* Promote/Demote Role */}
                        <button
                          disabled={isPendingRole}
                          onClick={() => handleToggleRole(userDetail.seller.id, userDetail.seller.role)}
                          className={`${styles.actionButton} ${userDetail.seller.role === 'admin' ? styles.dangerButton : ''}`}
                          style={{ minHeight: 28, padding: '4px 10px', fontSize: 11 }}
                        >
                          {isPendingRole ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : userDetail.seller.role === 'admin' ? (
                            <><ShieldMinus size={12} /> Demote ke Seller</>
                          ) : (
                            <><ShieldCheck size={12} /> Promote ke Admin</>
                          )}
                        </button>

                        {/* Export User Data */}
                        <button
                          onClick={handleExportUserDetail}
                          className={styles.actionButton}
                          style={{ minHeight: 28, padding: '4px 10px', fontSize: 11, borderColor: '#1f7a4d', color: '#1f7a4d' }}
                        >
                          <Download size={12} /> Ekspor Data Seller
                        </button>

                        {/* Delete User Account */}
                        <button
                          disabled={isDeletingUser}
                          onClick={() => handleDeleteUser(userDetail.seller.id, userDetail.seller.email, userDetail.seller.nama_lengkap)}
                          className={`${styles.actionButton} ${styles.dangerButton}`}
                          style={{
                            minHeight: 28,
                            padding: '4px 10px',
                            fontSize: 11,
                            background: '#ef4444',
                            color: '#ffffff',
                            borderColor: '#ef4444',
                          }}
                        >
                          {isDeletingUser ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <><Trash2 size={12} /> Hapus Akun Permanen</>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* METRICS ROW */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                      <div className={styles.metricCard} style={{ padding: 12, gap: 8, flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <Store size={16} color="#247a52" />
                        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8' }}>Toko</span>
                        <strong style={{ fontSize: 18, color: '#247a52', lineHeight: 1 }}>{userDetail.stores.length}</strong>
                      </div>
                      <div className={styles.metricCard} style={{ padding: 12, gap: 8, flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <Eye size={16} color="#1f7a4d" />
                        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8' }}>Views</span>
                        <strong style={{ fontSize: 18, color: '#1f7a4d', lineHeight: 1 }}>{userDetail.stats.totalViews}</strong>
                      </div>
                      <div className={styles.metricCard} style={{ padding: 12, gap: 8, flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <Package size={16} color="#247a52" />
                        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8' }}>Produk</span>
                        <strong style={{ fontSize: 18, color: '#247a52', lineHeight: 1 }}>{userDetail.stats.totalProducts}</strong>
                      </div>
                      <div className={styles.metricCard} style={{ padding: 12, gap: 8, flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <DollarSign size={16} color="#247a52" />
                        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8' }}>Revenue</span>
                        <strong style={{ fontSize: 13, color: '#247a52', lineHeight: 1, whiteSpace: 'nowrap' }}>Rp {userDetail.stats.totalRevenue > 1000 ? `${(userDetail.stats.totalRevenue/1000).toFixed(0)}k` : userDetail.stats.totalRevenue}</strong>
                      </div>
                    </div>

                    {/* PROFILE INFO & STORES */}
                    <div className={styles.card} style={{ padding: 16 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 800, borderBottom: '1px solid #f1f5f9', paddingBottom: 6, marginBottom: 10 }}>Profil & Kontak</h3>
                      <div className={styles.list} style={{ gap: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                          <span style={{ color: '#64748b' }}>Email:</span>
                          <strong style={{ color: '#0f172a' }}>{userDetail.seller.email}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                          <span style={{ color: '#64748b' }}>WhatsApp:</span>
                          {userDetail.seller.no_wa ? (
                            <a
                              href={`https://wa.me/${userDetail.seller.no_wa}`}
                              target="_blank"
                              rel="noreferrer"
                              className={styles.inlineLink}
                              style={{ fontSize: 12 }}
                            >
                              {userDetail.seller.no_wa}
                            </a>
                          ) : (
                            <strong style={{ color: '#94a3b8' }}>-</strong>
                          )}
                        </div>
                      </div>

                      <h3 style={{ fontSize: 13, fontWeight: 800, borderBottom: '1px solid #f1f5f9', paddingBottom: 6, marginTop: 16, marginBottom: 10 }}>Toko Dimiliki</h3>
                      {userDetail.stores.length > 0 ? (
                        <div className={styles.list} style={{ gap: 6 }}>
                          {userDetail.stores.map((store: any) => (
                            <div key={store.id} className={styles.listItem} style={{ padding: '8px 10px', borderRadius: 8 }}>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <Link
                                  href={getStorefrontDisplayUrl(store.slug)}
                                  target="_blank"
                                  className={styles.inlineLink}
                                  style={{ fontSize: 13, fontWeight: 700 }}
                                >
                                  {store.nama_toko} <ExternalLink size={11} />
                                </Link>
                                <span style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>/{store.slug} &bull; template: {store.template}</span>
                                <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                  <span className={`${styles.badge} ${getEffectivePlan(store) === 'pro' ? styles.badgeOn : styles.badgeOff}`} style={{ fontSize: 9 }}>
                                    {getEffectivePlan(store) === 'pro' ? 'Pro' : 'Free'}
                                  </span>
                                  <span style={{ fontSize: 10, color: '#64748b' }}>Expired: {formatPlanExpiry(store.plan_expires_at)}</span>
                                </div>
                                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <input
                                    type="text"
                                    placeholder="Custom Domain (e.g. toko.id)"
                                    defaultValue={store.custom_domain || ''}
                                    id={`custom-domain-${store.id}`}
                                    style={{
                                      fontSize: 10,
                                      padding: '2px 4px',
                                      borderRadius: 4,
                                      border: '1px solid #cbd5e1',
                                      width: '100%',
                                      outline: 'none',
                                      backgroundColor: '#fff',
                                      color: '#334155'
                                    }}
                                  />
                                  <button
                                    disabled={isPendingStore}
                                    onClick={() => {
                                      const inputVal = (document.getElementById(`custom-domain-${store.id}`) as HTMLInputElement)?.value
                                      handleSaveCustomDomain(store.id, inputVal || null)
                                    }}
                                    className={styles.badge}
                                    style={{
                                      fontSize: 9,
                                      padding: '3px 6px',
                                      cursor: 'pointer',
                                      border: 'none',
                                      backgroundColor: '#247a52',
                                      color: '#000',
                                      fontWeight: 600
                                    }}
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-end' }}>
                                <button
                                  disabled={isPendingStore}
                                  onClick={() => openPlanEditor(store, getEffectivePlan(store) === 'pro' ? 'free' : 'pro')}
                                  className={`${styles.badge} ${getEffectivePlan(store) === 'pro' ? styles.badgeOff : styles.badgeOn}`}
                                  style={{ fontSize: 9, cursor: 'pointer', border: 'none' }}
                                  title="Klik untuk ubah Free/Pro"
                                >
                                  {getEffectivePlan(store) === 'pro' ? 'Downgrade' : 'Upgrade Pro'}
                                </button>
                                <button
                                  disabled={isPendingStore}
                                  onClick={() => handleToggleStoreStatus(store.id, 'active', store.is_active)}
                                  className={`${styles.badge} ${store.is_active ? styles.badgeOn : styles.badgeOff}`}
                                  style={{ fontSize: 9, cursor: 'pointer', border: 'none' }}
                                  title="Klik untuk Suspend/Aktifkan"
                                >
                                  {store.is_active ? 'Active' : 'Suspended'}
                                </button>
                                <button
                                  disabled={isPendingStore}
                                  onClick={() => handleToggleStoreStatus(store.id, 'published', store.is_published)}
                                  className={`${styles.badge} ${store.is_published ? styles.badgeOn : styles.badgeOff}`}
                                  style={{ fontSize: 9, cursor: 'pointer', border: 'none' }}
                                  title="Klik untuk Publish/Unpublish"
                                >
                                  {store.is_published ? 'Published' : 'Draft'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Belum membuat toko.</p>
                      )}
                    </div>

                    {/* DIRECT NOTIFICATION DISPATCHER */}
                    <div className={styles.card} style={{ padding: 16 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 800, borderBottom: '1px solid #f1f5f9', paddingBottom: 6, marginBottom: 12 }}>Kirim Notifikasi Langsung</h3>
                      <form onSubmit={(e) => handleSendNotification(e, userDetail.seller.id)} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 8 }}>
                          <input
                            type="text"
                            placeholder="Judul notifikasi..."
                            value={notifForm.title}
                            onChange={e => setNotifForm({ ...notifForm, title: e.target.value })}
                            required
                            className={styles.inputField}
                            style={{ padding: '8px 10px', fontSize: 12 }}
                          />
                          <select
                            value={notifForm.type}
                            onChange={e => setNotifForm({ ...notifForm, type: e.target.value as any })}
                            className={styles.selectField}
                            style={{ padding: '8px 10px', fontSize: 12 }}
                          >
                            <option value="info">Info</option>
                            <option value="success">Sukses</option>
                            <option value="warning">Peringatan</option>
                            <option value="error">Eror</option>
                          </select>
                        </div>
                        <textarea
                          placeholder="Pesan notifikasi..."
                          value={notifForm.message}
                          onChange={e => setNotifForm({ ...notifForm, message: e.target.value })}
                          required
                          className={styles.textareaField}
                          rows={2}
                          style={{ padding: '8px 10px', fontSize: 12 }}
                        />
                        <input
                          type="text"
                          placeholder="Link URL opsional (e.g. /dashboard/orders)..."
                          value={notifForm.linkUrl}
                          onChange={e => setNotifForm({ ...notifForm, linkUrl: e.target.value })}
                          className={styles.inputField}
                          style={{ padding: '8px 10px', fontSize: 12 }}
                        />
                        <button
                          type="submit"
                          disabled={sendingNotifId === userDetail.seller.id}
                          className={styles.submitBtnPremium}
                          style={{ padding: '8px 16px', fontSize: 12, background: 'linear-gradient(135deg, #247a52 0%, #145c39 100%)', boxShadow: '0 2px 8px rgba(217,119,6,0.2)' }}
                        >
                          {sendingNotifId === userDetail.seller.id ? (
                            <><Loader2 size={12} className="animate-spin" /> Mengirim...</>
                          ) : (
                            <><Send size={12} /> Kirim Pesan</>
                          )}
                        </button>
                      </form>
                    </div>

                    {/* TRANSACTIONS & PAST NOTIFICATIONS */}
                    <div className={styles.card} style={{ padding: 16 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 800, borderBottom: '1px solid #f1f5f9', paddingBottom: 6, marginBottom: 10 }}>Pesanan Terbaru Toko</h3>
                      {userDetail.orders.length > 0 ? (
                        <div className={styles.list} style={{ gap: 6 }}>
                          {userDetail.orders.slice(0, 5).map((order: any) => (
                            <div key={order.id} className={styles.listItem} style={{ padding: '8px 10px', borderRadius: 8, fontSize: 12 }}>
                              <div style={{ flex: 1 }}>
                                <strong style={{ color: '#0f172a' }}>{order.customer_name}</strong>
                                <span style={{ display: 'block', fontSize: 10, color: '#94a3b8' }}>{formatDate(order.created_at)}</span>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <strong style={{ color: '#059669', display: 'block' }}>Rp {(order.total || 0).toLocaleString('id-ID')}</strong>
                                <span className={`${styles.badge}`} style={{ fontSize: 8, padding: '1px 5px', marginTop: 2 }}>
                                  {order.order_status?.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Belum ada pesanan.</p>
                      )}

                      <h3 style={{ fontSize: 13, fontWeight: 800, borderBottom: '1px solid #f1f5f9', paddingBottom: 6, marginTop: 16, marginBottom: 10 }}>Riwayat Notif Terkirim</h3>
                      {userDetail.notifications.length > 0 ? (
                        <div className={styles.list} style={{ gap: 6 }}>
                          {userDetail.notifications.map((n: any) => (
                            <div key={n.id} className={styles.listItem} style={{ padding: '8px 10px', borderRadius: 8, fontSize: 12 }}>
                              <div style={{ flex: 1 }}>
                                <strong style={{ color: '#0f172a' }}>{n.title}</strong>
                                <span style={{ display: 'block', fontSize: 11, color: '#64748b', marginTop: 2 }}>{n.message.substring(0, 45)}...</span>
                              </div>
                              <span className={`${styles.badge} ${n.is_read ? styles.badgeOff : styles.badgeOn}`} style={{ fontSize: 8 }}>
                                {n.is_read ? 'Read' : 'Unread'}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Belum ada notifikasi.</p>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            TAB: STORES MANAGEMENT
            ========================================== */}
        {activeTab === 'stores' && (
          <div className={styles.page}>
            <header className={styles.pageHeader}>
              <div>
                <h1 className={styles.pageTitle}>Platform Stores Directory</h1>
                <p className={styles.pageSubtitle}>Daftar dan kelola status publikasi seluruh toko di platform WebTokoku.</p>
              </div>
            </header>

            <div className={styles.card}>
              {/* Search & Filter */}
              <div style={{ display: 'flex', gap: 10, padding: 16, background: '#fafbfd', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                  <Search size={16} style={{ position: 'absolute', left: 12, top: 13, color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Cari nama toko atau slug..."
                    value={searchStore}
                    onChange={e => setSearchStore(e.target.value)}
                    className={styles.inputField}
                    style={{ paddingLeft: 36 }}
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className={styles.selectField}
                  style={{ width: '160px', padding: '10px' }}
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Toko Aktif</option>
                  <option value="suspended">Suspended</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
                <select
                  value={planFilter}
                  onChange={e => setPlanFilter(e.target.value)}
                  className={styles.selectField}
                  style={{ width: '150px', padding: '10px' }}
                >
                  <option value="all">Semua Plan</option>
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                </select>
              </div>

              {/* Stores Table */}
              <div style={{ overflowX: 'auto' }}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Toko</th>
                      <th>Slug</th>
                      <th>Template</th>
                      <th>Status</th>
                      <th>Plan</th>
                      <th>Seller / Pemilik</th>
                      <th>Dibuat</th>
                      <th>Kelola Toko</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStores.map(store => {
                      const seller = Array.isArray(store.sellers) ? store.sellers[0] : store.sellers

                      return (
                        <tr key={store.id}>
                          <td><strong>{store.nama_toko}</strong></td>
                          <td>
                            <Link href={getStorefrontDisplayUrl(store.slug)} target="_blank" className={styles.inlineLink}>
                              /{store.slug} <ExternalLink size={12} />
                            </Link>
                            {store.custom_domain && <span className={styles.tableHint}>{store.custom_domain}</span>}
                          </td>
                          <td>
                            <span style={{ textTransform: 'capitalize', fontSize: 12 }}>{store.template || '-'}</span>
                            <span className={styles.tableHint} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                              <span aria-hidden style={{ width: 7, height: 7, borderRadius: '50%', background: store.warna_tema || '#10b981', display: 'inline-block' }} />
                              {store.warna_tema}
                            </span>
                          </td>
                          <td>
                            <div className={styles.badgeStack}>
                              <span className={`${styles.badge} ${store.is_active ? styles.badgeOn : styles.badgeOff}`} style={{ fontSize: 10 }}>
                                {store.is_active ? 'Active' : 'Suspended'}
                              </span>
                              <span className={`${styles.badge} ${store.is_published ? styles.badgeOn : styles.badgeOff}`} style={{ fontSize: 10 }}>
                                {store.is_published ? 'Published' : 'Draft'}
                              </span>
                              <span className={`${styles.badge} ${['safe', 'flagged'].includes(store.moderation_status || 'safe') ? styles.badgeOn : styles.badgeOff}`} style={{ fontSize: 10 }}>
                                Moderasi: {store.moderation_status || 'safe'}
                              </span>
                              {store.moderation_reason && (
                                <span className={styles.tableHint}>{store.moderation_reason}</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={`${styles.badge} ${getEffectivePlan(store) === 'pro' ? styles.badgeOn : styles.badgeOff}`} style={{ fontSize: 10 }}>
                              {getEffectivePlan(store) === 'pro' ? 'Pro' : 'Free'}
                            </span>
                            <span className={styles.tableHint}>Expired: {formatPlanExpiry(store.plan_expires_at)}</span>
                            {store.pro_notes && <span className={styles.tableHint}>Catatan: {store.pro_notes}</span>}
                          </td>
                          <td>
                            <strong>{seller?.nama_lengkap || '-'}</strong>
                            <span className={styles.tableHint}>{seller?.email || '-'}</span>
                          </td>
                          <td><span style={{ fontSize: 12 }}>{formatDate(store.created_at)}</span></td>
                          <td>
                            <div className={styles.actionGroup}>
                              <button
                                disabled={isPendingStore}
                                onClick={() => openPlanEditor(store, getEffectivePlan(store) === 'pro' ? 'free' : 'pro')}
                                className={styles.actionButton}
                                style={{ minHeight: 28, padding: '4px 8px', fontSize: 11 }}
                              >
                                {getEffectivePlan(store) === 'pro' ? 'Downgrade' : 'Upgrade Pro'}
                              </button>
                              <button
                                disabled={isPendingStore}
                                onClick={() => handleToggleStoreStatus(store.id, 'published', store.is_published)}
                                className={styles.actionButton}
                                style={{ minHeight: 28, padding: '4px 8px', fontSize: 11 }}
                              >
                                {store.is_published ? <XCircle size={12} /> : <Send size={12} />}
                                {store.is_published ? 'Unpublish' : 'Publish'}
                              </button>
                              <button
                                disabled={isPendingStore}
                                onClick={() => handleToggleStoreStatus(store.id, 'active', store.is_active)}
                                className={`${styles.actionButton} ${store.is_active ? styles.dangerButton : ''}`}
                                style={{ minHeight: 28, padding: '4px 8px', fontSize: 11 }}
                              >
                                {store.is_active ? <PauseCircle size={12} /> : <PlayCircle size={12} />}
                                {store.is_active ? 'Suspend' : 'Aktifkan'}
                              </button>
                              {['pending_review', 'suspended', 'blocked'].includes(store.moderation_status || '') ? (
                                <button
                                  disabled={isPendingModeration}
                                  onClick={() => handleModerationAction(store.id, 'approve')}
                                  className={styles.actionButton}
                                  style={{ minHeight: 28, padding: '4px 8px', fontSize: 11 }}
                                >
                                  <CheckCircle2 size={12} /> Approve
                                </button>
                              ) : (
                                <button
                                  disabled={isPendingModeration}
                                  onClick={() => handleModerationAction(store.id, 'suspend')}
                                  className={`${styles.actionButton} ${styles.dangerButton}`}
                                  style={{ minHeight: 28, padding: '4px 8px', fontSize: 11 }}
                                >
                                  <ShieldMinus size={12} /> Moderasi
                                </button>
                              )}
                              <button
                                disabled={isPendingModeration}
                                onClick={() => handleModerationAction(store.id, 'block')}
                                className={`${styles.actionButton} ${styles.dangerButton}`}
                                style={{ minHeight: 28, padding: '4px 8px', fontSize: 11 }}
                              >
                                <Lock size={12} /> Block
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {filteredStores.length === 0 && (
                      <tr>
                        <td colSpan={8} className={styles.empty}>Tidak ada toko yang terdaftar.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.card} style={{ marginTop: 20 }}>
              <div style={{ padding: '18px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Banding Moderasi</h3>
                <p className={styles.tableHint}>Daftar banding seller untuk toko yang sedang ditahan moderasi.</p>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Toko</th>
                      <th>Status</th>
                      <th>Alasan Seller</th>
                      <th>Dibuat</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appealsList.map((appeal: any) => {
                      const storeData = Array.isArray(appeal.stores) ? appeal.stores[0] : appeal.stores
                      return (
                        <tr key={appeal.id}>
                          <td>
                            <strong>{storeData?.nama_toko || appeal.store_id}</strong>
                            <span className={styles.tableHint}>/{storeData?.slug || '-'}</span>
                          </td>
                          <td>
                            <span className={`${styles.badge} ${appeal.status === 'approved' ? styles.badgeOn : styles.badgeOff}`} style={{ fontSize: 10 }}>
                              {appeal.status}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: 12 }}>{appeal.reason}</span>
                            {appeal.context && <span className={styles.tableHint}>{appeal.context}</span>}
                            {appeal.admin_note && <span className={styles.tableHint}>Catatan admin: {appeal.admin_note}</span>}
                          </td>
                          <td><span style={{ fontSize: 12 }}>{formatDate(appeal.created_at)}</span></td>
                          <td>
                            <div className={styles.actionGroup}>
                              <button
                                disabled={isPendingModeration || appeal.status === 'approved'}
                                onClick={() => handleModerationAction(appeal.store_id, 'approve', appeal.id)}
                                className={styles.actionButton}
                                style={{ minHeight: 28, padding: '4px 8px', fontSize: 11 }}
                              >
                                Approve
                              </button>
                              <button
                                disabled={isPendingModeration}
                                onClick={() => handleModerationAction(appeal.store_id, 'request_edit', appeal.id)}
                                className={styles.actionButton}
                                style={{ minHeight: 28, padding: '4px 8px', fontSize: 11 }}
                              >
                                Request Edit
                              </button>
                              <button
                                disabled={isPendingModeration}
                                onClick={() => handleModerationAction(appeal.store_id, 'reject', appeal.id)}
                                className={`${styles.actionButton} ${styles.dangerButton}`}
                                style={{ minHeight: 28, padding: '4px 8px', fontSize: 11 }}
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {appealsList.length === 0 && (
                      <tr>
                        <td colSpan={5} className={styles.empty}>Belum ada banding moderasi.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB: SETUP INSTAN
            ========================================== */}
        {activeTab === 'quick-setup' && (
          <div className={styles.page}>
            <header className={styles.pageHeader}>
              <div>
                <h1 className={styles.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Zap size={26} color="#dc2626" />
                  Setup Cepat Seller & Toko Demo
                </h1>
                <p className={styles.pageSubtitle}>Buat akun seller tiruan lengkap dengan toko siap pakai, katalog produk, kategori, dan detail dalam 1-Klik.</p>
              </div>
            </header>

            {quickSetupMsg && (
              <div
                className={styles.card}
                style={{
                  borderLeft: `4px solid ${quickSetupMsg.success ? '#10b981' : '#ef4444'}`,
                  padding: '14px 20px',
                  background: quickSetupMsg.success ? '#f0fdf4' : '#fef2f2',
                  marginBottom: '20px'
                }}
              >
                <strong style={{ fontSize: 14, color: quickSetupMsg.success ? '#15803d' : '#b91c1c' }}>
                  {quickSetupMsg.success ? 'Sukses membuat toko demo' : 'Gagal membuat setup'}
                </strong>
                <p style={{ fontSize: 13, marginTop: 4, color: '#475569', lineHeight: 1.5 }}>{quickSetupMsg.text}</p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px', alignItems: 'start' }}>
              {/* LEFT COLUMN: FORM */}
              <div className={styles.card} style={{ padding: 24 }}>
                <form onSubmit={handleQuickSetupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  
                  {/* Section 1: Profil & Akun Seller */}
                  <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 16, marginBottom: 12 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', background: '#e8f6ee', color: '#247a52', fontSize: 12, fontWeight: 700 }}>1</span>
                      Profil & Akun Seller
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Nama Lengkap Seller *</label>
                        <input type="text" name="namaLengkap" placeholder="Budi Santoso" required className={styles.inputField} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Email Login Seller *</label>
                        <input type="email" name="email" placeholder="budi@demo.com" required className={styles.inputField} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Password Akun *</label>
                        <input type="text" name="password" defaultValue="demo1234" required className={styles.inputField} />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Identitas & Subdomain Toko */}
                  <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 16, marginBottom: 12 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', background: '#e8f6ee', color: '#247a52', fontSize: 12, fontWeight: 700 }}>2</span>
                      Identitas & Subdomain Toko
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Nama Toko *</label>
                        <input
                          type="text"
                          name="namaToko"
                          placeholder="Butik Modis Budi"
                          required
                          value={previewNamaToko}
                          onChange={(e) => setPreviewNamaToko(e.target.value)}
                          className={styles.inputField}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Slug Toko (Subdomain) *</label>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ background: '#f1f5f9', border: '1.5px solid #e2e8f0', borderRight: 'none', padding: '11px 12px', fontSize: 13, borderTopLeftRadius: 10, borderBottomLeftRadius: 10, color: '#64748b' }}>webtokoku.com/</span>
                          <input
                            type="text"
                            name="slug"
                            placeholder="butik-modis"
                            required
                            value={previewSlug}
                            onChange={(e) => handleSlugInput(e.target.value)}
                            className={styles.inputField}
                            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                          />
                        </div>
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Nomor WA Toko (Notifikasi Order) *</label>
                        <input type="text" name="noWa" placeholder="08123456789" required className={styles.inputField} />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Visual & Katalog Produk */}
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', background: '#edf8f1', color: '#145c39', fontSize: 12, fontWeight: 700 }}>3</span>
                      Visual & Katalog Produk
                    </h3>
                    
                    <div className={styles.formGroup} style={{ marginBottom: 14 }}>
                      <label className={styles.label}>Pilih Katalog Demo & Template Produk *</label>
                      <div className={styles.templateSelectorGrid}>
                        {TEMPLATES.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => {
                              setPreviewTemplate(t.id);
                              setWarnaTema(t.warna_default); // Set default color on change template
                            }}
                            className={`${styles.templateCard} ${previewTemplate === t.id ? styles.templateCardActive : ''}`}
                            style={{
                              borderColor: previewTemplate === t.id ? t.warna_default : '',
                              background: previewTemplate === t.id ? `${t.warna_default}10` : '',
                            }}
                          >
                            <div className={styles.templateCardHeader}>
                              <span className={styles.templateCardName}>{t.nama}</span>
                              {previewTemplate === t.id && (
                                <div
                                  className={styles.templateCardDot}
                                  style={{ background: t.warna_default }}
                                />
                              )}
                            </div>
                            <span className={styles.templateCardDesc}>{t.deskripsi}</span>
                          </div>
                        ))}
                      </div>
                      <input type="hidden" name="template" value={previewTemplate} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 14, marginBottom: 14 }}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Warna Tema Toko (Hex)</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            type="text"
                            placeholder="#10b981"
                            value={warnaTema}
                            onChange={(e) => handleHexChange(e.target.value)}
                            className={styles.inputField}
                            maxLength={7}
                          />
                          <input
                            type="color"
                            value={isValidHex(warnaTema) && warnaTema.length === 7 ? warnaTema : '#10b981'}
                            onChange={(e) => handleColorPickerChange(e.target.value)}
                            className={styles.inputField}
                            style={{ width: '60px', height: '46px', padding: '4px', cursor: 'pointer', flexShrink: 0 }}
                          />
                        </div>
                        {/* Hidden input holding validated theme color */}
                        <input
                          type="hidden"
                          name="warnaTema"
                          value={isValidHex(warnaTema) ? warnaTema : '#10b981'}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Presets Warna</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                          {[
                            { name: 'Emerald', val: '#10b981' },
                            { name: 'Indigo', val: '#6366f1' },
                            { name: 'Violet', val: '#1f7a4d' },
                            { name: 'Crimson', val: '#e11d48' },
                            { name: 'Amber', val: '#1f7a4d' }
                          ].map(preset => (
                            <button
                              key={preset.val}
                              type="button"
                              onClick={() => setWarnaTema(preset.val)}
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                background: preset.val,
                                border: warnaTema === preset.val ? '2px solid #000' : '1px solid #cbd5e1',
                                cursor: 'pointer',
                                padding: 0
                              }}
                              title={preset.name}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className={styles.formGroup} style={{ marginBottom: 14 }}>
                      <label className={styles.label}>Deskripsi Singkat Toko</label>
                      <textarea
                        name="deskripsi"
                        placeholder="Tulis deskripsi toko di sini..."
                        className={styles.textareaField}
                        rows={2}
                        value={previewDeskripsi}
                        onChange={(e) => setPreviewDeskripsi(e.target.value)}
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={quickSetupPending} className={styles.submitBtnPremium} style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', boxShadow: '0 4px 14px rgba(220,38,38,0.3)', width: '100%' }}>
                    {quickSetupPending ? (
                      <><Loader2 size={16} className="animate-spin" /> Sedang Menyiapkan & Memasang Toko...</>
                    ) : (
                      <><Zap size={16} /> Jalankan Setup Instan & Seeding Produk</>
                    )}
                  </button>
                </form>
              </div>

              {/* RIGHT COLUMN: LIVE STORE PREVIEW */}
              <div style={{ position: 'sticky', top: '24px' }}>
                <div style={{ textAlign: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Storefront Preview (Mobile View)</span>
                </div>
                
                {/* Smartphone Wrapper */}
                <div style={{
                  width: '320px',
                  height: '560px',
                  margin: '0 auto',
                  background: '#1e293b', // phone bezel
                  borderRadius: '36px',
                  padding: '11px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  border: '4px solid #475569',
                  position: 'relative'
                }}>
                  {/* Speaker Notch */}
                  <div style={{
                    width: '110px',
                    height: '18px',
                    background: '#1e293b',
                    borderRadius: '0 0 12px 12px',
                    position: 'absolute',
                    top: '11px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 20
                  }} />

                  {/* Phone Screen Container */}
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: '#f8fafc', // app background
                    borderRadius: '26px',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    scrollbarWidth: 'none'
                  }}>
                    {/* Status Bar */}
                    <div style={{
                      height: '24px',
                      background: 'transparent',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0 16px',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: previewTemplate === 'luxe' ? '#fff' : '#475569', // text color on hero
                      zIndex: 10,
                      position: 'absolute',
                      width: '100%',
                      top: 0
                    }}>
                      <span>09:41</span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Wifi size={9} />
                        <BatteryFull size={9} />
                      </div>
                    </div>

                    {/* Banner & Hero Header combined */}
                    <div style={{
                      background: previewTemplate === 'luxe'
                        ? 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%)' // Luxe Dark BG
                        : `${isValidHex(warnaTema) ? warnaTema : '#10b981'}15`, // Light themed BG
                      color: previewTemplate === 'luxe' ? '#fff' : '#0f172a',
                      padding: '48px 16px 20px',
                      textAlign: 'center',
                      borderBottom: `1px solid ${isValidHex(warnaTema) ? warnaTema : '#10b981'}30`,
                      position: 'relative'
                    }}>
                      {/* Nav row inside preview */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 16
                      }}>
                        <div style={{
                          fontWeight: 900,
                          fontSize: '13px',
                          color: isValidHex(warnaTema) ? warnaTema : '#10b981',
                          letterSpacing: '-0.02em',
                          textTransform: 'uppercase'
                        }}>
                          {previewNamaToko || 'Nama Toko'}
                        </div>
                        <div style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                          <Search size={12} />
                          <ShoppingCart size={12} />
                        </div>
                      </div>

                      {/* Title & Tagline */}
                      <h4 style={{
                        fontSize: '16px',
                        fontWeight: 900,
                        margin: '0 0 6px',
                        lineHeight: 1.2
                      }}>
                        {previewTemplate === 'butik' && 'Fashion Muslim Terbaik'}
                        {previewTemplate === 'dapur' && 'Cita Rasa Nusantara'}
                        {previewTemplate === 'glow' && 'Skincare Organik Alami'}
                        {previewTemplate === 'luxe' && 'Pancarkan Cantik Alami'}
                        {previewTemplate === 'herba' && 'Suplemen Kesehatan Alami'}
                      </h4>
                      <p style={{
                        fontSize: '10px',
                        margin: 0,
                        color: previewTemplate === 'luxe' ? '#cbd5e1' : '#64748b',
                        lineHeight: 1.4
                      }}>
                        {previewDeskripsi || 'Silakan isi deskripsi toko Anda.'}
                      </p>

                      <div style={{ marginTop: 12 }}>
                        <span style={{
                          background: isValidHex(warnaTema) ? warnaTema : '#10b981',
                          color: '#fff',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '9px',
                          fontWeight: 700,
                          boxShadow: `0 2px 6px ${isValidHex(warnaTema) ? warnaTema : '#10b981'}40`
                        }}>
                          Chat WhatsApp
                        </span>
                      </div>
                    </div>

                    {/* Storefront Products */}
                    <div style={{ padding: '12px 10px', flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 8
                      }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#1e293b' }}>Katalog Produk</span>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: isValidHex(warnaTema) ? warnaTema : '#10b981' }}>Lihat Semua</span>
                      </div>

                      {/* Mock Products Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {(MOCK_PREVIEW_PRODUCTS[previewTemplate] || MOCK_PREVIEW_PRODUCTS['butik']).map((prod, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: '#fff',
                              border: '1px solid #f1f5f9',
                              borderRadius: '12px',
                              overflow: 'hidden',
                              display: 'flex',
                              flexDirection: 'column',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}
                          >
                            {/* Product Image */}
                            <div style={{
                              width: '100%',
                              height: '90px',
                              backgroundImage: `url(${prod.image})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              position: 'relative'
                            }}>
                              {prod.tag && (
                                <span style={{
                                  position: 'absolute',
                                  top: 4,
                                  left: 4,
                                  background: isValidHex(warnaTema) ? warnaTema : '#10b981',
                                  color: '#fff',
                                  fontSize: '7px',
                                  fontWeight: 800,
                                  padding: '2px 5px',
                                  borderRadius: '4px',
                                  textTransform: 'uppercase'
                                }}>
                                  {prod.tag}
                                </span>
                              )}
                            </div>

                            {/* Product Info */}
                            <div style={{ padding: 6, display: 'flex', flexDirection: 'column', flex: 1 }}>
                              <span style={{
                                fontSize: '9px',
                                fontWeight: 800,
                                color: '#1e293b',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                height: '24px',
                                lineHeight: 1.3
                              }}>
                                {prod.name}
                              </span>
                              <span style={{
                                fontSize: '10px',
                                fontWeight: 900,
                                color: '#059669',
                                marginTop: 4,
                                display: 'block'
                              }}>
                                Rp {prod.price.toLocaleString('id-ID')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB: FEATURE FLAGS
            ========================================== */}
        {activeTab === 'feature-flags' && (
          <div className={styles.page}>
            <header className={styles.pageHeader}>
              <div>
                <h1 className={styles.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Flag size={26} color="#247a52" />
                  Platform Feature Flags
                </h1>
                <p className={styles.pageSubtitle}>Aktifkan atau nonaktifkan fitur global di platform tanpa merubah baris kode.</p>
              </div>
            </header>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.navInner}>
                  <Info size={16} color="#247a52" />
                  <strong>Kontrol global berdampak langsung ke seluruh toko seller platform secara instan.</strong>
                </span>
              </div>

              <div>
                {flagsList.map(flag => (
                  <div key={flag.id} className={styles.flagRow}>
                    <div className={styles.flagInfo}>
                      <div className={`${styles.flagIcon} ${flag.enabled_globally ? styles.flagIconOn : ''}`} style={{ background: flag.enabled_globally ? '#e8f6ee' : '', color: flag.enabled_globally ? '#247a52' : '' }}>
                        <Flag size={20} />
                      </div>
                      <div>
                        <h2 className={styles.flagName}>
                          {flag.name}
                          <code className={styles.code}>{flag.key}</code>
                        </h2>
                        <p className={styles.flagDesc}>{flag.description}</p>
                      </div>
                    </div>

                    <div className={styles.navInner}>
                      <span className={`${styles.badge} ${flag.enabled_globally ? styles.badgeOn : styles.badgeOff}`} style={{ fontSize: 11 }}>
                        {flag.enabled_globally ? 'Enabled' : 'Disabled'}
                      </span>

                      {/* Flag Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleFeatureFlag(flag.id, flag.key, flag.enabled_globally)}
                        disabled={isPendingFlag}
                        className={`${styles.toggle} ${flag.enabled_globally ? styles.toggleOn : ''}`}
                        style={{ background: flag.enabled_globally ? '#247a52' : '' }}
                      >
                        <span className={`${styles.toggleKnob} ${flag.enabled_globally ? styles.toggleKnobOn : ''}`}>
                          {isPendingFlag && <Loader2 size={12} className="animate-spin" style={{ color: '#247a52' }} />}
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
                {flagsList.length === 0 && <div className={styles.empty}>Belum ada Feature Flag yang terdaftar di database.</div>}
              </div>
            </section>
          </div>
        )}

        {/* ==========================================
            TAB: AUDIT LOGS
            ========================================== */}
        {activeTab === 'logs' && (
          <div className={styles.page}>
            <header className={styles.pageHeader}>
              <div>
                <h1 className={styles.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <History size={26} color="#1f7a4d" />
                  Audit Logs Platform
                </h1>
                <p className={styles.pageSubtitle}>Log jejak audit aktivitas yang dilakukan oleh admin atau sistem di platform.</p>
              </div>
            </header>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Aktivitas Audit Terbaru</h2>
              </div>
              <div className={styles.cardBody} style={{ padding: 0 }}>
                {logsList.length > 0 ? (
                  <div className={styles.tableCard} style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Waktu</th>
                          <th>Aksi Audit</th>
                          <th>Deskripsi</th>
                          <th>Dipicu Oleh</th>
                          <th>Tipe Target</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logsList.map(log => {
                          const seller = Array.isArray(log.sellers) ? log.sellers[0] : log.sellers
                          return (
                            <tr key={log.id}>
                              <td style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
                                {new Date(log.created_at).toLocaleString('id-ID', {
                                  day: '2-digit', month: '2-digit', year: '2-digit',
                                  hour: '2-digit', minute: '2-digit'
                                })}
                              </td>
                              <td><span className={styles.logAction}>{log.action}</span></td>
                              <td style={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>{log.description}</td>
                              <td>
                                <strong style={{ fontSize: 12, color: '#0f172a' }}>{seller?.nama_lengkap || 'System'}</strong>
                                <span className={styles.tableHint} style={{ fontSize: 11 }}>{seller?.email || 'automated@platform.com'}</span>
                              </td>
                              <td>
                                {log.target_type ? (
                                  <span className={styles.badge} style={{ fontSize: 10 }}>
                                    {log.target_type.toUpperCase()} ({log.target_id?.slice(0, 8)})
                                  </span>
                                ) : (
                                  <span className={styles.muted} style={{ fontSize: 11 }}>GLOBAL</span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className={styles.empty}>Belum ada aktivitas tercatat di sistem log.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB: BACKUP & BROADCAST
            ========================================== */}
        {activeTab === 'backup' && (
          <div className={styles.page}>
            <header className={styles.pageHeader}>
              <div>
                <h1 className={styles.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Database size={26} color="#059669" />
                  Backup Platform & Broadcast Notifikasi
                </h1>
                <p className={styles.pageSubtitle}>Download snapshot database platform, simpan ke local storage browser, dan kirim pesan broadcast ke semua seller sekaligus.</p>
              </div>
            </header>

            <div className={styles.grid2}>
              {/* BROADCAST FORM */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}><Bell size={16} style={{ marginRight: 6 }} />Kirim Broadcast Massal (Semua Seller)</h2>
                </div>
                <div className={styles.cardBody}>
                  <form onSubmit={(e) => handleSendNotification(e, null)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 10 }}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Judul Pesan Broadcast *</label>
                        <input
                          type="text"
                          placeholder="Masukkan judul menarik..."
                          value={notifForm.title}
                          onChange={e => setNotifForm({ ...notifForm, title: e.target.value })}
                          required
                          className={styles.inputField}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Tipe Banner / Notif *</label>
                        <select
                          value={notifForm.type}
                          onChange={e => setNotifForm({ ...notifForm, type: e.target.value as any })}
                          className={styles.selectField}
                        >
                          <option value="info">Info Platform</option>
                          <option value="success">Sukses / Selamat</option>
                          <option value="warning">Peringatan / Maintenance</option>
                          <option value="error">Eror / Perbaikan Sistem</option>
                        </select>
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Pesan Broadcast *</label>
                      <textarea
                        placeholder="Tulis pesan lengkap yang akan muncul di dashboard seluruh seller..."
                        value={notifForm.message}
                        onChange={e => setNotifForm({ ...notifForm, message: e.target.value })}
                        required
                        className={styles.textareaField}
                        rows={4}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Tautan Tambahan Opsional (Link URL)</label>
                      <input
                        type="text"
                        placeholder="Contoh: /dashboard/settings atau https://panduan.com"
                        value={notifForm.linkUrl}
                        onChange={e => setNotifForm({ ...notifForm, linkUrl: e.target.value })}
                        className={styles.inputField}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={sendingNotifId === 'broadcast'}
                      className={styles.submitBtnPremium}
                      style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', boxShadow: '0 4px 14px rgba(5,150,105,0.3)' }}
                    >
                      {sendingNotifId === 'broadcast' ? (
                        <><Loader2 size={16} className="animate-spin" /> Sedang Mengirim Broadcast ke Semua Seller...</>
                      ) : (
                        <><Send size={16} /> Siarkan Pesan ke Semua Seller</>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* BACKUP PLATFORM TABLES */}
              <div className={styles.page} style={{ gap: 16 }}>
                <div className={styles.card} style={{ padding: 20 }}>
                  <h2 className={styles.cardTitle} style={{ marginBottom: 8 }}><FileJson size={16} style={{ marginRight: 6 }} />Backup Data JSON Platform</h2>
                  <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, marginBottom: 16 }}>
                    Download snapshot seluruh tabel database platform (maksimal 5.000 baris data per tabel) untuk backup aman di penyimpanan cloud Anda.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {(['sellers', 'stores', 'products', 'orders'] as const).map(t => {
                      const isPending = backupPending === t
                      const isDone = backupExported.includes(t)

                      return (
                        <button
                          key={t}
                          disabled={backupPending !== null}
                          onClick={() => handleExportTable(t)}
                          className={styles.actionButton}
                          style={{
                            justifyContent: 'center',
                            fontSize: 12,
                            padding: '10px',
                            borderColor: isDone ? '#059669' : '#e2e8f0',
                            color: isDone ? '#059669' : '#334155',
                            background: isDone ? '#ecfdf5' : '#fff'
                          }}
                        >
                          {isPending ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : isDone ? (
                            <CheckCircle2 size={12} />
                          ) : (
                            <Download size={12} />
                          )}
                          Download {t.toUpperCase()}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className={styles.card} style={{ padding: 20 }}>
                  <h2 className={styles.cardTitle} style={{ marginBottom: 8 }}><Table2 size={16} style={{ marginRight: 6 }} />Simpan ke Local Storage</h2>
                  <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, marginBottom: 16 }}>
                    Simpan snapshot tabel database secara instan ke local storage browser Anda untuk pemulihan cepat tanpa harus mendownload berkas fisik.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {(['sellers', 'stores', 'products', 'orders'] as const).map(t => {
                      const isLSPending = backupPending === `ls-${t}`

                      return (
                        <button
                          key={t}
                          disabled={backupPending !== null}
                          onClick={() => handleSaveToLocalStorage(t)}
                          className={styles.actionButton}
                          style={{ justifyContent: 'center', fontSize: 11, padding: '8px' }}
                        >
                          {isLSPending ? <Loader2 size={11} className="animate-spin" /> : null}
                          Simpan {t.toUpperCase()}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {planEditor && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Ubah plan toko"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 500,
            display: 'grid',
            placeItems: 'center',
            padding: 20,
            background: 'rgba(15, 23, 42, 0.42)'
          }}
        >
          <div className={styles.card} style={{ width: 'min(520px, 100%)', overflow: 'hidden' }}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle} style={{ marginBottom: 4 }}>
                  <Crown size={16} style={{ marginRight: 6 }} />
                  Ubah Plan Toko
                </h2>
                <p className={styles.pageSubtitle} style={{ fontSize: 12 }}>{planEditor.storeName}</p>
              </div>
              <button
                type="button"
                onClick={() => setPlanEditor(null)}
                className={styles.actionButton}
                style={{ padding: 8, minHeight: 32 }}
                aria-label="Tutup"
              >
                <XCircle size={15} />
              </button>
            </div>
            <div className={styles.cardBody} style={{ display: 'grid', gap: 14 }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Plan</label>
                <select
                  value={planEditor.plan}
                  onChange={e => setPlanEditor(prev => prev ? { ...prev, plan: e.target.value as 'free' | 'pro' } : prev)}
                  className={styles.selectField}
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Tanggal Expired Pro</label>
                <input
                  type="date"
                  value={planEditor.expiresAt}
                  onChange={e => setPlanEditor(prev => prev ? { ...prev, expiresAt: e.target.value } : prev)}
                  disabled={planEditor.plan === 'free'}
                  className={styles.inputField}
                />
                <span className={styles.tableHint}>Kosongkan untuk Pro tanpa batas waktu. Downgrade Free tidak menghapus data toko.</span>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Catatan Pembayaran</label>
                <textarea
                  value={planEditor.notes}
                  onChange={e => setPlanEditor(prev => prev ? { ...prev, notes: e.target.value } : prev)}
                  className={styles.textareaField}
                  rows={3}
                  placeholder="Contoh: Transfer BCA 39rb, aktif 1 bulan."
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" onClick={() => setPlanEditor(null)} className={styles.actionButton}>
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveStorePlan}
                  disabled={isPendingStore}
                  className={styles.submitBtnPremium}
                  style={{ minHeight: 38, padding: '9px 16px' }}
                >
                  {isPendingStore ? <><Loader2 size={14} className="animate-spin" /> Menyimpan...</> : <><CheckCircle2 size={14} /> Simpan Plan</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notifikasi Admin */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
