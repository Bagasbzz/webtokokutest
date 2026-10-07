'use client'

/**
 * DashboardClient - Shell utama dashboard seller.
 *
 * Menangani:
 * - Auth gate: redirect ke login jika belum login, ke onboarding jika belum punya toko
 * - Sidebar navigasi
 * - Topbar dengan judul halaman, tombol lihat toko, dark mode, dan notifikasi
 * - Menampilkan children (konten halaman dashboard)
 */

import { useEffect, useState, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getMyStore } from '@/lib/store'
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Settings, 
  LogOut, 
  Loader2, 
  ExternalLink,
  Moon,
  Sun,
  Bell,
  ShoppingBasket,
  MapPin,
  Truck,
  Menu,
  X,
  Palette,
  CreditCard,
  Wand2,
  Crown
} from 'lucide-react'
import styles from './layout.module.css'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/ToastContainer'
import { formatPlanExpiry, getPlanLabel, isProPlan } from '@/lib/plan'
import { UpgradeProButton } from '@/components/plan/UpgradeProButton'

export default function DashboardClient({
  children,
  featureFlags,
}: {
  children: React.ReactNode
  featureFlags: Record<string, boolean>
}) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = useMemo(() => createClient(), [])
  const [store, setStore] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { toasts, toast, dismiss } = useToast()

  // Dashboard auth gate lives here because most dashboard pages are client-heavy.
  // Server components should still protect sensitive mutations/API routes separately.
  useEffect(() => {
    async function checkStore() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        if (featureFlags?.['email_verification'] && !user.email_confirmed_at) {
          router.push('/auth/verify-email')
          return
        }

        const myStore = await getMyStore()
        if (!myStore) {
          router.push('/onboarding')
          return
        }

        setStore(myStore)
      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    checkStore()
  }, [router, supabase, featureFlags])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard'
    if (pathname === '/dashboard/setup') return 'Setup Website'
    if (pathname?.startsWith('/dashboard/produk')) return 'Manajemen Produk'
    if (pathname === '/dashboard/pesanan') return 'Manajemen Pesanan'
    if (pathname === '/dashboard/editor') return 'Visual Template Editor'
    if (pathname === '/dashboard/pengaturan') return 'Pengaturan Toko'
    if (pathname === '/dashboard/pengaturan/alamat') return 'Alamat Toko'
    if (pathname === '/dashboard/pengaturan/pengiriman') return 'Pengaturan Pengiriman'
    if (pathname === '/dashboard/pengaturan/pembayaran') return 'Metode Pembayaran'
    return 'Webtokoku'
  }

  // The iframe-based editor manages its own full-screen shell, so the normal
  // dashboard sidebar/topbar is intentionally skipped for this route.
  const isEditorPage = pathname === '/dashboard/editor'
  const storeIsPro = isProPlan(store)

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={32} />
      </div>
    )
  }

  if (isEditorPage) {
    return <div className={darkMode ? styles.dark : ''}>{children}</div>
  }

  return (
    <div className={`${styles.container} ${darkMode ? styles.dark : ''} ${mobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}>
            <img src="/brand/webtokoku-logo.svg" alt="" />
          </div>
          <h2 className={styles.logoText}>Webtokoku</h2>
        </div>
        
        <nav className={styles.nav}>
          <p className={styles.navLabel}>Menu Utama</p>
          <Link 
            href="/dashboard" 
            className={`${styles.navItem} ${pathname === '/dashboard' ? styles.active : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          
          {featureFlags?.['setup_wizard'] && (
            <Link 
              href="/dashboard/setup" 
              className={`${styles.navItem} ${styles.navItemCollapse} ${pathname === '/dashboard/setup' ? styles.active : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Wand2 size={18} />
              <span>Setup Website</span>
            </Link>
          )}
          
          <p className={styles.navLabel}>Manajemen</p>
          <Link 
            href="/dashboard/produk" 
            className={`${styles.navItem} ${pathname?.startsWith('/dashboard/produk') ? styles.active : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <ShoppingBag size={18} />
            <span>Produk</span>
          </Link>
          <Link 
            href="/dashboard/pesanan" 
            className={`${styles.navItem} ${pathname === '/dashboard/pesanan' ? styles.active : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <ShoppingBasket size={18} />
            <span>Pesanan</span>
          </Link>
          {featureFlags?.['visual_editor'] && (
            <>
              <p className={styles.navLabel}>Editor</p>
              <Link 
                href="/dashboard/editor" 
                className={`${styles.navItem} ${pathname === '/dashboard/editor' ? styles.active : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Palette size={18} />
                <span>Edit Template</span>
              </Link>
            </>
          )}

          <p className={styles.navLabel}>Sistem</p>
          <Link 
            href="/dashboard/pengaturan" 
            className={`${styles.navItem} ${pathname?.startsWith('/dashboard/pengaturan') ? styles.active : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Settings size={18} />
            <span>Pengaturan Toko</span>
          </Link>
          <Link 
            href="/dashboard/pengaturan/alamat" 
            className={`${styles.navItem} ${styles.navItemCollapse} ${pathname === '/dashboard/pengaturan/alamat' ? styles.active : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <MapPin size={18} />
            <span>Alamat Toko</span>
          </Link>
          <Link 
            href="/dashboard/pengaturan/pengiriman" 
            className={`${styles.navItem} ${styles.navItemCollapse} ${pathname === '/dashboard/pengaturan/pengiriman' ? styles.active : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Truck size={18} />
            <span>Pengaturan Pengiriman</span>
          </Link>
          <Link 
            href="/dashboard/pengaturan/pembayaran" 
            className={`${styles.navItem} ${styles.navItemCollapse} ${pathname === '/dashboard/pengaturan/pembayaran' ? styles.active : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <CreditCard size={18} />
            <span>Metode Pembayaran</span>
          </Link>
        </nav>

        <div className={styles.userCard}>
           <div className={styles.avatar}>
             {store?.nama_toko?.charAt(0).toUpperCase()}
           </div>
          <div className={styles.userInfo}>
             <div className={styles.userNameRow}>
               <p className={styles.userName}>{store?.nama_toko}</p>
               <span className={`${styles.planPill} ${storeIsPro ? styles.planPillPro : ''}`}>
                 {storeIsPro && <Crown size={11} />}
                 {getPlanLabel(store)}
               </span>
             </div>
             {storeIsPro ? (
               <p className={styles.planHint}>Aktif sampai {formatPlanExpiry(store?.plan_expires_at)}</p>
             ) : (
               <UpgradeProButton store={store} className={styles.upgradeLink}>
                 Upgrade Pro
               </UpgradeProButton>
             )}
             <button onClick={handleLogout} className={styles.logoutBtn}>
               <LogOut size={14} /> Keluar
             </button>
           </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className={styles.mainArea}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <h2 className={styles.pageTitle}>{getPageTitle()}</h2>

          <div className={styles.actions}>
            <Link 
              href={`/${store?.slug}`} 
              target="_blank" 
              className={styles.btnViewStore}
            >
              <ExternalLink size={16} />
              <span>Lihat Toko</span>
            </Link>

            <button className={styles.iconButton} onClick={toggleDarkMode} title={darkMode ? 'Mode terang' : 'Mode gelap'} aria-label={darkMode ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <button 
              className={styles.iconButton} 
              onClick={() => toast.info('Belum ada notifikasi baru untuk Anda.')}
              title="Notifikasi"
            >
              <Bell size={18} />
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              className={`${styles.iconButton} ${styles.mobileMenuBtn}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>

      {/* Toast Notifikasi Global */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
