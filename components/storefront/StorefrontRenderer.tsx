import { CommerceLayer } from '@/components/commerce/CommerceLayer'
import { AnalyticsTracker } from '@/components/analytics/AnalyticsTracker'
import { fetchStoreCustomizations, mergeWithDefaults } from '@/lib/customizations'
import { getAllFeatureFlags } from '@/lib/feature-flags'
import { getStorePaymentMethods, getStoreProducts, getStoreShippingSettings, getStoreCategories, type PublicStore } from '@/lib/public-store'
import { applyPublicCategoryLimit, applyPublicProductLimit, shouldShowWebtokokuWatermark } from '@/lib/plan'

type Props = {
  store: PublicStore
}

export async function StorefrontRenderer({ store }: Props) {
  const [products, paymentMethods, shippingSettings, dbCustomizations, featureFlags, categories] = await Promise.all([
    getStoreProducts(store.id),
    getStorePaymentMethods(store.id),
    getStoreShippingSettings(store.id),
    fetchStoreCustomizations(store.id),
    getAllFeatureFlags(),
    getStoreCategories(store.id),
  ])

  const customizations = mergeWithDefaults(dbCustomizations, store.template || 'butik', store)
  const visibleProducts = applyPublicProductLimit(products, store)
  const visibleCategories = applyPublicCategoryLimit(categories, store)

  const template = await (async () => {
    switch (store.template) {
      case 'dapur': {
        const { DapurTemplate } = await import('@/components/templates/DapurTemplate')
        return <DapurTemplate store={store} products={visibleProducts} customizations={customizations} categories={visibleCategories} />
      }
      case 'glow': {
        const { GlowTemplate } = await import('@/components/templates/GlowTemplate')
        return <GlowTemplate store={store} products={visibleProducts} customizations={customizations} categories={visibleCategories} />
      }
      case 'luxe': {
        const { LuxeTemplate } = await import('@/components/templates/LuxeTemplate')
        return <LuxeTemplate store={store} products={visibleProducts} customizations={customizations} categories={visibleCategories} />
      }
      case 'herba': {
        const { HerbaTemplate } = await import('@/components/templates/HerbaTemplate')
        return <HerbaTemplate store={store} products={visibleProducts} customizations={customizations} categories={visibleCategories} />
      }
      case 'butik':
      default: {
        const { ButikTemplate } = await import('@/components/templates/ButikTemplate')
        return <ButikTemplate store={store} products={visibleProducts} customizations={customizations} categories={visibleCategories} />
      }
    }
  })()

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
      <AnalyticsTracker storeId={store.id} />
      {template}
    </CommerceLayer>
  )
}
