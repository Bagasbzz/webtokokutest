# WEBTOKOKU — MASTER EXECUTION PLAN
*Last updated: 9 Mei 2026 | Status: Ready to Execute*

---

## STATUS TERAKHIR

### Sudah Selesai & Build Sukses
- Repo bisa `npm ci`, build sukses, error syntax/type sudah bersih
- Checkout engine diarahkan ke `CommerceLayer` — `UniversalCatalog` dianggap legacy
- `DapurTemplate` dan `LuxeTemplate` sudah tidak pakai `UniversalCatalog`
- Password policy sudah dibuat
- Cloudflare Turnstile CAPTCHA sudah dibuat
- Register sudah pindah ke API route server-side
- Email verification dan forgot password sudah jalan, build sukses
- Alamat berbasis API.co.id sudah dibuat (tapi API sedang error — fitur perlu bisa dimatikan)
- Product detail dan multi images sudah dibuat:
  - Tabel `product_images`
  - Field `stok` dan `berat_gram`
  - `ProductDrawer` lebih lengkap
  - Quantity cart dibatasi stok
  - Produk stok 0 tidak bisa add to cart

### Masalah Aktif
- **API.co.id error** — fitur `auto_shipping` dan `formal_region_address` harus dimatikan via feature flag, jangan hapus kode
- **Database migration bercampur** — perlu audit, final schema, dan rencana reset sebelum lanjut
- **Setup Wizard** belum mulai
- **Visual Editor V2** belum mulai
- **Dashboard Admin** belum ada — developer tidak bisa toggle fitur tanpa ini

---

## ATURAN KERJA (Paste ke setiap prompt AI)

```
Aturan kerja:
- Kerjakan hanya scope yang diminta. Jangan buat fitur di luar instruksi.
- Jangan refactor besar tanpa izin eksplisit.
- Jangan hapus fitur lama — matikan via feature flag jika tidak stabil.
- Jangan pakai emoji di UI. Gunakan Lucide React icons atau elemen visual standar.
- Jangan expose API key ke frontend.
- Jangan percaya harga, stok, berat, subtotal, atau total dari frontend — selalu recalculate server-side.
- Public storefront hanya membaca data aktif/published.
- Seller hanya boleh akses data toko sendiri.
- Admin guard harus dicek server-side, bukan role frontend saja.
- Update dokumentasi setelah task selesai:
  - CHANGELOG.md
  - discussion.md
  - TECHNICAL_DOCUMENTATION.md (jika menyentuh arsitektur/API/schema)
  - IMPLEMENTATION_ROADMAP.md (jika menyentuh roadmap/status)
- Jalankan build setelah setiap perubahan.
- Jika build gagal, laporkan error lengkap dan berhenti — jangan lanjut task lain.
```

### Output Wajib per Task

```
Output yang harus dilaporkan:
1. Ringkasan perubahan yang dilakukan
2. Daftar file yang diubah/dibuat
3. Migration SQL (jika ada schema change)
4. Dokumen yang diupdate
5. Cara test manual (step by step)
6. Hasil build (sukses / gagal)
7. Error lengkap jika ada
```

---

## URUTAN EKSEKUSI

| # | Phase | Estimasi | Dependency |
|---|---|---|---|
| 1 | **4A** — Admin Dashboard + Feature Flags | 1 hari | — |
| 2 | **DB-1** — Database Audit + Final Schema Plan | 4 jam | 4A selesai |
| 3 | *(Review manual)* DATABASE_RESET_PLAN.md + final_schema.sql | — | DB-1 selesai |
| 4 | **DB-2** — Execute Database Reset | 2 jam | Review manual selesai |
| 5 | **3B** — Checkout & Order Inventory Hardening | 4 jam | DB-2 selesai |
| 6 | **4B** — Template Content Contract | 4 jam | 3B selesai |
| 7 | **5** — Setup Wizard | 2 hari | 4A + 4B selesai |
| 8 | **6** — Visual Editor V2 | 2–3 hari | 4B selesai |
| 9 | **7** — Dashboard Seller Redesign | 1 hari | 4A + 6 selesai |
| 10 | **8** — Admin Dashboard Advanced | 1 hari | 4A selesai |
| 11 | **1C** — Rate Limit Auth | 4 jam | Semua core stabil |

---

---

# PHASE 4A — Admin Dashboard + Feature Flags

**Tujuan:** Developer/platform owner bisa toggle fitur dari dashboard admin. Karena API ongkir sedang error, fitur terkait harus bisa dimatikan sementara tanpa hapus kode.

**Estimasi:** 1 hari kerja
**Dependency:** Tidak ada
**Blocker jika tidak selesai:** Tidak bisa toggle fitur apapun, tidak bisa lanjut fase lain dengan aman

---

### Database — Migration

Buat file: `supabase/phase_4a_admin_feature_flags.sql`

**Tabel `feature_flags`** — daftar fitur global platform

```sql
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  enabled_globally BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Hanya admin yang bisa baca/ubah
CREATE POLICY "admin_only_feature_flags" ON feature_flags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM sellers
      WHERE sellers.user_id = auth.uid()
      AND sellers.role = 'admin'
    )
  );
```

**Tabel `store_feature_flags`** — override flag per toko

```sql
CREATE TABLE store_feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(store_id, feature_key)
);

ALTER TABLE store_feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_manage_store_flags" ON store_feature_flags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM sellers
      WHERE sellers.user_id = auth.uid()
      AND sellers.role = 'admin'
    )
  );
```

**Tabel `admin_logs`** — audit trail semua aksi admin

```sql
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_type TEXT,       -- 'store' | 'user' | 'feature_flag' | 'system'
  target_id UUID,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_logs" ON admin_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sellers
      WHERE sellers.user_id = auth.uid()
      AND sellers.role = 'admin'
    )
  );
```

**Tabel `platform_settings`** — key-value settings global

```sql
CREATE TABLE platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_manage_settings" ON platform_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM sellers
      WHERE sellers.user_id = auth.uid()
      AND sellers.role = 'admin'
    )
  );
```

**Tambah kolom `role` ke tabel `sellers`** (jika belum ada)

```sql
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'seller';
-- role: 'seller' | 'admin'
-- Set admin pertama manual: UPDATE sellers SET role = 'admin' WHERE email = 'youremail@...';
```

**Seed feature flags default**

```sql
INSERT INTO feature_flags (key, name, description, enabled_globally) VALUES
  ('auto_shipping',          'Ongkir Otomatis',         'Kalkulasi ongkir via API.co.id. Matikan jika API error.',    false),
  ('formal_region_address',  'Alamat Formal (API)',      'Form alamat wajib via dropdown wilayah API.co.id.',          false),
  ('setup_wizard',           'Setup Wizard',             'Guided wizard 8-step untuk setup toko.',                     false),
  ('visual_editor',          'Visual Editor',            'Click-to-edit template editor di dashboard.',                false),
  ('qris_checkout',          'Checkout QRIS',            'Pembayaran via upload bukti QRIS.',                          true),
  ('product_gallery',        'Galeri Produk',            'Multiple foto per produk.',                                  true),
  ('turnstile_captcha',      'Cloudflare Turnstile',     'CAPTCHA di halaman register.',                               true),
  ('email_verification',     'Verifikasi Email',         'Wajib verifikasi email setelah register.',                   true),
  ('maintenance_mode',       'Maintenance Mode',         'Tampilkan halaman maintenance ke semua user.',               false)
ON CONFLICT (key) DO NOTHING;
```

---

### File yang Dibuat

**`lib/feature-flags.ts`** — helper server-side untuk cek flag

```typescript
import { createClient } from '@/lib/supabase/server'

// Cache sederhana — flags tidak berubah sering
let flagCache: Record<string, boolean> = {}
let cacheTime = 0
const CACHE_TTL = 60 * 1000 // 1 menit

export async function getFeatureFlags(): Promise<Record<string, boolean>> {
  const now = Date.now()
  if (now - cacheTime < CACHE_TTL && Object.keys(flagCache).length > 0) {
    return flagCache
  }

  const supabase = createClient()
  const { data } = await supabase
    .from('feature_flags')
    .select('key, enabled_globally')

  if (data) {
    flagCache = Object.fromEntries(data.map(f => [f.key, f.enabled_globally]))
    cacheTime = now
  }

  return flagCache
}

export async function isFeatureEnabled(key: string): Promise<boolean> {
  const flags = await getFeatureFlags()
  return flags[key] ?? false
}

export async function isStoreFeatureEnabled(storeId: string, key: string): Promise<boolean> {
  // Cek override per toko dulu, fallback ke global
  const supabase = createClient()
  const { data } = await supabase
    .from('store_feature_flags')
    .select('enabled')
    .eq('store_id', storeId)
    .eq('feature_key', key)
    .single()

  if (data !== null) return data.enabled
  return isFeatureEnabled(key)
}

export async function isAdmin(): Promise<boolean> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('sellers')
    .select('role')
    .eq('user_id', user.id)
    .single()

  return data?.role === 'admin'
}

export async function logAdminAction(params: {
  action: string
  target_type?: string
  target_id?: string
  description?: string
  metadata?: Record<string, unknown>
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('admin_logs').insert({
    admin_id: user.id,
    ...params
  })
}
```

**`lib/feature-flags-client.ts`** — helper client-side (baca dari API route, tidak langsung DB)

```typescript
// Tidak boleh akses DB langsung dari client — gunakan API route atau server props

export type FeatureFlags = {
  auto_shipping: boolean
  formal_region_address: boolean
  setup_wizard: boolean
  visual_editor: boolean
  qris_checkout: boolean
  product_gallery: boolean
  turnstile_captcha: boolean
  email_verification: boolean
  maintenance_mode: boolean
}

export const DEFAULT_FLAGS: FeatureFlags = {
  auto_shipping: false,
  formal_region_address: false,
  setup_wizard: false,
  visual_editor: false,
  qris_checkout: true,
  product_gallery: true,
  turnstile_captcha: true,
  email_verification: true,
  maintenance_mode: false,
}
```

**`app/api/admin/feature-flags/route.ts`** — API untuk baca dan toggle flags

```typescript
// GET — baca semua flags (admin only)
// PATCH — toggle flag (admin only)
// Body: { key: string, enabled: boolean }
// Setiap toggle wajib insert ke admin_logs
```

---

### Route Admin

**Struktur file:**

```
app/admin/
├── layout.tsx          ← Admin guard (server-side cek role)
├── page.tsx            ← Overview
└── feature-flags/
    └── page.tsx        ← Tabel semua flag + toggle
```

**`app/admin/layout.tsx`** — admin guard wajib server-side

```typescript
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/feature-flags'

export default async function AdminLayout({ children }) {
  const admin = await isAdmin()
  if (!admin) redirect('/dashboard')  // Jangan expose /admin ke non-admin

  return (
    <div className="admin-layout">
      {/* sidebar admin */}
      {children}
    </div>
  )
}
```

**`app/admin/page.tsx`** — overview singkat: jumlah seller, toko, order, flags aktif

**`app/admin/feature-flags/page.tsx`** — tabel flag dengan toggle switch. Setiap toggle:
- Panggil API route PATCH
- Catat ke `admin_logs`
- Invalidate cache flags
- Tampilkan feedback sukses/gagal

---

### Gate Fitur di UI

Tambahkan pengecekan di:

| Fitur | Lokasi Gate | Behavior jika OFF |
|---|---|---|
| `auto_shipping` | `UniversalCatalog` step ongkir | Tampilkan: "Ongkir dikonfirmasi seller via WhatsApp" |
| `formal_region_address` | Form alamat seller + form alamat checkout | Boleh pakai teks bebas, tidak paksa API wilayah |
| `setup_wizard` | `dashboard/layout.tsx` sidebar | Menu "Setup Website" tidak muncul |
| `visual_editor` | `dashboard/layout.tsx` sidebar | Menu "Edit Template" tidak muncul |
| `maintenance_mode` | `app/[slug]/page.tsx` + `app/page.tsx` | Tampilkan halaman maintenance |
| `qris_checkout` | `UniversalCatalog` step pembayaran | Sembunyikan opsi QRIS |
| `turnstile_captcha` | `app/auth/register/page.tsx` | Skip render CAPTCHA |

---

### Cara Test Manual

1. Jalankan migration SQL di Supabase SQL Editor
2. Set role admin: `UPDATE sellers SET role = 'admin' WHERE email = 'emailkamu@...'`
3. Login → akses `/admin` → pastikan masuk
4. Login dengan akun non-admin → akses `/admin` → pastikan di-redirect ke `/dashboard`
5. Di `/admin/feature-flags`, toggle `setup_wizard` ON → pergi ke `/dashboard` → pastikan menu "Setup Website" muncul
6. Toggle `setup_wizard` OFF → kembali ke `/dashboard` → pastikan menu hilang
7. Cek `admin_logs` di Supabase — pastikan setiap toggle tercatat

---

---

# PHASE DB-1 — Database Audit + Final Schema Plan

**Tujuan:** Rapikan database yang sudah bercampur. Jangan langsung drop data — buat rencana dan schema final dulu.

**Estimasi:** 4 jam
**Dependency:** Phase 4A selesai (agar tabel admin sudah ada di schema final)
**Output wajib:** File `DATABASE_RESET_PLAN.md` + `supabase/final_schema.sql` (belum dijalankan)

---

### Task

1. Audit semua file di folder `supabase/` — list semua migration yang pernah dijalankan
2. Identifikasi: tabel duplikat, kolom konflik, schema tidak konsisten
3. Buat `DATABASE_RESET_PLAN.md` berisi:
   - Tabel final yang dipakai (lihat daftar di bawah)
   - Tabel legacy yang tidak dipakai
   - Urutan drop (sesuai foreign key dependency)
   - Urutan buat ulang
   - Data seed awal
   - Risiko jika auth/storage ikut terdampak
4. Buat `supabase/final_schema.sql` — schema lengkap semua tabel final
5. **Jangan jalankan SQL dulu** — tunggu review manual

---

### Tabel Final yang Harus Ada

**Auth/Profile**
- `sellers` — dengan kolom `role TEXT DEFAULT 'seller'`

**Store Core**
- `stores`
- `store_addresses`
- `shipping_settings`
- `payment_methods`

**Product/Commerce**
- `products`
- `product_images`
- `orders`
- `order_items`

**Builder/Template**
- `template_customizations`
- `template_revisions`
- `store_testimonials`
- `store_promos`
- `store_brand_contents`
- `store_social_links`

**Platform Admin**
- `feature_flags`
- `store_feature_flags`
- `platform_settings`
- `admin_logs`
- `error_logs`
- `shipping_logs`

**Aturan wajib semua tabel:**
- RLS aktif
- Public storefront: hanya SELECT data `is_active = true` atau `is_published = true`
- Seller: hanya CRUD data toko sendiri
- Admin: akses via role check server-side

**Jangan sentuh:**
- `auth.users`
- `storage.objects`
- `storage.buckets`

---

---

# PHASE DB-2 — Execute Database Reset

**Pakai hanya setelah `DATABASE_RESET_PLAN.md` dan `final_schema.sql` sudah direview dan disetujui secara manual.**

**Estimasi:** 2 jam (termasuk test)

---

### Task

1. Backup data penting dulu (export CSV dari Supabase dashboard)
2. Buat SQL reset: DROP tabel public webtokoku sesuai urutan foreign key
3. Jalankan `final_schema.sql`
4. Jalankan seed feature flags default
5. Test flow utama setelah reset:

| Flow | Yang Dicek |
|---|---|
| Register | Form submit → user tercatat di `sellers` |
| Onboarding | Multi-step → `stores` dibuat dengan slug |
| Tambah produk | CRUD produk + upload foto |
| Product drawer | Detail produk + galeri foto |
| Cart | Add to cart, quantity dibatasi stok |
| Checkout | 4-step flow, order tersimpan |
| Admin feature flags | Toggle flag, tercatat di admin_logs |

---

---

# PHASE 3B — Checkout & Order Inventory Hardening

**Tujuan:** Validasi stok dan harga harus aman di server, bukan hanya validasi cart frontend.

**Estimasi:** 4 jam
**Dependency:** DB-2 selesai (schema sudah bersih)
**File utama:** `app/api/orders/route.ts`

---

### Audit Checklist `app/api/orders/route.ts`

Server harus melakukan ini dalam urutan:

```
1. Ambil semua product_id dari request
2. Fetch ulang produk dari DB — jangan percaya data frontend
3. Untuk setiap item:
   - Produk ada?
   - Produk is_active = true?
   - Produk milik store_id yang benar?
   - stok >= quantity?
   - quantity > 0?
4. Hitung ulang server-side:
   - harga per item (dari DB, bukan frontend)
   - subtotal (sum harga * quantity)
   - berat total (sum berat_gram * quantity)
   - ongkir (dari API jika auto_shipping = true, atau 0 jika false)
   - total = subtotal + ongkir
5. Jika auto_shipping = false:
   - shipping_cost = 0
   - shipping_service = "Dikonfirmasi seller via WhatsApp"
   - shipping_courier = null
   - Pesan WA menyebut ongkir akan dikonfirmasi
6. Simpan order ke DB
7. Kurangi stok produk (atomik — gunakan transaction atau RPC)
8. Return order_code
```

---

### Keputusan Stok yang Harus Ditentukan

Pilih satu dan dokumentasikan:

**Opsi A — Kurangi stok saat order dibuat** *(lebih aman untuk seller)*
- Pro: stok tidak oversell
- Con: stok berkurang meski pembeli tidak jadi bayar
- Implementasi: `UPDATE products SET stok = stok - qty WHERE id = ... AND stok >= qty`

**Opsi B — Kurangi stok saat pembayaran dikonfirmasi** *(lebih buyer-friendly)*
- Pro: stok tidak terkunci untuk order yang tidak dibayar
- Con: bisa oversell jika banyak order bersamaan
- Implementasi: update stok di endpoint konfirmasi pembayaran

Rekomendasi untuk MVP: **Opsi A** — lebih aman, lebih mudah diimplementasi.

---

### WhatsApp Message Format

Jika `auto_shipping = false`, format pesan WA:

```
Halo [nama_seller], ada pesanan baru!

No. Order: ORD-xxx
Dari: [nama_pembeli] ([nomor_wa])

Items:
- [nama_produk] x[qty] = Rp [harga]
...

Subtotal: Rp [subtotal]
Ongkir: Dikonfirmasi seller
Total sementara: Rp [subtotal]

Alamat pengiriman:
[alamat lengkap pembeli]

Pembeli sudah upload bukti bayar. Mohon konfirmasi ongkir dan total akhir.
```

---

### Cara Test Manual

1. Tambah produk dengan stok 3
2. Checkout 2 item → order tersimpan → stok berkurang jadi 1
3. Coba checkout 2 item lagi (melebihi stok) → harus gagal dengan error jelas
4. Coba kirim request dengan harga dimanipulasi dari browser devtools → server harus ignore dan recalculate
5. Pastikan order dengan `auto_shipping = false` menyimpan `shipping_cost = 0` dan `shipping_service = "Dikonfirmasi seller via WhatsApp"`

---

---

# PHASE 4B — Template Content Contract

**Tujuan:** Semua 5 template punya struktur section dan editable key yang seragam, walau desain visualnya beda. Ini prerequisite untuk Setup Wizard dan Visual Editor V2.

**Estimasi:** 4 jam
**Dependency:** 3B selesai

---

### Section Wajib Semua Template

```
header
announcement
hero
value_props
featured_categories
catalog
promo
reviews
brand_story
brand_gallery
location
contact
faq
footer
```

---

### File yang Dibuat

**`lib/template-content-contract.ts`** — definisi section dan field type

```typescript
export type FieldType =
  | 'text'        // input satu baris
  | 'textarea'    // teks panjang
  | 'richtext'    // teks dengan formatting sederhana (bold, list)
  | 'image'       // URL gambar (upload)
  | 'color'       // hex color picker
  | 'gradient'    // gradient JSON { from, to, direction }
  | 'toggle'      // boolean show/hide
  | 'link'        // URL + label
  | 'video'       // URL video embed

export type EditableField = {
  key: string          // contoh: 'hero.title'
  label: string        // label di sidebar editor
  type: FieldType
  placeholder?: string
  maxLength?: number
  required?: boolean
}

export type Section = {
  key: string          // contoh: 'hero'
  label: string        // contoh: 'Hero Utama'
  fields: EditableField[]
  hasVisibilityToggle: boolean   // apakah section bisa disembunyikan
}
```

**`lib/template-editables.ts`** — registry editable keys per template

Contoh untuk `dapur`:

```typescript
dapur: [
  // HERO
  { key: 'hero.visible',          label: 'Tampilkan Hero',      type: 'toggle' },
  { key: 'hero.title',            label: 'Judul Hero',          type: 'text',     maxLength: 60 },
  { key: 'hero.subtitle',         label: 'Subjudul Hero',       type: 'textarea', maxLength: 150 },
  { key: 'hero.image_url',        label: 'Gambar Hero',         type: 'image' },
  { key: 'hero.float_image_url',  label: 'Gambar Float',        type: 'image' },
  { key: 'hero.background_color', label: 'Warna Background',    type: 'color' },
  { key: 'hero.cta_text',         label: 'Teks Tombol CTA',     type: 'text',     maxLength: 30 },

  // PROMO
  { key: 'promo.visible',         label: 'Tampilkan Promo',     type: 'toggle' },
  { key: 'promo.badge_text',      label: 'Teks Badge',          type: 'text',     maxLength: 40 },
  { key: 'promo.title',           label: 'Judul Promo',         type: 'text',     maxLength: 60 },
  { key: 'promo.description',     label: 'Deskripsi Promo',     type: 'textarea', maxLength: 200 },
  { key: 'promo.image_url',       label: 'Gambar Promo',        type: 'image' },

  // BRAND STORY
  { key: 'brand_story.visible',   label: 'Tampilkan Brand Story', type: 'toggle' },
  { key: 'brand_story.title',     label: 'Judul Brand Story',   type: 'text',     maxLength: 60 },
  { key: 'brand_story.content',   label: 'Konten Brand Story',  type: 'richtext' },
  { key: 'brand_story.image_url', label: 'Foto Brand Story',    type: 'image' },

  // REVIEWS
  { key: 'reviews.visible',       label: 'Tampilkan Ulasan',    type: 'toggle' },
  { key: 'reviews.title',         label: 'Judul Seksi Ulasan',  type: 'text',     maxLength: 50 },

  // LOCATION
  { key: 'location.visible',      label: 'Tampilkan Lokasi',    type: 'toggle' },
  { key: 'location.map_url',      label: 'URL Google Maps',     type: 'link' },
  { key: 'location.address_text', label: 'Teks Alamat',         type: 'textarea', maxLength: 200 },

  // FOOTER
  { key: 'footer.visible',        label: 'Tampilkan Footer',    type: 'toggle' },
  { key: 'footer.tagline',        label: 'Tagline Footer',      type: 'text',     maxLength: 100 },
]
```

Pattern yang sama untuk semua template: `butik`, `glow`, `luxe`, `herba`.

---

### Audit 5 Template

Untuk setiap template, cek:
- Apakah semua section ada di komponen?
- Apakah template membaca data dari `customizations` jika ada, atau fallback ke default?
- Apakah `data-editable="hero.title"` (atau attr serupa) sudah ada di elemen yang bisa diedit?
- Apakah template menampilkan `reviews.visible`, `promo.visible`, dll dengan benar?

---

---

# PHASE 5 — Setup Wizard

**Tujuan:** Guided setup 8-step untuk seller baru. Hanya tampil jika `setup_wizard = true`.

**Estimasi:** 2 hari kerja
**Dependency:** Phase 4A (feature flags) + Phase 4B (template contract) selesai
**Route:** `/dashboard/setup`

---

### 8 Step Wizard

| # | Step | Field Utama | Tabel |
|---|---|---|---|
| 1 | Informasi Dasar | nama_toko, slug, deskripsi, no_wa, logo_url | `stores` |
| 2 | Pilih Template | template, warna_tema, font_heading, font_body | `stores` |
| 3 | Tampilan Utama | hero.title, hero.subtitle, hero.image_url, promo.* | `template_customizations` |
| 4 | Ulasan & Brand | brand_story.*, galeri foto, testimoni | `store_testimonials`, `store_brand_contents` |
| 5 | Kontak, Sosmed & Lokasi | location.*, social links, jam buka | `store_social_links`, `template_customizations` |
| 6 | Promo | promo aktif, diskon, badge | `store_promos` |
| 7 | Checkout, Ongkir & QRIS | QRIS upload, setting ongkir (jika flag aktif), alamat | `payment_methods`, `store_addresses` |
| 8 | Preview & Publish | preview template, validasi checklist, tombol publish | `stores.is_published` |

---

### Tabel Baru yang Perlu Dibuat

```sql
CREATE TABLE store_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  content TEXT,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  urutan INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE store_promos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  badge_text TEXT,
  image_url TEXT,
  discount_type TEXT,   -- 'percent' | 'fixed'
  discount_value INTEGER,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE store_brand_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  type TEXT NOT NULL,   -- 'story' | 'gallery' | 'certificate' | 'video'
  title TEXT,
  content TEXT,
  media_url TEXT,
  urutan INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE store_social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,  -- 'instagram' | 'tiktok' | 'shopee' | 'tokopedia' | 'whatsapp' | 'website'
  url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  urutan INTEGER DEFAULT 0
);
```

---

### Validasi Sebelum Publish (Step 8)

```
✓ nama_toko terisi (min 3 karakter)
✓ slug valid (hanya huruf kecil, angka, tanda hubung)
✓ no_wa valid (diawali 08 atau +62)
✓ minimal 1 produk aktif
✓ QRIS tersimpan (jika qris_checkout = true)
✓ alamat tersimpan (jika auto_shipping = true)
✓ berat_gram > 0 di semua produk aktif (jika auto_shipping = true)
```

---

### UX Wizard

- Progress bar di atas (step 1 dari 8)
- Setiap step auto-save sebagai draft
- Tombol "Lanjut" dan "Kembali" di setiap step
- Draft tidak expire — seller bisa tutup dan lanjut besok
- Step 8 menampilkan preview live template sebelum publish
- Jika publish gagal validasi, tampilkan checklist mana yang belum terpenuhi

---

---

# PHASE 6 — Visual Editor V2

**Tujuan:** Perbaiki editor visual agar tidak kacau. Preview tidak boleh kena dashboard layout. Inline edit terasa nyata.

**Estimasi:** 2–3 hari kerja
**Dependency:** Phase 4B (template contract) selesai
**Hanya tampil jika:** `visual_editor = true`

---

### Yang Boleh di Phase Ini

- Klik teks untuk edit inline
- Klik gambar untuk ganti gambar
- Klik warna untuk color picker
- Klik background untuk gradient editor
- Toggle show/hide per section

### Yang Tidak Boleh (Scope Limitation)

- Drag-and-drop bebas
- Resize elemen
- Reorder section
- Raw custom CSS dari user

---

### Arsitektur Baru

**Preview route yang terisolasi:**

```
/editor-preview/[storeId]   ← Hanya template, tanpa dashboard layout
```

Route ini server-side render template dengan data terkini, tanpa sidebar, tanpa topbar. Diakses dari dalam iframe di editor studio.

**Editor studio layout:**

```
┌─────────────────────────────────────────────────────┐
│  [TOPBAR] Nama Toko | Status | Save Draft | Publish  │
├──────────────┬──────────────────────┬───────────────┤
│ LEFT PANEL   │   CENTER CANVAS      │ RIGHT PANEL   │
│ Sections     │   (Iframe Preview)   │ Inspector     │
│ ─────────    │                      │ ─────────     │
│ ○ Hero       │   ┌──────────────┐   │ Selected:     │
│ ○ Promo      │   │  Template    │   │ hero.title    │
│ ○ Reviews    │   │  Preview     │   │               │
│ ○ Brand      │   │  (live)      │   │ [Input field] │
│ ○ Location   │   │              │   │               │
│ ○ Footer     │   └──────────────┘   │ [Save]        │
└──────────────┴──────────────────────┴───────────────┘
```

---

### Task Breakdown

**Task 6.1 — Isolated Preview Route**
- Buat `app/editor-preview/[storeId]/page.tsx`
- Server component, fetch store + products + customizations
- Render template tanpa layout dashboard
- Terima postMessage dari parent untuk update preview real-time

**Task 6.2 — Editor Studio Layout**
- Buat `app/dashboard/editor/page.tsx` (jika belum ada, atau redesign yang ada)
- Topbar: nama toko, status badge, tombol Save Draft, tombol Publish
- Left panel: list section dengan toggle visibility
- Center: iframe ke `/editor-preview/[storeId]`
- Right panel: field inspector untuk elemen yang dipilih

**Task 6.3 — Selection Overlay**
- Ketika user hover di iframe → highlight elemen dengan outline biru
- Klik elemen → right panel menampilkan field yang relevan
- Koordinat hover dikirim via postMessage dari preview ke editor

**Task 6.4 — Inline Text Edit**
- Double click teks di preview → floating input muncul di atas elemen
- Enter = commit perubahan ke `formData`
- Escape = batal
- `formData` di-postMessage ke preview → preview re-render

**Task 6.5 — Image Replace**
- Klik gambar → floating image panel muncul
- Upload gambar baru → preview langsung ganti
- Gambar disimpan ke Supabase Storage saat save/commit

**Task 6.6 — Color & Gradient Picker**
- Klik elemen dengan type `color` → color picker hex input
- Klik elemen dengan type `gradient` → gradient editor (from color, to color, direction)
- Gradient disimpan sebagai JSON: `{ from: "#hex", to: "#hex", direction: "to right" }`

**Task 6.7 — Section Visibility**
- Toggle di left panel atau klik section header
- Update `hero.visible`, `promo.visible`, dll di `formData`
- Preview auto-update

**Task 6.8 — Save & Publish**
- Save Draft: upsert ke `template_customizations`, tidak mengubah live storefront
- Publish: mark draft sebagai live, storefront langsung ikut data terbaru
- Undo/Redo: stack history `formData` (50 langkah, sudah ada dari V1)

---

---

# PHASE 7 — Dashboard Seller Redesign

**Tujuan:** Dashboard seller jadi command center toko yang berguna, bukan halaman statistik kosong.

**Estimasi:** 1 hari kerja
**Dependency:** Phase 4A selesai (feature flags sudah berjalan)

---

### Menu Sidebar Final

```
Dashboard
Setup Website         ← hanya tampil jika setup_wizard = true
Edit Template         ← hanya tampil jika visual_editor = true
──────────────
Produk
Pesanan
Pelanggan
Promo
Ulasan
Konten Brand
──────────────
Analitik
──────────────
Alamat & Ongkir
Metode Pembayaran
Pengaturan Toko
```

---

### Dashboard Home (Halaman Utama Seller)

**Store Health Checklist** — di atas, merah jika ada yang kurang:

```
✓ Email sudah diverifikasi
✓ Alamat toko lengkap
✓ Minimal 1 produk aktif
✓ QRIS sudah diupload (jika qris_checkout = true)
✓ Ongkir sudah diatur (jika auto_shipping = true)
✓ Toko sudah dipublish
```

**Ringkasan Hari Ini:**
- Order masuk hari ini: N
- Produk terlaris: (nama produk)
- Pengunjung hari ini: N (jika analytics tersedia)

**Quick Actions:**
- Tambah Produk
- Lihat Toko (buka tab baru ke `/[slug]`)
- Salin Link Toko

**Aktivitas Terbaru:**
- 5 order terakhir dengan status dan waktu

**Tips Optimasi Toko** (statis, contextual):
- Jika belum ada foto hero: "Tambah foto hero untuk menarik lebih banyak pembeli"
- Jika produk < 5: "Seller dengan 10+ produk mendapat 3x lebih banyak pengunjung"
- Jika toko belum publish: "Toko belum live — publish sekarang!"

---

---

# PHASE 8 — Admin Dashboard Advanced

**Tujuan:** Dashboard admin bukan cuma feature flags, tapi pusat kontrol platform.

**Estimasi:** 1 hari kerja
**Dependency:** Phase 4A selesai

---

### Menu Admin Final

```
Overview
──────────────
Users / Sellers
Stores
Orders Monitor
Products Monitor
──────────────
Templates
Feature Flags
API & Integrations
──────────────
Shipping Logs
Payment Proofs
Abuse & Rate Limits
──────────────
Error Logs
Audit Logs
System Settings
Maintenance Mode
```

---

### Fitur per Menu

| Menu | Fitur |
|---|---|
| **Overview** | Total seller, toko aktif, order hari ini, error rate |
| **Users/Sellers** | List semua seller, filter by status, suspend/unsuspend akun |
| **Stores** | List semua toko, filter by template/status, suspend per toko, maintenance per toko |
| **Orders Monitor** | Order masuk semua toko, filter by status/tanggal, lihat detail |
| **Feature Flags** | Toggle global + per toko, history perubahan |
| **Error Logs** | Error checkout, error shipping, filter by toko/sumber |
| **Audit Logs** | Semua aksi admin: siapa, kapan, apa |
| **Maintenance Mode** | Toggle global maintenance, atau per toko |

---

### Aturan Ketat Admin

- Semua aksi CRUD dari admin wajib insert ke `admin_logs`
- Suspend user: catat alasan, catat siapa yang suspend
- Login-as-user: **tidak diimplementasikan di fase ini** (terlalu berisiko tanpa audit trail yang matang)
- Jangan expose data sensitif (no_wa, alamat lengkap pembeli) kecuali yang benar-benar butuh

---

---

# PHASE 1C — Rate Limit Auth

**Status:** Ditunda — kerjakan setelah semua core fitur stabil.

**Estimasi:** 4 jam

---

### Scope

| Endpoint | Limit |
|---|---|
| `POST /auth/register` | Max 3 akun per IP per 24 jam |
| `POST /auth/login` (gagal) | Max 5 kali gagal per 15 menit |
| `POST /auth/resend-verification` | Max 3 kali per 10 menit |

---

### Implementasi

- Server-side rate limit di API route (bukan client)
- Simpan hit count ke tabel `auth_rate_limit_logs` dengan TTL
- Jika limit tercapai: return 429 dengan pesan yang jelas
- Log ke `admin_logs` jika ada pattern abuse (banyak IP berbeda, banyak gagal)
- Device cookie ringan sebagai secondary check (bukan primary)
- Jangan simpan data sensitif berlebihan di log

---

---

## CATATAN PENTING

1. **Jangan hapus kode API.co.id** — matikan via feature flag `auto_shipping` dan `formal_region_address`
2. **Jangan hapus fitur alamat resmi** — fallback ke alamat teks bebas jika flag mati
3. **Jangan lanjut Setup Wizard sebelum** admin feature flags dan final schema jelas
4. **Jangan lanjut Visual Editor V2 sebelum** template content contract selesai
5. **Jangan reset database sebelum** `final_schema.sql` direview manual
6. **Backup dulu** sebelum reset — jangan sentuh `auth.users` dan `storage` kecuali memang full reset
7. **Setiap task wajib update:** CHANGELOG.md, discussion.md, TECHNICAL_DOCUMENTATION.md, IMPLEMENTATION_ROADMAP.md
8. **Build harus sukses** setelah setiap task — jika gagal, berhenti dan laporkan error lengkap

---

## FEATURE FLAGS DEFAULT

```
auto_shipping          = false   ← API.co.id sedang error
formal_region_address  = false   ← API.co.id sedang error
setup_wizard           = false   ← Belum selesai dibangun
visual_editor          = false   ← Belum selesai dibangun
qris_checkout          = true    ← Sudah stabil
product_gallery        = true    ← Sudah stabil
turnstile_captcha      = true    ← Sudah dibuat, build sukses
email_verification     = true    ← Sudah dibuat, build sukses
maintenance_mode       = false   ← Default OFF
```
