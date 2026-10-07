# WEBTOKOKU EXECUTION PLAN

Dokumen ini adalah catatan eksekusi untuk melanjutkan pengembangan webtokoku secara bertahap dengan AI coding. Gunakan sebagai panduan copy-paste prompt satu per satu.

---

## 1. Status Terakhir

Status yang sudah dikerjakan/diklaim selesai:

- Phase 0: repo sudah bisa `npm ci`, build sukses, error syntax dan type sudah diperbaiki.
- Checkout engine diarahkan ke `CommerceLayer`.
- `UniversalCatalog` dianggap legacy dan tidak dipakai fitur baru.
- `DapurTemplate` dan `LuxeTemplate` sudah tidak memakai `UniversalCatalog`.
- Password policy sudah dibuat.
- Cloudflare Turnstile CAPTCHA sudah dibuat.
- Register sudah pindah ke API route server.
- Email verification dan forgot password sudah terlanjur dibuat, build sukses.
- Alamat resmi berbasis API.co.id sudah dibuat, tetapi karena API error, fitur alamat/ongkir otomatis perlu bisa dimatikan.
- Product detail dan multi images sudah dibuat:
  - `product_images`
  - `stok`
  - `berat_gram`
  - ProductDrawer lebih lengkap
  - quantity cart dibatasi stok
  - produk stok 0 tidak bisa add to cart
  - build sukses.

Status penting:
- API.co.id sedang bermasalah, jadi fitur `auto_shipping` dan `formal_region_address` sebaiknya dimatikan dulu lewat feature flag.
- Database migration sudah mulai bercampur, jadi perlu final schema dan rencana reset database.
- Setup wizard dan Visual Editor V2 belum mulai.
- Dashboard admin perlu dibuat agar developer bisa toggle fitur.

---

## 2. Aturan Kerja untuk AI Coding

Pakai aturan ini di semua prompt:

```text
Aturan kerja:
- Kerjakan hanya scope yang diminta.
- Jangan buat fitur di luar instruksi.
- Jangan refactor besar tanpa izin.
- Jangan hapus fitur lama jika cukup dimatikan via feature flag.
- Jangan pakai emoji di UI. Pakai Lucide React icons atau elemen visual standar.
- Jangan expose API key ke frontend.
- Jangan percaya harga, stok, berat, subtotal, atau total dari frontend.
- Public storefront hanya membaca data aktif/published.
- Seller hanya boleh akses data toko sendiri.
- Admin guard harus dicek server-side, bukan role frontend saja.
- Update dokumentasi setelah task selesai:
  - CHANGELOG.md
  - discussion.md
  - TECHNICAL_DOCUMENTATION.md jika menyentuh arsitektur/API/schema
  - IMPLEMENTATION_ROADMAP.md jika menyentuh roadmap/status
- Jalankan build setelah perubahan.
- Kalau build gagal, laporkan error lengkap dan jangan lanjut task lain.
```

Output wajib untuk tiap task:

```text
Output:
- ringkasan perubahan
- file diubah
- migration SQL jika ada
- docs yang diupdate
- cara test manual
- hasil build
- error jika ada
```

---

## 3. Prioritas Baru

Karena API ongkir/alamat sedang error, jangan lanjut ongkir otomatis dulu.

Urutan paling aman sekarang:

1. Admin Dashboard + Feature Flags
2. Database Reset Plan + Final Schema
3. Checkout & Order Inventory Hardening
4. Template Content Contract
5. Setup Wizard
6. Visual Editor V2
7. Dashboard Seller Redesign
8. Admin Dashboard lanjutan
9. Rate limit auth, nanti belakangan

---

# PHASE 4A — Admin Dashboard + Feature Flags

Tujuan:
Developer bisa menghidupkan/mematikan fitur dari dashboard admin. Fitur yang belum stabil jangan dihapus, cukup dimatikan.

Copy prompt:

```text
Phase 4A — Admin Dashboard + Feature Flags

Tujuan:
Saya sebagai developer/platform owner bisa menghidupkan dan mematikan fitur webtokoku dari dashboard admin. Karena API ongkir/alamat sedang error, fitur terkait harus bisa dimatikan sementara tanpa hapus kode.

Scope:
1. Buat sistem feature flags.
2. Buat dashboard admin dasar.
3. Tambahkan gate fitur di UI dan API.
4. Update docs.
5. Build wajib sukses.

Fitur yang harus bisa di-toggle:
- auto_shipping
- formal_region_address
- setup_wizard
- visual_editor
- qris_checkout
- product_gallery
- email_verification
- turnstile_captcha
- maintenance_mode

Database:
Buat migration untuk:
1. feature_flags
   - id
   - key unique
   - name
   - description
   - enabled_globally boolean
   - created_at
   - updated_at

2. store_feature_flags
   - id
   - store_id
   - feature_key
   - enabled boolean
   - created_at
   - updated_at

3. admin_logs
   - id
   - admin_id
   - action
   - target_type
   - target_id
   - description
   - created_at

4. platform_settings jika diperlukan:
   - key
   - value jsonb
   - updated_at

Admin route:
- /admin

Admin menu minimal:
- Overview
- Feature Flags
- Stores
- Users/Sellers
- System Logs

Admin guard:
- Jangan pakai role frontend saja.
- Tambahkan role admin yang dicek server-side.
- Jika schema sellers/users belum punya role, buat migration aman.
- Non-admin tidak boleh akses /admin.

Task:
1. Buat helper `lib/feature-flags.ts`.
2. Buat helper:
   - isFeatureEnabled(key)
   - isStoreFeatureEnabled(storeId, key)
3. Buat halaman `/admin` sederhana.
4. Buat halaman `/admin/feature-flags`.
5. Admin bisa toggle fitur global.
6. Set default awal:
   - auto_shipping = false
   - formal_region_address = false
   - setup_wizard = false
   - visual_editor = false
   - qris_checkout = true
   - product_gallery = true
   - turnstile_captcha = true
   - email_verification = true
   - maintenance_mode = false

7. Terapkan gate awal:
   - Jika auto_shipping false, checkout pakai “Ongkir dikonfirmasi seller via WhatsApp”.
   - Jika formal_region_address false, jangan paksa API wilayah; boleh pakai alamat manual sementara.
   - Jika setup_wizard false, jangan tampilkan menu Setup Website.
   - Jika visual_editor false, jangan tampilkan menu Edit Template.
   - Jika maintenance_mode true, tampilkan halaman maintenance.

8. Jangan hapus kode ongkir/alamat/API.co.id. Cukup disable via feature flag.

Docs:
Update:
- CHANGELOG.md
- discussion.md
- TECHNICAL_DOCUMENTATION.md
- IMPLEMENTATION_ROADMAP.md

Output:
- file diubah
- migration SQL
- fitur yang bisa di-toggle
- flow admin guard
- docs diupdate
- hasil build
```

---

# PHASE DB-1 — Database Reset Plan + Final Schema

Tujuan:
Rapikan database karena migration sudah bercampur. Jangan langsung delete data. Buat rencana dan schema final dulu.

Copy prompt:

```text
Phase DB-1 — Database Reset & Final Schema Plan

Tujuan:
Rapikan seluruh database webtokoku karena migration sudah mulai bercampur. Buat rencana reset database yang aman, lalu susun schema final yang konsisten.

Aturan:
- Jangan langsung drop/delete data.
- Jangan eksekusi SQL destructive dulu.
- Jangan sentuh auth.users tanpa instruksi eksplisit.
- Jangan hapus storage tanpa instruksi eksplisit.
- Fokus buat audit dan rencana final dulu.

Task:
1. Audit semua file SQL/migration di folder supabase.
2. Identifikasi tabel yang duplikat, konflik, atau schema-nya tidak konsisten.
3. Buat dokumen `DATABASE_RESET_PLAN.md`.
4. Di dokumen itu jelaskan:
   - tabel final yang dipakai
   - tabel legacy yang tidak dipakai
   - urutan reset database
   - urutan migration baru
   - data seed awal
   - risiko jika auth/storage ikut dihapus
5. Buat satu file SQL final:
   `supabase/final_schema.sql`
6. Jangan jalankan SQL final dulu.

Final schema wajib mencakup:
- sellers
- stores
- store_addresses
- shipping_settings
- payment_methods
- products
- product_images
- orders
- order_items
- template_customizations
- template_revisions
- store_testimonials
- store_promos
- store_brand_contents
- store_social_links
- feature_flags
- store_feature_flags
- platform_settings
- admin_logs
- error_logs

Semua tabel wajib punya RLS:
- Public storefront hanya boleh SELECT data aktif/published.
- Seller hanya boleh CRUD data toko sendiri.
- Admin hanya boleh akses lewat role admin yang dicek server-side.

Seed feature flags default:
- auto_shipping = false
- formal_region_address = false
- setup_wizard = false
- visual_editor = false
- qris_checkout = true
- product_gallery = true
- turnstile_captcha = true
- email_verification = true
- maintenance_mode = false

Update docs:
- CHANGELOG.md
- discussion.md
- TECHNICAL_DOCUMENTATION.md
- IMPLEMENTATION_ROADMAP.md

Output:
- hasil audit migration lama
- isi ringkas DATABASE_RESET_PLAN.md
- file final_schema.sql dibuat
- tabel final
- tabel legacy
- risiko reset
- docs diupdate
- build result kalau ada perubahan TS
```

---

# PHASE DB-2 — Execute Database Reset

Pakai hanya setelah `DATABASE_RESET_PLAN.md` dan `final_schema.sql` sudah direview.

Copy prompt:

```text
Phase DB-2 — Execute Database Reset

Saya sudah review DATABASE_RESET_PLAN.md dan final_schema.sql.

Sekarang siapkan SQL reset aman untuk public schema saja.

Aturan:
- Jangan sentuh auth.users.
- Jangan sentuh storage.objects.
- Backup dulu.
- Reset hanya tabel public webtokoku.
- Jalankan final_schema.sql setelah tabel lama dibersihkan.
- Jalankan seed feature flags.

Task:
1. Buat SQL reset final untuk tabel public webtokoku.
2. Pastikan urutan drop sesuai foreign key.
3. Jalankan final_schema.sql.
4. Jalankan seed feature flags.
5. Test flow utama:
   - register
   - onboarding
   - tambah produk
   - product drawer
   - cart
   - checkout
   - admin feature flags

Output:
- SQL reset final
- tabel yang dikosongkan/dibuat ulang
- seed yang dijalankan
- hasil test utama
- error jika ada
```

---

# PHASE 3B — Checkout & Order Inventory Hardening

Tujuan:
Validasi stok dan total harga harus aman di server, bukan hanya cart frontend.

Copy prompt:

```text
Phase 3B — Checkout & Order Inventory Hardening

Tujuan:
Checkout dan order harus aman secara server-side, bukan hanya validasi cart frontend.

Scope:
1. Audit app/api/orders/route.ts.
2. Pastikan server fetch ulang produk dari database.
3. Validasi:
   - produk aktif
   - produk milik store tersebut
   - stok cukup
   - quantity valid
4. Hitung ulang:
   - harga
   - subtotal
   - berat total
   - ongkir jika fitur aktif
   - total
5. Jangan percaya harga, stok, berat, subtotal, atau total dari frontend.
6. Tentukan mekanisme stok:
   - minimal: kurangi stok setelah order dibuat
   - atau jelaskan jika stok dikurangi setelah pembayaran dikonfirmasi
7. Jika auto_shipping false, gunakan fallback:
   - shipping_cost = 0
   - shipping_service = "Dikonfirmasi seller"
   - WhatsApp message menyebut ongkir akan dikonfirmasi seller
8. Pastikan bukti bayar QRIS tetap tersimpan ke orders.bukti_url.
9. Update docs.
10. Jalankan build.

Aturan:
- Jangan buat setup wizard dulu.
- Jangan refactor UI besar.
- Fokus order, checkout, stok, dan total harga.

Docs:
- CHANGELOG.md
- discussion.md
- TECHNICAL_DOCUMENTATION.md

Output:
- file diubah
- flow order baru
- keputusan stok
- docs diupdate
- hasil build
```

---

# PHASE 4B — Template Content Contract

Tujuan:
Semua template punya struktur section yang sama, walau desain visualnya beda.

Section wajib:
- header
- announcement
- hero
- value_props
- featured_categories
- catalog
- promo
- reviews
- brand_story
- brand_gallery
- location
- contact
- faq
- footer

Copy prompt:

```text
Phase 4B — Template Content Contract

Tujuan:
Semua 5 template harus punya struktur section yang sama agar setup wizard dan visual editor bisa bekerja konsisten.

Aturan:
- Jangan redesign besar dulu.
- Jangan buat visual editor V2 dulu.
- Fokus contract data dan key editable.
- Semua template boleh beda desain, tapi struktur data harus sama.

Task:
1. Buat `lib/template-content-contract.ts`.
2. Rapikan `lib/template-editables.ts`.
3. Support field type:
   - text
   - textarea
   - richtext
   - image
   - color
   - gradient
   - toggle
   - link
   - video
4. Tentukan key granular, contoh:
   - hero.title
   - hero.subtitle
   - hero.image_url
   - hero.background_color
   - promo.title
   - promo.description
   - reviews.title
   - brand_story.title
   - location.map_url
   - footer.tagline
5. Audit 5 template:
   - DapurTemplate
   - ButikTemplate
   - GlowTemplate
   - LuxeTemplate
   - HerbaTemplate/Bazz
6. Jangan pakai data-editable terlalu umum seperti “hero” untuk banyak elemen sekaligus.
7. Update docs.
8. Jalankan build.

Output:
- file diubah
- daftar section final
- daftar editable key final
- docs diupdate
- hasil build
```

---

# PHASE 5 — Setup Wizard

Tujuan:
Buat guided setup website builder seperti sketsa: dari informasi toko sampai preview/publish.

Route:
- `/dashboard/setup`

Step wizard:
1. Informasi Dasar
2. Pilih Template
3. Tampilan Utama
4. Ulasan & Dokumentasi Brand
5. Kontak, Sosmed & Lokasi
6. Promo
7. Checkout, Ongkir & QRIS
8. Preview & Publish

Copy prompt:

```text
Phase 5 — Setup Wizard

Tujuan:
Buat /dashboard/setup sebagai guided setup website builder. Jangan terlalu berat, tapi harus rapi dan bisa disimpan.

Syarat:
- Hanya tampil jika feature flag setup_wizard = true.
- Jika setup_wizard = false, menu tidak tampil.
- Gunakan data contract template yang sudah dibuat.
- Jangan buat visual editor V2 di phase ini.
- Jangan bergantung pada API wilayah jika formal_region_address = false.

Task:
1. Buat route `/dashboard/setup`.
2. Buat UI stepper 8 step:
   - Informasi Dasar
   - Pilih Template
   - Tampilan Utama
   - Ulasan & Dokumentasi Brand
   - Kontak, Sosmed & Lokasi
   - Promo
   - Checkout, Ongkir & QRIS
   - Preview & Publish
3. Buat tabel jika belum ada:
   - store_testimonials
   - store_promos
   - store_brand_contents
   - store_social_links
4. Simpan data sebagai draft dulu.
5. Publish melakukan validasi:
   - nama toko ada
   - slug valid
   - WhatsApp valid
   - minimal 1 produk aktif
   - QRIS ada jika qris_checkout aktif
   - alamat valid jika auto_shipping aktif
6. Jika auto_shipping false, tampilkan fallback “Ongkir dikonfirmasi seller”.
7. Update docs.
8. Jalankan build.

Output:
- file diubah
- migration SQL jika ada
- flow setup wizard
- docs diupdate
- hasil build
```

---

# PHASE 6 — Visual Editor V2

Tujuan:
Benerin editor visual yang sekarang kacau. Editor harus terasa inline dan preview tidak kena dashboard layout.

Fitur yang boleh:
- klik teks untuk edit
- klik gambar untuk ganti gambar
- klik warna untuk color picker
- klik background untuk gradient editor
- klik section/elemen untuk hide/show

Tidak boleh dulu:
- drag-and-drop bebas
- resize bebas
- reorder bebas
- raw custom CSS dari user

Copy prompt:

```text
Phase 6 — Visual Editor V2

Tujuan:
Perbaiki UI/UX Visual Editor agar tidak kacau, inline edit terasa nyata, dan preview tidak kena dashboard layout.

Aturan:
- Jangan buat drag/drop.
- Jangan buat resize.
- Jangan buat custom CSS mentah.
- Jangan pakai route preview yang kena dashboard layout.
- Semua perubahan harus mendukung draft dan publish.
- Public storefront hanya baca data live.

Task:
1. Buat isolated preview route, contoh:
   - /editor-preview/[storeId]
   Preview hanya menampilkan storefront/template, bukan dashboard/sidebar.
2. Buat editor studio layout:
   - topbar
   - left layers/sections panel
   - center canvas preview
   - right inspector
3. Selection overlay:
   - klik elemen = select
   - outline muncul
   - toolbar kecil muncul
   - inspector menampilkan field elemen
4. Inline text edit:
   - double click teks
   - floating input
   - Enter apply
   - Escape cancel
5. Image replace:
   - klik gambar
   - floating image panel
   - upload/preview/apply
6. Color/gradient:
   - color picker
   - hex input
   - gradient editor
   - gradient disimpan sebagai JSON aman
7. Hide/show section:
   - hero.visible
   - promo.visible
   - reviews.visible
   - brand_story.visible
   - location.visible
   - faq.visible
   - footer.visible
8. No reorder MVP.
9. Update docs.
10. Jalankan build.

Output:
- file diubah
- route preview lama vs baru
- flow editor baru
- docs diupdate
- hasil build
```

---

# PHASE 7 — Dashboard Seller Redesign

Tujuan:
Dashboard seller jadi command center toko, bukan halaman statistik kosong.

Menu seller final:
- Dashboard
- Setup Website
- Edit Template
- Produk
- Pesanan
- Pelanggan
- Promo
- Ulasan
- Konten Brand
- Analitik
- Alamat & Ongkir
- Metode Pembayaran
- Pengaturan Toko

Copy prompt:

```text
Phase 7 — Dashboard Seller Redesign

Tujuan:
Redesign dashboard seller jadi command center toko yang berguna dan konsisten.

Aturan:
- Gunakan feature flags:
  - setup_wizard
  - visual_editor
  - auto_shipping
  - qris_checkout
- Jangan pakai emoji UI.
- Jangan redesign public storefront.
- Fokus dashboard seller.

Task:
1. Update sidebar/menu dashboard:
   - Dashboard
   - Setup Website jika flag aktif
   - Edit Template jika flag aktif
   - Produk
   - Pesanan
   - Pelanggan
   - Promo
   - Ulasan
   - Konten Brand
   - Analitik
   - Alamat & Ongkir
   - Metode Pembayaran
   - Pengaturan Toko
2. Dashboard home berisi:
   - Store Health Checklist
   - Ringkasan hari ini
   - Quick actions
   - Aktivitas terbaru
   - Tips optimasi toko
3. Store Health Checklist:
   - email verified
   - alamat lengkap
   - minimal 1 produk
   - QRIS aktif
   - ongkir aktif jika auto_shipping true
   - toko published
4. Update docs.
5. Jalankan build.

Output:
- file diubah
- menu final
- health checklist
- docs diupdate
- hasil build
```

---

# PHASE 8 — Admin Dashboard Advanced

Tujuan:
Dashboard admin bukan cuma feature flags, tapi pusat kontrol platform.

Route:
- `/admin`

Menu admin:
- Overview
- Users / Sellers
- Stores
- Orders Monitor
- Products Monitor
- Templates
- Plans / Subscriptions
- Feature Flags
- API & Integrations
- Shipping Logs
- Payment Proofs
- Abuse & Rate Limits
- Error Logs
- Audit Logs
- System Settings
- Maintenance Mode

Copy prompt:

```text
Phase 8 — Admin Dashboard Advanced

Tujuan:
Lengkapi dashboard admin developer agar bisa mengatur platform.

Aturan:
- Admin guard wajib server-side.
- Semua aksi admin penting masuk admin_logs.
- Jangan buat login-as-user tanpa audit log.
- Jangan expose data sensitif yang tidak perlu.

Task:
1. Tambahkan menu admin:
   - Overview
   - Users/Sellers
   - Stores
   - Orders Monitor
   - Products Monitor
   - Templates
   - Feature Flags
   - API & Integrations
   - Error Logs
   - Audit Logs
   - Maintenance Mode
2. Fitur:
   - lihat semua seller
   - lihat semua toko
   - suspend/unsuspend user
   - suspend/unsuspend toko
   - lihat order monitor
   - lihat error checkout
   - lihat error shipping
   - manage feature flags
   - maintenance global
   - maintenance per toko
3. Update docs.
4. Jalankan build.

Output:
- file diubah
- fitur admin baru
- admin guard
- docs diupdate
- hasil build
```

---

# PHASE 1C — Rate Limit Auth

Ditunda sampai core fitur stabil.

Copy prompt nanti:

```text
Phase 1C — Auth Rate Limit

Tujuan:
Cegah spam register/login/resend.

Scope:
1. Register max 3 akun per IP per 24 jam.
2. Login gagal max 5 kali per 15 menit.
3. Resend verification max 3 kali per 10 menit.
4. Device cookie ringan.
5. Logs untuk admin.

Aturan:
- Jangan simpan data sensitif berlebihan.
- Gunakan server-side rate limit.
- Update admin dashboard jika ada abuse logs.

Output:
- migration SQL
- file diubah
- aturan rate limit
- docs diupdate
- hasil build
```

---

## 4. Database Final yang Diinginkan

Tabel final utama:

### Auth/Profile
- sellers
- admin role di sellers atau tabel admin_users

### Store Core
- stores
- store_addresses
- shipping_settings
- payment_methods

### Product/Commerce
- products
- product_images
- orders
- order_items
- customers jika perlu

### Builder/Template
- template_customizations
- template_revisions
- editor_drafts jika diperlukan
- store_testimonials
- store_promos
- store_brand_contents
- store_social_links

### Platform Admin
- feature_flags
- store_feature_flags
- platform_settings
- admin_logs
- error_logs
- shipping_logs
- auth_rate_limit_logs nanti

Jangan sentuh sembarangan:
- auth.users
- storage.objects
- storage.buckets

---

## 5. Feature Flags Default

Gunakan default awal ini:

```text
auto_shipping = false
formal_region_address = false
setup_wizard = false
visual_editor = false
qris_checkout = true
product_gallery = true
turnstile_captcha = true
email_verification = true
maintenance_mode = false
```

Alasan:
- API.co.id sedang error, jadi auto shipping dan formal region address dimatikan dulu.
- Setup wizard dan visual editor belum stabil, jangan tampilkan dulu.
- QRIS dan product gallery sudah relatif aman.
- CAPTCHA dan email verification sudah terlanjur dibuat dan build sukses.

---

## 6. Catatan Penting

1. Jangan hapus kode API.co.id, cukup disable via feature flag.
2. Jangan hapus fitur alamat resmi, cukup fallback ke alamat manual jika flag mati.
3. Jangan lanjut setup wizard sebelum admin feature flags dan final schema jelas.
4. Jangan lanjut visual editor sebelum template content contract beres.
5. Jangan kosongkan database sebelum `final_schema.sql` direview.
6. Kalau database mau dikosongkan, backup dulu dan jangan sentuh `auth.users` serta storage kecuali memang ingin full reset akun dan file.
7. Semua task wajib update dokumentasi.

---

## 7. Urutan Eksekusi Rekomendasi

Jalankan prompt dalam urutan ini:

1. Phase 4A — Admin Dashboard + Feature Flags
2. Phase DB-1 — Database Reset & Final Schema Plan
3. Review manual `DATABASE_RESET_PLAN.md` dan `final_schema.sql`
4. Phase DB-2 — Execute Database Reset
5. Phase 3B — Checkout & Order Inventory Hardening
6. Phase 4B — Template Content Contract
7. Phase 5 — Setup Wizard
8. Phase 6 — Visual Editor V2
9. Phase 7 — Dashboard Seller Redesign
10. Phase 8 — Admin Dashboard Advanced
11. Phase 1C — Rate Limit Auth
