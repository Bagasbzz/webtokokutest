import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const ENV_FILE = path.join(ROOT, '.env.local')

function loadLocalEnv() {
  if (!fs.existsSync(ENV_FILE)) return
  for (const line of fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1)
    if (!process.env[key]) process.env[key] = value
  }
}

loadLocalEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const DEMO_PASSWORD = process.env.ACTIVE_CLIENT_DEMO_PASSWORD || ''
const ADMIN_WA = (process.env.NEXT_PUBLIC_WEBTOKOKU_ADMIN_WA || '6285830145032').replace(/\D/g, '')

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Env NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib ada.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const img = {
  risol: '/client-store-images/risol-sari-bandung-1.jpg',
  pastry: '/client-store-images/risol-sari-bandung-2.jpg',
  kopi: '/client-store-images/kopi-teras-senayan-1.jpg',
  beans: '/client-store-images/kopi-teras-senayan-2.jpg',
  hijab: '/client-store-images/naraya-daily-hijab-1.jpg',
  fashion: '/client-store-images/naraya-daily-hijab-2.jpg',
  skincare: '/client-store-images/glowvera-skin-studio-1.jpg',
  beauty: '/client-store-images/glowvera-skin-studio-2.jpg',
  honey: '/client-store-images/madu-rimpang-jogja-1.jpg',
  supplement: '/client-store-images/madu-rimpang-jogja-2.jpg',
  florist: '/client-store-images/bloomara-gift-surabaya-1.jpg',
  gift: '/client-store-images/bloomara-gift-surabaya-2.jpg',
}

const stores = [
  {
    slug: 'risol-sari-bandung',
    storeName: 'Risol Sari Bandung',
    sellerName: 'Admin Risol Sari',
    template: 'dapur',
    color: '#7A3E24,#F2B84B',
    category: 'Makanan Ringan & Frozen Food',
    city: 'Bandung',
    address: 'Antapani, Kota Bandung, Jawa Barat',
    title: 'Risol rumahan, isi padat.',
    subtitle: 'Pilihan risol mayo, ragout, smoked beef, dan frozen pack untuk stok rumah.',
    hero: img.risol,
    categories: ['Risol Mayo', 'Risol Ragout', 'Frozen Pack', 'Paket Acara'],
    names: ['Risol Mayo Smoked Beef', 'Risol Mayo Telur', 'Risol Ragout Ayam', 'Risol Mozzarella', 'Risol Sayur Creamy', 'Risol Pedas Manis', 'Frozen Risol Mix 10 pcs', 'Paket Arisan 25 pcs'],
    basePrice: 6500,
    imageSet: [img.risol, img.pastry],
  },
  {
    slug: 'kopi-teras-senayan',
    storeName: 'Kopi Teras Senayan',
    sellerName: 'Admin Kopi Teras',
    template: 'dapur',
    color: '#4B2E22,#D8A35D',
    category: 'Kopi Susu & Minuman Literan',
    city: 'Jakarta Selatan',
    address: 'Kebayoran Baru, Jakarta Selatan, DKI Jakarta',
    title: 'Kopi susu buat jeda siang.',
    subtitle: 'Kopi harian, non coffee, dan botol literan untuk kantor atau rumah.',
    hero: img.kopi,
    categories: ['Kopi Susu', 'Non Coffee', 'Literan', 'Snack'],
    names: ['Kopi Susu Aren', 'Iced Americano', 'Latte Creamy', 'Caramel Macchiato', 'Matcha Latte', 'Chocolate Signature', 'Kopi Susu 1 Liter', 'Brownies Bite'],
    basePrice: 18000,
    imageSet: [img.kopi, img.beans],
  },
  {
    slug: 'naraya-daily-hijab',
    storeName: 'Naraya Daily Hijab',
    sellerName: 'Admin Naraya Hijab',
    template: 'butik',
    color: '#9A6B4F,#D8B99D',
    category: 'Fashion Muslimah',
    city: 'Bekasi',
    address: 'Bekasi Selatan, Kota Bekasi, Jawa Barat',
    title: 'Hijab daily yang gampang dipaduin.',
    subtitle: 'Koleksi hijab, inner, tunik, dan set harian warna netral.',
    hero: img.hijab,
    categories: ['Hijab Voal', 'Pashmina', 'Inner', 'Tunik'],
    names: ['Hijab Voal Basic', 'Pashmina Ceruty', 'Inner Ninja Premium', 'Tunik Linen Daily', 'Khimar Soft Pad', 'Hijab Motif Neutral', 'Set Hijab Inner', 'Outer Knit Muslimah'],
    basePrice: 39000,
    imageSet: [img.hijab, img.fashion],
  },
  {
    slug: 'glowvera-skin-studio',
    storeName: 'Glowvera Skin Studio',
    sellerName: 'Admin Glowvera',
    template: 'glow',
    color: '#0F8F73,#A7E8D4',
    category: 'Skincare & Beauty Care',
    city: 'Depok',
    address: 'Margonda, Kota Depok, Jawa Barat',
    title: 'Skincare basic, rapi, dan mudah dipilih.',
    subtitle: 'Cleanser, toner, serum, moisturizer, sunscreen, dan bundle routine.',
    hero: img.skincare,
    categories: ['Cleanser', 'Serum', 'Moisturizer', 'Sunscreen'],
    names: ['Gentle Low pH Cleanser', 'Hydrating Toner', 'Niacinamide Serum', 'Barrier Moisturizer', 'Daily Sunscreen SPF50', 'Acne Spot Gel', 'Retinol Night Serum', 'Basic Skincare Bundle'],
    basePrice: 55000,
    imageSet: [img.skincare, img.beauty],
  },
  {
    slug: 'madu-rimpang-jogja',
    storeName: 'Madu Rimpang Jogja',
    sellerName: 'Admin Madu Rimpang',
    template: 'herba',
    color: '#2D6A4F,#DDB86A',
    category: 'Herbal, Madu & Suplemen',
    city: 'Yogyakarta',
    address: 'Umbulharjo, Kota Yogyakarta, DI Yogyakarta',
    title: 'Stok herbal harian keluarga.',
    subtitle: 'Madu, jahe, kunyit asam, vitamin, dan paket sehat rumahan.',
    hero: img.honey,
    categories: ['Madu', 'Minuman Herbal', 'Vitamin', 'Paket Sehat'],
    names: ['Madu Randu 500gr', 'Madu Multiflora 250gr', 'Sari Jahe Merah', 'Kunyit Asam Botol', 'Temulawak Madu', 'Vitamin C Tablet', 'Paket Imun Mingguan', 'Herbal Wedang Uwuh'],
    basePrice: 28000,
    imageSet: [img.honey, img.supplement],
  },
  {
    slug: 'bloomara-gift-surabaya',
    storeName: 'Bloomara Gift Surabaya',
    sellerName: 'Admin Bloomara',
    template: 'butik',
    color: '#B85C7A,#F2C6D3',
    category: 'Florist, Hampers & Gift',
    city: 'Surabaya',
    address: 'Rungkut, Kota Surabaya, Jawa Timur',
    title: 'Buket dan hampers siap kirim.',
    subtitle: 'Buket bunga, snack bouquet, money bouquet, dan hampers custom.',
    hero: img.florist,
    categories: ['Buket Bunga', 'Snack Bouquet', 'Hampers', 'Custom Gift'],
    names: ['Buket Mawar Mini', 'Buket Fresh Flower Medium', 'Snack Bouquet Cokelat', 'Money Bouquet Basic', 'Hampers Birthday', 'Hampers Wisuda', 'Buket Satin Premium', 'Custom Gift Box'],
    basePrice: 45000,
    imageSet: [img.florist, img.gift],
  },
]

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function productRows(store, savedCategories) {
  const categoryByName = new Map(savedCategories.map((cat) => [cat.name, cat.id]))
  const rows = []
  for (let i = 0; i < 24; i++) {
    const name = store.names[i % store.names.length]
    const category = store.categories[i % store.categories.length]
    const price = store.basePrice + (i % 6) * Math.max(2500, Math.round(store.basePrice * 0.18))
    rows.push({
      nama: i < store.names.length ? name : `${name} ${i + 1}`,
      harga: price,
      compare_at_price: i % 5 === 0 ? price + Math.round(price * 0.14) : null,
      deskripsi: `Produk ${category.toLowerCase()} pilihan ${store.storeName}. Stok dibuat terbatas supaya kualitas tetap rapi sebelum dikirim.`,
      foto_url: store.imageSet[i % store.imageSet.length],
      kategori: category,
      category_id: categoryByName.get(category) || null,
      product_type: store.category.toLowerCase().includes('makanan') || store.category.toLowerCase().includes('kopi') ? 'food' : 'general',
      option_groups: [
        {
          id: 'opsi',
          name: store.category.includes('Fashion') ? 'Warna/Ukuran' : 'Pilihan',
          required: false,
          values: [
            { id: 'regular', label: 'Regular', price_delta: 0, stock: 18 + i },
            { id: 'premium', label: 'Premium', price_delta: Math.round(price * 0.18), stock: 8 + i },
          ],
        },
      ],
      addons: store.category.includes('Makanan') || store.category.includes('Kopi')
        ? [{ id: 'extra-pack', name: 'Extra packing', price: 3000, max_qty: 1 }]
        : [],
      product_details: {
        catatan: 'Data awal toko klien WebTokoku.',
        estimasi: 'Dikirim sesuai jadwal toko.',
      },
      show_category: true,
      show_on_homepage: i < 8,
      homepage_rank: i,
      badge_label: i === 0 ? 'Best Seller' : i === 1 ? 'Ready' : i === 2 ? 'Favorit' : null,
      is_active: true,
      stok: 15 + (i % 9) * 4,
      berat_gram: store.category.includes('Fashion') ? 250 : store.category.includes('Florist') ? 700 : 300,
      urutan: i,
      moderation_status: 'safe',
      moderation_reason: null,
      moderation_score: 0,
      moderation_matched_terms: [],
      moderation_categories: [],
      moderation_checked_at: new Date().toISOString(),
    })
  }
  return rows
}

async function findUserByEmail(email) {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw error
    const found = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase())
    if (found || data.users.length < 1000) return found || null
  }
  return null
}

async function getOrCreateUser(store) {
  const email = `${store.slug}@webtokoku.id`
  const created = await supabase.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { name: store.sellerName, client_active: true },
  })
  if (!created.error && created.data.user) return { user: created.data.user, email }
  if (!String(created.error?.message || '').toLowerCase().includes('already')) throw created.error
  const user = await findUserByEmail(email)
  if (!user) throw new Error(`User ${email} tidak ditemukan`)
  await supabase.auth.admin.updateUserById(user.id, {
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { name: store.sellerName, client_active: true },
  })
  return { user, email }
}

async function cleanupStore(storeId) {
  const { data: oldOrders } = await supabase.from('orders').select('id').eq('store_id', storeId)
  const orderIds = (oldOrders || []).map((order) => order.id)
  if (orderIds.length) await supabase.from('order_items').delete().in('order_id', orderIds)
  for (const table of ['orders', 'store_traffic', 'template_customizations', 'template_revisions', 'payment_methods', 'product_categories', 'products', 'store_addresses', 'shipping_settings']) {
    const { error } = await supabase.from(table).delete().eq('store_id', storeId)
    if (error && !/does not exist|relation .* does not exist/i.test(error.message)) throw error
  }
}

async function seedOne(store) {
  const { user, email } = await getOrCreateUser(store)
  const { data: oldSeller } = await supabase.from('sellers').select('id').eq('user_id', user.id).maybeSingle()
  const sellerPayload = { user_id: user.id, email, nama_lengkap: store.sellerName, no_wa: ADMIN_WA, role: 'seller' }
  const { data: seller, error: sellerError } = await (oldSeller?.id
    ? supabase.from('sellers').update(sellerPayload).eq('id', oldSeller.id)
    : supabase.from('sellers').insert(sellerPayload)
  ).select().single()
  if (sellerError) throw sellerError

  const { data: oldStore } = await supabase.from('stores').select('id').eq('slug', store.slug).maybeSingle()
  if (oldStore?.id) await cleanupStore(oldStore.id)

  const { data: savedStore, error: storeError } = await supabase.from('stores').upsert({
    id: oldStore?.id,
    seller_id: seller.id,
    nama_toko: store.storeName,
    slug: store.slug,
    deskripsi: store.subtitle,
    business_category: store.category,
    template: store.template,
    warna_tema: store.color,
    logo_url: null,
    no_wa: ADMIN_WA,
    alamat: store.address,
    kota: store.city,
    hero_image_url: store.hero,
    font_heading: store.template === 'dapur' ? 'Playfair Display' : 'Outfit',
    font_body: 'Inter',
    hero_title: store.title,
    hero_subtitle: store.subtitle,
    is_active: true,
    is_published: true,
    plan: 'pro',
    pro_started_at: new Date().toISOString(),
    plan_expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    pro_notes: 'CLIENT ACTIVE: toko aktif klien WebTokoku. Lengkapi WA, rekening/QRIS, alamat detail, dan foto asli dari pemilik toko.',
    moderation_status: 'safe',
    moderation_reason: null,
    moderation_score: 0,
    moderation_matched_terms: [],
    moderation_categories: [],
    moderation_checked_at: new Date().toISOString(),
  }, { onConflict: 'slug' }).select().single()
  if (storeError) throw storeError

  await supabase.from('store_addresses').upsert({
    store_id: savedStore.id,
    label: 'Utama',
    nama_pengirim: store.storeName,
    no_telp: ADMIN_WA,
    alamat_lengkap: store.address,
    province_name: store.address.split(',').at(-1)?.trim() || store.city,
    regency_name: store.city,
    district_name: store.address.split(',')[0]?.trim() || store.city,
    postal_code: '00000',
    map_url: `https://www.google.com/maps/search/${encodeURIComponent(store.address)}`,
    is_default: true,
  }, { onConflict: 'store_id,label' })

  const categoryRows = store.categories.map((name, index) => ({
    store_id: savedStore.id,
    name,
    slug: slugify(name),
    description: `Kategori ${name.toLowerCase()} di ${store.storeName}.`,
    sort_order: index,
    is_active: true,
  }))
  const { error: catError } = await supabase.from('product_categories').insert(categoryRows)
  if (catError) throw catError
  const { data: savedCategories } = await supabase.from('product_categories').select('id,name').eq('store_id', savedStore.id)

  const { error: productError } = await supabase.from('products').insert(productRows(store, savedCategories || []).map((row) => ({ store_id: savedStore.id, ...row })))
  if (productError) throw productError

  await supabase.from('payment_methods').insert([
    { store_id: savedStore.id, type: 'bank_transfer', bank_name: 'BCA', account_number: '1234567890', account_name: store.storeName, is_active: true },
    { store_id: savedStore.id, type: 'ewallet', bank_name: 'DANA', account_number: ADMIN_WA, account_name: store.storeName, is_active: true },
  ])
  await supabase.from('shipping_settings').upsert({
    store_id: savedStore.id,
    auto_shipping_enabled: false,
    pickup_enabled: true,
    cod_enabled: false,
    allowed_couriers: ['jne', 'jnt', 'sicepat'],
    free_shipping_minimum: 150000,
  }, { onConflict: 'store_id' })

  const customizations = {
    'hero.title': store.title,
    'hero.subtitle': store.subtitle,
    'hero.image_url': store.hero,
    'reviews.title': 'Apa kata pelanggan',
    'gallery.title': store.category.includes('Kopi') ? 'Dari bar kopi' : store.category.includes('Florist') ? 'Karya siap kirim' : 'Pilihan toko',
    'docs.title': store.category.includes('Fashion') ? 'Panduan ukuran & bahan' : 'Info produk & pemesanan',
    'contact.title': 'Tanya stok hari ini',
    'faq.title': 'Pertanyaan umum',
  }
  const rows = Object.entries(customizations).flatMap(([key, value]) => {
    const dot = key.indexOf('.')
    const base = { store_id: savedStore.id, section_key: key.slice(0, dot), element_key: key.slice(dot + 1), value, updated_at: new Date().toISOString() }
    return [{ ...base, is_draft: false }, { ...base, is_draft: true }]
  })
  await supabase.from('template_customizations').insert(rows)

  console.log(`OK ${store.storeName}: /${store.slug} (${email})`)
}

for (const store of stores) await seedOne(store)
console.log(`Done. Seeded ${stores.length} active client stores. Password: ${DEMO_PASSWORD}`)
