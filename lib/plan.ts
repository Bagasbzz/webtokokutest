import type { PublicProduct, PublicStore } from '@/lib/public-store'
import type { ProductCategory, Store } from '@/lib/types'

export type StorePlan = 'free' | 'pro'

export const FREE_PLAN_LIMITS = {
  products: 15,
  categories: 3,
} as const

export function isProPlan(store?: Pick<PublicStore | Store, 'plan' | 'plan_expires_at'> | null): boolean {
  if (!store || store.plan !== 'pro') return false
  if (!store.plan_expires_at) return true

  const expiresAt = new Date(store.plan_expires_at)
  if (Number.isNaN(expiresAt.getTime())) return false

  return expiresAt.getTime() > Date.now()
}

export function getEffectivePlan(store?: Pick<PublicStore | Store, 'plan' | 'plan_expires_at'> | null): StorePlan {
  return isProPlan(store) ? 'pro' : 'free'
}

export function getPlanLabel(store?: Pick<PublicStore | Store, 'plan' | 'plan_expires_at'> | null): string {
  return isProPlan(store) ? 'Pro' : 'Gratis'
}

export function applyPublicProductLimit<T extends PublicProduct>(products: T[], store?: Pick<PublicStore, 'plan' | 'plan_expires_at'> | null): T[] {
  return isProPlan(store) ? products : products.slice(0, FREE_PLAN_LIMITS.products)
}

export function applyPublicCategoryLimit<T extends Pick<ProductCategory, 'id'> | { id: string }>(categories: T[], store?: Pick<PublicStore, 'plan' | 'plan_expires_at'> | null): T[] {
  return isProPlan(store) ? categories : categories.slice(0, FREE_PLAN_LIMITS.categories)
}

export function shouldShowWebtokokuWatermark(store?: Pick<PublicStore | Store, 'plan' | 'plan_expires_at'> | null): boolean {
  return !isProPlan(store)
}

export function canUseUnlimitedCatalog(store?: Pick<PublicStore | Store, 'plan' | 'plan_expires_at'> | null): boolean {
  return isProPlan(store)
}

export function canChangeTemplate(store?: Pick<Store, 'plan' | 'plan_expires_at' | 'is_published'> | null): boolean {
  if (!store) return false
  return isProPlan(store) || !store.is_published
}

export function getUpgradeWhatsAppUrl(store?: Pick<PublicStore | Store, 'nama_toko' | 'slug'> | null): string {
  const adminWa = (process.env.NEXT_PUBLIC_WEBTOKOKU_ADMIN_WA || '6285830145032').replace(/\D/g, '')
  const storeName = store?.nama_toko || 'toko saya'
  const storeSlug = store?.slug ? `/${store.slug}` : ''
  const message = [
    'Halo Admin WebTokoku, saya mau upgrade ke Pro.',
    `Toko: ${storeName}${storeSlug ? ` (${storeSlug})` : ''}`,
    'Paket: Pro Rp39.000/bulan',
  ].join('\n')

  return `https://wa.me/${adminWa}?text=${encodeURIComponent(message)}`
}

export function formatPlanExpiry(value?: string | null): string {
  if (!value) return 'Tidak ada batas'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Tanggal tidak valid'
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
