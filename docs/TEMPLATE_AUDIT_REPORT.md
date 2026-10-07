# 📋 TEMPLATE AUDIT REPORT

> Terakhir diperbarui: **2026-05-20** oleh Antigravity (Claude Sonnet)

---

## Hasil Audit Konsistensi Template — 2026-05-20

### 1. Navbar — Link ke `/produk`

Semua 5 template harus memiliki link navigasi yang mengarah ke halaman produk lengkap `/{slug}/produk`.

| Template | File | Nav Link Produk | Status |
|---|---|---|---|
| Butik Hana | `ButikTemplate.tsx` | `<a href={/${store.slug}/produk}>Produk</a>` | ✅ Ada |
| Dapur Nusantara | `DapurTemplate.tsx` | `<a href={/${store.slug}/produk}>Produk</a>` | ✅ Ada |
| Glow Lab | `GlowTemplate.tsx` | `<a href={/${store.slug}/produk}>Produk</a>` | ✅ Ada |
| Luna Beauty | `LuxeTemplate.tsx` | `<a href={/${store.slug}/produk}>Produk</a>` | ✅ Ada |
| Bazzhealth | `HerbaTemplate.tsx` | `<a href={/${store.slug}/produk}>Produk</a>` | ✅ Ada |

---

### 2. Catalog Component — Tombol "Lihat Semua Produk"

Setiap catalog component harus menampilkan tombol "Lihat semua produk" yang mengarah ke `/{slug}/produk` secara kondisional **hanya ketika** jumlah produk total melebihi batas tampilan homepage (6 produk).

| Template | Catalog Component | Kondisi Show | Link Tujuan | Status |
|---|---|---|---|---|
| Butik Hana | `ButikCatalog.tsx` | `products.length > homepageProducts.length` | `/${storeSlug}/produk` | ✅ Benar |
| Dapur Nusantara | `DapurCatalog.tsx` | `products.length > homepageProducts.length` | `/${storeSlug}/produk` | ✅ Benar |
| Glow Lab | `GlowCatalog.tsx` | `safeProducts.length > visibleProducts.length` | `/${storeSlug}/produk` | ✅ Benar |
| Luna Beauty | `LuxeCatalog.tsx` | `products.length > homepageProducts.length` | `/${storeSlug}/produk` | ✅ Benar |
| Bazzhealth | `BazzCatalog.tsx` | `safeProducts.length > visibleProducts.length` | `/${storeSlug}/produk` | ✅ Benar |

---

### 3. Footer — Link Internal

Footer setiap template harus memiliki link yang berguna, termasuk link ke halaman produk lengkap.

| Template | Footer Link Produk | Status |
|---|---|---|
| Butik Hana | `/${store.slug}/produk` → "Lihat semua produk" | ✅ Fixed (2026-05-20) |
| Dapur Nusantara | `#menu` (anchor internal) | ✅ Sesuai konteks kuliner |
| Glow Lab | Tidak ada footer link produk (footer minimalitss) | ✅ Diterima — footer glow sangat minimalis |
| Luna Beauty | `#collections` (anchor internal) | ✅ Sesuai konteks kosmetik |
| Bazzhealth | `#catalog` (anchor internal) | ✅ Sesuai konteks kesehatan |

> **Catatan:** Template Dapur, Glow, Luxe, dan Herba memilih anchor internal sebagai link utama footer — ini diterima karena sesuai gaya tampilan masing-masing. Paling penting adalah **navbar** dan **catalog component** sudah mengarah ke `/produk` dengan benar.

---

### 4. Preview Images — Landing Page

Landing page (`app/page.tsx`) menampilkan kartu template di section "Template Showcase". Semua gambar preview sudah menggunakan file dari `public/template-previews/`:

| Template | Desktop Preview | Mobile Preview | File Tersedia |
|---|---|---|---|
| Butik Hana | `/template-previews/butik-desktop.jpg` | `/template-previews/butik-mobile.jpg` | ✅ Ada (520KB) |
| Dapur Nusantara | `/template-previews/dapur-desktop.jpg` | `/template-previews/dapur-mobile.jpg` | ✅ Ada (580KB) |
| Glow Lab | `/template-previews/glow-desktop.jpg` | `/template-previews/glow-mobile.jpg` | ✅ Ada (81KB) |
| Luna Beauty | `/template-previews/luxe-desktop.jpg` | `/template-previews/luxe-mobile.jpg` | ✅ Ada (343KB) |
| Bazzhealth | `/template-previews/herba-desktop.jpg` | `/template-previews/herba-mobile.jpg` | ✅ Ada (359KB) |

> **Catatan:** File `glow-desktop.jpg` ukurannya jauh lebih kecil (81KB) dibanding template lain (>300KB). Ini bisa disebabkan oleh screenshot yang berbeda kualitas. Pertimbangkan untuk regenerasi screenshot jika tampilannya terlalu low-res.

---

### 5. Preview Images — Onboarding

Onboarding wizard step 2 (`app/onboarding/OnboardingClient.tsx`) menampilkan kartu template menggunakan `TEMPLATES` dari `lib/templates.ts`. Field `preview_image` masing-masing template sudah mengarah ke file yang benar:

| Template | preview_image di templates.ts | Status |
|---|---|---|
| Butik Hana | `/template-previews/butik.jpg` | ✅ File ada (520KB, sama dengan desktop) |
| Dapur Nusantara | `/template-previews/dapur.jpg` | ✅ File ada (580KB) |
| Glow Lab | `/template-previews/glow.jpg` | ✅ File ada (514KB) |
| Luna Beauty | `/template-previews/luxe.jpg` | ✅ File ada (343KB) |
| Bazzhealth | `/template-previews/herba.jpg` | ✅ File ada (359KB) |

---

### 6. Konsistensi Skema Database — `product_categories`

| Item | Status |
|---|---|
| `supabase/2_CREATE_ALL.sql` — kolom `name` | ✅ Fixed (2026-05-20) |
| `supabase/migrations/step24_product_options_categories.sql` — INSERT `name` | ✅ Konsisten |
| `lib/product.ts` — query `name` | ✅ Konsisten |
| `app/api/stores/onboarding/route.ts` — insert `name` | ✅ Konsisten |
| **Database yang sudah ada** | ⚠️ Perlu SQL manual: `ALTER TABLE public.product_categories RENAME COLUMN nama TO name;` |

---

## Riwayat Audit

| Tanggal | Oleh | Ringkasan |
|---|---|---|
| 2026-05-20 | Antigravity Claude Sonnet | Audit lengkap konsistensi template, fix footer Butik, fix skema kategori, buat Quick Setup admin |
| 2026-05-19 | Codex | Tambah nav Produk ke semua template, tambah "Lihat semua" di catalog components |
| 2026-05-18 | Codex | Template rombak total: Glow editorial, Bazzhealth klinis, katalog limit 6 |
| 2026-05-07 | Antigravity Claude | Step 8 restorasi 5 template React sesuai desain orisinal HTML statis |
