# Research Setup — Baseline `baseline-v1`

Dokumen ini menjelaskan cara menyiapkan **lingkungan penelitian** (Vercel + Supabase baru)
untuk kondisi *baseline* (sebelum perbaikan kontrol akses).

> **Aturan baseline:** jangan ubah RLS, server action, API route, middleware, checkout,
> moderasi, onboarding, atau logika plan pada branch `research-baseline`.
> Jangan hubungkan ke Supabase production dan jangan gunakan data pengguna asli.

---

## 1. Environment variable

Lihat [`.env.example`](../.env.example). Isi di Vercel → *Settings → Environment Variables*
(atau `.env.local` untuk lokal). Semua nilai **hanya** dari project Supabase penelitian.

| Variabel | Scope | Wajib | Keterangan |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | browser | ya | URL project Supabase penelitian |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser | ya | anon key project penelitian |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | browser | ya* | dipakai di register |
| `NEXT_PUBLIC_WEBTOKOKU_ADMIN_WA` | browser | tidak | jika kosong memakai fallback di `lib/plan.ts` |
| `NEXT_PUBLIC_PRIMARY_DOMAIN` | browser | lihat §2 | default kode: `webtokoku.id` |
| `NEXT_PUBLIC_STOREFRONT_DOMAIN` | browser | tidak | fallback dari PRIMARY_DOMAIN |
| `NEXT_PUBLIC_LEGACY_VERCEL_DOMAIN` | browser | lihat §2 | default kode: `webtokoku.vercel.app` |
| `SUPABASE_SERVICE_ROLE_KEY` | **server-only** | ya | bypass RLS — jangan pernah diberi prefix `NEXT_PUBLIC_` |
| `TURNSTILE_SECRET_KEY` | server-only | ya* | verifikasi Turnstile |
| `TURNSTILE_DEV_BYPASS` | server-only | tidak | hanya berlaku saat `NODE_ENV !== 'production'` |
| `RAJAONGKIR_API_KEY` / `KOMERCE_SHIPPING_COST_API_KEY` | server-only | tidak | ongkir otomatis (flag `auto_shipping`) |
| `RAJAONGKIR_BASE_URL`, `RAJAONGKIR_DAILY_LIMIT` | server-only | tidak | ada default di kode |
| `APICOID_API_KEY` | server-only | tidak | alamat formal (flag `formal_region_address`) |
| `VINCOSME_DEMO_PASSWORD`, `CHIRISOL_DEMO_PASSWORD`, `ACTIVE_CLIENT_DEMO_PASSWORD` | script lokal | tidak | hanya `scripts/seed-*.mjs` |

\* Untuk Turnstile dapat memakai *test keys* resmi Cloudflare pada lingkungan penelitian.

Semua variabel dibaca dengan pola `process.env.X || default`, sehingga nilai kosong = memakai default kode.

## 2. Domain (penting untuk Vercel penelitian)

Perilaku di `lib/domains.ts` dan `middleware.ts` (tidak diubah):

- Semua host `*.vercel.app` dianggap *platform host*.
- Redirect ke `PRIMARY_DOMAIN` **hanya** terjadi jika host **sama persis** dengan
  `LEGACY_VERCEL_DOMAIN` (default `webtokoku.vercel.app`).
- Link storefront dibangun sebagai `https://{slug}.{PRIMARY_DOMAIN}` (default → domain production).

Rekomendasi untuk `webtokokutest.vercel.app` (konfigurasi env saja, tanpa ubah kode):

- `NEXT_PUBLIC_PRIMARY_DOMAIN` = domain penelitian (mis. `webtokokutest.vercel.app`) agar link
  tidak mengarah ke domain production. Catatan: subdomain `{slug}.webtokokutest.vercel.app`
  tidak tersedia di Vercel, sehingga storefront diakses path-based: `https://webtokokutest.vercel.app/{slug}`.
- **Jangan** set `NEXT_PUBLIC_LEGACY_VERCEL_DOMAIN` sama dengan host penelitian (akan memicu redirect).
  Biarkan kosong (default `webtokoku.vercel.app`, bukan host penelitian).
- Catat nilai env yang dipakai dalam log penelitian agar kondisi sebelum/sesudah dapat direplikasi.

## 3. Urutan migrasi Supabase (project baru, kosong)

> **Cara cepat:** jalankan satu file [`supabase/research/RESEARCH_ALL_IN_ONE.sql`](../supabase/research/RESEARCH_ALL_IN_ONE.sql)
> di SQL Editor. File ini hasil generate: isi file asli di tabel bawah disalin apa adanya sesuai urutan,
> dibungkus satu transaksi (`BEGIN`/`COMMIT`) — jika ada error, seluruhnya di-rollback.
> Header file memuat hash SHA-256 tiap file sumber untuk verifikasi.

> Jangan jalankan `supabase/1_RESET_ONLY.sql` (destruktif; tidak dibutuhkan pada DB baru).
> File `schema.sql`, `final_schema.sql`, `step_11_*.sql`, `step_16/17/18_*.sql`,
> `phase_4a_admin_feature_flags.sql` adalah skema lama/alternatif — sudah tercakup di `2_CREATE_ALL.sql`.

| # | File | Isi utama |
|---|---|---|
| 1 | `supabase/2_CREATE_ALL.sql` | 19 tabel dasar, trigger shipping, 30 policy, seed `feature_flags` & `platform_settings` |
| 2 | `supabase/phase_5_setup_wizard.sql` | `store_testimonials`, `store_promos`, `store_brand_contents`, `store_social_links` (dipakai `/api/stores/[slug]`) |
| 3 | `migrations/step12_rajaongkir.sql` | ⚠️ lihat konflik K1 |
| 4 | `migrations/step20_formal_regions.sql` | kolom alamat formal |
| 5 | `migrations/step21_product_gallery_stok.sql` | ⚠️ lihat konflik K1 |
| 6 | `migrations/step22_custom_domains.sql` | `stores.custom_domain` |
| 7 | `migrations/step23_rajaongkir_komerce_usage.sql` | `shipping_api_usage_logs` |
| 8 | `migrations/step24_product_options_categories.sql` | opsi/varian produk, kategori |
| 9 | `migrations/step25_homepage_product_controls.sql` | kontrol produk beranda |
| 10 | `migrations/step26_fix_product_categories_constraints.sql` | constraint kategori |
| 11 | `migrations/step27_analytics_notifications.sql` | `page_views`, `notifications` |
| 12 | `migrations/step28_fix_orders_policies.sql` | policy orders/order_items |
| 13 | `migrations/step29_atomic_stock_decrement.sql` | RPC stok |
| 14 | `migrations/step31_store_traffic_table.sql` | `store_traffic` (step30 tidak ada) |
| 15 | `migrations/step32_store_plan.sql` | `stores.plan` |
| 16 | `migrations/step33_store_business_category.sql` | kategori bisnis |
| 17 | `migrations/step34_order_payment_proof_path.sql` | path bukti bayar |
| 18 | `migrations/step35_option_stock_rpc.sql` | RPC stok varian |
| 19 | `migrations/step36_security_batch1_rls_admin_hardening.sql` | `platform_admins`, `is_platform_admin` |
| 20 | `migrations/step37_security_batch5_moderation.sql` | moderasi |
| 21 | `migrations/step38_security_batch5_1_moderation_gap_fixes.sql` | trigger field moderasi |
| 22 | `migrations/step39_security_batch5_2_moderation_insert_lock.sql` | trigger insert moderasi |
| 23 | `migrations/step40_dashboard_analytics_aggregation.sql` | RPC `get_store_dashboard_analytics` |

### Potensi konflik (belum diperbaiki — baseline)

- **K1 — policy duplikat tanpa `DROP POLICY IF EXISTS`:**
  `step12` membuat ulang `store_addresses_owner`, `shipping_settings_owner`;
  `step21` membuat ulang `product_images_owner`, `product_images_public` — semuanya sudah dibuat
  oleh `2_CREATE_ALL.sql`. Di SQL Editor Supabase error ini membatalkan seluruh skrip.
  Isi lain kedua file (tabel, kolom, trigger) sudah ada di `2_CREATE_ALL.sql`
  (kecuali policy `ro_locations_service_only`, yang setara dengan `ro_locations_service`).
  Keputusan menjalankan/melewati keduanya harus dicatat di log penelitian.
- **K2 — seed kredensial:** `2_CREATE_ALL.sql` berisi `INSERT` ke `platform_settings`
  (`admin_credentials`). Tidak dibaca oleh kode aplikasi. Lihat catatan keamanan repository.
- **K3 — bootstrap admin:** `step36` mem-bootstrap admin berdasarkan `sellers.role = 'admin'`
  atau email tertentu. Pada DB baru tidak ada baris yang cocok; admin penelitian dibuat manual (§6).
- **K4 — storage bucket tidak dibuat oleh SQL mana pun** (lihat §5).

## 4. Objek database (ringkas)

- **Tabel:** 19 tabel dasar (`sellers`, `stores`, `products`, `product_images`, `product_categories`,
  `orders`, `order_items`, `customers`, `payment_methods`, `checkout_settings`, `store_addresses`,
  `shipping_settings`, `ro_locations`, `template_customizations`, `template_revisions`,
  `feature_flags`, `store_feature_flags`, `admin_logs`, `platform_settings`) + phase 5 (4 tabel)
  + `shipping_api_usage_logs`, `page_views`, `notifications`, `store_traffic`, `platform_admins`,
  `moderation_events`, `moderation_appeals`.
- **Function/RPC:** `create_default_shipping_settings`, `decrement_product_stock`,
  `increment_product_stock`, `decrement_product_stock_with_options`,
  `increment_product_stock_with_options`, `is_platform_admin`, `prevent_seller_role_self_update`,
  `prevent_store_moderation_bypass`, `prevent_store_moderation_field_client_update`,
  `prevent_product_moderation_field_client_update`,
  `normalize_store_moderation_fields_on_client_insert`,
  `normalize_product_moderation_fields_on_client_insert`, `get_store_dashboard_analytics`.
- **Trigger:** `tr_create_shipping_settings`, `prevent_seller_role_self_update_trigger`,
  `prevent_store_moderation_bypass_trigger`, `prevent_store_moderation_field_client_update_trigger`,
  `prevent_product_moderation_field_client_update_trigger`,
  `normalize_store_moderation_fields_on_client_insert_trigger`,
  `normalize_product_moderation_fields_on_client_insert_trigger`.
- **RLS:** semua tabel di atas RLS enabled. Policy utama yang relevan untuk penelitian kontrol akses:
  `stores_owner` (FOR ALL), `products_owner`, `orders_public_insert` / `order_items_public_insert`,
  `stores_public` / `products_public` (diubah step37), `platform_admins_self_read`,
  serta policy admin berbasis `is_platform_admin` (step36). Verifikasi dengan
  `select * from pg_policies where schemaname = 'public';` setelah migrasi.

## 5. Storage bucket (buat manual di Dashboard → Storage)

| Bucket | Akses | Dipakai oleh |
|---|---|---|
| `editor-images` | public | `app/api/upload/route.ts` |
| `payment-methods` | public | `app/api/upload/qris/route.ts` |
| `proofs` | **private** | `app/api/upload/payment-proof/route.ts`, `app/api/orders/payment-proof-url/route.ts` (signed URL) |
| `template-assets` | public | `lib/template-editor/api.ts` (hapus aset) |

Upload dilakukan server-side dengan service role. Catat policy storage yang dibuat di log penelitian.

## 6. Konfigurasi Auth manual (Dashboard → Authentication)

- **Site URL:** `https://webtokokutest.vercel.app` (atau URL Vercel penelitian).
- **Redirect URLs:** `https://webtokokutest.vercel.app/**` dan `http://localhost:3000/**`
  (reset password memakai `/auth/update-password`).
- **Email confirmation:** sesuaikan dengan flag `email_verification` (seed: aktif).
- **Admin penelitian:** buat akun dummy (email non-pribadi), lalu via SQL Editor:
  insert ke `platform_admins (user_id, seller_id, email, is_active)` untuk akun tersebut.
- Jangan membuat akun di project production.

## 7. Data dummy

- Akun: minimal 1 admin platform, 2+ seller (tenant A & tenant B) untuk uji isolasi tenant,
  1 pembeli/anon. Semua email dummy (mis. domain `example.test`).
- Data: toko, produk, kategori, metode pembayaran, beberapa pesanan per tenant.
- Script `scripts/seed-*.mjs` membutuhkan service role — **hanya** jalankan terhadap project
  penelitian dan set password demo via env (`*_DEMO_PASSWORD`).
- Jangan menyalin data dari production.

## 8. Validasi baseline (lokal, Node v24.13.0 / npm 11.6.2)

| Langkah | Command | Hasil |
|---|---|---|
| Install | `npm ci` | OK (409 packages; peringatan deprecated saja) |
| Type-check | `npx tsc --noEmit -p .` | OK, 0 error |
| Lint | `npm run lint` | OK, 0 error, 46 warning (`no-img-element`, `exhaustive-deps`, `no-page-custom-font`) |
| Build | `npm run build` (tanpa env) | OK, 63 halaman |
