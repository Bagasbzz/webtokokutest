# DATABASE RESET PLAN — Webtokoku
*Created: 11 Mei 2026 | Phase DB-1*

---

## 1. AUDIT SUMMARY

### File SQL yang Dianalisis (12 files)

| File | Path | Keterangan |
|------|------|------------|
| `schema.sql` | Root | Base schema: sellers, stores, products |
| `step_11_catalog_orders.sql` | Root | Orders, order_items, payment_methods, product_categories |
| `step_16_visual_editor.sql` | Root | template_customizations (flat key-value) |
| `step_17_revisions.sql` | Root | template_revisions |
| `step_18_draft_state.sql` | Root | Add is_draft column ke template_customizations |
| `migration_phase_1.sql` | Root | Consolidated: template_customizations + revisions (duplikat) |
| `phase_4a_admin_feature_flags.sql` | Root | **Final & Active** — Feature flags, admin_logs |
| `step12_rajaongkir.sql` | migrations/ | store_addresses, shipping_settings, ro_locations |
| `step13_template_customizations.sql` | migrations/ | **KONFLIK** — Struktur berbeda (JSONB content) |
| `step20_formal_regions.sql` | migrations/ | Add region columns ke store_addresses |
| `step21_product_gallery_stok.sql` | migrations/ | product_images, stok, berat_gram |
| `step30_admin_feature_flags.sql` | migrations/ | **Duplikat** — Feature flags (sama dengan phase_4a) |

---

## 2. KONFLIK & DUPLIKAT

### 🔴 Konflik 1: `template_customizations`

**Ada 3 versi berbeda:**

| Versi | Struktur | Lokasi | Status |
|-------|----------|--------|--------|
| A | `section_key`, `element_key`, `value` (TEXT) | step_16, migration_phase_1 | **Dipakai kode** |
| B | `template_id`, `section_id`, `content` (JSONB) | step13 | Tidak dipakai |
| C | + `is_draft` column | step_18 | **Final** |

**Keputusan:** Gunakan struktur A + C (flat key-value dengan is_draft).
Hapus/abaikan step13.

### 🔴 Konflik 2: `feature_flags`

| Versi | Lokasi | Status |
|-------|--------|--------|
| phase_4a_admin_feature_flags.sql | Root | **Final & Aktif** |
| step30_admin_feature_flags.sql | migrations/ | Duplikat |

**Keputusan:** Gunakan phase_4a (sudah dibuat Phase 4A).

### 🟡 Duplikat 3: `template_revisions`

Ada di step_17 dan migration_phase_1 — struktur sama, tidak masalah.

---

## 3. TABEL FINAL YANG DIGUNAKAN

### Core Tables
| # | Tabel | Fungsi | Dependencies |
|---|-------|--------|--------------|
| 1 | `sellers` | Profil user | auth.users |
| 2 | `stores` | Data toko | sellers |
| 3 | `products` | Katalog produk | stores |
| 4 | `product_images` | Galeri foto | products |
| 5 | `product_categories` | Kategori produk | stores |

### Orders & Commerce
| # | Tabel | Fungsi | Dependencies |
|---|-------|--------|--------------|
| 6 | `orders` | Pesanan | stores |
| 7 | `order_items` | Detail item | orders, products |
| 8 | `customers` | Data pelanggan | stores |
| 9 | `payment_methods` | Metode bayar | stores |
| 10 | `checkout_settings` | Setting checkout | stores |

### Shipping
| # | Tabel | Fungsi | Dependencies |
|---|-------|--------|--------------|
| 11 | `store_addresses` | Alamat toko | stores |
| 12 | `shipping_settings` | Setting pengiriman | stores |
| 13 | `ro_locations` | Cache RajaOngkir | - |

### Template & Builder
| # | Tabel | Fungsi | Dependencies |
|---|-------|--------|--------------|
| 14 | `template_customizations` | Custom visual | stores |
| 15 | `template_revisions` | Riwayat revisi | stores |

### Platform Admin
| # | Tabel | Fungsi | Dependencies |
|---|-------|--------|--------------|
| 16 | `feature_flags` | Fitur global | - |
| 17 | `store_feature_flags` | Override per toko | stores, feature_flags |
| 18 | `admin_logs` | Audit trail | auth.users atau sellers |
| 19 | `platform_settings` | Settings global | - |

### Future Tables (Phase 5+)
| # | Tabel | Fungsi | Phase |
|---|-------|--------|-------|
| 20 | `store_testimonials` | Ulasan pelanggan | 5 |
| 21 | `store_promos` | Promo/diskon | 5 |
| 22 | `store_brand_contents` | Konten brand | 5 |
| 23 | `store_social_links` | Link sosmed | 5 |
| 24 | `error_logs` | Error tracking | 8 |
| 25 | `shipping_logs` | Log pengiriman | 8 |

---

## 4. TABEL LEGACY (Tidak Digunakan)

| Tabel | Alasan |
|-------|--------|
| step13 version of `template_customizations` | Struktur JSONB tidak dipakai kode |
| `step30` duplikat | Sama dengan phase_4a |

---

## 5. RENCANA RESET DATABASE

### ⚠️ Peringatan Penting

**JANGAN SENTUH:**
- `auth.users` — Akun user akan hilang
- `storage.objects` — File upload akan hilang
- `storage.buckets` — Config storage akan hilang

**BACKUP DULU:**
Export CSV dari Supabase Dashboard untuk data penting:
- sellers (tanpa role admin, nanti set manual)
- stores
- products
- orders

---

### Urutan DROP Tabel (Sesuai Foreign Key)

```sql
-- 1. Tabel dengan FK ke tabel lain (child first)
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS checkout_settings CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;
DROP TABLE IF EXISTS store_addresses CASCADE;
DROP TABLE IF EXISTS shipping_settings CASCADE;
DROP TABLE IF EXISTS ro_locations CASCADE;
DROP TABLE IF EXISTS template_customizations CASCADE;
DROP TABLE IF EXISTS template_revisions CASCADE;
DROP TABLE IF EXISTS store_feature_flags CASCADE;
DROP TABLE IF EXISTS admin_logs CASCADE;

-- 2. Tabel utama (parent)
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS sellers CASCADE;

-- 3. Tabel global
DROP TABLE IF EXISTS platform_settings CASCADE;
DROP TABLE IF EXISTS feature_flags CASCADE;
```

---

### Urutan CREATE Tabel (Final Schema)

Lihat file: `supabase/final_schema.sql` (akan dibuat setelah ini)

Urutan:
1. sellers
2. stores
3. products
4. product_images
5. product_categories
6. orders
7. order_items
8. customers
9. payment_methods
10. checkout_settings
11. store_addresses
12. shipping_settings
13. ro_locations
14. template_customizations
15. template_revisions
16. feature_flags
17. store_feature_flags
18. admin_logs
19. platform_settings

---

### Data Seed Awal

```sql
-- Feature flags default
INSERT INTO feature_flags (key, name, description, enabled_globally) VALUES
  ('auto_shipping', 'Ongkir Otomatis', 'Kalkulasi ongkir via API.co.id. Matikan jika API error.', false),
  ('formal_region_address', 'Alamat Formal (API)', 'Form alamat via dropdown API.co.id.', false),
  ('setup_wizard', 'Setup Wizard', 'Guided wizard 8-step.', false),
  ('visual_editor', 'Visual Editor', 'Click-to-edit template.', false),
  ('qris_checkout', 'Checkout QRIS', 'Pembayaran QRIS.', true),
  ('product_gallery', 'Galeri Produk', 'Multiple foto per produk.', true),
  ('turnstile_captcha', 'Cloudflare Turnstile', 'CAPTCHA di register.', true),
  ('email_verification', 'Verifikasi Email', 'Wajib verifikasi email.', true),
  ('maintenance_mode', 'Maintenance Mode', 'Platform maintenance.', false);

-- Set admin pertama (ganti email)
-- UPDATE sellers SET role = 'admin' WHERE email = 'your@email.com';
```

---

## 6. RISIKO RESET

| Risiko | Mitigasi |
|--------|----------|
| Data sellers hilang | Backup CSV, restore setelah reset |
| Data stores hilang | Backup CSV |
| Data products hilang | Backup CSV |
| Data orders hilang | Backup CSV |
| auth.users ikut terhapus | **JANGAN DROP auth schema** |
| storage.objects ikut terhapus | **JANGAN DROP storage schema** |
| File product-images hilang | Jangan hapus storage bucket |

---

## 7. CHECKLIST EXECUTION (DB-2)

- [ ] Backup data penting ke CSV
- [ ] Jalankan SQL DROP (hanya tabel public)
- [ ] Jalankan `final_schema.sql`
- [ ] Jalankan seed data
- [ ] Set admin role manual
- [ ] Test register
- [ ] Test onboarding
- [ ] Test tambah produk
- [ ] Test product drawer
- [ ] Test cart
- [ ] Test checkout
- [ ] Test admin feature flags

---

## 8. Catatan Schema Terbaru - 2026-05-28

Bagian ini menggabungkan isi lama dari `SCHEMA_RECOMMENDATION.md` supaya rekomendasi database tidak tersebar di root repo.

### `template_customizations`

Struktur yang dipakai kode aktif adalah flat key-value:

- `store_id`
- `section_key`
- `element_key`
- `value`
- `is_draft`

Jika constraint lama `UNIQUE(store_id, section_key, element_key)` masih ada, hapus karena akan bentrok dengan mode draft dan published.

```sql
ALTER TABLE template_customizations
  DROP CONSTRAINT IF EXISTS template_customizations_store_id_section_key_element_key_key;
```

Primary key final yang diharapkan:

```sql
ALTER TABLE template_customizations
  DROP CONSTRAINT IF EXISTS template_customizations_pkey;

ALTER TABLE template_customizations
  ADD PRIMARY KEY (store_id, section_key, element_key, is_draft);
```

### `template_revisions`

Schema `template_revisions` sudah cocok dengan kode aktif. Kolom `snapshot` tetap `JSONB`.

### `orders`

API aktif memakai:

- `bukti_url`
- `bukti_uploaded_at`

Kalau database lama masih memakai `proof_image_url`, samakan dengan API:

```sql
ALTER TABLE orders
  RENAME COLUMN proof_image_url TO bukti_url;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS bukti_uploaded_at TIMESTAMPTZ;
```

### `payment_methods`

QRIS dan transfer sebaiknya tetap di tabel `payment_methods`, bukan ditambah lagi ke `stores`. Frontend publik sebaiknya membaca metode aktif dari `payment_methods`.

### `stores` Plan System

Sistem Free/Pro terbaru memakai migration:

```text
supabase/migrations/step32_store_plan.sql
```

Field yang ditambahkan:

- `plan`
- `plan_expires_at`
- `pro_started_at`
- `pro_notes`

---

*Dokumen ini sudah digabung dengan rekomendasi schema lama pada 2026-05-28.*
