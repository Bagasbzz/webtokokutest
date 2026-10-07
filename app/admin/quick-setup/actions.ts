'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface QuickSetupResult {
  success: boolean
  error?: string
  storeSlug?: string
  sellerEmail?: string
}

function slugifyCategory(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Minimal Sample Data Generator for Server Side
const IMAGES: Record<string, string[]> = {
  butik: [
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=900&auto=format&fit=crop'
  ],
  dapur: [
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1627042633145-b780d842ba45?q=80&w=900&auto=format&fit=crop'
  ],
  glow: [
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=900&auto=format&fit=crop'
  ],
  luxe: [
    'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1596462502277-27bfdc40334a?q=80&w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=900&auto=format&fit=crop'
  ],
  herba: [
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?q=80&w=900&auto=format&fit=crop'
  ]
}

const TEMPLATE_NAMES: Record<string, { type: string, names: string[], categories: string[] }> = {
  butik: {
    type: 'fashion',
    names: ['Dress', 'Outer', 'Kemeja', 'Celana', 'Hijab'],
    categories: ['Ready to Wear', 'Atasan', 'Bawahan']
  },
  dapur: {
    type: 'food',
    names: ['Rendang', 'Rice Bowl', 'Ayam Bakar', 'Sate', 'Sambal'],
    categories: ['Menu harian', 'Paket keluarga', 'Frozen food']
  },
  glow: {
    type: 'skincare',
    names: ['Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen'],
    categories: ['Cleanser', 'Treatment', 'Daily care']
  },
  luxe: {
    type: 'beauty',
    names: ['Lip Tint', 'Cushion', 'Brow Pencil', 'Blush', 'Palette'],
    categories: ['Lip', 'Base', 'Eye']
  },
  herba: {
    type: 'health',
    names: ['Vitamin C', 'Madu Herbal', 'Omega 3', 'Probiotik', 'Masker Medis'],
    categories: ['Vitamin', 'Herbal', 'Alat kesehatan']
  }
}

const TEMPLATE_BUSINESS_CATEGORIES: Record<string, string> = {
  butik: 'Fashion & Hijab',
  dapur: 'Makanan & Minuman',
  glow: 'Skincare',
  luxe: 'Kosmetik',
  herba: 'Kesehatan & Apotek',
}

function makeProducts(template: string): any[] {
  const config = TEMPLATE_NAMES[template] || TEMPLATE_NAMES['butik']
  const images = IMAGES[template] || IMAGES['butik']
  
  return Array.from({ length: 15 }, (_, index) => {
    const category = config.categories[index % config.categories.length]
    const name = `${config.names[index % config.names.length]} ${index + 1}`
    const harga = 25000 + (index + 1) * 9000
    const type = config.type
    const isFood = type === 'food'
    const isWear = type === 'fashion'
    const isCare = type === 'skincare' || type === 'beauty'
    
    return {
      nama: name,
      harga,
      kategori: category,
      deskripsi: `Detail ${name.toLowerCase()} lengkap dengan stok, berat, dan pilihan varian.`,
      foto_url: images[index % images.length],
      berat_gram: isFood ? 500 : 250,
      stok: 25,
      product_type: type,
      show_category: true,
      show_on_homepage: index < 6,
      homepage_rank: index,
      badge_label: index === 0 ? 'Best seller' : index === 1 ? 'Terlaris' : index === 2 ? 'Promo' : null,
      compare_at_price: index === 2 ? harga + 18000 : null,
      option_groups: isFood
        ? [{ id: 'portion', name: 'Porsi', type: 'portion', required: true, values: [{ id: 'regular', label: 'Reguler' }, { id: 'large', label: 'Large', price_delta: 12000 }] }]
        : isWear
          ? [{ id: 'size', name: 'Ukuran', type: 'size', required: true, values: [{ id: 's', label: 'S' }, { id: 'm', label: 'M' }, { id: 'l', label: 'L' }] }, { id: 'color', name: 'Warna', type: 'color', required: true, values: [{ id: 'black', label: 'Hitam', color_hex: '#111111' }, { id: 'cream', label: 'Cream', color_hex: '#e7d7bd' }] }]
          : [{ id: 'size', name: 'Isi', type: isCare ? 'shade' : 'custom', required: true, values: [{ id: 'small', label: isCare ? 'Natural' : '1 pcs' }, { id: 'bundle', label: 'Bundle', price_delta: 25000 }] }],
      addons: isFood ? [{ id: 'sambal', name: 'Extra sambal', price: 5000, max_qty: 3 }] : [],
      product_details: {
        unit: isFood ? 'porsi' : 'pcs',
        portion_detail: isFood ? 'Reguler dan large' : undefined,
        contents: isCare ? '1 produk utama' : undefined,
        material: isWear ? 'Bahan nyaman untuk harian' : undefined,
        usage: isCare ? 'Gunakan sesuai kebutuhan' : undefined,
        shipping_note: 'Dikemas sebelum dikirim',
      }
    }
  })
}

export async function quickSetupStore(formData: FormData): Promise<QuickSetupResult> {
  const supabase = createAdminClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const namaLengkap = formData.get('namaLengkap') as string
  const namaToko = formData.get('namaToko') as string
  const slug = formData.get('slug') as string
  const noWa = formData.get('noWa') as string
  const template = formData.get('template') as string
  const templateColor = formData.get('warnaTema') as string
  const deskripsi = formData.get('deskripsi') as string
  
  if (!email || !password || !namaLengkap || !namaToko || !slug || !noWa) {
    return { success: false, error: 'Silakan isi semua bidang wajib (Bintang *).' }
  }

  // Format WA Number
  let cleanWa = noWa.replace(/\D/g, '')
  if (cleanWa.startsWith('0')) {
    cleanWa = '62' + cleanWa.slice(1)
  } else if (!cleanWa.startsWith('62')) {
    cleanWa = '62' + cleanWa
  }

  try {
    // 1. Create Auth User in Supabase Auth via Admin Client
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      return { success: false, error: `Gagal membuat User Auth: ${authError.message}` }
    }

    const userId = authData.user.id

    // 2. Create Seller Profile
    const { data: seller, error: sellerError } = await supabase
      .from('sellers')
      .insert({
        user_id: userId,
        email,
        nama_lengkap: namaLengkap,
        no_wa: cleanWa,
        role: 'seller'
      })
      .select()
      .single()

    if (sellerError) {
      // Clean up Auth user if seller insert fails
      await supabase.auth.admin.deleteUser(userId)
      return { success: false, error: `Gagal membuat profil seller: ${sellerError.message}` }
    }

    // 3. Create Store
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .insert({
        seller_id: seller.id,
        nama_toko: namaToko,
        slug,
        deskripsi: deskripsi || null,
        template,
        no_wa: cleanWa,
        warna_tema: templateColor || '#16a34a',
        business_category: TEMPLATE_BUSINESS_CATEGORIES[template] || 'Umum / Serba Ada',
        kota: 'Jakarta Pusat',
        alamat: 'Gondangdia, Menteng, Jakarta Pusat',
        is_active: true,
        is_published: true
      })
      .select()
      .single()

    if (storeError) {
      await supabase.from('sellers').delete().eq('id', seller.id)
      await supabase.auth.admin.deleteUser(userId)
      return { success: false, error: `Gagal membuat toko: ${storeError.message}` }
    }

    // 3b. Create Default Store Address (DKI Jakarta, Menteng) to avoid empty address
    const { error: addressError } = await supabase
      .from('store_addresses')
      .insert({
        store_id: store.id,
        label: 'Utama',
        nama_pengirim: namaToko,
        no_telp: cleanWa,
        alamat_lengkap: 'Gondangdia, Menteng, Jakarta Pusat, DKI Jakarta',
        province_id: '6',
        province_code: '31',
        province_name: 'DKI Jakarta',
        city_id: '152',
        regency_code: '3171',
        regency_name: 'Jakarta Pusat',
        district_id: '2094',
        district_code: '3171060',
        district_name: 'Menteng',
        subdistrict_id: '2094',
        village_code: '3171060001',
        village_name: 'Gondangdia',
        postal_code: '10310',
        is_default: true
      })

    if (addressError) {
      console.error('Error seeding default store address:', addressError)
    }

    // 4. Seed categories and products
    const seedProducts = makeProducts(template)
    const categoryNames = Array.from(
      new Set(
        seedProducts
          .map((p) => String(p.kategori || '').trim())
          .filter(Boolean),
      ),
    )

    if (categoryNames.length > 0) {
      const { error: categoryErr } = await supabase
        .from('product_categories')
        .upsert(
          categoryNames.map((name, index) => ({
            store_id: store.id,
            name,
            slug: slugifyCategory(name),
            sort_order: index,
            is_active: true,
          })),
          { onConflict: 'store_id,slug' }
        )

      if (categoryErr) {
        console.error('Error saving categories:', categoryErr)
      }
    }

    const { data: categories } = await supabase
      .from('product_categories')
      .select('id, name, slug')
      .eq('store_id', store.id)

    const categoryBySlug = new Map(
      (categories || []).map((category) => [category.slug, category.id]),
    )

    const { error: prodErr } = await supabase
      .from('products')
      .insert(
        seedProducts.map((p, i) => ({
          store_id: store.id,
          nama: p.nama,
          harga: p.harga,
          foto_url: p.foto_url,
          kategori: p.kategori,
          category_id: p.kategori ? categoryBySlug.get(slugifyCategory(p.kategori)) || null : null,
          product_type: p.product_type || 'general',
          option_groups: p.option_groups || [],
          addons: p.addons || [],
          product_details: p.product_details || {},
          show_category: p.show_category ?? true,
          show_on_homepage: p.show_on_homepage ?? i < 6,
          homepage_rank: i,
          badge_label: p.badge_label || null,
          compare_at_price: p.compare_at_price || null,
          stok: p.stok,
          berat_gram: p.berat_gram,
          deskripsi: p.deskripsi,
          urutan: i,
        }))
      )

    if (prodErr) {
      console.error('Error saving products:', prodErr)
    }

    // 5. Add platform log
    await supabase.from('admin_logs').insert({
      action: 'QUICK_SETUP_STORE',
      description: `Setup toko instan ${namaToko} (/${slug}) untuk seller ${email}.`
    })

    revalidatePath('/admin/stores')

    return {
      success: true,
      storeSlug: slug,
      sellerEmail: email
    }

  } catch (err: any) {
    return { success: false, error: err.message || 'Terjadi kesalahan sistem.' }
  }
}
