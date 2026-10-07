import Link from 'next/link'
import { adminGuard } from '@/lib/admin-guard'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatPlanExpiry, getEffectivePlan } from '@/lib/plan'
import styles from '../admin.module.css'
import { updateStorePlanForm } from './actions'

export const dynamic = 'force-dynamic'

function toDateInput(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

export default async function AdminStoresPage() {
  await adminGuard()
  const supabase = createAdminClient()

  const { data: stores } = await supabase
    .from('stores')
    .select('id, nama_toko, slug, custom_domain, plan, plan_expires_at, pro_started_at, pro_notes, is_active, is_published, created_at, sellers(nama_lengkap, email)')
    .order('created_at', { ascending: false })

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Stores & Plan</h1>
          <p className={styles.pageSubtitle}>Kontrol paket Free/Pro manual. Data produk dan kategori tidak dihapus saat downgrade.</p>
        </div>
        <Link href="/admin694" className={styles.actionButton}>Buka Admin694</Link>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Toko</th>
              <th>Seller</th>
              <th>Status</th>
              <th>Plan</th>
              <th>Ubah Plan</th>
            </tr>
          </thead>
          <tbody>
            {(stores || []).map((store: any) => {
              const seller = Array.isArray(store.sellers) ? store.sellers[0] : store.sellers
              const effectivePlan = getEffectivePlan(store)

              return (
                <tr key={store.id}>
                  <td>
                    <Link href={`/${store.slug}`} target="_blank" className={styles.inlineLink}>{store.nama_toko}</Link>
                    <span className={styles.tableHint}>/{store.slug}{store.custom_domain ? ` - ${store.custom_domain}` : ''}</span>
                  </td>
                  <td>
                    <strong>{seller?.nama_lengkap || '-'}</strong>
                    <span className={styles.tableHint}>{seller?.email || '-'}</span>
                  </td>
                  <td>
                    <div className={styles.badgeStack}>
                      <span className={`${styles.badge} ${store.is_active ? styles.badgeOn : styles.badgeOff}`}>{store.is_active ? 'Active' : 'Suspended'}</span>
                      <span className={`${styles.badge} ${store.is_published ? styles.badgeOn : styles.badgeOff}`}>{store.is_published ? 'Published' : 'Draft'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${effectivePlan === 'pro' ? styles.badgeOn : styles.badgeOff}`}>{effectivePlan === 'pro' ? 'Pro' : 'Free'}</span>
                    <span className={styles.tableHint}>Expired: {formatPlanExpiry(store.plan_expires_at)}</span>
                    {store.pro_notes && <span className={styles.tableHint}>Catatan: {store.pro_notes}</span>}
                  </td>
                  <td>
                    <form action={updateStorePlanForm} style={{ display: 'grid', gap: 8, minWidth: 280 }}>
                      <input type="hidden" name="storeId" value={store.id} />
                      <select name="plan" defaultValue={store.plan || 'free'} className={styles.selectField}>
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                      </select>
                      <input type="date" name="plan_expires_at" defaultValue={toDateInput(store.plan_expires_at)} className={styles.inputField} />
                      <textarea name="pro_notes" defaultValue={store.pro_notes || ''} className={styles.textareaField} placeholder="Catatan pembayaran/manual admin" rows={2} />
                      <button type="submit" className={styles.actionButton}>Simpan Plan</button>
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
