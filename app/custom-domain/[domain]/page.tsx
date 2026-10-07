import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { StorefrontRenderer } from '@/components/storefront/StorefrontRenderer'
import { getStoreByCustomDomain } from '@/lib/public-store'

export const dynamic = 'force-dynamic'

type Props = { params: { domain: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const store = await getStoreByCustomDomain(decodeURIComponent(params.domain))
  if (!store) return { title: 'Toko Tidak Ditemukan | webtokoku' }
  const domain = decodeURIComponent(params.domain)
  const canonical = `https://${domain}`
  const title = `${store.nama_toko} - Katalog Produk Online`
  const description = store.deskripsi || `Lihat katalog produk ${store.nama_toko} dan pesan langsung lewat WhatsApp.`

  return {
    title,
    description,
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
  }
}

export default async function CustomDomainStorePage({ params }: Props) {
  const store = await getStoreByCustomDomain(decodeURIComponent(params.domain))
  if (!store) {
    notFound()
    return null
  }

  return <StorefrontRenderer store={store} />
}
