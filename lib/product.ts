import { createClient } from '@/lib/supabase/client'
import type { Product, ProductAddon, ProductCategory, ProductDetails, ProductOptionGroup, ProductType, ProductVariantOption } from '@/lib/types'
import { compressImage } from '@/lib/editor-image-processing'
import { IMAGE_UPLOAD } from '@/lib/upload-limits'
import { FREE_PLAN_LIMITS, isProPlan } from '@/lib/plan'

export type { Product }

export interface ProductForm {
  nama: string
  harga: number
  deskripsi?: string
  foto_url?: string
  kategori?: string
  category_id?: string | null
  product_type?: ProductType
  option_groups?: ProductOptionGroup[]
  variants?: ProductVariantOption[]
  addons?: ProductAddon[]
  product_details?: ProductDetails
  show_category?: boolean
  show_on_homepage?: boolean
  homepage_rank?: number
  badge_label?: string | null
  compare_at_price?: number | null
  berat_gram: number
  stok?: number
}

function slugifyCategory(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function scanProductModeration(productId: string) {
  const res = await fetch('/api/moderation/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.error) {
    throw new Error(json.error || 'Gagal memeriksa moderasi produk')
  }
  return json
}

async function getStorePlanState(supabase: ReturnType<typeof createClient>, storeId: string) {
  const { data, error } = await supabase
    .from('stores')
    .select('plan, plan_expires_at')
    .eq('id', storeId)
    .single()

  if (error) {
    console.error('Error checking store plan:', error)
    throw new Error('Gagal memeriksa paket toko')
  }

  return data
}

export async function getMyStoreId(): Promise<string | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: seller } = await supabase
    .from('sellers')
    .select('id')
    .eq('user_id', user.id)
    .single()
  
  if (!seller) return null

  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('seller_id', seller.id)
    .single()
  
  return store?.id || null
}

export async function getProducts(storeId: string): Promise<Product[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', storeId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    throw new Error('Gagal mengambil data produk')
  }

  return data as Product[]
}

export async function getProductCategories(storeId: string): Promise<ProductCategory[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .eq('store_id', storeId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching product categories:', error)
    throw new Error('Gagal mengambil kategori produk')
  }

  return data as ProductCategory[]
}

export async function ensureProductCategory(storeId: string, name: string): Promise<ProductCategory | null> {
  const cleanName = name.trim()
  if (!cleanName) return null

  const supabase = createClient()
  const slug = slugifyCategory(cleanName)
  if (!slug) return null

  const { data: existing, error: existingError } = await supabase
    .from('product_categories')
    .select('*')
    .eq('store_id', storeId)
    .eq('slug', slug)
    .maybeSingle()

  if (existingError) {
    console.error('Error checking product category:', existingError)
    throw new Error('Gagal memeriksa kategori produk')
  }

  if (existing) {
    if (existing.name !== cleanName || existing.is_active === false) {
      if (existing.is_active === false) {
        const planState = await getStorePlanState(supabase, storeId)
        if (!isProPlan(planState)) {
          const { count, error: countError } = await supabase
            .from('product_categories')
            .select('id', { count: 'exact', head: true })
            .eq('store_id', storeId)
            .eq('is_active', true)

          if (countError) {
            console.error('Error counting product categories:', countError)
            throw new Error('Gagal memeriksa batas kategori')
          }

          if ((count || 0) >= FREE_PLAN_LIMITS.categories) {
            throw new Error(`Paket Gratis maksimal ${FREE_PLAN_LIMITS.categories} kategori aktif. Upgrade Pro untuk kategori unlimited.`)
          }
        }
      }

      const { data: updated, error: updateError } = await supabase
        .from('product_categories')
        .update({ name: cleanName, is_active: true, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating product category:', updateError)
        throw new Error('Gagal memperbarui kategori produk')
      }

      return updated as ProductCategory
    }

    return existing as ProductCategory
  }

  const planState = await getStorePlanState(supabase, storeId)
  if (!isProPlan(planState)) {
    const { count, error: countError } = await supabase
      .from('product_categories')
      .select('id', { count: 'exact', head: true })
      .eq('store_id', storeId)
      .eq('is_active', true)

    if (countError) {
      console.error('Error counting product categories:', countError)
      throw new Error('Gagal memeriksa batas kategori')
    }

    if ((count || 0) >= FREE_PLAN_LIMITS.categories) {
      throw new Error(`Paket Gratis maksimal ${FREE_PLAN_LIMITS.categories} kategori aktif. Upgrade Pro untuk kategori unlimited.`)
    }
  }

  const { data, error } = await supabase
    .from('product_categories')
    .insert({ store_id: storeId, name: cleanName, slug })
    .select()
    .single()

  if (error) {
    console.error('Error creating product category:', error)
    throw new Error('Gagal membuat kategori produk')
  }

  return data as ProductCategory
}

export async function getProduct(id: string): Promise<Product | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  return data as Product
}

export async function addProduct(storeId: string, data: ProductForm): Promise<void> {
  const supabase = createClient()
  const planState = await getStorePlanState(supabase, storeId)

  if (!isProPlan(planState)) {
    const { count, error: countError } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('store_id', storeId)
      .eq('is_active', true)

    if (countError) {
      console.error('Error counting products:', countError)
      throw new Error('Gagal memeriksa batas produk')
    }

    if ((count || 0) >= FREE_PLAN_LIMITS.products) {
      throw new Error(`Paket Gratis maksimal ${FREE_PLAN_LIMITS.products} produk aktif. Upgrade Pro untuk produk unlimited.`)
    }
  }

  const { data: insertedProduct, error } = await supabase
    .from('products')
    .insert({
      store_id: storeId,
      nama: data.nama,
      harga: data.harga,
      deskripsi: data.deskripsi || null,
      foto_url: data.foto_url || null,
      kategori: data.kategori || null,
      category_id: data.category_id || null,
      product_type: data.product_type || 'general',
      option_groups: data.option_groups || [],
      variants: data.variants || [],
      addons: data.addons || [],
      product_details: data.product_details || {},
      show_category: data.show_category ?? true,
      show_on_homepage: data.show_on_homepage ?? false,
      homepage_rank: data.homepage_rank ?? 0,
      badge_label: data.badge_label || null,
      compare_at_price: data.compare_at_price || null,
      berat_gram: data.berat_gram || 0,
      stok: data.stok ?? 0,
      is_active: true,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error adding product:', error)
    throw new Error(error.message || 'Gagal menambahkan produk')
  }

  const scan = await scanProductModeration(insertedProduct.id)
  if (scan?.blocked) {
    throw new Error(scan.message || 'Produk tersimpan, tetapi perlu ditinjau sebelum tampil publik.')
  }
}

export async function updateProduct(id: string, data: Partial<ProductForm>): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('products')
    .update({
      nama: data.nama,
      harga: data.harga,
      deskripsi: data.deskripsi,
      foto_url: data.foto_url,
      kategori: data.kategori,
      category_id: data.category_id,
      product_type: data.product_type,
      option_groups: data.option_groups,
      variants: data.variants,
      addons: data.addons,
      product_details: data.product_details,
      show_category: data.show_category,
      show_on_homepage: data.show_on_homepage,
      homepage_rank: data.homepage_rank,
      badge_label: data.badge_label,
      compare_at_price: data.compare_at_price,
      berat_gram: data.berat_gram,
      stok: data.stok,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating product:', error)
    throw new Error('Gagal memperbarui produk')
  }

  const scan = await scanProductModeration(id)
  if (scan?.blocked) {
    throw new Error(scan.message || 'Produk diperbarui, tetapi perlu ditinjau sebelum tampil publik.')
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = createClient()
  // Soft delete
  const { error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', id)

  if (error) {
    console.error('Error deleting product:', error)
    throw new Error('Gagal menghapus produk')
  }
}

export async function uploadProductPhoto(file: File, storeId: string): Promise<string> {
  if (!IMAGE_UPLOAD.allowedTypes.includes(file.type)) {
    throw new Error('Format foto harus JPG, PNG, atau WEBP.')
  }

  if (file.size > IMAGE_UPLOAD.maxOriginalBytes) {
    throw new Error(`Ukuran foto terlalu besar. Maksimal file awal ${IMAGE_UPLOAD.maxOriginalLabel}; sistem akan kompres otomatis.`)
  }

  const processedFile = await compressImage(file, IMAGE_UPLOAD.maxStoredBytes)
  if (processedFile.size > IMAGE_UPLOAD.maxStoredBytes) {
    throw new Error(`Foto masih terlalu besar setelah dikompres. Pakai foto yang lebih sederhana atau crop lebih kecil agar di bawah ${IMAGE_UPLOAD.maxStoredLabel}.`)
  }

  const form = new FormData()
  form.append('file', processedFile)
  form.append('store_id', storeId)
  form.append('purpose', 'product')

  const res = await fetch('/api/upload', { method: 'POST', body: form })
  const json = await res.json().catch(() => ({}))

  if (!res.ok || json.error) {
    throw new Error(json.error || `Gagal mengunggah foto (HTTP ${res.status})`)
  }

  return json.url
}

/**
 * Upload foto produk yang sudah di-crop oleh ImageCropperModal.
 * PENTING: JANGAN pakai compressImage() di sini karena akan menghapus
 * masking bentuk (bulat/oval/segilima). Blob dari cropper sudah WebP
 * dengan transparansi yang sudah benar.
 */
export async function uploadCroppedProductPhoto(croppedBlob: Blob, storeId: string): Promise<string> {
  const fileName = `product-cropped-${Date.now()}.webp`
  const file = new File([croppedBlob], fileName, { type: 'image/webp' })

  const form = new FormData()
  form.append('file', file)
  form.append('store_id', storeId)
  form.append('purpose', 'product')

  const res = await fetch('/api/upload', { method: 'POST', body: form })
  const json = await res.json().catch(() => ({}))

  if (!res.ok || json.error) {
    throw new Error(json.error || `Gagal mengunggah foto produk (HTTP ${res.status})`)
  }

  return json.url
}

export async function deleteProductCategory(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('product_categories')
    .update({ is_active: false })
    .eq('id', id)

  if (error) {
    console.error('Error deleting product category:', error)
    throw new Error('Gagal menghapus kategori')
  }
}

export async function assignProductsToCategory(storeId: string, categoryName: string | null, categoryId: string | null, productIds: string[]): Promise<void> {
  const supabase = createClient()
  
  if (categoryId) {
    const { error: resetError } = await supabase
      .from('products')
      .update({ category_id: null, kategori: null })
      .eq('store_id', storeId)
      .eq('category_id', categoryId)
      
    if (resetError) {
      console.error('Error resetting product categories:', resetError)
      throw new Error('Gagal memperbarui kategori produk')
    }
  }
  
  if (productIds.length > 0) {
    const { error: updateError } = await supabase
      .from('products')
      .update({ category_id: categoryId, kategori: categoryName })
      .in('id', productIds)
      
    if (updateError) {
      console.error('Error assigning products to category:', updateError)
      throw new Error('Gagal menetapkan kategori produk')
    }
  }
}

export async function updateProductFields(id: string, fields: Record<string, any>): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('products')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Error updating product fields:', error)
    throw new Error(error.message || 'Gagal memperbarui produk')
  }
}
