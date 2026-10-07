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
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

loadLocalEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const DEMO_PASSWORD = process.env.CHIRISOL_DEMO_PASSWORD

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !DEMO_PASSWORD) {
  console.error('Env NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, dan CHIRISOL_DEMO_PASSWORD wajib diisi.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const DEMO = {
  email: 'chirisol@webtokoku.id',
  password: DEMO_PASSWORD,
  sellerName: 'Admin Chirisol',
  storeName: 'Chirisol',
  slug: 'chirisol',
  whatsapp: '6281219485726',
}

const images = {
  hero: '/marketing/chirisol/hero.webp',
  matcha: '/marketing/chirisol/matcha.webp',
  savory: '/marketing/chirisol/savory.webp',
  mozzarella: '/marketing/chirisol/mozzarella.webp',
  chocolate: '/marketing/chirisol/chocolate.webp',
  frozen: '/marketing/chirisol/frozen.webp',
}

const categories = [
  { name: 'Risol Gurih', slug: 'risol-gurih', description: 'Risol mayo, ragout, smoked beef, dan mozzarella.', sort_order: 1 },
  { name: 'Risol Manis', slug: 'risol-manis', description: 'Risol dessert dengan isian matcha, cokelat, dan tiramisu.', sort_order: 2 },
  { name: 'Frozen Pack', slug: 'frozen-pack', description: 'Risol frozen siap goreng untuk stok di rumah.', sort_order: 3 },
  { name: 'Paket Hemat', slug: 'paket-hemat', description: 'Paket campur untuk keluarga, kantor, dan acara.', sort_order: 4 },
  { name: 'Saus & Add-on', slug: 'saus-add-on', description: 'Tambahan saus dan pelengkap pesanan.', sort_order: 5 },
]

const commonServingOptions = [
  {
    id: 'penyajian',
    name: 'Penyajian',
    required: true,
    options: [
      { id: 'matang', label: 'Siap makan', price_delta: 0, stock: 120 },
      { id: 'frozen', label: 'Frozen', price_delta: -500, stock: 120 },
    ],
  },
]

const products = [
  {
    nama: 'Risol Mayo Smoked Beef',
    harga: 6500,
    compare_at_price: 7500,
    kategori: 'Risol Gurih',
    categorySlug: 'risol-gurih',
    image: images.savory,
    badge: 'Best Seller',
    description: 'Risol renyah dengan smoked beef, telur, dan saus mayo creamy. Harga per buah.',
    stock: 137,
    weight: 85,
    options: commonServingOptions,
    details: { isi: 'Smoked beef, telur, mayones', porsi: '1 buah', ketahanan_frozen: '30 hari' },
  },
  {
    nama: 'Risol Ragout Ayam',
    harga: 5500,
    kategori: 'Risol Gurih',
    categorySlug: 'risol-gurih',
    image: images.savory,
    badge: 'Favorit',
    description: 'Ragout ayam lembut dengan wortel dan kentang, dibalut kulit tipis dan tepung roti.',
    stock: 94,
    weight: 90,
    options: commonServingOptions,
    details: { isi: 'Ayam, wortel, kentang, susu', porsi: '1 buah', level_pedas: 'Tidak pedas' },
  },
  {
    nama: 'Risol Mozzarella Beef',
    harga: 7500,
    compare_at_price: 8500,
    kategori: 'Risol Gurih',
    categorySlug: 'risol-gurih',
    image: images.mozzarella,
    badge: 'Cheese Pull',
    description: 'Smoked beef dengan mozzarella lumer dan saus gurih. Cocok disajikan hangat.',
    stock: 76,
    weight: 95,
    options: commonServingOptions,
    details: { isi: 'Smoked beef, mozzarella, saus mayo', porsi: '1 buah' },
  },
  {
    nama: 'Risol Carbonara',
    harga: 7000,
    kategori: 'Risol Gurih',
    categorySlug: 'risol-gurih',
    image: images.savory,
    badge: 'Creamy',
    description: 'Isian carbonara creamy dengan ayam asap dan keju, gurih tanpa terasa berat.',
    stock: 68,
    weight: 90,
    options: commonServingOptions,
    details: { isi: 'Ayam asap, susu, keju, jamur', porsi: '1 buah' },
  },
  {
    nama: 'Risol Sayur Klasik',
    harga: 4500,
    kategori: 'Risol Gurih',
    categorySlug: 'risol-gurih',
    image: images.savory,
    badge: null,
    description: 'Risol klasik berisi wortel, kentang, daun bawang, dan ragout gurih.',
    stock: 113,
    weight: 80,
    options: commonServingOptions,
    details: { isi: 'Wortel, kentang, daun bawang', porsi: '1 buah' },
  },
  {
    nama: 'Risol Matcha Cream',
    harga: 7000,
    compare_at_price: 8000,
    kategori: 'Risol Manis',
    categorySlug: 'risol-manis',
    image: images.matcha,
    badge: 'Signature',
    description: 'Risol dessert dengan matcha cream yang lembut, tidak terlalu manis, dan paling enak dinikmati hangat.',
    stock: 82,
    weight: 85,
    options: commonServingOptions,
    details: { isi: 'Matcha cream', porsi: '1 buah', rasa: 'Manis dengan sedikit pahit matcha' },
  },
  {
    nama: 'Risol Dark Chocolate',
    harga: 6500,
    kategori: 'Risol Manis',
    categorySlug: 'risol-manis',
    image: images.chocolate,
    badge: 'Lumer',
    description: 'Isian dark chocolate creamy dalam kulit risol renyah. Manisnya seimbang.',
    stock: 71,
    weight: 82,
    options: commonServingOptions,
    details: { isi: 'Dark chocolate cream', porsi: '1 buah' },
  },
  {
    nama: 'Risol Tiramisu',
    harga: 7500,
    kategori: 'Risol Manis',
    categorySlug: 'risol-manis',
    image: images.chocolate,
    badge: 'Baru',
    description: 'Cream tiramisu lembut dengan aroma kopi dan taburan kakao.',
    stock: 59,
    weight: 85,
    options: commonServingOptions,
    details: { isi: 'Mascarpone cream, kopi, kakao', porsi: '1 buah' },
  },
  {
    nama: 'Frozen Risol Mayo Isi 5',
    harga: 28500,
    compare_at_price: 32500,
    kategori: 'Frozen Pack',
    categorySlug: 'frozen-pack',
    image: images.frozen,
    badge: 'Stok Rumah',
    description: 'Paket lima risol mayo frozen siap goreng. Dikemas rapat dan dilengkapi petunjuk memasak.',
    stock: 43,
    weight: 475,
    details: { isi_paket: '5 buah', ketahanan_freezer: '30 hari', cara_masak: 'Goreng api sedang 5-7 menit' },
  },
  {
    nama: 'Frozen Risol Matcha Isi 5',
    harga: 31985,
    kategori: 'Frozen Pack',
    categorySlug: 'frozen-pack',
    image: images.frozen,
    badge: 'Unik',
    description: 'Lima risol matcha frozen untuk camilan manis di rumah. Goreng saat masih beku.',
    stock: 37,
    weight: 450,
    details: { isi_paket: '5 buah', ketahanan_freezer: '30 hari', cara_masak: 'Goreng api kecil-sedang' },
  },
  {
    nama: 'Frozen Mix Gurih Isi 10',
    harga: 54900,
    compare_at_price: 59500,
    kategori: 'Frozen Pack',
    categorySlug: 'frozen-pack',
    image: images.frozen,
    badge: 'Hemat',
    description: 'Campuran mayo smoked beef, ragout ayam, mozzarella, carbonara, dan sayur.',
    stock: 31,
    weight: 900,
    details: { isi_paket: '10 buah', varian: '5 rasa gurih', ketahanan_freezer: '30 hari' },
  },
  {
    nama: 'Sweet Box Isi 6',
    harga: 42500,
    compare_at_price: 45000,
    kategori: 'Paket Hemat',
    categorySlug: 'paket-hemat',
    image: images.hero,
    badge: 'Dessert Box',
    description: 'Dua matcha, dua dark chocolate, dan dua tiramisu dalam satu kotak.',
    stock: 24,
    weight: 540,
    addons: [{ id: 'kartu-ucapan', label: 'Kartu ucapan', price_delta: 3000, weight_delta: 5, stock: 100 }],
    details: { isi_paket: '6 buah', varian: 'Matcha, chocolate, tiramisu' },
  },
  {
    nama: 'Paket Kenalan Chirisol Isi 8',
    harga: 49900,
    compare_at_price: 56000,
    kategori: 'Paket Hemat',
    categorySlug: 'paket-hemat',
    image: images.hero,
    badge: 'Paling Lengkap',
    description: 'Delapan risol campur gurih dan manis untuk mencoba rasa favorit Chirisol.',
    stock: 28,
    weight: 720,
    details: { isi_paket: '8 buah', varian: '4 gurih dan 4 manis' },
  },
  {
    nama: 'Party Box Isi 20',
    harga: 118500,
    compare_at_price: 135000,
    kategori: 'Paket Hemat',
    categorySlug: 'paket-hemat',
    image: images.hero,
    badge: 'Acara',
    description: 'Paket risol campur untuk arisan, rapat, ulang tahun, dan acara keluarga.',
    stock: 16,
    weight: 1800,
    options: [
      {
        id: 'komposisi',
        name: 'Komposisi rasa',
        required: true,
        options: [
          { id: 'gurih', label: 'Semua gurih', price_delta: 0, stock: 20 },
          { id: 'campur', label: 'Gurih dan manis', price_delta: 7000, stock: 20 },
        ],
      },
    ],
    details: { isi_paket: '20 buah', minimal_preorder: 'H-1' },
  },
  {
    nama: 'Sambal Chirisol 100 ml',
    harga: 12500,
    kategori: 'Saus & Add-on',
    categorySlug: 'saus-add-on',
    image: images.savory,
    badge: null,
    description: 'Sambal asam-manis pedas untuk menemani risol gurih.',
    stock: 48,
    weight: 130,
    details: { netto: '100 ml', ketahanan_kulkas: '7 hari' },
  },
]

const customizations = {
  'hero.title': 'Risol unik,<br/>isi bikin balik.',
  'hero.subtitle': 'Risol gurih dan manis dibuat harian. Pilih siap makan atau frozen, lalu pesan langsung dari katalog.',
  'hero.image_url': images.hero,
  'hero.float_image_url': images.matcha,
  'hero.spin_text': 'FRESH SETIAP HARI - GURIH & MANIS -',
  'menu.visible': 'true',
  'menu.title': 'Pilih risol favoritmu',
  'menu.description': 'Mulai dari smoked beef mayo sampai matcha cream. Harga, stok, dan pilihan penyajian tersedia di setiap produk.',
  'promo.visible': 'true',
  'promo.title': 'Pesanan untuk berbagai acara',
  'promo.image_url': images.frozen,
  'promo.badge': 'PREORDER TERSEDIA',
  'promo.main_title': 'Party box<br/>mulai isi 20',
  'promo.main_desc': 'Untuk rapat, arisan, ulang tahun, atau stok frozen di rumah. Komposisi rasa bisa disesuaikan.',
  'promo.box1_title': 'Dibuat harian',
  'promo.box1_desc': 'Risol matang digoreng mendekati waktu kirim agar tetap renyah.',
  'promo.box2_title': 'Frozen siap simpan',
  'promo.box2_desc': 'Paket frozen dikemas rapat dan dilengkapi petunjuk menggoreng.',
  'outlet.visible': 'true',
  'outlet.title': 'Dapur Chirisol',
  'outlet.subtitle': 'Produksi rumahan di Bandung. Pickup dan pengiriman mengikuti jadwal produksi.',
  'promo_banner.visible': 'true',
  'promo_banner.title': 'Coba Paket Kenalan Chirisol',
  'promo_banner.description': 'Delapan risol campur gurih dan manis dengan harga lebih hemat.',
  'promo_banner.code': 'KENALCHIRISOL',
  'promo_banner.image_url': images.hero,
  'reviews.title': 'Kata pelanggan',
  'reviews.subtitle': 'Pesanan favorit pelanggan Chirisol dalam beberapa minggu terakhir.',
  'reviews.item1_name': 'Aurel, Antapani',
  'reviews.item1_text': 'Matchanya terasa tapi tidak bikin enek. Risol mayonya juga penuh dan masih renyah saat sampai.',
  'reviews.item2_name': 'Fikri, Buahbatu',
  'reviews.item2_text': 'Pesan party box untuk rapat, datang tepat waktu dan semuanya habis.',
  'reviews.item3_name': 'Nisa, Cimahi',
  'reviews.item3_text': 'Frozen pack praktis. Petunjuk gorengnya jelas dan hasilnya tidak pecah.',
  'gallery.title': 'Dari dapur Chirisol',
  'gallery.subtitle': 'Isian, hasil goreng, dan paket frozen yang disiapkan untuk pelanggan.',
  'gallery.image1_url': images.savory,
  'gallery.image1_caption': 'Risol gurih dengan isian penuh',
  'gallery.image2_url': images.matcha,
  'gallery.image2_caption': 'Signature matcha cream',
  'gallery.image3_url': images.frozen,
  'gallery.image3_caption': 'Paket frozen siap simpan',
  'docs.visible': 'true',
  'docs.title': 'Cara menyimpan dan menggoreng',
  'docs.article_title': 'Panduan risol frozen agar renyah dan tidak pecah',
  'docs.article_url': 'https://www.kompas.com/food/read/2021/03/09/170700675/cara-menggoreng-risoles-agar-tidak-pecah',
  'docs.image_url': images.frozen,
  'location.visible': 'true',
  'location.title': 'Area pickup dan pengiriman',
  'location.address': 'Antapani, Kota Bandung, Jawa Barat',
  'location.map_url': 'https://www.google.com/maps?q=Antapani%2C%20Bandung&output=embed',
  'location.outlet1_name': 'Dapur Chirisol Antapani',
  'location.outlet1_address': 'Antapani, Kota Bandung',
  'location.outlet1_hours': 'Selasa-Minggu, 09.00-19.00 WIB',
  'contact.title': 'Pesan atau tanyakan stok',
  'contact.description': 'Hubungi admin untuk pesanan hari ini, party box, frozen pack, dan permintaan komposisi rasa.',
  'contact.whatsapp_label': 'Chat Chirisol',
  'faq.title': 'Pertanyaan Umum',
  'faq.q1': 'Apakah risol tersedia setiap hari?',
  'faq.a1': 'Produksi berlangsung Selasa-Minggu. Stok siap makan dapat berubah, jadi konfirmasi sebelum memesan dalam jumlah banyak.',
  'faq.q2': 'Berapa lama risol frozen bisa disimpan?',
  'faq.a2': 'Simpan dalam freezer hingga 30 hari. Jangan dicairkan sebelum digoreng agar kulit tidak mudah pecah.',
  'faq.q3': 'Apakah bisa pesan untuk acara?',
  'faq.a3': 'Bisa. Party box minimal isi 20 sebaiknya dipesan paling lambat H-1.',
  'social.instagram_url': 'https://www.instagram.com/',
  'social.tiktok_url': 'https://www.tiktok.com/',
}

function pick(list, index) {
  return list[index % list.length]
}

function dateDaysAgo(days, hour = 9, minute = 0) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

function seededRandom(seed) {
  let value = seed + 0x6D2B79F5
  value = Math.imul(value ^ (value >>> 15), value | 1)
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296
}

async function getOrCreateUser() {
  const created = await supabase.auth.admin.createUser({
    email: DEMO.email,
    password: DEMO.password,
    email_confirm: true,
    user_metadata: { name: DEMO.sellerName },
  })
  if (!created.error && created.data.user) return created.data.user
  if (!String(created.error?.message || '').toLowerCase().includes('already')) throw created.error

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
  throw new Error(`User ${DEMO.email} tidak ditemukan.`)
}

async function deleteStoreRows(storeId) {
  const { data: oldOrders } = await supabase.from('orders').select('id').eq('store_id', storeId)
  const orderIds = (oldOrders || []).map((order) => order.id)
  if (orderIds.length) await supabase.from('order_items').delete().in('order_id', orderIds)

  for (const table of ['orders', 'store_traffic', 'template_customizations', 'product_categories', 'products', 'store_addresses']) {
    const { error } = await supabase.from(table).delete().eq('store_id', storeId)
    if (error && !String(error.message).includes('does not exist')) throw error
  }
}

async function seed() {
  const user = await getOrCreateUser()
  const { data: oldSeller, error: oldSellerError } = await supabase.from('sellers').select('id').eq('user_id', user.id).maybeSingle()
  if (oldSellerError) throw oldSellerError

  const sellerPayload = {
    user_id: user.id,
    email: DEMO.email,
    nama_lengkap: DEMO.sellerName,
    no_wa: DEMO.whatsapp,
    role: 'seller',
  }
  const sellerQuery = oldSeller?.id
    ? supabase.from('sellers').update(sellerPayload).eq('id', oldSeller.id)
    : supabase.from('sellers').insert(sellerPayload)
  const { data: seller, error: sellerError } = await sellerQuery.select().single()
  if (sellerError) throw sellerError

  const { data: oldStore } = await supabase.from('stores').select('id').eq('slug', DEMO.slug).maybeSingle()
  if (oldStore?.id) await deleteStoreRows(oldStore.id)

  const { data: store, error: storeError } = await supabase.from('stores').upsert({
    id: oldStore?.id,
    seller_id: seller.id,
    nama_toko: DEMO.storeName,
    slug: DEMO.slug,
    deskripsi: 'Risol rumahan dengan pilihan rasa gurih dan manis, mulai dari smoked beef mayo sampai matcha cream.',
    template: 'dapur',
    warna_tema: '#1F5C46,#EFB83E',
    logo_url: '/marketing/chirisol/logo.svg',
    no_wa: DEMO.whatsapp,
    alamat: 'Antapani, Kota Bandung, Jawa Barat',
    kota: 'Bandung',
    business_category: 'Makanan, Camilan & Frozen Food',
    hero_image_url: images.hero,
    font_heading: 'Playfair Display',
    font_body: 'Inter',
    hero_title: 'Risol unik, isi bikin balik.',
    hero_subtitle: 'Risol gurih dan manis dibuat harian. Tersedia siap makan dan frozen.',
    is_active: true,
    is_published: true,
    plan: 'pro',
    pro_started_at: dateDaysAgo(34),
    plan_expires_at: dateDaysAgo(-331),
    moderation_status: 'safe',
    moderation_reason: null,
    moderation_score: 0,
    moderation_matched_terms: [],
    moderation_categories: [],
    moderation_checked_at: new Date().toISOString(),
  }, { onConflict: 'slug' }).select().single()
  if (storeError) throw storeError

  const { error: addressError } = await supabase.from('store_addresses').upsert({
    store_id: store.id,
    label: 'Utama',
    nama_pengirim: DEMO.storeName,
    no_telp: DEMO.whatsapp,
    alamat_lengkap: 'Antapani, Kota Bandung, Jawa Barat',
    province_id: '9',
    province_code: '32',
    province_name: 'Jawa Barat',
    city_id: '23',
    regency_code: '3273',
    regency_name: 'Kota Bandung',
    district_id: '100',
    district_code: '3273100',
    district_name: 'Antapani',
    subdistrict_id: '100',
    village_code: '3273100001',
    village_name: 'Antapani Kulon',
    postal_code: '40291',
    is_default: true,
  }, { onConflict: 'store_id,label' })
  if (addressError) throw addressError

  const { error: categoryError } = await supabase.from('product_categories').insert(
    categories.map((category) => ({ store_id: store.id, ...category, is_active: true })),
  )
  if (categoryError) throw categoryError

  const { data: savedCategories, error: savedCategoryError } = await supabase
    .from('product_categories')
    .select('id,slug')
    .eq('store_id', store.id)
  if (savedCategoryError) throw savedCategoryError
  const categoryIds = new Map(savedCategories.map((category) => [category.slug, category.id]))

  const { data: savedProducts, error: productError } = await supabase.from('products').insert(
    products.map((product, index) => ({
      store_id: store.id,
      nama: product.nama,
      harga: product.harga,
      compare_at_price: product.compare_at_price || null,
      deskripsi: product.description,
      foto_url: product.image,
      kategori: product.kategori,
      category_id: categoryIds.get(product.categorySlug),
      product_type: product.categorySlug === 'frozen-pack' ? 'frozen_food' : 'food',
      option_groups: product.options || [],
      variants: [],
      addons: product.addons || [],
      product_details: product.details,
      show_category: true,
      show_on_homepage: index < 6,
      homepage_rank: index,
      badge_label: product.badge,
      is_active: true,
      stok: product.stock,
      berat_gram: product.weight,
      urutan: index,
      moderation_status: 'safe',
      moderation_reason: null,
      moderation_score: 0,
      moderation_matched_terms: [],
      moderation_categories: [],
      moderation_checked_at: new Date().toISOString(),
    })),
  ).select('id,nama,harga,berat_gram')
  if (productError) throw productError

  const customizationRows = []
  for (const [key, value] of Object.entries(customizations)) {
    const dot = key.indexOf('.')
    const base = {
      store_id: store.id,
      section_key: key.slice(0, dot),
      element_key: key.slice(dot + 1),
      value,
      updated_at: new Date().toISOString(),
    }
    customizationRows.push({ ...base, is_draft: false }, { ...base, is_draft: true })
  }
  const { error: customizationError } = await supabase.from('template_customizations').insert(customizationRows)
  if (customizationError) throw customizationError

  const customers = [
    ['Aurel Maharani', '6281220101841', 'Antapani, Bandung'],
    ['Fikri Ramadhan', '6281220101842', 'Buahbatu, Bandung'],
    ['Nisa Kurnia', '6281220101843', 'Cimahi Tengah'],
    ['Dhea Puspita', '6281220101844', 'Arcamanik, Bandung'],
    ['Rafi Akbar', '6281220101845', 'Kiaracondong, Bandung'],
    ['Sinta Aprilia', '6281220101846', 'Ujungberung, Bandung'],
    ['Maya Nurlita', '6281220101847', 'Dago, Bandung'],
    ['Andri Saputra', '6281220101848', 'Cicaheum, Bandung'],
    ['Hana Fadhila', '6281220101849', 'Rancasari, Bandung'],
  ]
  const statuses = ['selesai', 'selesai', 'selesai', 'selesai', 'dikirim', 'diproses', 'menunggu_konfirmasi']
  const paymentStatus = { selesai: 'lunas', dikirim: 'lunas', diproses: 'lunas', menunggu_konfirmasi: 'pending' }
  const orderRows = []
  const itemsByCode = new Map()

  for (let index = 0; index < 87; index++) {
    const daysAgo = Math.floor((index * 34) / 87)
    const customer = pick(customers, index)
    const itemCount = index % 7 === 0 ? 3 : index % 3 === 0 ? 2 : 1
    const items = []
    for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
      const product = savedProducts[(index + itemIndex * 4) % savedProducts.length]
      const quantity = product.harga < 15000 ? 2 + ((index + itemIndex) % 4) : 1 + ((index + itemIndex) % 2)
      items.push({
        product_id: product.id,
        nama: product.nama,
        harga: product.harga,
        quantity,
        berat_gram: product.berat_gram,
      })
    }
    const subtotal = items.reduce((sum, item) => sum + item.harga * item.quantity, 0)
    const shippingCost = subtotal >= 120000 ? 0 : 9000 + ((index % 5) * 2000)
    const status = pick(statuses, index)
    const createdAt = dateDaysAgo(daysAgo, 8 + (index % 11), (index * 13) % 60)
    const orderCode = `CHI-${createdAt.slice(0, 10).replaceAll('-', '')}-${String(index + 1).padStart(3, '0')}`

    orderRows.push({
      store_id: store.id,
      order_code: orderCode,
      customer_name: customer[0],
      customer_whatsapp: customer[1],
      customer_address: customer[2],
      subdistrict_id: '100',
      postal_code: '40291',
      items,
      subtotal,
      shipping_cost: shippingCost,
      shipping_courier: shippingCost ? pick(['gosend', 'grab', 'jne'], index) : null,
      shipping_service: shippingCost ? pick(['Instant', 'Same Day', 'REG'], index) : 'Gratis ongkir',
      shipping_etd: shippingCost ? pick(['1-3 jam', 'Hari yang sama', '1-2 hari'], index) : null,
      total: subtotal + shippingCost,
      payment_method: pick(['qris', 'bank_transfer', 'manual_whatsapp'], index),
      payment_status: paymentStatus[status],
      order_status: status,
      customer_note: index % 9 === 0 ? 'Risol matang dikirim mendekati jam istirahat.' : null,
      created_at: createdAt,
      updated_at: createdAt,
    })
    itemsByCode.set(orderCode, items)
  }

  const { data: savedOrders, error: orderError } = await supabase.from('orders').insert(orderRows).select('id,order_code')
  if (orderError) throw orderError
  const orderIds = new Map(savedOrders.map((order) => [order.order_code, order.id]))
  const orderItems = []
  for (const [orderCode, items] of itemsByCode) {
    for (const item of items) {
      orderItems.push({
        order_id: orderIds.get(orderCode),
        product_id: item.product_id,
        product_name: item.nama,
        price: item.harga,
        quantity: item.quantity,
        weight_gram: item.berat_gram,
        total: item.harga * item.quantity,
      })
    }
  }
  const { error: itemError } = await supabase.from('order_items').insert(orderItems)
  if (itemError) throw itemError

  const trafficRows = []
  const paths = [`/${DEMO.slug}`, `/${DEMO.slug}/produk`, `/${DEMO.slug}#menu`, `/${DEMO.slug}#contact`]
  const referrers = ['https://instagram.com/', 'https://google.com/', 'https://tiktok.com/', 'https://wa.me/', null, null]
  for (let day = 0; day < 35; day++) {
    const daily = 31 + Math.floor(seededRandom(day + 117) * 58)
    for (let visit = 0; visit < daily; visit++) {
      trafficRows.push({
        store_id: store.id,
        visitor_id: `chi-${day}-${Math.floor(visit / (visit % 5 === 0 ? 2 : 1))}-${Math.floor(seededRandom(visit + day * 19) * 99991)}`,
        path: pick(paths, visit + day),
        referrer: pick(referrers, visit + day * 2),
        created_at: dateDaysAgo(day, 7 + (visit % 14), (visit * 17) % 60),
      })
    }
  }
  for (let index = 0; index < trafficRows.length; index += 500) {
    const { error } = await supabase.from('store_traffic').insert(trafficRows.slice(index, index + 500))
    if (error) throw error
  }

  await supabase.from('admin_logs').insert({
    action: 'SEED_CHIRISOL_DEMO',
    description: `Seed demo toko ${DEMO.storeName} (/${DEMO.slug}) dengan katalog, pesanan, dan trafik realistis.`,
  })

  console.log('Seed Chirisol selesai.')
  console.log(`Storefront: /${DEMO.slug}`)
  console.log(`Login dashboard: ${DEMO.email}`)
  console.log(`Produk: ${savedProducts.length}`)
  console.log(`Orders: ${savedOrders.length}`)
  console.log(`Traffic rows: ${trafficRows.length}`)
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
