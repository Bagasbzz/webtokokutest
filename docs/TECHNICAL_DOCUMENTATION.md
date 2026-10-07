# 🛠️ TECHNICAL DOCUMENTATION — webtokoku

> Arsitektur, database, API, security, dan deployment. Dokumen referensi utama untuk developer.

---

## 📐 Architecture Overview

```
Browser
├── /                → app/page.tsx (Landing Page - React SSR)
├── /[slug]          → Server Component → getStoreBySlug() → switch(template) → render
│                      └── UniversalCatalog (client component, cart + checkout)
├── /dashboard/*     → Client Layout (auth guard) → getMyStore() → children
├── /auth/*          → Client Components → supabase.auth.*
├── /onboarding      → Client Component → multi-step form
└── /api/*           → API Routes (server-side, Service Role Key)
    ├── /api/regions             → Proxy wilayah (API.co.id)
    │   ├── /provinces           → GET: daftar provinsi
    │   ├── /regencies           → GET: daftar kota per provinsi
    │   ├── /districts           → GET: daftar kecamatan per kota
    │   ├── /villages            → GET: daftar desa + kodepos per kecamatan
    │   └── /search              → GET: cari wilayah by string
    ├── /api/orders              → POST: simpan order + order_items
    ├── /api/shipping/cost       → POST: proxy ke RajaOngkir (legacy)
    └── /api/shipping/apico-cost → GET: proxy ke API.co.id
```

### Multi-Tenant System
Satu file `app/[slug]/page.tsx` melayani semua toko. Flow:
1. Request masuk ke `/butik-hana`
2. Server fetch `stores` WHERE `slug = 'butik-hana'` AND `is_active = true`
3. Fetch semua `products` WHERE `store_id = store.id` AND `is_active = true`
4. Switch berdasarkan `store.template` → render komponen template yang sesuai
5. Template menerima `{store, products}` sebagai props + render `UniversalCatalog`

---

## 📁 File Structure

```
webtokoku/
├── app/
│   ├── page.tsx                    ← Landing Page (React)
│   ├── auth/login/page.tsx         ← Login
│   ├── auth/register/page.tsx      ← Register
│   ├── onboarding/page.tsx         ← Setup toko pertama
│   ├── dashboard/
│   │   ├── layout.tsx              ← Auth guard + sidebar navigation
│   │   ├── page.tsx                ← Dashboard home (stats)
│   │   ├── produk/page.tsx         ← CRUD produk
│   │   ├── pesanan/page.tsx        ← Manajemen pesanan
│   │   └── pengaturan/
│   │       ├── page.tsx            ← Pengaturan toko
│   │       ├── alamat/page.tsx     ← Alamat pengirim
│   │       ├── pengiriman/page.tsx ← Setting kurir
│   │       └── pembayaran/page.tsx ← Upload QRIS
│   ├── [slug]/page.tsx             ← Toko publik (multi-tenant)
│   └── api/
│       ├── orders/route.ts         ← POST: create order
│       └── shipping/
│           ├── cost/route.ts       ← POST: RajaOngkir (legacy)
│           └── apico-cost/route.ts ← GET: API.co.id
├── components/
│   ├── templates/                  ← 5 template React
│   │   ├── DapurTemplate.tsx
│   │   ├── ButikTemplate.tsx
│   │   ├── GlowTemplate.tsx
│   │   ├── LuxeTemplate.tsx
│   │   └── HerbaTemplate.tsx
│   └── catalog/
│       └── UniversalCatalog.tsx    ← Checkout engine (cart, modals, WA)
├── lib/
│   ├── supabase/client.ts          ← createBrowserClient (@supabase/ssr)
│   ├── public-store.ts             ← Server-safe: getStoreBySlug, getStoreProducts
│   ├── store.ts                    ← Auth-required: getMyStore, updateStore
│   ├── product.ts                  ← CRUD products + upload foto
│   ├── auth.ts                     ← signUp, signIn, signOut, getSession
│   ├── templates.ts                ← TEMPLATES registry (5 templates)
│   └── types.ts                    ← TypeScript interfaces
├── public/
│   ├── demo/                       ← 5 HTML statis (referensi visual)
│   ├── inidemo/                    ← Demo interaktif (isolated sandbox)
│   └── template-previews/          ← Screenshot desktop+mobile
├── supabase/
│   ├── schema.sql                  ← Tabel core: sellers, stores, products
│   └── step_11_catalog_orders.sql  ← Tabel: orders, order_items, dll
└── _assets_penting/                ← Referensi desain (JANGAN DIUBAH)
    └── UI_DESIGN_SPEC.md
```

---

## 📊 Database Schema

### Core Tables (schema.sql)

```sql
-- Sellers: profil pemilik toko
CREATE TABLE sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nama_lengkap TEXT NOT NULL,
  no_wa TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Stores: data toko (1 seller = 1 toko di MVP)
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
  nama_toko TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  deskripsi TEXT,
  template TEXT DEFAULT 'butik',        -- butik|dapur|glow|luxe|herba
  warna_tema TEXT DEFAULT '#16A34A',
  logo_url TEXT,
  no_wa TEXT NOT NULL,
  alamat TEXT,
  kota TEXT,
  hero_image_url TEXT,
  font_heading TEXT DEFAULT 'Outfit',
  font_body TEXT DEFAULT 'Inter',
  hero_title TEXT,
  hero_subtitle TEXT,
  is_published BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Products: katalog produk
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  harga INTEGER NOT NULL,               -- Rupiah, tanpa desimal
  deskripsi TEXT,
  foto_url TEXT,
  kategori TEXT,
  berat_gram INTEGER DEFAULT 0,         -- Wajib untuk ongkir
  stok INTEGER DEFAULT 0,               -- Manajemen inventaris
  is_active BOOLEAN DEFAULT true,
  urutan INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Product Images: galeri foto tambahan
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  urutan INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Order Tables (step_11_catalog_orders.sql)

```sql
-- Orders: pesanan masuk
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  order_code TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  customer_address TEXT,
  subdistrict_id TEXT,
  items JSONB NOT NULL,
  subtotal INTEGER NOT NULL,
  shipping_cost INTEGER DEFAULT 0,
  shipping_courier TEXT,
  shipping_service TEXT,
  shipping_etd TEXT,
  total INTEGER NOT NULL,
  payment_method TEXT,                   -- 'qris_manual'
  payment_status TEXT DEFAULT 'pending', -- pending|menunggu_konfirmasi|confirmed
  order_status TEXT DEFAULT 'menunggu_konfirmasi',
  bukti_url TEXT,
  bukti_uploaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order Items: detail item per pesanan (snapshot)
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  weight_gram INTEGER NOT NULL,
  total INTEGER NOT NULL
);

-- Payment Methods: metode pembayaran seller
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  type TEXT NOT NULL,                    -- 'qris' | 'bank_transfer'
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  qr_image_url TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Shipping Tables (untuk integrasi ongkir)
CREATE TABLE store_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Utama',
  nama_pengirim TEXT NOT NULL,
  no_telp TEXT NOT NULL,
  alamat_lengkap TEXT NOT NULL,
  province_code TEXT,
  province_name TEXT,
  regency_code TEXT,
  regency_name TEXT,
  district_code TEXT,
  district_name TEXT,
  village_code TEXT,
  village_name TEXT,
  postal_code TEXT,
  location_notes TEXT,
  map_url TEXT,
  is_default BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE shipping_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE UNIQUE,
  auto_shipping_enabled BOOLEAN DEFAULT false,
  pickup_enabled BOOLEAN DEFAULT true,
  cod_enabled BOOLEAN DEFAULT false,
  allowed_couriers JSONB DEFAULT '["jne","jnt","sicepat"]',
  free_shipping_minimum INTEGER DEFAULT 0
);
```

### RLS Policies

```sql
-- Seller hanya akses data sendiri
CREATE POLICY "store_owner" ON stores FOR ALL
  USING (seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid()));

-- Publik bisa lihat toko aktif
CREATE POLICY "store_public" ON stores FOR SELECT
  USING (is_active = true);

-- Pattern yang sama untuk products, orders, dll
-- Seller: USING (store_id IN (SELECT id FROM stores WHERE ...))
-- Public: USING (is_active = true) — hanya SELECT
```

---

## 🔌 API Routes

### POST `/api/orders`
Simpan pesanan baru. **Server-side price recalculation** — tidak percaya data frontend.

```typescript
// Request
{ store_id, customer: { name, whatsapp, address }, cart: [...], shipping: { cost, courier, service, etd }, bukti_url }

// Response
{ order_code: "ORD-1715187600000" }
```

### GET `/api/shipping/apico-cost` ⚡ AKTIF
Proxy ke API.co.id untuk cek ongkir. **API key tidak boleh di frontend.**

```typescript
// Request (query params)
?origin=3273111001&destination=3171011001&weight=1000&courier=jne

// Headers yang dikirim ke API.co.id
{ 'x-api-co-id': process.env.APICO_API_KEY }
```

### POST `/api/shipping/cost` (Legacy — RajaOngkir)
Masih ada tapi tidak digunakan. Akan di-deprecate.

---

## 🚚 Shipping Integration (API.co.id)

**Provider:** [API.co.id](https://api.co.id) — pengganti RajaOngkir.

| Aspek | Detail |
|---|---|
| Base URL | `https://use.api.co.id` |
| Auth Header | `x-api-co-id: {API_KEY}` |
| Env Variable | `APICO_API_KEY` (sudah di Vercel) |
| Expedition API | `/expedition/shipping-cost` |
| Regional API | `/regional/indonesia/villages` |
| Location Code | **10-digit Village Code** (lebih presisi dari RajaOngkir) |
| Kurir | JNE, SiCepat, SAP, dll |

### Endpoint Regional (Cari Lokasi)
```
GET /regional/indonesia/provinces                    → List provinsi
GET /regional/indonesia/provinces/{code}/regencies   → List kab/kota
GET /regional/indonesia/regencies/{code}/districts   → List kecamatan
GET /regional/indonesia/districts/{code}/villages    → List desa/kelurahan
GET /regional/indonesia/search?name={query}          → Search (Premium)
```

### Response Format (Regional)
```json
{
  "is_success": true,
  "message": "Success",
  "data": [
    { "code": "3273111001", "name": "DESA CONTOH", "district_code": "327311", ... }
  ],
  "paging": { "page": 1, "size": 100, "total_item": 15, "total_page": 1 }
}
```

---

## 🔐 Security

### Checklist
- [x] RLS aktif di tabel: `sellers`, `stores`, `products`
- [x] RLS aktif di tabel: `orders`, `order_items`, `payment_methods`
- [x] `SUPABASE_SERVICE_ROLE_KEY` hanya di API Routes
- [x] Server-side price recalculation di `/api/orders`
- [ ] Bucket `payment-proofs` = PRIVATE
- [ ] Upload file: max 2MB, validasi MIME
- [ ] Rate limit pada API endpoints

### Pola Supabase Client
```typescript
// ❌ SALAH — top-level instantiation
const supabase = createClient()
export async function getData() { ... }

// ✅ BENAR — di dalam fungsi async
export async function getData() {
  const supabase = createClient()
  // ...
}
```

### Env Variables (Wajib)
```env
NEXT_PUBLIC_SUPABASE_URL=...          # Public, boleh di frontend
NEXT_PUBLIC_SUPABASE_ANON_KEY=...     # Public, boleh di frontend
SUPABASE_SERVICE_ROLE_KEY=...         # ⚠️ SERVER-SIDE ONLY
APICO_API_KEY=...                     # ⚠️ SERVER-SIDE ONLY
NEXT_PUBLIC_SITE_URL=...              # Public
```

---

## 🚀 Deployment

### Production Domain and SEO

- Domain platform canonical: `https://www.webtokoku.id`.
- Vercel saat ini mengarahkan apex `webtokoku.id` ke `www.webtokoku.id`, jadi middleware tidak boleh mengarahkan `www.webtokoku.id` balik ke apex. Jika dua arah ini aktif bersamaan, browser akan menampilkan `ERR_TOO_MANY_REDIRECTS`.
- Domain tenant memakai wildcard `*.webtokoku.id`, contoh `rina.webtokoku.id`. Middleware membaca host, mengambil subdomain sebagai slug, lalu rewrite internal ke `/${slug}`.
- Domain lama `webtokoku.vercel.app/{slug}` diarahkan ke `https://{slug}.webtokoku.id`.
- Custom domain seller disiapkan dengan kolom `stores.custom_domain` dan route internal `/custom-domain/[domain]`.
- Google Search Console domain property harus diverifikasi lewat DNS TXT di Vercel DNS karena nameserver domain sudah pindah ke Vercel. Value saat ini: `google-site-verification=r-RpP1KKnonQkR864pV2qxT-6ZAEBKLhLWcdCU5wH2M`.
- Meta tag Google verification juga dipasang di `app/layout.tsx` untuk mendukung URL-prefix verification.
- SEO dasar platform: metadata global, canonical, Open Graph, structured data, `/blog`, `/sitemap.xml`, dan `/robots.txt`.
- SEO tenant: `app/[slug]/page.tsx` dan `app/custom-domain/[domain]/page.tsx` menghasilkan title, description, canonical, Open Graph, dan image dari data toko.

### Vercel Configuration
- **Framework Preset:** Next.js (⚠️ BUKAN "Other" — pernah menyebabkan 404 semua routes)
- **Build Command:** `next build`
- **Auto-deploy:** Push ke `main` branch → auto deploy
- **Domain:** `webtokoku.id` dan `www.webtokoku.id` via Vercel DNS. Wildcard tenant: `*.webtokoku.id`.

### next.config.mjs
```javascript
// Redirect /index.html → / (hindari conflict dengan [slug])
async redirects() {
  return [{ source: '/index.html', destination: '/', permanent: true }]
}
```

---

## 🐛 Known Issues & Decisions

| Issue | Keputusan | Status |
|---|---|---|
| Middleware auth error | Hapus middleware.ts, auth guard di client `dashboard/layout.tsx` | ✅ Fixed |
| `[slug]` catches `/index.html` | Redirect di `next.config.mjs` | ✅ Fixed |
| `class` vs `className` di TSX | Fix di HerbaTemplate + LuxeTemplate | ✅ Fixed |
| Dashboard stats hardcoded | Placeholder — akan connect ke data real saat order management mature | 🟡 Known |
| `Store` type vs DB schema mismatch | DB sudah di-alter manual, types.ts sudah updated | ✅ Fixed |
| Landing page: 2 versi | `app/page.tsx` (React) aktif. `public/index.html` lama di-redirect | ✅ Resolved |

---

## 🧩 Checkout Engine (UniversalCatalog)

Semua 5 template menggunakan `UniversalCatalog.tsx` sebagai single checkout engine:

```tsx
<UniversalCatalog store={store} products={products} themeColor={accentColor} />
```

**Flow 4-step:**
1. **Keranjang** — tambah/kurangi item, lihat subtotal
2. **Alamat** — isi nama, WA, alamat pengiriman
3. **Pengiriman** — pilih kurir (dari API.co.id), lihat ongkir
4. **Pembayaran** — scan QRIS seller, upload bukti bayar

**Setelah submit:**
- Order disimpan ke DB via `/api/orders` (server-side recalculate)
- Auto-redirect ke WhatsApp seller dengan format pesan terstruktur
- Status order: `menunggu_konfirmasi`

---

## Update 2026-05-19: RajaOngkir/Komerce Shipping

Provider ongkir otomatis sekarang diarahkan ke RajaOngkir/Komerce Shipping Cost API.

### Env Vercel

```env
RAJAONGKIR_API_KEY=...               # SERVER-SIDE ONLY
RAJAONGKIR_BASE_URL=https://rajaongkir.komerce.id/api/v1
RAJAONGKIR_DAILY_LIMIT=100
```

API key diambil dari Collaborator Komerce bagian Integration/API Key, pilih key Shipping Cost.

### Endpoint Webtokoku

```text
GET  /api/shipping/search?q=jakarta
POST /api/shipping/cost
POST /api/shipping/apico-cost   # legacy alias ke /api/shipping/cost
```

`/api/shipping/search` memanggil:

```text
GET https://rajaongkir.komerce.id/api/v1/destination/domestic-destination?search={q}&limit=20&offset=0
Header: key: RAJAONGKIR_API_KEY
```

`/api/shipping/cost` memanggil:

```text
POST https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost
Content-Type: application/x-www-form-urlencoded
Body: origin, destination, weight, courier, price=lowest
Header: key: RAJAONGKIR_API_KEY
```

### Feature Toggle

Ongkir otomatis hanya aktif jika dua level toggle aktif:

1. Admin platform: `feature_flags.key = auto_shipping` harus `enabled_globally = true`.
2. Seller: `shipping_settings.auto_shipping_enabled = true`.

Jika admin mematikan global flag, checkout publik tidak membuka step cek ongkir dan dashboard seller menampilkan info bahwa fitur dimatikan admin. Order tetap masuk dengan `shipping_cost = 0` dan `shipping_service = "Dikonfirmasi seller via WhatsApp"`.

### Kuota 100 Hit/Hari

Paket Starter RajaOngkir/Komerce punya batas 100 hit/hari. Migration `supabase/migrations/step23_rajaongkir_komerce_usage.sql` menambahkan tabel `shipping_api_usage_logs` untuk menghitung hit per hari.

Perilaku saat kuota habis:

- `/api/shipping/search` dan `/api/shipping/cost` mengembalikan `429` dengan `code = RAJAONGKIR_DAILY_LIMIT`.
- UI checkout menampilkan pesan bahwa ongkir dikonfirmasi lewat WhatsApp.
- `/api/orders` tetap menerima order dan melakukan fallback manual.
- Admin overview menampilkan hit RajaOngkir hari ini.

### Maintenance

`maintenance_mode` adalah feature flag global. Saat aktif, middleware mengarahkan halaman publik dan dashboard user ke `/maintenance`. Route `/admin`, `/maintenance`, asset static, dan `/api/auth` tetap dibuka agar admin bisa login dan mematikan maintenance. Jadi pengembangan kecil tidak wajib menutup semua toko; maintenance mode hanya dipakai untuk perubahan besar, migrasi DB, atau insiden production.
