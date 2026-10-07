import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const ENV_FILE = path.join(ROOT, '.env.local')

function loadLocalEnv() {
  if (!fs.existsSync(ENV_FILE)) return

  const lines = fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue

    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

loadLocalEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error([
    'Env belum lengkap.',
    'Buat file .env.local di root project dan isi minimal:',
    'NEXT_PUBLIC_SUPABASE_URL=...',
    'SUPABASE_SERVICE_ROLE_KEY=...',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=... (opsional untuk login normal)',
  ].join('\n'))
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const DEMO = {
  email: 'vincosme@webtokoku.id',
  password: process.env.VINCOSME_DEMO_PASSWORD || '',
  sellerName: 'Admin Vincosme',
  storeName: 'Vincosme',
  slug: 'vincosme',
  whatsapp: '6281234567890',
}

if (!DEMO.password) {
  console.error('Env VINCOSME_DEMO_PASSWORD belum diisi.')
  process.exit(1)
}

const productImages = {
  cushion: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200&auto=format&fit=crop',
  lip: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=1200&auto=format&fit=crop',
  palette: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1200&auto=format&fit=crop',
  skincare: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=1200&auto=format&fit=crop',
  serum: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1200&auto=format&fit=crop',
  cleanser: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop',
  sunscreen: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=1200&auto=format&fit=crop',
  makeup: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop',
  bundle: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=1200&auto=format&fit=crop',
}

const categories = [
  { name: 'Base Makeup', slug: 'base-makeup', description: 'Cushion, bedak, primer, dan produk complexion.', sort_order: 1 },
  { name: 'Lip Product', slug: 'lip-product', description: 'Lip tint, lip cream, lip balm, dan perawatan bibir.', sort_order: 2 },
  { name: 'Eye & Brow', slug: 'eye-brow', description: 'Maskara, pensil alis, eyeliner, dan palet mata.', sort_order: 3 },
  { name: 'Skincare', slug: 'skincare', description: 'Cleanser, toner, serum, moisturizer, sunscreen.', sort_order: 4 },
  { name: 'Bundle Hemat', slug: 'bundle-hemat', description: 'Paket produk pilihan untuk rutinitas harian.', sort_order: 5 },
]

const products = [
  {
    nama: 'Somethinc Copy Paste Breathable Cushion SPF 33',
    harga: 189000,
    compare_at_price: 209000,
    kategori: 'Base Makeup',
    categorySlug: 'base-makeup',
    foto_url: productImages.cushion,
    badge_label: 'Best Seller',
    deskripsi: 'Cushion ringan dengan hasil natural satin, cocok untuk complexion harian dan touch up cepat.',
    product_type: 'beauty',
    stok: 42,
    berat_gram: 120,
    option_groups: [
      {
        id: 'shade',
        name: 'Shade',
        required: true,
        options: [
          { id: 'nina', label: 'Nina', price_delta: 0, stock: 12 },
          { id: 'bijou', label: 'Bijou', price_delta: 0, stock: 14 },
          { id: 'serene', label: 'Serene', price_delta: 0, stock: 16 },
        ],
      },
    ],
    product_details: {
      netto: '15 g',
      finish: 'Natural satin',
      cocok_untuk: 'Kulit normal hingga kombinasi',
      sumber_harga: 'Referensi harga pasar kosmetik Indonesia, 2026',
    },
  },
  {
    nama: 'Wardah Colorfit Velvet Matte Lip Mousse',
    harga: 69000,
    compare_at_price: 79000,
    kategori: 'Lip Product',
    categorySlug: 'lip-product',
    foto_url: productImages.lip,
    badge_label: 'Terlaris',
    deskripsi: 'Lip mousse tekstur lembut dengan warna intens dan nyaman dipakai untuk aktivitas harian.',
    product_type: 'beauty',
    stok: 88,
    berat_gram: 40,
    option_groups: [
      {
        id: 'shade',
        name: 'Shade',
        required: true,
        options: [
          { id: 'brown-creator', label: 'Brown Creator', price_delta: 0, stock: 22 },
          { id: 'rose-ballerina', label: 'Rose Ballerina', price_delta: 0, stock: 34 },
          { id: 'red-pioneer', label: 'Red Pioneer', price_delta: 0, stock: 32 },
        ],
      },
    ],
    product_details: {
      netto: '4 g',
      finish: 'Velvet matte',
      catatan: 'Warna dapat berbeda tergantung tone bibir.',
    },
  },
  {
    nama: 'Make Over Powerstay Transferproof Matte Lip Cream',
    harga: 115000,
    kategori: 'Lip Product',
    categorySlug: 'lip-product',
    foto_url: productImages.lip,
    badge_label: 'Promo',
    compare_at_price: 129000,
    deskripsi: 'Lip cream matte dengan pigmentasi tinggi untuk tampilan yang lebih tegas dan tahan lama.',
    product_type: 'beauty',
    stok: 58,
    berat_gram: 45,
    option_groups: [
      {
        id: 'shade',
        name: 'Shade',
        required: true,
        options: [
          { id: 'hype', label: 'Hype', price_delta: 0, stock: 18 },
          { id: 'stellar', label: 'Stellar', price_delta: 0, stock: 20 },
          { id: 'fired-up', label: 'Fired Up', price_delta: 0, stock: 20 },
        ],
      },
    ],
    product_details: {
      netto: '7 g',
      finish: 'Matte',
      cocok_untuk: 'Makeup acara, kampus, kerja',
    },
  },
  {
    nama: 'Emina Cheek Lit Cream Blush',
    harga: 42000,
    kategori: 'Base Makeup',
    categorySlug: 'base-makeup',
    foto_url: productImages.palette,
    badge_label: 'Favorit',
    deskripsi: 'Cream blush ringan untuk warna pipi natural, mudah dibaurkan dan cocok untuk pemula.',
    product_type: 'beauty',
    stok: 73,
    berat_gram: 35,
    option_groups: [
      {
        id: 'shade',
        name: 'Shade',
        required: true,
        options: [
          { id: 'pink', label: 'Pink', price_delta: 0, stock: 30 },
          { id: 'peach', label: 'Peach', price_delta: 0, stock: 43 },
        ],
      },
    ],
    product_details: {
      netto: '10 ml',
      tekstur: 'Cream',
      hasil: 'Natural flushed look',
    },
  },
  {
    nama: 'Azarine Hydrasoothe Sunscreen Gel SPF45',
    harga: 65000,
    kategori: 'Skincare',
    categorySlug: 'skincare',
    foto_url: productImages.sunscreen,
    badge_label: 'Daily Pick',
    deskripsi: 'Sunscreen gel ringan untuk penggunaan harian, nyaman dipakai sebelum makeup.',
    product_type: 'skincare',
    stok: 96,
    berat_gram: 80,
    product_details: {
      netto: '50 ml',
      fungsi: 'Perlindungan UV harian',
      cara_pakai: 'Gunakan pada pagi/siang hari dan ulangi pemakaian bila diperlukan.',
    },
  },
  {
    nama: 'SKINTIFIC 5X Ceramide Barrier Moisture Gel',
    harga: 169000,
    kategori: 'Skincare',
    categorySlug: 'skincare',
    foto_url: productImages.skincare,
    badge_label: 'Barrier Care',
    deskripsi: 'Moisturizer gel untuk membantu menjaga kelembapan dan skin barrier.',
    product_type: 'skincare',
    stok: 54,
    berat_gram: 110,
    product_details: {
      netto: '30 g',
      tekstur: 'Gel cream',
      cocok_untuk: 'Kulit kering, normal, kombinasi',
    },
  },
  {
    nama: 'Avoskin Your Skin Bae Serum Niacinamide',
    harga: 149000,
    kategori: 'Skincare',
    categorySlug: 'skincare',
    foto_url: productImages.serum,
    badge_label: null,
    deskripsi: 'Serum niacinamide untuk membantu tampilan kulit terlihat lebih cerah dan merata.',
    product_type: 'skincare',
    stok: 47,
    berat_gram: 70,
    product_details: {
      netto: '30 ml',
      active: 'Niacinamide',
      catatan: 'Patch test disarankan untuk kulit sensitif.',
    },
  },
  {
    nama: 'Hada Labo Gokujyun Ultimate Moisturizing Lotion',
    harga: 63000,
    kategori: 'Skincare',
    categorySlug: 'skincare',
    foto_url: productImages.skincare,
    badge_label: null,
    deskripsi: 'Hydrating lotion yang membantu melembapkan kulit sebelum serum dan moisturizer.',
    product_type: 'skincare',
    stok: 61,
    berat_gram: 130,
    product_details: { netto: '100 ml', fungsi: 'Hydrating toner', tekstur: 'Lotion cair' },
  },
  {
    nama: 'Luxcrime Blur & Cover Two Way Cake',
    harga: 129000,
    kategori: 'Base Makeup',
    categorySlug: 'base-makeup',
    foto_url: productImages.makeup,
    badge_label: null,
    deskripsi: 'Powder foundation praktis untuk merapikan complexion dan mengurangi tampilan kilap.',
    product_type: 'beauty',
    stok: 39,
    berat_gram: 95,
    option_groups: [
      {
        id: 'shade',
        name: 'Shade',
        required: true,
        options: [
          { id: 'buttercream', label: 'Buttercream', price_delta: 0, stock: 11 },
          { id: 'custard', label: 'Custard', price_delta: 0, stock: 16 },
          { id: 'honey', label: 'Honey', price_delta: 0, stock: 12 },
        ],
      },
    ],
    product_details: { netto: '12 g', finish: 'Soft matte', coverage: 'Medium' },
  },
  {
    nama: 'Maybelline Lash Sensational Sky High Mascara',
    harga: 155000,
    kategori: 'Eye & Brow',
    categorySlug: 'eye-brow',
    foto_url: productImages.palette,
    badge_label: 'Ready',
    deskripsi: 'Maskara untuk tampilan bulu mata lebih panjang dan lentik.',
    product_type: 'beauty',
    stok: 31,
    berat_gram: 50,
    option_groups: [
      {
        id: 'variant',
        name: 'Varian',
        required: true,
        options: [
          { id: 'black', label: 'Black', price_delta: 0, stock: 21 },
          { id: 'waterproof', label: 'Waterproof Black', price_delta: 7000, stock: 10 },
        ],
      },
    ],
    product_details: { netto: '7.2 ml', hasil: 'Lengthening', catatan: 'Bersihkan dengan remover.' },
  },
  {
    nama: 'Browit by Nongchat Brow Pencil',
    harga: 89000,
    kategori: 'Eye & Brow',
    categorySlug: 'eye-brow',
    foto_url: productImages.palette,
    badge_label: null,
    deskripsi: 'Pensil alis praktis dengan spoolie untuk merapikan bentuk alis harian.',
    product_type: 'beauty',
    stok: 64,
    berat_gram: 35,
    option_groups: [
      {
        id: 'shade',
        name: 'Shade',
        required: true,
        options: [
          { id: 'dark-brown', label: 'Dark Brown', price_delta: 0, stock: 30 },
          { id: 'natural-brown', label: 'Natural Brown', price_delta: 0, stock: 34 },
        ],
      },
    ],
    product_details: { jenis: 'Retractable brow pencil', isi: 'Pensil + spoolie' },
  },
  {
    nama: 'Dear Me Beauty Perfect Matte Lip Coat',
    harga: 109000,
    kategori: 'Lip Product',
    categorySlug: 'lip-product',
    foto_url: productImages.lip,
    badge_label: null,
    deskripsi: 'Lip coat matte dengan pilihan shade yang cocok untuk daily look.',
    product_type: 'beauty',
    stok: 44,
    berat_gram: 45,
    option_groups: [
      {
        id: 'shade',
        name: 'Shade',
        required: true,
        options: [
          { id: 'dear-irene', label: 'Dear Irene', price_delta: 0, stock: 15 },
          { id: 'dear-luna', label: 'Dear Luna', price_delta: 0, stock: 14 },
          { id: 'dear-ruby', label: 'Dear Ruby', price_delta: 0, stock: 15 },
        ],
      },
    ],
    product_details: { netto: '5.5 g', finish: 'Soft matte' },
  },
  {
    nama: 'Somethinc Ceramic Skin Saviour Moisturizer Gel',
    harga: 155000,
    kategori: 'Skincare',
    categorySlug: 'skincare',
    foto_url: productImages.skincare,
    badge_label: null,
    deskripsi: 'Moisturizer gel ringan untuk membantu menjaga kelembapan kulit.',
    product_type: 'skincare',
    stok: 52,
    berat_gram: 95,
    product_details: { netto: '25 ml', tekstur: 'Gel', fungsi: 'Moisturizing' },
  },
  {
    nama: 'Clean It Zero Cleansing Balm',
    harga: 185000,
    kategori: 'Skincare',
    categorySlug: 'skincare',
    foto_url: productImages.cleanser,
    badge_label: null,
    deskripsi: 'Cleansing balm untuk membersihkan makeup dan sunscreen sebelum facial wash.',
    product_type: 'skincare',
    stok: 27,
    berat_gram: 140,
    product_details: { netto: '100 ml', step: 'First cleanser' },
  },
  {
    nama: 'Vincosme Daily Makeup Starter Kit',
    harga: 399000,
    compare_at_price: 455000,
    kategori: 'Bundle Hemat',
    categorySlug: 'bundle-hemat',
    foto_url: productImages.bundle,
    badge_label: 'Bundle',
    deskripsi: 'Paket cushion, lip product, blush, dan brow pencil untuk makeup harian.',
    product_type: 'bundle',
    stok: 18,
    berat_gram: 380,
    addons: [
      { id: 'gift-wrap', label: 'Gift wrap', price_delta: 12000, weight_delta: 20, stock: 100 },
      { id: 'mini-pouch', label: 'Mini pouch', price_delta: 25000, weight_delta: 40, stock: 45 },
    ],
    product_details: { isi: '4 produk', cocok_untuk: 'Pemula dan daily makeup' },
  },
  {
    nama: 'Vincosme Skin Barrier Routine Bundle',
    harga: 349000,
    compare_at_price: 395000,
    kategori: 'Bundle Hemat',
    categorySlug: 'bundle-hemat',
    foto_url: productImages.bundle,
    badge_label: 'Hemat',
    deskripsi: 'Paket basic skincare untuk cleansing, hydrating, moisturizing, dan sunscreen.',
    product_type: 'bundle',
    stok: 22,
    berat_gram: 480,
    addons: [{ id: 'travel-size', label: 'Tambahkan travel bottle', price_delta: 15000, weight_delta: 25, stock: 60 }],
    product_details: { isi: '4 produk', step: 'Cleanse - Hydrate - Moisturize - Protect' },
  },
]

const customizations = {
  'hero.title': 'MAKEUP ANTI LUNTUR.',
  'hero.subtitle': 'Kosmetik pilihan untuk daily makeup yang rapi, tahan lama, dan mudah dipakai. Cek shade, stok, dan rekomendasi produk lewat WhatsApp.',
  'hero.image2_url': productImages.makeup,
  'hero.image2_title': 'Flawless Base',
  'hero.image3_url': productImages.lip,
  'hero.image3_title': 'Statement Lips',
  'marquee.text': 'READY STOCK - CEK SHADE - BISA KONSULTASI - ORDER VIA WHATSAPP -',
  'values.val1_title': 'Shade lebih jelas',
  'values.val1_desc': 'Setiap produk dilengkapi pilihan shade dan catatan penggunaan agar pembeli tidak salah pilih.',
  'values.val2_title': 'Katalog siap order',
  'values.val2_desc': 'Harga, stok, berat produk, promo, dan detail varian sudah tersusun rapi.',
  'values.val3_title': 'Konsultasi cepat',
  'values.val3_desc': 'Admin membantu cek kecocokan warna, jenis kulit, dan stok sebelum pembeli checkout.',
  'cta.image_url': productImages.bundle,
  'cta.title': 'Butuh rekomendasi produk?',
  'cta.description': '<p>Kirim kebutuhan makeup atau kondisi kulitmu ke admin Vincosme. Kami bantu arahkan produk yang paling sesuai.</p><p>Untuk shade complexion, konsultasi terlebih dahulu agar hasilnya lebih aman.</p>',
  'promo_banner.visible': 'true',
  'promo_banner.title': 'Promo makeup harian',
  'promo_banner.description': 'Diskon bundle dan produk pilihan selama stok tersedia. Cocok untuk restock kosmetik bulanan.',
  'promo_banner.code': 'VINJUNE',
  'promo_banner.image_url': productImages.bundle,
  'reviews.title': 'Ulasan pelanggan',
  'reviews.subtitle': 'Beberapa catatan pelanggan setelah order di Vincosme.',
  'reviews.item1_name': 'Nadia, Jakarta',
  'reviews.item1_text': 'Cushion-nya ringan dan shade yang direkomendasikan admin pas di kulitku.',
  'reviews.item2_name': 'Alya, Bandung',
  'reviews.item2_text': 'Paket daily makeup-nya lengkap. Packing rapi dan admin cepat respon.',
  'reviews.item3_name': 'Risa, Bekasi',
  'reviews.item3_text': 'Suka karena deskripsi produk jelas, jadi gampang pilih sebelum order.',
  'gallery.title': 'Galeri Vincosme',
  'gallery.subtitle': 'Katalog, detail tekstur, dan proses packing produk.',
  'gallery.image1_url': productImages.makeup,
  'gallery.image1_caption': 'Koleksi base makeup',
  'gallery.image2_url': productImages.skincare,
  'gallery.image2_caption': 'Skincare harian',
  'gallery.image3_url': productImages.lip,
  'gallery.image3_caption': 'Lip product favorit',
  'docs.title': 'Panduan memilih produk',
  'docs.article_title': 'Cara memilih shade complexion yang aman',
  'docs.article_url': 'https://www.sociolla.com/',
  'docs.image_url': productImages.cushion,
  'location.visible': 'true',
  'location.title': 'Area layanan Vincosme',
  'location.address': 'Gondangdia, Menteng, Jakarta Pusat, DKI Jakarta',
  'location.map_url': 'https://www.google.com/maps?q=Gondangdia%2C%20Menteng%2C%20Jakarta%20Pusat&output=embed',
  'location.outlet1_name': 'Vincosme Jakarta',
  'location.outlet1_address': 'Gondangdia, Menteng, Jakarta Pusat',
  'location.outlet1_hours': 'Senin-Sabtu, 09.00-18.00 WIB',
  'contact.title': 'Hubungi admin Vincosme',
  'contact.description': 'Tanyakan stok, shade, rekomendasi produk, atau promo yang sedang berjalan.',
  'contact.whatsapp_label': 'Chat Admin',
  'faq.title': 'Pertanyaan Umum',
  'faq.q1': 'Apakah bisa konsultasi shade sebelum order?',
  'faq.a1': 'Bisa. Kirim foto referensi shade atau produk yang biasa dipakai agar admin bisa bantu rekomendasikan.',
  'faq.q2': 'Apakah stok di katalog selalu tersedia?',
  'faq.a2': 'Stok diperbarui berkala, tetapi pembeli tetap disarankan konfirmasi ke admin sebelum checkout.',
  'faq.q3': 'Apakah ada pengiriman luar kota?',
  'faq.a3': 'Ada. Ongkir dan estimasi pengiriman mengikuti alamat tujuan dan jasa kirim yang dipilih.',
  'social.instagram_url': 'https://www.instagram.com/',
  'social.tiktok_url': 'https://www.tiktok.com/',
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function rand(seed) {
  let t = seed + 0x6D2B79F5
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

function pick(arr, index) {
  return arr[index % arr.length]
}

function dateDaysAgo(days, hour = 9, minute = 0) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

async function getOrCreateUser() {
  const created = await supabase.auth.admin.createUser({
    email: DEMO.email,
    password: DEMO.password,
    email_confirm: true,
    user_metadata: { name: DEMO.sellerName },
  })

  if (!created.error && created.data.user) return created.data.user

  if (!String(created.error?.message || '').toLowerCase().includes('already')) {
    throw new Error(`Gagal membuat auth user: ${created.error?.message}`)
  }

  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw error
    const found = data.users.find((user) => user.email?.toLowerCase() === DEMO.email)
    if (found) {
      await supabase.auth.admin.updateUserById(found.id, {
        password: DEMO.password,
        email_confirm: true,
        user_metadata: { name: DEMO.sellerName },
      })
      return found
    }
    if (data.users.length < 1000) break
  }

  throw new Error(`User ${DEMO.email} sudah ada, tetapi tidak ditemukan lewat listUsers.`)
}

async function maybeDelete(table, column, value) {
  const { error } = await supabase.from(table).delete().eq(column, value)
  if (error && !String(error.message).includes('does not exist')) throw error
}

async function seed() {
  const user = await getOrCreateUser()

  const { data: existingSeller, error: existingSellerError } = await supabase
    .from('sellers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingSellerError) throw existingSellerError

  const sellerPayload = {
    user_id: user.id,
    email: DEMO.email,
    nama_lengkap: DEMO.sellerName,
    no_wa: DEMO.whatsapp,
    role: 'seller',
  }

  const sellerQuery = existingSeller?.id
    ? supabase.from('sellers').update(sellerPayload).eq('id', existingSeller.id)
    : supabase.from('sellers').insert(sellerPayload)

  const { data: seller, error: sellerError } = await sellerQuery
    .select()
    .single()

  if (sellerError) throw sellerError

  const { data: existingStore } = await supabase
    .from('stores')
    .select('id')
    .eq('slug', DEMO.slug)
    .maybeSingle()

  if (existingStore?.id) {
    const { data: oldOrders } = await supabase
      .from('orders')
      .select('id')
      .eq('store_id', existingStore.id)

    const orderIds = (oldOrders || []).map((order) => order.id)
    if (orderIds.length > 0) await supabase.from('order_items').delete().in('order_id', orderIds)

    await maybeDelete('orders', 'store_id', existingStore.id)
    await maybeDelete('store_traffic', 'store_id', existingStore.id)
    await maybeDelete('template_customizations', 'store_id', existingStore.id)
    await maybeDelete('product_categories', 'store_id', existingStore.id)
    await maybeDelete('products', 'store_id', existingStore.id)
    await maybeDelete('store_addresses', 'store_id', existingStore.id)
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .upsert({
      id: existingStore?.id,
      seller_id: seller.id,
      nama_toko: DEMO.storeName,
      slug: DEMO.slug,
      deskripsi: 'Toko kosmetik dan skincare pilihan untuk daily makeup, shade complexion, dan basic skin barrier routine.',
      template: 'luxe',
      warna_tema: '#7C3AED,#C4B5FD',
      logo_url: null,
      no_wa: DEMO.whatsapp,
      alamat: 'Gondangdia, Menteng, Jakarta Pusat',
      kota: 'Jakarta Pusat',
      business_category: 'Kosmetik & Skincare',
      hero_image_url: productImages.makeup,
      font_heading: 'Syne',
      font_body: 'Inter',
      hero_title: 'MAKEUP ANTI LUNTUR.',
      hero_subtitle: 'Kosmetik pilihan untuk daily makeup yang rapi, tahan lama, dan mudah dipakai.',
      is_active: true,
      is_published: true,
      plan: 'pro',
      pro_started_at: dateDaysAgo(16),
      plan_expires_at: dateDaysAgo(-349),
      moderation_status: 'safe',
      moderation_reason: null,
      moderation_score: 0,
      moderation_matched_terms: [],
      moderation_categories: [],
      moderation_checked_at: new Date().toISOString(),
    }, { onConflict: 'slug' })
    .select()
    .single()

  if (storeError) throw storeError

  await supabase.from('store_addresses').upsert({
    store_id: store.id,
    label: 'Utama',
    nama_pengirim: DEMO.storeName,
    no_telp: DEMO.whatsapp,
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
    is_default: true,
  }, { onConflict: 'store_id,label' })

  const { error: categoryError } = await supabase
    .from('product_categories')
    .upsert(categories.map((category) => ({
      store_id: store.id,
      ...category,
      is_active: true,
      updated_at: new Date().toISOString(),
    })), { onConflict: 'store_id,slug' })

  if (categoryError) throw categoryError

  const { data: savedCategories, error: savedCategoryError } = await supabase
    .from('product_categories')
    .select('id, slug')
    .eq('store_id', store.id)

  if (savedCategoryError) throw savedCategoryError

  const categoryBySlug = new Map((savedCategories || []).map((category) => [category.slug, category.id]))

  const productRows = products.map((product, index) => ({
    store_id: store.id,
    nama: product.nama,
    harga: product.harga,
    deskripsi: product.deskripsi,
    foto_url: product.foto_url,
    kategori: product.kategori,
    category_id: categoryBySlug.get(product.categorySlug) || null,
    product_type: product.product_type || 'beauty',
    option_groups: product.option_groups || [],
    variants: [],
    addons: product.addons || [],
    product_details: product.product_details || {},
    show_category: true,
    show_on_homepage: index < 6,
    homepage_rank: index,
    badge_label: product.badge_label || null,
    compare_at_price: product.compare_at_price || null,
    is_active: true,
    stok: product.stok,
    berat_gram: product.berat_gram,
    urutan: index,
    moderation_status: 'safe',
    moderation_reason: null,
    moderation_score: 0,
    moderation_matched_terms: [],
    moderation_categories: [],
    moderation_checked_at: new Date().toISOString(),
  }))

  const { data: insertedProducts, error: productError } = await supabase
    .from('products')
    .insert(productRows)
    .select('id, nama, harga, berat_gram')

  if (productError) throw productError

  const customizationRows = []
  for (const [key, value] of Object.entries(customizations)) {
    const dot = key.indexOf('.')
    const row = {
      store_id: store.id,
      section_key: key.slice(0, dot),
      element_key: key.slice(dot + 1),
      value,
      updated_at: new Date().toISOString(),
    }
    customizationRows.push({ ...row, is_draft: false })
    customizationRows.push({ ...row, is_draft: true })
  }

  const { error: customizationError } = await supabase
    .from('template_customizations')
    .upsert(customizationRows, { onConflict: 'store_id,section_key,element_key,is_draft' })

  if (customizationError) throw customizationError

  const customers = [
    ['Nadia Putri', '6281211100011', 'Menteng, Jakarta Pusat'],
    ['Alya Rahma', '6281211100012', 'Tebet, Jakarta Selatan'],
    ['Risa Amelia', '6281211100013', 'Bekasi Timur'],
    ['Dinda Safira', '6281211100014', 'Depok, Jawa Barat'],
    ['Maya Lestari', '6281211100015', 'Cempaka Putih, Jakarta Pusat'],
    ['Tania Maharani', '6281211100016', 'Kelapa Gading, Jakarta Utara'],
    ['Putri Anindya', '6281211100017', 'Bintaro, Tangerang Selatan'],
    ['Salsa Kirana', '6281211100018', 'Rawamangun, Jakarta Timur'],
  ]
  const statuses = ['selesai', 'selesai', 'selesai', 'diproses', 'dikirim', 'menunggu_konfirmasi']
  const paymentStatuses = {
    selesai: 'lunas',
    diproses: 'lunas',
    dikirim: 'lunas',
    menunggu_konfirmasi: 'pending',
  }

  const orderRows = []
  const orderItemRowsByCode = new Map()
  for (let i = 0; i < 68; i++) {
    const daysAgo = Math.floor((i * 29) / 68)
    const customer = pick(customers, i)
    const itemCount = i % 5 === 0 ? 3 : i % 2 === 0 ? 2 : 1
    const items = []

    for (let j = 0; j < itemCount; j++) {
      const product = insertedProducts[(i + j * 3) % insertedProducts.length]
      const quantity = 1 + ((i + j) % 2)
      items.push({
        product_id: product.id,
        nama: product.nama,
        harga: product.harga,
        quantity,
        berat_gram: product.berat_gram || 80,
      })
    }

    const subtotal = items.reduce((sum, item) => sum + item.harga * item.quantity, 0)
    const shippingCost = subtotal >= 350000 ? 0 : 12000 + ((i % 4) * 3000)
    const status = pick(statuses, i)
    const createdAt = dateDaysAgo(daysAgo, 8 + (i % 10), (i * 7) % 60)
    const orderCode = `VIN-${new Date(createdAt).toISOString().slice(0, 10).replace(/-/g, '')}-${String(i + 1).padStart(3, '0')}`

    orderRows.push({
      store_id: store.id,
      order_code: orderCode,
      customer_name: customer[0],
      customer_whatsapp: customer[1],
      customer_address: customer[2],
      subdistrict_id: '2094',
      postal_code: '10310',
      items,
      subtotal,
      shipping_cost: shippingCost,
      shipping_courier: shippingCost > 0 ? pick(['jne', 'sicepat', 'anteraja'], i) : null,
      shipping_service: shippingCost > 0 ? pick(['REG', 'BEST', 'SIUNT'], i) : 'Gratis ongkir promo',
      shipping_etd: shippingCost > 0 ? pick(['1-2 hari', '2-3 hari'], i) : null,
      total: subtotal + shippingCost,
      payment_method: pick(['qris', 'bank_transfer', 'manual_whatsapp'], i),
      payment_status: paymentStatuses[status] || 'pending',
      order_status: status,
      customer_note: i % 6 === 0 ? 'Tolong cek shade sebelum dikirim.' : null,
      created_at: createdAt,
      updated_at: createdAt,
    })
    orderItemRowsByCode.set(orderCode, items)
  }

  const { data: insertedOrders, error: orderError } = await supabase
    .from('orders')
    .insert(orderRows)
    .select('id, order_code')

  if (orderError) throw orderError

  const orderIdByCode = new Map((insertedOrders || []).map((order) => [order.order_code, order.id]))
  const orderItemRows = []
  for (const [orderCode, items] of orderItemRowsByCode.entries()) {
    const orderId = orderIdByCode.get(orderCode)
    for (const item of items) {
      orderItemRows.push({
        order_id: orderId,
        product_id: item.product_id,
        product_name: item.nama,
        price: item.harga,
        quantity: item.quantity,
        weight_gram: item.berat_gram,
        total: item.harga * item.quantity,
      })
    }
  }

  const { error: orderItemError } = await supabase.from('order_items').insert(orderItemRows)
  if (orderItemError) throw orderItemError

  const trafficRows = []
  const paths = [`/${DEMO.slug}`, `/${DEMO.slug}/produk`, `/${DEMO.slug}#catalog`, `/${DEMO.slug}#contact`]
  const referrers = ['https://instagram.com/', 'https://google.com/', 'https://tiktok.com/', null, null]

  for (let day = 0; day < 30; day++) {
    const daily = 26 + Math.floor(rand(day + 7) * 55)
    for (let i = 0; i < daily; i++) {
      trafficRows.push({
        store_id: store.id,
        visitor_id: `vin-${day}-${Math.floor(i / 2)}-${Math.floor(rand(i + day * 13) * 9999)}`,
        path: pick(paths, i + day),
        referrer: pick(referrers, i + day),
        created_at: dateDaysAgo(day, 7 + (i % 14), (i * 11) % 60),
      })
    }
  }

  const trafficChunks = []
  for (let i = 0; i < trafficRows.length; i += 500) {
    trafficChunks.push(trafficRows.slice(i, i + 500))
  }
  for (const chunk of trafficChunks) {
    const { error } = await supabase.from('store_traffic').insert(chunk)
    if (error) throw error
  }

  await supabase.from('admin_logs').insert({
    action: 'SEED_VINCOSME_DEMO',
    description: `Seed demo toko ${DEMO.storeName} (/${DEMO.slug}) untuk landing dashboard asli.`,
  })

  console.log('Seed Vincosme selesai.')
  console.log(`Storefront: /${DEMO.slug}`)
  console.log(`Login dashboard: ${DEMO.email} / ${DEMO.password}`)
  console.log(`Produk: ${insertedProducts.length}`)
  console.log(`Orders: ${insertedOrders.length}`)
  console.log(`Traffic rows: ${trafficRows.length}`)
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
