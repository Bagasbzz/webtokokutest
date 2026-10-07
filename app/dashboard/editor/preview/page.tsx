import { getStoreById, getStoreProducts } from '@/lib/public-store'
import { PreviewClient } from './PreviewClient'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PreviewPageProps {
  searchParams: { storeId?: string }
}

import { fetchEditorCustomizations } from '@/lib/customizations'

export default async function PreviewPage({ searchParams }: PreviewPageProps) {
  const storeId = searchParams.storeId
  if (!storeId) return notFound()

  const store = await getStoreById(storeId)
  if (!store) return notFound()

  const products = await getStoreProducts(store.id)
  const savedCustomizations = await fetchEditorCustomizations(store.id)

  return (
    <PreviewClient
      store={store}
      products={products}
      initialCustomizations={savedCustomizations}
      templateId={store.template}
    />
  )
}
