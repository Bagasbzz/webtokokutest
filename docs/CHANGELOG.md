# 📋 CHANGELOG — webtokoku

> Log kronologis perubahan proyek, keputusan arsitektur, dan bug kritis.

---

## [2026-05-20] - Bug Fix Kategori, Admin Quick Setup, & Template Consistency Audit

**AI:** Antigravity (Claude Sonnet)

### Bug Fix: `column "name" of relation "product_categories" does not exist`
- Ditemukan inkonsistensi nama kolom: `supabase/2_CREATE_ALL.sql` mendefinisikan kolom sebagai `nama`, sedangkan migration `step24_product_options_categories.sql`, `lib/product.ts`, dan API `onboarding/route.ts` seluruhnya menggunakan `name`.
- **Fix:** Ubah kolom di `2_CREATE_ALL.sql` dari `nama` menjadi `name` agar skema konsisten.
- **Catatan untuk user:** Jalankan `ALTER TABLE public.product_categories RENAME COLUMN nama TO name;` di Supabase SQL Editor untuk database yang sudah ada.

### Fitur Baru: Admin Quick Setup (Setup Instan)
- Membuat halaman `/admin/quick-setup` dengan form lengkap untuk mendaftarkan seller baru dan membuat toko secara instan dari dashboard admin.
- Server Action `app/admin/quick-setup/actions.ts` menggunakan Supabase Admin Client untuk:
  - Membuat user di Auth tanpa verifikasi email manual (`email_confirm: true`)
  - Membuat profil seller dan toko
  - Seed otomatis 15 produk bawaan sesuai template yang dipilih
  - Mencatat aktivitas ke `admin_logs`
- Menambahkan menu "Setup Instan" (⚡) ke sidebar admin layout.
- Membuat form kuesioner klien lengkap untuk Bagas kirim ke klien yang mau dibuatkan toko.

### Audit & Fix Konsistensi Template
- **Audit menyeluruh** semua 5 template (Butik, Dapur, Glow, Luxe, Herba):
  - ✅ Semua navbar sudah memiliki link `/{slug}/produk`
  - ✅ Semua catalog component (`ButikCatalog`, `DapurCatalog`, `GlowCatalog`, `LuxeCatalog`, `BazzCatalog`) sudah menampilkan tombol "Lihat semua produk" yang mengarah ke `/{slug}/produk` ketika produk > 6
  - ❌ **Fix:** Footer `ButikTemplate` — link "Lihat semua" dan "Produk terbaru" yang sebelumnya mengarah ke `#collections` diperbaiki menjadi link ke `/{store.slug}/produk`
- **Landing page preview images** sudah konsisten menggunakan file dari `/template-previews/` dengan format `-desktop.jpg` dan `-mobile.jpg`
- **Onboarding template card** sudah menggunakan `preview_image` dari `TEMPLATES` config (`/template-previews/[id].jpg`)
- Semua perubahan di-commit dan di-push ke `Bazzcuy/webtokoku.git`

---


## [2026-05-19] - Product Workflow Audit dan Checkout Option Safety

**AI:** Codex

- Pull terbaru dari `Bazzcuy/webtokoku.git` berhasil dilakukan sebelum coding.
- Membaca ulang dokumen Markdown aktif dan arsip penting untuk memastikan konteks lama tidak hilang.
- Mengaktifkan kategori produk relasional dari dashboard tambah/edit produk melalui tabel `product_categories`.
- Menambahkan pencarian dan filter kategori di dashboard produk, serta pencarian di halaman semua produk publik.
- Menambahkan migration `step25_homepage_product_controls.sql` untuk kontrol produk landing: tampil di halaman utama, urutan, label, dan harga sebelum diskon.
- Mengubah semua template agar landing hanya menampilkan maksimal 6 produk pilihan, sementara katalog penuh berada di `/{slug}/produk`.
- Menjaga tampilan kartu produk tetap mengikuti karakter template masing-masing: Butik gelap elegan, Dapur menu makanan, Glow editorial skincare, Herba klinis, dan Luxe tegas editorial.
- Memastikan sample onboarding 15 produk per template tidak hanya tampil di preview, tetapi juga menyimpan detail variasi, add-on, detail produk, stok, berat, tipe produk, dan kategori relasional ke database.
- Mengubah drawer produk supaya variasi multi-grup bisa dipilih bersamaan, contohnya ukuran + warna, bukan hanya satu opsi total.
- Mengaktifkan add-on di drawer produk dan menampilkan add-on pada cart serta pesan checkout.
- Memperkuat `/api/orders` agar harga variasi/add-on dihitung ulang dari data database.
- Memperbarui `docs/ADMIN_SETUP.md` untuk akun admin email `bagasphensell@gmail.com` dan mekanisme role `sellers.role = 'admin'`.
- Menambahkan `docs/SESSION_AUDIT_2026_05_19_PRODUCT_SYSTEM.md` sebagai catatan sesi, audit, risiko, dan checklist lanjutan.

## [2026-05-19] - Checkout WA, Bazzhealth, dan Demo Image Fallback

**AI:** Codex

- Mengubah checkout publik agar setelah order dibuat langsung redirect ke WhatsApp memakai navigasi halaman, bukan popup tab baru yang sering diblokir browser.
- Format pesan WhatsApp sekarang memuat kode order, tanggal, status pesanan, status pembayaran, daftar barang + harga, subtotal, ongkir, total, instruksi kirim ulang bukti bayar, data pembeli, dan alamat lengkap.
- Form checkout utama sekarang menambahkan pilihan provinsi, kota/kabupaten, kecamatan, dan kelurahan/desa sebelum detail alamat.
- Demo statis menghapus banner `Demo toko webtokoku`, mengganti emoji template makanan dengan penanda numerik, dan menambahkan fallback gambar inline agar broken image tidak muncul saat URL eksternal gagal.
- Template Bazzhealth dirombak pada hero: floating card dekat gambar utama dihapus, bentuk gambar dibuat lebih editorial, dan logo kesehatan SVG ditambahkan di `public/template-assets/bazz-health-logo.svg`.

## [2026-05-19] - RajaOngkir/Komerce Shipping Integration Guard

**AI:** Codex

- Fix deploy blocker setelah integrasi: menghapus tanda kutip langsung di JSX `GlowReview.tsx` yang memicu `react/no-unescaped-entities` saat `next build`.
- Menambahkan `.tools` ke `.gitignore` karena Node portable lokal dipakai hanya untuk verifikasi build.
- Verifikasi lokal `npm run build` berhasil setelah Node portable dipasang di workspace.
- Mengganti jalur ongkir otomatis dari API.co.id lama ke RajaOngkir/Komerce Shipping Cost API.
- Menambahkan helper server `lib/rajaongkir.ts` untuk config env, parsing response, cache lokasi/ongkir, dan penjaga kuota harian.
- Mengubah `/api/shipping/search` ke endpoint `destination/domestic-destination`.
- Mengubah `/api/shipping/cost` ke endpoint `calculate/domestic-cost`.
- Menjaga route legacy `/api/shipping/apico-cost` agar tidak langsung 404, namun diarahkan ke implementasi RajaOngkir.
- Checkout publik sekarang hanya menampilkan ongkir otomatis jika global `auto_shipping` ON dan setting toko `auto_shipping_enabled` ON.
- Jika admin mematikan fitur, API key belum ada, alamat asal belum siap, courier gagal, atau kuota harian habis, order tetap bisa masuk dengan fallback ongkir dikonfirmasi via WhatsApp.
- Dashboard pengiriman seller sekarang menjelaskan status global admin dan memakai label RajaOngkir.
- Admin overview sekarang menampilkan status env RajaOngkir key dan hit kuota harian.
- Menambahkan migration `supabase/migrations/step23_rajaongkir_komerce_usage.sql` untuk log hit API 100/hari, unique index alamat toko, dan update deskripsi feature flag.
- Memperbarui `.env.example` dengan `RAJAONGKIR_API_KEY`, `RAJAONGKIR_BASE_URL`, dan `RAJAONGKIR_DAILY_LIMIT`.
- Catatan maintenance: maintenance mode global menutup area publik/dashboard user, tetapi admin tetap bisa masuk untuk mematikan mode tersebut.

## [2026-05-19] - Landing Hero Identity Pass

**AI:** Codex

- Merombak ulang hero landing supaya tidak memakai eyebrow/badge kecil, proof pills, atau label kecil yang terasa generik.
- Hero sekarang memakai headline lebih pendek, panel preview toko, wordmark besar transparan `toko`, ledger fungsi sederhana, dan strip katalog lebih khas.
- Section label kecil pada header section diganti menjadi tanda visual dua garis tanpa teks.
- Pricing copy dipendekkan, `Nanti` diganti menjadi `Coming soon`, dan kartu pricing dibuat lebih sederhana tanpa badge promo.
- Final CTA dibersihkan dari ikon kecil dan copy panjang.
- Font heading diperkuat dengan weight 900 untuk memberi karakter lebih tegas.
- Verifikasi `npm run build` berhasil setelah perubahan.

## [2026-05-19] - Aturan Dokumentasi dan Target Repository

**AI:** Codex

- Menambahkan aturan kerja bahwa setiap perubahan kode/schema/UI harus disertai update Markdown relevan.
- Mencatat target push repository `Bazzcuy/webtokoku.git` dan email kerja `nanamigemoy@gmail.com`.

## [2026-05-19] - Landing Page UI Polish Tahap Awal

**AI:** Codex

- Merombak hero landing page agar lebih fungsional dan tidak terasa seperti template SaaS generik.
- Mengganti section label dari badge kecil menjadi gaya garis sederhana.
- Merapikan copy landing page supaya lebih pendek dan langsung menjelaskan fungsi.
- Mengubah pricing menjadi dua paket sederhana: Free dan Pro nanti.
- Menambahkan footer yang lebih berisi dengan kolom navigasi dan kredit `Dibuat oleh Bazzcreate`.
- Menambahkan `docs/UI_AUDIT_2026_05_19.md` sebagai catatan audit UI awal semua area.

## [2026-05-19] - Auth UI Polish Tahap Awal

**AI:** Codex

- Merombak halaman login menjadi shell dua kolom dengan panel konteks dashboard dan form yang tetap ringkas.
- Merombak halaman register dengan panel konteks toko, preview link toko, benefit singkat, dan form dua kolom.
- Menambahkan background grid halus dan visual panel gelap agar halaman auth tidak terasa polos.
- Memindahkan styling password meter register dari inline style ke CSS module.
- Menambahkan usulan section contract template di dokumen audit UI.

## [2026-05-19] - Template Glow Lab dan Bazzhealth UI Polish

**AI:** Codex

- Merombak Glow Lab hero menjadi komposisi skincare editorial dengan foto utama asimetris, foto tekstur, ingredient strip, dan note routine.
- Menghapus elemen Glow Lab yang terasa generik seperti floating rating/best seller, foto user review, verified buyer, dan repeat order.
- Menggeser Bazzhealth/Herba dari gaya dark terminal/system menjadi UI kesehatan terang, klinis, dan lebih mudah dipahami.
- Menambahkan kategori dan mekanisme "Lihat semua produk" untuk katalog Glow Lab dan Bazzhealth saat produk lebih dari 12.
- Menambahkan horizontal scroll untuk review shared section saat item lebih dari 3.
- Menambahkan dukungan cabang/outlet pada shared location section.
- Memperbarui audit UI dengan mekanisme 15 section, cabang outlet, kategori produk, dan panduan ukuran gambar.

## [2026-05-19] - Demo Simulasi dan Audit Inline Editor

**AI:** Codex

- Mengubah `/inidemo/index.html` menjadi demo simulasi terbatas dengan template live Dapur Nusantara di iframe.
- Demo sekarang mengizinkan edit hero title, subtitle, dan image tanpa menyimpan ke database.
- Menambahkan dashboard simulasi yang lebih menyerupai dashboard seller: sidebar, statistik, pesanan terbaru, dan checklist toko.
- Menandai hero template statis Dapur Nusantara dengan `data-editable` untuk kebutuhan demo inline.
- Memperbaiki quick edit inline agar mengambil teks aktual dari preview sebagai fallback ketika field belum ada di draft.
- Menambahkan `data-editable` hero title/subtitle/image untuk Glow Lab dan Bazzhealth di preview editor.
- Menambahkan helper ukuran gambar pada form editor untuk field image template.
- Menambahkan catatan multi-tenant: traffic toko tidak otomatis saling merekomendasikan, data tetap dipisah per `store_id`.

## [2026-05-18] - Onboarding Preview Template Asli

**AI:** Codex

- Mengganti preview generik di onboarding dengan render template asli sesuai pilihan user.
- Preview mobile dan preview sebelum publish sekarang memakai komponen template yang sama dengan storefront.
- Menambahkan sample product per kategori agar template terlihat utuh walaupun user belum mengisi produk.
- Menyesuaikan ukuran frame preview agar template asli bisa discroll dan tidak terasa seperti thumbnail palsu.

## [2026-05-18] - Edukasi Domain di Pengaturan

**AI:** Codex

- Menambahkan kartu "Domain dan Hosting" di Pengaturan Toko.
- Menjelaskan domain bawaan `slug.webtokoku.id`, opsi domain sendiri, dan bahwa hosting toko tetap dikelola webtokoku.
- Menambahkan langkah singkat DNS: A record untuk domain utama dan CNAME untuk subdomain.
- Menambahkan tautan penyedia domain: Hostinger, IDWebHost, Niagahoster, dan Rumahweb.

## [2026-05-18] - Payment Manual Lebih Lengkap

**AI:** Codex

- Menambahkan pengaturan transfer bank, e-wallet, dan ambil di toko di halaman Pengaturan Pembayaran.
- Checkout sekarang menampilkan pilihan metode bayar yang aktif: QRIS, transfer bank, e-wallet, ambil di toko, atau fallback konfirmasi WhatsApp.
- Format pesan WhatsApp pesanan dibuat lebih lengkap: kode order, kode ambil jika pickup, produk, ongkir, total, metode bayar, data pembeli, catatan, dan bukti bayar.
- API order sekarang menyimpan `payment_method` sesuai pilihan checkout, bukan selalu `qris_manual`.

## [2026-05-18] - UI Copy Polish Tahap Awal

**AI:** Codex

- Merapikan copy landing page agar lebih lugas, pendek, dan tidak terasa seperti iklan generik.
- Memoles teks login, register, onboarding, dashboard seller, dan ringkasan admin.
- Mengganti default copy 5 template toko agar lebih natural untuk seller UMKM: fashion, kuliner, skincare, kosmetik, dan kesehatan.
- Membersihkan teks demo statis di `public/demo` yang terlalu bombastis atau berisi klaim besar.
- Referensi arah copy: produk matang seperti Supabase, Shopify, WordPress.com, dan Vercel yang memakai heading pendek, navigasi sederhana, dan kalimat informatif.

## [2026-05-18] - Audit Sistem dan Quick Fix Dashboard

**AI:** Codex

- Menambahkan `docs/SYSTEM_AUDIT_2026_05_18.md` untuk merapikan scope perbaikan UI, demo, template preview, produk, payment, domain, notifikasi, akun, dan RajaOngkir/Komerce.
- Membuat sidebar dashboard seller dan admin lebih rapat serta scrollable agar tombol keluar tidak kepotong layar.
- Menambahkan input stok di form tambah dan edit produk, lalu menyimpan nilainya ke `products.stok`.
- Menandai risiko keamanan API key Komerce yang terlihat di screenshot agar di-rotate sebelum production.

---

## [2026-05-09] — Visual Editor: Hardening & Polish Phase (COMPLETE)

**AI:** Antigravity (Claude Sonnet + Gemini Flash)

### Step 5B — Overlay Hover System
- Implementasi `useOverlaySync.ts` — koordinat hover dari iframe ke host via `getBoundingClientRect`
- `OverlayCanvas.tsx` — external overlay layer (sibling, bukan inject ke template)
- Tooltip kecil menampilkan editable key
- Cursor pointer, outline biru animasi smooth

### Step 5C — Click Sync (Preview → Sidebar)
- Klik elemen di preview → auto switch section tab → auto scroll → auto focus field
- `selectedKey` + `highlightedKey` state di `EditorClient`
- `FieldRenderer` menerima `isSelected`/`isHighlighted` props

### Step 5D — Quick Edit (Double Click)
- Double click elemen teks di preview → `FloatingInput` muncul di overlay layer
- Tidak menggunakan `contentEditable` — commit-based ke `formData`
- Keyboard: Enter commit, Escape cancel
- Image field dikecualikan dari quick edit

### Hardening: Undo/Redo System
- `useEditorHistory.ts` — stack-based (past/present/future), limit 50
- Debounced commit 800ms saat mengetik
- `Ctrl+Z` / `Ctrl+Shift+Z` keyboard shortcut
- Reset history saat load draft/revision

### Hardening: Overlay Stability & Resize Sync
- `ResizeObserver` pada iframe body — deteksi late-load image/font shift
- `lockedKey` mechanism — overlay sticky saat Quick Edit aktif meski window di-resize
- `requestAnimationFrame` throttling untuk smooth 60fps sync
- Cleanup observer otomatis saat iframe reload

### Hardening: Recovery & State Integrity
- ACK system — EditorClient kirim `messageId`, PreviewClient balas `PREVIEW_ACK`
- Status indikator "🔄 Sinkronisasi..." / "✓ Terhubung" di preview toolbar
- `beforeunload` protection saat ada unsaved changes

### Hardening: Error Boundary & Failsafe
- `EditorErrorBoundary.tsx` — React class component, catch runtime error di sub-tree manapun
- `lib/editor-logger.ts` — in-memory + sessionStorage audit trail (hanya dashboard)
- `PreviewFrame` retry cap MAX_RETRIES=3, logEditorError on iframe failure
- `OverlayCanvas` wrapped `EditorErrorBoundary fallback=null` — crash silent, sidebar tetap jalan
- try/catch di semua OverlayCanvas event handlers

### Polish Phase: Production UX
- **Save Status System** — unified status: `typing | saving | saved | error | offline`
- **Offline detection** — `navigator.onLine` + event listener
- **Command Palette (Ctrl+K)** — searchable modal ala Notion/Figma, full keyboard nav
- **Keyboard Shortcuts** — Ctrl+S (save), Ctrl+K (palette), Ctrl+Z/Shift+Z (undo/redo)
- **Sidebar Search** — filter field realtime, highlight matched fields
- **Realtime Validation** — inline soft warnings (URL, maxLength, empty image)
- **Image Optimization** — skeleton pulse + fade-in transition saat gambar dimuat
- **Performance** — `FieldRenderer` wrapped `React.memo`
- **Accessibility** — `aria-label` semua buttons
- **Mobile Safety** — `min-width: 1024px`, CSS media query mobile warning

### Audit & Bug Fixes (sesi ini)
- **BUG #1**: `retryFile` state dihapus dari ImageField → restore
- **BUG #2**: `useEffect` tidak diimport di ImageField → fix import
- **BUG #3**: `import validateField` mid-file di FieldRenderer → pindah ke top
- **BUG #4**: `React` namespace tidak diimport di `useOverlaySync.ts` → fix
- **BUG #5**: `@media` dalam inline style `mobileWarning` tidak bekerja → ganti ke `dangerouslySetInnerHTML` CSS

**Dokumen audit lengkap:** [`EDITOR_AUDIT_2026_05_09.md`](./EDITOR_AUDIT_2026_05_09.md)

---

## [2026-05-08] — Konsolidasi Dokumentasi & API.co.id Setup

**AI:** Antigravity (Claude)

**Yang dikerjakan:**
- Konsolidasi 13 file MD → 7 file terstruktur (docs cleanup)
- SQL migration `step12_rajaongkir.sql` dijalankan di Supabase
- Setup `APICO_API_KEY` di Vercel environment variables
- Buat API route `/api/shipping/apico-cost` untuk integrasi API.co.id
- **Keputusan: Ganti RajaOngkir → API.co.id** untuk cek ongkir
  - Auth header: `x-api-co-id` (bukan `Authorization: Bearer`)
  - Lokasi menggunakan **10-digit village code** (lebih presisi)
  - Base URL: `https://use.api.co.id`

**Commit:** `9136031`

---

## [2026-05-07/08] — Dashboard Responsive UI Fix

**AI:** Cascade

**Yang dikerjakan:**
- Fix responsive layout dashboard untuk tablet & mobile
- Hamburger menu + fullscreen overlay untuk mobile navigation
- Breakpoints: 1024px, 768px, 480px
- Fix topbar yang nimpa konten di mobile

**Commit:** `61962a6`

---

## [2026-05-07] — Step 11: Universal Catalog + WhatsApp Checkout

**AI:** Antigravity (Gemini)

**Yang dikerjakan:**
- `UniversalCatalog.tsx` — cart (LocalStorage), checkout state machine, sinkronisasi warna tema
- Alur checkout 4-modal: Ringkasan → Alamat → Ongkir → Pembayaran
- Integrasi ke semua 5 template (ganti grid statis)
- SQL migration: `orders`, `order_items`, `customers`, `payment_methods`, `checkout_settings`
- RLS untuk keamanan multi-tenant
- API route `/api/orders` dengan server-side price recalculation

---

## [2026-05-07] — Step 10: Screenshot + Isolated Demo Mode

**AI:** Antigravity (Claude)

- Screenshot desktop (1280px) + mobile (400px) dari 5 HTML statis → `public/template-previews/`
- `public/inidemo/` — demo interaktif terisolasi (100% sandbox, no DB connection)
- Tombol "Coba Demo Interaktif" di Hero Section

---

## [2026-05-07] — Step 9: Redesign Landing Page

**AI:** Antigravity (Claude)

- Rombak total `app/page.tsx` (dari redirect ke HTML statis → full React)
- Tagline: *"Bangun Website Toko Sendiri, Tanpa Ribet Marketplace."*
- Posisi: pelengkap marketplace, bukan anti-marketplace
- Animasi: pulse badge, 3D tilt mockup, hover effects
- Mobile-first responsive

---

## [2026-05-07] — Step 8: Restorasi Template Orisinal

**AI:** Antigravity (Claude)

- Tulis ulang 5 komponen React di `components/templates/` agar 100% mereplikasi desain orisinal HTML statis
- Hapus `shared/ProductCard.tsx` — tiap template punya card unik
- Fix `class` → `className` di HerbaTemplate + LuxeTemplate

**Konteks:** User kecewa template React sebelumnya jauh dari desain orisinal.

---

## [2026-05-05] — Audit, Bug Fix & Deploy Fix

**AI:** Antigravity (Claude)

**Bug deploy kritis:**
- `VERCEL_NOT_FOUND_ALL_ROUTES` — Fix: Vercel Framework Preset "Other" → "Next.js"
- `[slug]` catches `/index.html` — Fix: redirect di `next.config.mjs`
- Hapus `middleware.ts` — auth guard pindah ke client `dashboard/layout.tsx`

---

## [2026-05-04] — Full MVP Build (Step 0–7)

**AI:** Gemini

- Step 0: Migrasi ke Next.js 14 (App Router)
- Step 1: Setup Supabase + schema `sellers`, `stores`, `products`
- Step 2: Auth System (Register/Login)
- Step 3: Onboarding multi-step + validasi slug real-time
- Step 4: CRUD Produk + Upload foto
- Step 5: Dynamic Store Page multi-tenant (`/[slug]`)
- Step 6: Dashboard Seller
- Step 7: Polish + deploy Vercel

**Bug kritis ditemukan & fixed:**
- `MIDDLEWARE_INVOCATION_FAILED` — `@supabase/ssr` memanggil `crypto` di Edge Runtime
- RLS error saat register — pecah policy `FOR ALL` jadi per-aksi
- `public/index.html` masih pakai mock JS lama → diganti redirect

---

## [2026-05-03] — Keputusan Arsitektur Awal

- **Model:** E-commerce builder untuk closing via WhatsApp
- **Arsitektur:** Multi-tenant Dynamic Routing (`/[slug]`)
- **Hosting:** Vercel Free Tier (100GB bandwidth/bulan)
- **Database:** Supabase Free Tier (500MB, ~10.000 toko)
- **Desain:** Light mode, elegan, Shopify-inspired. **Bukan** dark/neon theme.
- **Editing:** Preset Only (pilih template, isi data, publish). Drag & drop nanti.

**Insiden UI:** AI pertama bikin tema gelap/neon yang jauh dari ekspektasi → REBUILD TOTAL ke light mode.
