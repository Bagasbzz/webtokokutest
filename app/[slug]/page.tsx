/**
 * Multi-Tenant Store Page
 * 
 * Halaman ini menangani semua request ke subdomain toko: /[slug]
 * Ini adalah core feature dari webtokoku - setiap seller punya URL unik.
 * 
 * Cara kerja:
 * 1. Ambil slug dari URL params
 * 2. Query database untuk cari toko dengan slug tersebut
 * 3. Kalau tidak ketemu → 404
 * 4. Kalau ketemu → ambil produk toko tersebut
 * 5. Render template yang sesuai dengan store.template
 * 
 * Templates:
 * - butik: Butik Hana (Fashion)
 * - dapur: Dapur Nusantara (Kuliner)
 * - glow: Glow Lab (Skincare)
 * - luxe: Luna Beauty (Kosmetik)
 * - herba: Bazzhealth (Apotek)
 * 
 * @see docs/SYSTEM_PLAN.md untuk detail arsitektur multi-tenant
 */

import { notFound } from 'next/navigation'
import { getStoreBySlug } from '@/lib/public-store'
import type { Metadata } from 'next'
import { StorefrontRenderer } from '@/components/storefront/StorefrontRenderer'
import { getStorefrontUrl } from '@/lib/domains'

// Force dynamic rendering karena data toko bisa berubah kapan saja
export const dynamic = 'force-dynamic'

type Props = { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const store = await getStoreBySlug(params.slug)
  if (!store) return { title: 'Toko Tidak Ditemukan | webtokoku' }
  const category = store.business_category?.trim()
  const title = category
    ? `${store.nama_toko} - ${category} Online`
    : `${store.nama_toko} - Katalog Produk Online`
  const description = store.deskripsi || (category
    ? `Lihat katalog ${category.toLowerCase()} dari ${store.nama_toko} dan pesan langsung lewat WhatsApp.`
    : `Lihat katalog produk ${store.nama_toko} dan pesan langsung lewat WhatsApp.`)
  const canonical = getStorefrontUrl(store.slug)

  return {
    title,
    description,
    keywords: [store.nama_toko, category, 'katalog online', 'toko online', 'WebTokoku'].filter(Boolean) as string[],
    icons: store.logo_url ? { icon: store.logo_url } : undefined,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: store.nama_toko,
      type: 'website',
      locale: 'id_ID',
      images: store.hero_image_url ? [{ url: store.hero_image_url, alt: store.nama_toko }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: store.hero_image_url ? [store.hero_image_url] : undefined,
    },
  }
}

export default async function StorePage({ params }: Props) {
  const store = await getStoreBySlug(params.slug)
  if (!store) { notFound(); return null }

  return <StorefrontRenderer store={store} />
}
