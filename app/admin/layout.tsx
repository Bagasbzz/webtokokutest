import React from 'react'
import Link from 'next/link'
import { adminGuard } from '@/lib/admin-guard'
import {
  Bell, ChevronRight, Database, Flag, History,
  LayoutDashboard, LogOut, Store, Users, Zap
} from 'lucide-react'
import styles from './admin.module.css'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await adminGuard()

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>
            <img src="/brand/webtokoku-logo.svg" alt="" />
          </div>
          <span>Admin WebTokoku</span>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navSection}>Platform</div>
          <AdminNavLink href="/admin" icon={<LayoutDashboard size={17} />}>Overview</AdminNavLink>
          <AdminNavLink href="/admin/stores" icon={<Store size={17} />}>Stores</AdminNavLink>
          <AdminNavLink href="/admin/users" icon={<Users size={17} />}>Users</AdminNavLink>

          <div className={styles.navSection}>Tools</div>
          <AdminNavLink href="/admin/notifications" icon={<Bell size={17} />}>Notifikasi</AdminNavLink>
          <AdminNavLink href="/admin/quick-setup" icon={<Zap size={17} />}>Setup Instan</AdminNavLink>
          <AdminNavLink href="/admin/backup" icon={<Database size={17} />}>Backup</AdminNavLink>

          <div className={styles.navSection}>System</div>
          <AdminNavLink href="/admin/feature-flags" icon={<Flag size={17} />}>Feature Flags</AdminNavLink>
          <AdminNavLink href="/admin/logs" icon={<History size={17} />}>System Logs</AdminNavLink>
        </nav>

        <div className={styles.backWrap}>
          <Link href="/dashboard" className={styles.backLink}>
            <span className={styles.navInner}><LogOut size={17} /> Back to Dashboard</span>
          </Link>
        </div>
      </aside>

      <main className={styles.content}>
        {children}
      </main>
    </div>
  )
}

function AdminNavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link href={href} className={styles.navLink}>
      <span className={styles.navInner}>
        {icon}
        <span>{children}</span>
      </span>
      <ChevronRight size={13} />
    </Link>
  )
}
