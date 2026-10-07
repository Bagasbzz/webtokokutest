import { notFound } from 'next/navigation'
import { CommerceLayer } from '@/components/commerce/CommerceLayer'
import { ProductsIndexClient } from '@/components/storefront/ProductsIndexClient'
import { getAllFeatureFlags } from '@/lib/feature-flags'
import { getStoreBySlug, getStorePaymentMethods, getStoreProducts, getStoreShippingSettings } from '@/lib/public-store'
import { applyPublicProductLimit, shouldShowWebtokokuWatermark } from '@/lib/plan'
import type { Metadata } from 'next'
import { getStorefrontUrl } from '@/lib/domains'

type Props = { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const store = await getStoreBySlug(params.slug)
  if (!store) return { title: 'Toko Tidak Ditemukan | webtokoku' }
  const category = store.business_category?.trim()
  const title = category
    ? `Katalog ${category} - ${store.nama_toko}`
    : `Katalog Produk - ${store.nama_toko}`
  const description = category
    ? `Lihat semua produk ${category.toLowerCase()} dari ${store.nama_toko} dan pesan langsung lewat WhatsApp.`
    : `Lihat katalog produk lengkap dari ${store.nama_toko} dan pesan langsung lewat WhatsApp.`
  const canonical = `${getStorefrontUrl(store.slug)}/produk`

  return {
    title,
    description,
    keywords: [store.nama_toko, category, 'katalog produk', 'produk online'].filter(Boolean) as string[],
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

export default async function StoreProductsPage({ params }: { params: { slug: string } }) {
  const store = await getStoreBySlug(params.slug)
  if (!store) notFound()

  const [products, paymentMethods, shippingSettings, featureFlags] = await Promise.all([
    getStoreProducts(store.id),
    getStorePaymentMethods(store.id),
    getStoreShippingSettings(store.id),
    getAllFeatureFlags(),
  ])
  const visibleProducts = applyPublicProductLimit(products, store)

  return (
    <CommerceLayer
      store={{
        id: store.id,
        nama_toko: store.nama_toko,
        wa_nomor: store.no_wa || '',
        slug: store.slug,
        warna_tema: store.warna_tema,
        template: store.template,
        paymentMethods,
        shippingSettings,
      }}
      featureFlags={featureFlags}
      showWatermark={shouldShowWebtokokuWatermark(store)}
    >
      <ProductsIndexClient store={store} products={visibleProducts} />
    </CommerceLayer>
  )
}
