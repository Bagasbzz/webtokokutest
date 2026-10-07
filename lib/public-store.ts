import { createClient } from '@supabase/supabase-js'
import {
  sanitizeFontValue,
  sanitizePlainText,
  sanitizeThemeColorList,
  sanitizeUrl,
} from './customization-security'
import { isPublicModerationStatus } from './moderation'

// PENTING: Untuk halaman publik, gunakan @supabase/supabase-js langsung
// BUKAN createClient dari @/lib/supabase/client (yang butuh browser)
// Ini agar bisa dipanggil di server component

const RESERVED_SLUGS = [
  'auth', 'dashboard', 'onboarding', 'api', '_next',
  'index.html', 'favicon.ico', 'editor', 'inidemo', 'demo',
  'template-previews', 'admin', 'blog', 'help', 'support',
  'login', 'register', 'logout', 'static', 'public', 'custom-domain',
]

export interface PublicStore {
  id: string
  nama_toko: string
  slug: string
  custom_domain?: string | null
  deskripsi: string | null
  template: string
  warna_tema: string
  logo_url: string | null
  no_wa: string
  kota: string | null
  business_category?: string | null
  hero_image_url: string | null
  font_heading: string
  font_body: string
  hero_title: string | null
  hero_subtitle: string | null
  alamat: string | null
  plan?: 'free' | 'pro' | null
  plan_expires_at?: string | null
  pro_started_at?: string | null
  pro_notes?: string | null
  moderation_status?: string | null
}

export interface PublicProduct {
  id: string
  nama: string
  harga: number
  deskripsi: string | null
  foto_url: string | null
  kategori: string | null
  category_id?: string | null
  product_type?: string
  option_groups?: any[]
  variants?: any[]
  addons?: any[]
  product_details?: Record<string, any>
  show_category?: boolean
  show_on_homepage?: boolean
  homepage_rank?: number
  badge_label?: string | null
  compare_at_price?: number | null
  berat_gram: number
  stok: number
  urutan?: number
  product_images?: { url: string; urutan: number }[]
}

// Buat Supabase client untuk query publik (server-side safe)
function getPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

function sanitizePublicStore(data: any): PublicStore | null {
  if (!data) return null
  if (!isPublicModerationStatus(data.moderation_status)) return null
  return {
    ...data,
    nama_toko: sanitizePlainText(data.nama_toko),
    deskripsi: sanitizePlainText(data.deskripsi) || null,
    warna_tema: sanitizeThemeColorList(data.warna_tema),
    logo_url: sanitizeUrl(data.logo_url, 'image') || null,
    hero_image_url: sanitizeUrl(data.hero_image_url, 'image') || null,
    font_heading: sanitizeFontValue(data.font_heading) || 'Inter',
    font_body: sanitizeFontValue(data.font_body) || 'Inter',
    hero_title: sanitizePlainText(data.hero_title) || null,
    hero_subtitle: sanitizePlainText(data.hero_subtitle) || null,
    kota: sanitizePlainText(data.kota) || null,
    alamat: sanitizePlainText(data.alamat) || null,
    business_category: sanitizePlainText(data.business_category) || null,
  }
}

function sanitizePublicProduct(product: any): PublicProduct {
  return {
    ...product,
    nama: sanitizePlainText(product.nama),
    deskripsi: sanitizePlainText(product.deskripsi) || null,
    foto_url: sanitizeUrl(product.foto_url, 'image') || null,
    kategori: sanitizePlainText(product.kategori) || null,
    badge_label: sanitizePlainText(product.badge_label) || null,
    product_images: Array.isArray(product.product_images)
      ? product.product_images
          .map((image: any) => ({ ...image, url: sanitizeUrl(image.url, 'image') }))
          .filter((image: any) => image.url)
      : product.product_images,
  }
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug.toLowerCase())
}

export async function getStoreBySlug(slug: string): Promise<PublicStore | null> {
  if (isReservedSlug(slug)) return null
  const supabase = getPublicClient()
  if (!supabase) return null

  try {
    const { data } = await supabase
      .from('stores')
      .select('id, nama_toko, slug, deskripsi, template, warna_tema, logo_url, no_wa, kota, alamat, business_category, hero_image_url, font_heading, font_body, hero_title, hero_subtitle, plan, plan_expires_at, pro_started_at, pro_notes, moderation_status')
      .eq('slug', slug)
      .eq('is_active', true)
      .eq('is_published', true)
      .in('moderation_status', ['safe', 'flagged'])
      .single()

    return sanitizePublicStore(data)
  } catch (err) {
    console.error('Error in getStoreBySlug:', err)
    return null
  }
}

export async function getStoreByCustomDomain(domain: string): Promise<PublicStore | null> {
  const supabase = getPublicClient()
  if (!supabase) return null

  try {
    const normalizedDomain = domain.toLowerCase().replace(/^www\./, '')
    const { data } = await supabase
      .from('stores')
      .select('id, nama_toko, slug, deskripsi, template, warna_tema, logo_url, no_wa, kota, alamat, business_category, hero_image_url, font_heading, font_body, hero_title, hero_subtitle, plan, plan_expires_at, pro_started_at, pro_notes, moderation_status')
      .eq('custom_domain', normalizedDomain)
      .eq('is_active', true)
      .eq('is_published', true)
      .in('moderation_status', ['safe', 'flagged'])
      .single()

    return sanitizePublicStore(data)
  } catch (err) {
    console.error('Error in getStoreByCustomDomain:', err)
    return null
  }
}

export async function getStoreById(id: string): Promise<PublicStore | null> {
  const supabase = getPublicClient()
  if (!supabase) return null

  try {
    const { data } = await supabase
      .from('stores')
      .select('id, nama_toko, slug, custom_domain, deskripsi, template, warna_tema, logo_url, no_wa, kota, alamat, business_category, hero_image_url, font_heading, font_body, hero_title, hero_subtitle, plan, plan_expires_at, pro_started_at, pro_notes, moderation_status')
      .eq('id', id)
      .single()

    return sanitizePublicStore(data)
  } catch (err) {
    console.error('Error in getStoreById:', err)
    return null
  }
}

export async function getStoreProducts(storeId: string): Promise<PublicProduct[]> {
  try {
    const supabase = getPublicClient()
    if (!supabase) return []

    const { data, error } = await supabase
      .from('products')
      .select(`
        id, nama, harga, deskripsi, foto_url, kategori, category_id, product_type, option_groups, variants, addons, product_details, show_category, show_on_homepage, homepage_rank, badge_label, compare_at_price, berat_gram, stok, urutan,
        product_images(url, urutan)
      `)
      .eq('store_id', storeId)
      .eq('is_active', true)
      .in('moderation_status', ['safe', 'flagged'])
      .order('urutan', { ascending: true })

    if (error) {
      // Fallback query if product_images table relation is not populated or has issues
      const { data: fallbackData } = await supabase
        .from('products')
        .select('id, nama, harga, deskripsi, foto_url, kategori, category_id, show_on_homepage, badge_label, compare_at_price, berat_gram, stok, urutan')
        .eq('store_id', storeId)
        .eq('is_active', true)
        .in('moderation_status', ['safe', 'flagged'])
        .order('urutan', { ascending: true })
      return ((fallbackData || []) as any[]).map(sanitizePublicProduct)
    }

    return ((data || []) as any[]).map(sanitizePublicProduct)
  } catch (err) {
    console.error('Error fetching storefront products:', err)
    return []
  }
}

export async function getStorePaymentMethods(storeId: string) {
  try {
    const supabase = getPublicClient()
    if (!supabase) return []

    const { data } = await supabase
      .from('payment_methods')
      .select('id, type, bank_name, account_number, account_name, qr_image_url, is_active')
      .eq('store_id', storeId)
      .eq('is_active', true)

    return (data || []).map((method: any) => ({
      ...method,
      qr_image_url: sanitizeUrl(method.qr_image_url, 'image') || null,
    }))
  } catch (err) {
    console.error('Error fetching payment methods:', err)
    return []
  }
}

export async function getStoreShippingSettings(storeId: string) {
  try {
    const supabase = getPublicClient()
    if (!supabase) {
      return {
        auto_shipping_enabled: false,
        pickup_enabled: true,
        cod_enabled: false,
        allowed_couriers: ['jne', 'jnt', 'sicepat'],
        free_shipping_minimum: 0,
      }
    }

    const { data } = await supabase
      .from('shipping_settings')
      .select('auto_shipping_enabled, pickup_enabled, cod_enabled, allowed_couriers, free_shipping_minimum')
      .eq('store_id', storeId)
      .single()

    return data || {
      auto_shipping_enabled: false,
      pickup_enabled: true,
      cod_enabled: false,
      allowed_couriers: ['jne', 'jnt', 'sicepat'],
      free_shipping_minimum: 0,
    }
  } catch (err) {
    console.error('Error fetching shipping settings:', err)
    return {
      auto_shipping_enabled: false,
      pickup_enabled: true,
      cod_enabled: false,
      allowed_couriers: ['jne', 'jnt', 'sicepat'],
      free_shipping_minimum: 0,
    }
  }
}

export async function getStoreCategories(storeId: string) {
  try {
    const supabase = getPublicClient()
    if (!supabase) return []

    const { data } = await supabase
      .from('product_categories')
      .select('id, name, slug')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    return data || []
  } catch (err) {
    console.error('Error fetching storefront categories:', err)
    return []
  }
}
