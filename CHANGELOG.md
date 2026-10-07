# Changelog - Webtokoku

## [Plan Security & Upgrade Flow Audit] - 2026-06-01

### Fixed
- Endpoint `/api/stores/plan-admin` sekarang wajib admin sebelum membaca atau mengubah plan toko.
- Endpoint `/api/stores/downgrade` sekarang wajib admin sebelum menurunkan plan toko.
- Endpoint `/api/stores/upgrade` tidak lagi langsung mengaktifkan Pro; endpoint ini hanya mencatat request dan mengembalikan link WhatsApp untuk konfirmasi.
- Log plan API sekarang memakai UUID user yang valid, bukan string `system` pada kolom UUID `admin_logs.admin_id`.

### Changed
- Tombol Upgrade Pro di dashboard seller dan halaman produk sekarang membuka modal benefit terlebih dahulu, lalu user bisa lanjut ke WhatsApp admin.
- Benefit Pro ditampilkan formal: produk/kategori lebih banyak, tanpa watermark, bebas ganti template setelah publish, dan branding toko lebih siap.

## [Storefront Polish & Docs Cleanup] - 2026-05-28

### Fixed
- Footer storefront semua template dikunci ulang agar rapi 3 kolom di desktop/tablet dan 1 kolom di mobile.
- Gambar dokumentasi section ekstra dibuat landscape normal, tidak lagi gepeng karena `max-height` terlalu kecil.
- Heading Luna/Luxe di section ekstra diperkecil agar tetap khas tapi tidak pecah dan terlalu besar.

### Changed
- Section ekstra tetap menjaga atribut `data-editable` supaya masih aman untuk sistem edit template.
- Dokumentasi schema lama dari `SCHEMA_RECOMMENDATION.md` digabung ke `docs/DATABASE_RESET_PLAN.md`.
- Tambah `docs/FINAL_AUDIT_SUMMARY_2026_05_28.md` dan `supabase/README.md` sebagai rekap final dan panduan SQL.

### Verified
- `npm run build` berhasil.
- `npx tsc --noEmit` berhasil setelah `.next/types` dibuat ulang oleh build.
- Smoke test lokal demo storefront HTTP 200.

## [Product Workflow Audit] - 2026-05-19

### Added
- Migration `supabase/migrations/step25_homepage_product_controls.sql` untuk memilih produk yang tampil di landing toko, urutan tampil, label produk, dan harga sebelum diskon.
- Kategori produk dashboard sekarang tersimpan ke tabel `product_categories` otomatis saat seller membuat atau mengedit produk.
- Halaman dashboard produk memiliki pencarian dan filter kategori untuk toko dengan katalog besar.
- Halaman semua produk publik memiliki pencarian produk.

### Changed
- Landing tiap template sekarang hanya menampilkan maksimal 6 produk pilihan dan mengarahkan sisanya ke halaman `/{slug}/produk`.
- Kartu produk landing tiap template menampilkan label dan harga coret dengan gaya sesuai template masing-masing.
- Produk sample onboarding sekarang ikut menyimpan kategori relasional, tipe produk, variasi, add-on, detail produk, stok, berat, dan deskripsi ke database.
- Drawer produk publik sekarang mendukung pemilihan beberapa grup variasi sekaligus, misalnya ukuran dan warna, serta add-on tambahan.
- Checkout dan order API menghitung ulang harga variasi/add-on dari database supaya total tidak hanya percaya data dari browser.
- Dokumentasi admin diperbarui untuk login email/password dan role admin Supabase.

## [Product Options, Categories, Logo Refresh] - 2026-05-19

### Added
- Migration `supabase/migrations/step24_product_options_categories.sql` untuk tabel kategori produk dan kolom variasi, add-on, detail produk, tipe produk, serta kontrol tampil kategori.
- Form tambah/edit produk sekarang mendukung jenis produk, variasi warna/ukuran/porsi/topping, add-on, dan detail spesifik seperti bahan, porsi, isi paket, cara pakai, masa simpan, serta catatan pengiriman.
- Halaman semua produk di `/{slug}/produk` dengan filter kategori dan akses detail produk.
- Logo SVG baru `public/brand/webtokoku-logo.svg` dan komponen `WebtokokuLogo`.

### Changed
- Storefront membaca variasi/add-on/detail produk dari data produk asli, bukan hardcoded per template.
- Navbar semua template utama sekarang punya link Produk.
- Sample onboarding tiap template dibuat 15 produk dengan kategori dan variasi supaya preview terasa seperti toko asli.
- Landing hero memakai headline `Buat web tokomu sendiri dalam sekali klik.` dan elemen kecil `foto/harga/stok`, `Order masuk`, serta teks transparan `toko` dihapus.
- Rail template di landing dibuat bergerak horizontal dan berhenti saat hover.
- Build production berhasil; warning yang tersisa adalah warning lama terkait `<img>` dan dependency hook.

## [RajaOngkir/Komerce Shipping Guard] - 2026-05-19

### Added
- Helper server `lib/rajaongkir.ts` untuk config env, parsing response, cache, dan penjaga kuota.
- Migration `supabase/migrations/step23_rajaongkir_komerce_usage.sql` untuk log hit API 100/hari dan unique index alamat toko.
- Status RajaOngkir key dan kuota harian di admin overview.

### Changed
- `/api/shipping/search` dan `/api/shipping/cost` sekarang memakai RajaOngkir/Komerce Shipping Cost API.
- Checkout publik hanya menampilkan ongkir otomatis jika admin global dan seller sama-sama mengaktifkan fitur.
- Jika API key belum ada, kuota habis, admin mematikan fitur, atau API gagal, order tetap masuk dengan fallback ongkir via WhatsApp.
- Pengaturan pengiriman seller sekarang memakai label RajaOngkir dan memberi info saat global admin OFF.
- Fix deploy blocker `react/no-unescaped-entities` di `components/sections/glow/GlowReview.tsx`.
- `.tools` ditambahkan ke `.gitignore` untuk Node portable lokal yang dipakai verifikasi build.

## [Landing Hero Identity Pass] - 2026-05-19

### Changed
- Hero landing dirombak ulang tanpa eyebrow/badge kecil dan tanpa proof pills.
- Headline dan body copy dibuat lebih pendek dan fungsional.
- Preview hero memakai wordmark transparan `toko`, ledger fungsi, dan strip katalog.
- Section label kecil diganti menjadi tanda visual tanpa teks.
- Pricing memakai `Coming soon` untuk paket Pro dan copy lebih ringkas.
- `npm run build` berhasil setelah perubahan.

Semua perubahan signifikan pada proyek ini akan dicatat di file ini.

## [Phase 7 — Landing Page & Onboarding Overhaul] - 2026-05-12

### Added
- **WhatsApp CTA Bubble** (`app/page.tsx`) — Balon chat WA di pojok kanan bawah halaman utama, mengarah ke nomor `+62 858-3014-5032` dengan pesan otomatis. Animasi muncul setelah 1.5s, bounce hover effect, dan di mobile collapse jadi ikon lingkaran.
- **Wilayah.id API Helper** (`lib/wilayah.ts`) — Helper baru untuk API statis gratis dari wilayah.id (provinsi, kabupaten/kota, kecamatan, kelurahan). Tidak butuh API key.
- **Notifikasi Onboarding Step 3** — Banner biru informatif di Step 3 yang memberitahu user: *"Setelah daftar, kamu bisa mengganti semua elemen toko langsung dari template tanpa form — pilih menu Edit Template di dashboard."*

### Changed
- **API Wilayah diganti ke wilayah.id** — Semua 4 route wilayah (`provinces`, `regencies`, `districts`, `villages`) sekarang menggunakan `wilayah.id` API statis (gratis, tanpa auth) menggantikan `api.co.id` yang bermasalah.
- **Onboarding Step 3 disederhanakan** — Tab dikurangi dari 3 (Tampilan + Teks + Produk) menjadi 2 (Tampilan + Teks Hero). Opsi Font Heading dihapus. Produk bisa ditambah dari dashboard setelah registrasi.
- **Template card di slider bisa diklik** — Kartu template di landing page sekarang bisa diklik untuk membuka live demo langsung di tab baru.
- **Gambar template diperbarui** — Semua gambar di `public/template-previews/` (butik, dapur, herba, luxe) diperbarui dengan screenshot aktual dari demo live yang sudah bersih tanpa banner.

### Removed
- **Demo Banner dihapus dari template** — Tag `<div class="demo-banner">` beserta CSS-nya dihapus dari `kesehatan.html` dan `kosmetik.html`. `fashion.html` dan `makanan.html` sudah tidak memiliki banner sebelumnya.
- **Modal Tambah Produk di Onboarding** — Dihapus dari Step 3 (dipindah ke dashboard setelah registrasi).
- **Import Trash2 dan X** dari `OnboardingClient.tsx` (tidak lagi dipakai).

### Files Changed
```
app/page.tsx                                  - Tambah WAChatBubble, update TemplatesSection
app/onboarding/OnboardingClient.tsx           - Simplify Step 3, tambah notifikasi, bersihkan modal
app/api/regions/provinces/route.ts            - Switch ke wilayah.id
app/api/regions/regencies/route.ts            - Switch ke wilayah.id
app/api/regions/districts/route.ts            - Switch ke wilayah.id
app/api/regions/villages/route.ts             - Switch ke wilayah.id
lib/wilayah.ts                                - BARU: Helper wilayah.id API
public/demo/kesehatan.html                    - Hapus demo-banner, fix hero padding
public/demo/kosmetik.html                     - Hapus demo-banner, fix nav top
public/template-previews/butik.jpg            - Update screenshot fresh
public/template-previews/butik-desktop.jpg    - Update screenshot fresh
public/template-previews/dapur.jpg            - Update screenshot fresh
public/template-previews/dapur-desktop.jpg    - Update screenshot fresh
public/template-previews/herba.jpg            - Update screenshot fresh
public/template-previews/herba-desktop.jpg    - Update screenshot fresh
public/template-previews/luxe.jpg             - Update screenshot fresh
public/template-previews/luxe-desktop.jpg     - Update screenshot fresh
```

---

## [Phase 6] - 2026-05-11
### Added
- Visual Editor V2 (Simplified) di `/dashboard/edit/[storeSlug]`.
- Route `/dashboard/edit/[storeSlug]` dengan feature flag gate `visual_editor`.
- File `VisualEditorClient.tsx` — UI overlay dengan sidebar tools dan preview area.
- Edit mode vs Preview mode toggle.
- Click-to-select functionality pada section placeholder.
- Properties panel di sidebar untuk elemen terpilih.

### Features
- **Top Bar:** Kembali ke dashboard, Preview/Edit toggle, Save button.
- **Sidebar:** List section, Properties panel, Help box.
- **Preview Area:** Placeholder section (Header, Hero, Value Props, Catalog, Footer).
- **Click-to-Edit:** Klik section di preview untuk select dan edit.

### Tech Stack
- Next.js App Router dengan dynamic route `[storeSlug]`.
- Client-side state management dengan React hooks.
- Tailwind CSS untuk styling.

---

## [Phase 5] - 2026-05-11
### Added
- Setup Wizard 8-step di `/dashboard/setup`.
- Migration 4 tabel baru: `store_testimonials`, `store_promos`, `store_brand_contents`, `store_social_links`.
- File `app/dashboard/setup/page.tsx` — server component dengan feature flag gate.
- File `app/dashboard/setup/SetupWizardClient.tsx` — client wizard UI dengan progress bar.
- 8 step wizard: Informasi Dasar, Pilih Template, Tampilan Utama, Brand & Ulasan, Kontak & Sosmed, Promo, Checkout & Pembayaran, Preview & Publish.

### Database
- Tabel `store_testimonials` — ulasan pelanggan dengan rating 1-5.
- Tabel `store_promos` — promo dan diskon dengan valid_until.
- Tabel `store_brand_contents` — konten brand (story, gallery, certificate, video).
- Tabel `store_social_links` — link sosial media (Instagram, TikTok, Shopee, dll).

### Feature Flag
- Setup Wizard hanya tampil jika `setup_wizard = true`.

---

## [Phase 4B] - 2026-05-11
### Added
- Template Content Contract dengan 15 section wajib untuk semua template.
- File `lib/template-content-contract.ts` — definisi section dan field type.
- Standardisasi 15 section: header, hero, value_props, featured_categories, catalog, promo, reviews, brand_story, brand_gallery, location, contact, faq, footer.
- Support field types: text, textarea, richtext, image, color, gradient, toggle, link, video.
- Update `lib/template-editables.ts` dengan struktur Phase 4B.
- File `docs/TEMPLATE_AUDIT_REPORT.md` — dokumentasi audit lengkap 5 template.

### Template Updates (5 HTML Files)
Semua template di `public/demo/` telah diupdate dengan:
- **Sections baru:** reviews, brand_story, brand_gallery, location, faq, value_props
- **data-editable attributes:** Semua elemen utama telah dipasang attribute `data-editable="section.key"`
- **Section toggle:** Semua section memiliki `data-editable-section-visible="section.visible"`

| Template | Sections Ditambah |
|----------|-------------------|
| fashion.html | reviews, brand_gallery, location, faq |
| makanan.html | value_props, reviews, brand_story, brand_gallery, faq |
| skincare.html | brand_story, brand_gallery, location, faq |
| kesehatan.html | reviews, brand_story, brand_gallery, location, faq |
| kosmetik.html | reviews, brand_story, brand_gallery, faq |

### Editable Keys Tersedia
- `hero.title`, `hero.subtitle`, `hero.image_url`, `hero.cta_text`
- `reviews.title`, `reviews.content`, `reviews.author`
- `brand_story.title`, `brand_story.content`, `brand_story.image`
- `brand_gallery.title`, `brand_gallery.image_1` s/d `image_4`
- `location.title`, `location.address`, `location.map`
- `faq.title`, `faq.q1`, `faq.a1`, `faq.q2`, `faq.a2`
- `value_props.prop1-3.title`, `value_props.prop1-3.desc`

### Contract
- Semua 5 template (butik, dapur, glow, luxe, herba) wajib implement 15 section yang sama.
- Visual boleh beda, tapi struktur editable harus seragam.
- Prerequisite untuk Setup Wizard (Phase 5) dan Visual Editor V2 (Phase 6).
- **Status: COMPLETE** — Semua template siap digunakan dengan Setup Wizard dan Visual Editor.

---

## [Phase 3B] - 2026-05-11
### Added
- Server-side validation hardening di `app/api/orders/route.ts`:
  - Validasi produk aktif (`is_active = true`)
  - Validasi produk milik toko yang benar (`store_id` match)
  - Validasi stok cukup (`stok >= quantity`)
  - Validasi quantity > 0
- Cek feature flag `auto_shipping` untuk menentukan ongkir
- Pengurangan stok atomik setelah order berhasil (Opsi A)
- Error message spesifik untuk setiap validasi gagal

### Changed
- API orders sekarang ignore harga/ongkir dari frontend — selalu recalculate dari DB
- Jika `auto_shipping = false`: `shipping_cost = 0` dan `shipping_service = "Dikonfirmasi seller via WhatsApp"`
- Response API sekarang include `shipping_note` untuk info tambahan

### Security
- Race condition protection dengan `.gte('stok', item.quantity)` saat update stok
- Prevent oversell dengan validasi stok ketat

---

## [Phase DB-1] - 2026-05-11
### Added
- Audit lengkap 12 file SQL/migration di folder `supabase/`.
- Dokumen `DATABASE_RESET_PLAN.md` dengan analisis konflik dan duplikat.
- File `final_schema.sql` dengan 19 tabel final yang konsisten.

### Identified Conflicts
- `template_customizations`: 3 versi berbeda — dipilih struktur flat key-value dengan `is_draft`.
- `feature_flags`: Duplikat antara `phase_4a` dan `step30` — gunakan phase_4a.

### Tables Final (19)
**Core:** sellers, stores, products, product_images, product_categories  
**Orders:** orders, order_items, customers, payment_methods, checkout_settings  
**Shipping:** store_addresses, shipping_settings, ro_locations  
**Template:** template_customizations, template_revisions  
**Admin:** feature_flags, store_feature_flags, admin_logs, platform_settings  

---

## [Phase 4A] - 2026-05-11
### Added
- Sistem Feature Flags dengan tabel `feature_flags`, `store_feature_flags`, `admin_logs`, `platform_settings`.
- Admin Dashboard di `/admin` dengan role-based access control (RBAC).
- Halaman `/admin/feature-flags` untuk toggle fitur platform secara real-time.
- Helper functions `isAdmin()`, `logAdminAction()`, dan caching `getFeatureFlags()`.
- Default flags: `auto_shipping=false`, `formal_region_address=false`, `setup_wizard=false`, `visual_editor=false`, `qris_checkout=true`, `product_gallery=true`, `turnstile_captcha=true`, `email_verification=true`, `maintenance_mode=false`.

### Changed
- DashboardClient: Menambahkan conditional menu "Setup Website" berdasarkan flag `setup_wizard`.
- DashboardClient: Menu "Edit Template" sudah conditional berdasarkan flag `visual_editor`.
- RegisterClient: CAPTCHA Turnstile sekarang conditional berdasarkan flag `turnstile_captcha`.
- Middleware: Maintenance mode gate sudah aktif dengan bypass untuk `/admin` dan `/api/auth`.

## [Phase 3A] - 2026-05-11
### Added
- Dukungan galeri foto produk (multi-images) dengan tabel `product_images`.
- Pembaruan UI `ProductDrawer` (PDP) dengan galeri, deskripsi, kategori, berat, dan info stok.
- Validasi stok pada Keranjang: Quantity tidak bisa melebihi stok yang tersedia.
- Sinkronisasi field `stok`, `berat_gram`, dan `product_images` pada fetch produk publik.
- Migrasi database `step21_product_gallery_stok.sql`.

### Changed
- `useCartStore`: Menambahkan validasi limit stok saat tambah/update quantity.
- `QuantityStepper`: Menambahkan prop `max` untuk membatasi input berdasarkan stok.

## [Phase 2] - 2026-05-11
### Added
- Integrasi API wilayah resmi menggunakan API.co.id.
- Proxy API routes untuk data Provinsi, Kabupaten, Kecamatan, dan Desa.
- Validasi alamat resmi pada Onboarding: User wajib memilih wilayah hingga tingkat Desa/Kelurahan.
- Penyimpanan data alamat detail, patokan, dan koordinat (map URL) ke tabel `store_addresses`.
- Migrasi database `step20_formal_regions.sql` untuk kolom wilayah baru.

### Changed
- Onboarding Flow: Mengganti input "Kota" bebas dengan dropdown wilayah berjenjang.

## [Phase 1B] - 2026-05-11
### Added
- Email Verification Gate: Mencegah user yang belum verifikasi email masuk ke Dashboard atau Onboarding.
- Halaman `/auth/verify-email`: Memberikan info status verifikasi dan tombol kirim ulang email verifikasi.
- Halaman `/auth/forgot-password`: Fitur permintaan link reset password via email.
- Halaman `/auth/update-password`: Halaman untuk mengubah password setelah klik link reset (mendukung Password Policy).
- Link "Lupa password?" di halaman Login.

### Changed
- Dashboard Layout & Onboarding Page: Menambahkan pengecekan status `email_confirmed_at` dari Supabase User.

## [Phase 1.1 & 1.2] - 2026-05-11
### Added
- Implementasi Strong Password Policy (Min 8 karakter, huruf besar, huruf kecil, angka, simbol).
- Integrasi Cloudflare Turnstile CAPTCHA pada halaman registrasi untuk mencegah spam bot.
- API Route `/api/auth/register` untuk menangani registrasi sisi server.
- Server-side verification untuk Turnstile token di `lib/turnstile.ts`.
- Server-side password validation (re-check) di API Route.
- `lib/supabase/server.ts` untuk operasi Supabase di sisi server.
- `.env.example` untuk konfigurasi variabel lingkungan (Supabase & Turnstile).

### Changed
- Alur registrasi dari client-side Supabase Auth menjadi server-side API call.
- Update UI `RegisterPage` untuk menampilkan widget Turnstile.
- Placeholder dan validasi input password di `RegisterPage`.

### Fixed
- Build error akibat syntax mismatch dan type mismatch (Phase 0).
