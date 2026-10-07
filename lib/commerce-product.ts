import type { PublicProduct } from '@/lib/public-store'
import type { CommerceProduct, ProductAddon, ProductVariant } from '@/types/commerce'

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

export function toCommerceProduct(product: PublicProduct): CommerceProduct {
  const galleryImages = (product.product_images || [])
    .sort((a, b) => (a.urutan || 0) - (b.urutan || 0))
    .map((image) => image.url)

  const optionGroups = asArray<any>(product.option_groups)
  const variants = optionGroups.flatMap<ProductVariant>((group) =>
    asArray<any>(group.values).map((value) => ({
      id: `${group.id || group.name}-${value.id || value.label}`,
      name: group.name || 'Pilihan',
      value: value.label || value.value || '',
      priceDelta: Number(value.price_delta || 0),
      stock: typeof value.stock === 'number' ? value.stock : undefined,
      weightGram: typeof value.weight_delta === 'number' ? value.weight_delta : undefined,
      colorHex: value.color_hex,
      groupId: group.id,
    })),
  )

  const addons = asArray<any>(product.addons).map<ProductAddon>((addon) => ({
    id: addon.id || addon.name,
    name: addon.name,
    price: Number(addon.price || 0),
    required: Boolean(addon.required),
    maxQty: Number(addon.max_qty || 1),
  }))

  return {
    id: product.id,
    title: product.nama,
    price: product.harga,
    compareAtPrice: product.compare_at_price || null,
    images: product.foto_url ? [product.foto_url, ...galleryImages] : galleryImages,
    slug: product.id,
    isAvailable: (product.stok || 0) > 0,
    stock: product.stok || 0,
    description: product.deskripsi || '',
    category: product.show_category === false ? '' : product.kategori || '',
    weightGram: product.berat_gram || 0,
    variants,
    addons,
    details: product.product_details || {},
  }
}

export function getHomepageProducts(products: PublicProduct[], limit = 6) {
  const safeProducts = products || []
  const selected = safeProducts.filter((product) => product.show_on_homepage)
  const source = selected.length > 0 ? selected : safeProducts

  return [...source]
    .sort((a, b) => {
      const rankA = typeof a.homepage_rank === 'number' ? a.homepage_rank : 0
      const rankB = typeof b.homepage_rank === 'number' ? b.homepage_rank : 0
      if (rankA !== rankB) return rankA - rankB
      const orderA = typeof a.urutan === 'number' ? a.urutan : 0
      const orderB = typeof b.urutan === 'number' ? b.urutan : 0
      if (orderA !== orderB) return orderA - orderB
      return a.nama.localeCompare(b.nama)
    })
    .slice(0, limit)
}

export function visibleCategories(products: PublicProduct[]) {
  return Array.from(
    new Set(
      products
        .filter((product) => product.show_category !== false && product.kategori)
        .map((product) => product.kategori as string),
    ),
  )
}
