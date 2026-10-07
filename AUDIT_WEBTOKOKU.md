# LAPORAN AUDIT MENYELURUH — WEBTOKOKU
> Dibuat: 22 Mei 2026 | Status: Menunggu Persetujuan Perbaikan

---

## RINGKASAN EKSEKUTIF

WebTokoku adalah platform SaaS multi-tenant yang secara arsitektur sudah cukup solid: middleware Next.js menangani routing subdomain dan custom domain dengan baik, Supabase RLS sudah aktif di semua tabel utama, dan flow checkout end-to-end sudah berjalan. Namun terdapat beberapa **bug fatal** di level security, **desinkronisasi serius** antara template/editor, **bug checkout** yang bisa menjebak pembeli, dan banyak inkonsistensi UI/UX yang tersebar.

Audit ini mencakup 9 area utama: keamanan & backend, template & editor, checkout & commerce, produk & kategori, dashboard seller, pengaturan & shipping, admin panel, database/RLS, dan UI/UX.

---

## PRIORITAS BUG

| ID | Level | Area | Deskripsi Singkat |
|----|-------|------|-------------------|
| P0-01 | 🔴 KRITIS | Security | Backdoor UUID invalid di `adminGuard()` menyebabkan crash DB |
| P0-02 | 🔴 KRITIS | Security | Bucket `proofs` menggunakan `getPublicUrl` tanpa enkripsi — link bukti bayar bisa diakses siapapun |
| P0-03 | 🔴 KRITIS | Commerce | Buyer checkout trap: RajaOngkir gagal → dropdown kosong, tidak ada fallback message yang jelas |
| P1-01 | 🟠 TINGGI | Template | FAQ section didefinisikan di contract tapi tidak dirender di satupun template |
| P1-02 | 🟠 TINGGI | Template | Dapur template mendefinisikan `promo` custom section yang duplikat dengan `SHARED_BUSINESS_SECTIONS.promo_banner` |
| P1-03 | 🟠 TINGGI | Template | Footer semua template pakai link hardcoded (`#`, `#collections`, dll) — tidak dinamis dari kategori DB |
| P1-04 | 🟠 TINGGI | Commerce | Seller diblokir setup alamat jika RajaOngkir search API gagal — tidak ada mode manual fallback |
| P1-05 | 🟠 TINGGI | Admin | `getPlatformAnalytics`, `getSellerDetails`, `getStoreAnalytics` — meskipun sudah ada `adminGuard()` di page.tsx, server actions ini bisa dipanggil langsung via POST dari browser devtools tanpa auth check di level action |
| P1-06 | 🟠 TINGGI | Editor | `publishDraft()` tidak revalidate cache storefront — perubahan tidak langsung tampil live |
| P2-01 | 🟡 SEDANG | Dashboard | `alert()` dan `window.confirm()` primitif dipakai di 7+ tempat di dashboard |
| P2-02 | 🟡 SEDANG | Dashboard | Subtitel halaman produk selalu bilang "X produk aktif" — tidak memfilter berdasarkan `is_active` |
| P2-03 | 🟡 SEDANG | Checkout | `searchDestination` tidak cek `res.ok` sebelum mapping — silent error jika search API non-200 |
| P2-04 | 🟡 SEDANG | Commerce | Stok dikurangi saat order masuk tanpa rollback jika order dibatalkan |
| P2-05 | 🟡 SEDANG | Schema | `store_addresses` punya banyak kolom redundan (`province_id`, `province_code`, `village_code`, dst) yang tidak terisi oleh form UI |
| P2-06 | 🟡 SEDANG | Admin | Tidak ada mekanisme untuk admin mengupdate `custom_domain` seller dari panel admin |
| P2-07 | 🟡 SEDANG | Template | `gallery.subtitle` di `TemplateExtraSections` di-render tapi tidak ada di `TEMPLATE_SECTION_CONTRACT` |
| P2-08 | 🟡 SEDANG | Auth | Register/login tidak redirect ke `/onboarding` jika seller belum punya toko (hanya ke `/dashboard`) |
| P3-01 | 🟢 RINGAN | UI | Logo upload di `pengaturan/page.tsx` menggunakan `<input>` didalam `<button>` (invalid HTML) |
| P3-02 | 🟢 RINGAN | UI | Tombol "Hapus Logo" tidak ada konfirmasi, langsung hapus |
| P3-03 | 🟢 RINGAN | UI | Breadcrumb di banyak halaman sub-dashboard tidak konsisten (ada yang pakai breadcrumb, ada yang tidak) |
| P3-04 | 🟢 RINGAN | UX | Checkout step "Kembali" dari `payment` kembali ke `shipping` — padahal jika `skipAutoShipping = true`, seharusnya kembali ke `address` |
| P3-05 | 🟢 RINGAN | UX | `show_on_homepage` tidak ada di type `Product` di `lib/types.ts` (runtime-safe tapi TypeScript `any`-workaround) |
| P3-06 | 🟢 RINGAN | Template | `ButikTemplate` footer masih pakai `<a href="#">Cara Perawatan</a>` hardcoded — placeholder link mati |
| P3-07 | 🟢 RINGAN | Template | Navbar ButikTemplate tidak memuat kategori dari database — link hanya ke anchor `#collections` |

---

## DETAIL TEMUAN P0 — KRITIS / SECURITY

### P0-01: Backdoor UUID Invalid di `adminGuard()`
**File:** [`lib/admin-guard.ts`](file:///c:/Users/bagas/Downloads/iniwebtokoku/iniwebtokoku/lib/admin-guard.ts) — Baris 17-18

**Kode bermasalah:**
```ts
if (user.email === 'bagasphensell@gmail.com') {
  return { user, seller: { id: 'admin-bagas', role: 'admin' } }
}
```

**Masalah:** `id: 'admin-bagas'` bukan format UUID yang valid. Jika kode backend manapun mencoba menggunakan `seller.id` ini sebagai foreign key ke kolom UUID di database (misalnya logging ke `admin_logs.admin_id`), PostgreSQL akan throw error `invalid input syntax for type uuid: "admin-bagas"` dan operasi akan crash.

**Dampak:** Setiap admin action yang mencoba menyimpan audit log atau data lain dengan `seller.id` akan crash diam-diam. Admin sah lain yang role-nya diset via database tidak terdampak.

**Solusi:** Ganti `id: 'admin-bagas'` dengan UUID asli dari DB seller yang bersangkutan, atau ambil seller dari DB terlebih dahulu jika email cocok, sama seperti path normal di bawahnya.

---

### P0-02: Bukti Pembayaran Bisa Diakses Siapapun Lewat Public URL
**File:** [`app/api/upload/payment-proof/route.ts`](file:///c:/Users/bagas/Downloads/iniwebtokoku/iniwebtokoku/app/api/upload/payment-proof/route.ts) — Baris 121-124

**Kode bermasalah:**
```ts
const { data: { publicUrl } } = supabase
  .storage
  .from('proofs')
  .getPublicUrl(fileName)
```

**Masalah:** Bucket `proofs` menggunakan `getPublicUrl()` yang berarti URL permanen dan bisa diakses siapapun yang mengetahui URL-nya. Bukti transfer berisi data sensitif (rekening, nomor HP, tanda tangan digital). URL ini juga disimpan di `orders.bukti_url` yang dibaca oleh dashboard seller.

**Dampak (Privacy/Security):** Siapapun yang mendapat link bukti bayar bisa membukanya selamanya tanpa autentikasi.

**Solusi:** Gunakan Supabase signed URL (`createSignedUrl`) dengan TTL misalnya 1 jam, atau jadikan bucket `proofs` bersifat `private` dan serve signed URL on-demand dari API yang terproteksi login.

---

### P0-03: Buyer Checkout Trap — RajaOngkir Gagal → Checkout Buntu
**File:** [`components/commerce/CheckoutSummary.tsx`](file:///c:/Users/bagas/Downloads/iniwebtokoku/iniwebtokoku/components/commerce/CheckoutSummary.tsx) — Baris 202-219

**Kode bermasalah:**
```ts
const searchDestination = async () => {
  const res = await fetch(`/api/shipping/search?q=...`)
  const data = await res.json()
  const items = data.data || data.results || []  // ← data bisa undefined jika error
  const results = items.map((r: any) => ({ ... }))
  setDestinationResults(results)
  // TIDAK ADA pengecekan res.ok atau error handling!
}
```

**Masalah:** Jika API RajaOngkir mengembalikan error (status 429, 503, 502), `data` berisi `{ error: '...', code: 'RAJAONGKIR_...' }` tanpa property `data` atau `results`. Maka `items` = `[]` dan dropdown lokasi kosong. Tidak ada error message yang muncul ke pembeli.

**Dampak (UX Fatal):** Pembeli yang mengetik area tujuan di checkout tidak mendapat hasil apapun, tidak ada pesan error, dan tidak ada panduan untuk menekan "Lewati cek ongkir otomatis". Pembeli bisa stuck dan meninggalkan checkout tanpa menyelesaikan transaksi.

**Solusi:**
1. Tambahkan `if (!res.ok)` check dengan pesan error yang ditampilkan ke user
2. Jika search gagal, otomatis centang `skipAutoShipping = true` dan tampilkan notifikasi bahwa ongkir akan dikonfirmasi via WA

---

## DETAIL TEMUAN P1 — TINGGI / SISTEM TIDAK SINKRON

### P1-01: Section FAQ Dideklarasikan tapi Tidak Dirender
**File:** [`lib/template-content-contract.ts`](file:///c:/Users/bagas/Downloads/iniwebtokoku/iniwebtokoku/lib/template-content-contract.ts) — Baris 197-203  
**File:** [`components/templates/shared/TemplateExtraSections.tsx`](file:///c:/Users/bagas/Downloads/iniwebtokoku/iniwebtokoku/components/templates/shared/TemplateExtraSections.tsx)

**Masalah:** `TEMPLATE_SECTION_CONTRACT` mendefinisikan section `faq` dengan fields `faq.visible` dan `faq.title`. Namun:
1. `TemplateExtraSections.tsx` tidak merender section FAQ sama sekali
2. Contract hanya mendefinisikan `faq.visible` dan `faq.title` — tidak ada fields untuk konten pertanyaan/jawaban (misal `faq.q1`, `faq.a1`, dll.)
3. Seller yang mengisi FAQ di editor tidak akan melihat hasilnya di storefront

**Dampak:** Fitur FAQ yang ada di editor panel sepenuhnya tidak berfungsi — seller kecewa karena konten tidak muncul di toko mereka.

---

### P1-02: Duplikasi Section Promo di Template Dapur
**File:** [`lib/template-editables.ts`](file:///c:/Users/bagas/Downloads/iniwebtokoku/iniwebtokoku/lib/template-editables.ts)

**Masalah:** Template `dapur` mendefinisikan section custom `promo` dengan key seperti `promo.title`, `promo.description`, sedangkan `TemplateExtraSections` juga merender `promo_banner` (dari `SHARED_BUSINESS_SECTIONS`). Keduanya ditampilkan bersamaan di storefront live, menghasilkan dua blok promo yang terlihat hampir identik.

**Dampak:** Tampilan storefront dapur punya duplikat visual — terlihat tidak profesional dan membingungkan seller saat mengisi editor.

---

### P1-03: Footer Semua Template Pakai Link Hardcoded
**File:** Semua 5 template di [`components/templates/`](file:///c:/Users/bagas/Downloads/iniwebtokoku/iniwebtokoku/components/templates/)

**Contoh di ButikTemplate.tsx (baris 278-291):**
```tsx
<ul>
  <li><a href={`/${store.slug}/produk`}>Lihat semua produk</a></li>
  <li><a href="#collections">Katalog</a></li>
</ul>
...
<li><a href="#">Cara Perawatan</a></li>  {/* LINK MATI */}
```

**Masalah:** Footer tidak membaca kategori dari database. Link kategori hanya berupa anchor hardcoded ke section di halaman yang sama, bukan ke halaman filter kategori yang sesungguhnya. Link "Cara Perawatan" adalah placeholder mati yang tidak dihapus.

**Dampak:** SEO buruk, UX membingungkan — pembeli mengklik link kategori di footer dan hanya scroll ke atas, bukan masuk ke filter.

---

### P1-04: Seller Terblokir Setup Alamat Jika RajaOngkir Gagal
**File:** [`app/dashboard/pengaturan/alamat/page.tsx`](file:///c:/Users/bagas/Downloads/iniwebtokoku/iniwebtokoku/app/dashboard/pengaturan/alamat/page.tsx) — Baris 126-128

**Kode bermasalah:**
```ts
if (!namaPengirim || !noTelp || !alamatLengkap || !selectedLocation) {
  throw new Error('Semua field wajib diisi')
}
```

**Masalah:** `selectedLocation` hanya bisa diisi via dropdown hasil search RajaOngkir. Jika API RajaOngkir tidak dikonfigurasi atau sedang down, search tidak menghasilkan hasil dan `selectedLocation` selalu `null`. Seller tidak bisa menyimpan alamatnya.

**Dampak:** Seller yang ingin menggunakan pengiriman manual (tanpa RajaOngkir) tetap terpaksa mengisi field RajaOngkir yang tidak relevan untuk mereka.

**Solusi:** Buat `selectedLocation` opsional. Jika kosong, ongkir otomatis tidak berfungsi tapi alamat teks tetap bisa disimpan.

---

### P1-05: Server Actions Admin Bisa Dipanggil Langsung Tanpa Guard
**File:** [`app/admin/actions.ts`](file:///c:/Users/bagas/Downloads/iniwebtokoku/iniwebtokoku/app/admin/actions.ts)

**Masalah:** Server Actions di Next.js bisa diinvoke langsung via HTTP POST dari browser devtools atau tools seperti `curl`. Meskipun `adminGuard()` sudah dipasang di `page.tsx`, server actions seperti `getPlatformAnalytics`, `getSellerDetails`, `getStoreAnalytics` perlu memiliki guard **di dalam** body fungsi action itu sendiri — bukan hanya di halaman yang memanggilnya.

**Catatan:** Progress summary menyebut ini sudah dipatch sebagian. Perlu dikonfirmasi apakah semua 3 action sudah punya `await adminGuard()` di baris pertama mereka.

---

### P1-06: Publish Draft Tidak Trigger Cache Revalidation
**File:** [`lib/publish.ts`](file:///c:/Users/bagas/Downloads/iniwebtokoku/iniwebtokoku/lib/publish.ts)

**Masalah:** `publishDraft()` mengupdate database tapi tidak memanggil `revalidatePath()` atau `revalidateTag()`. Next.js mungkin masih menyajikan halaman storefront yang di-cache sebelum publish.

**Dampak:** Seller menekan "Publish" dan perubahan tidak langsung muncul di storefront live. Seller bingung mengira fitur broken.

**Solusi:** Tambahkan `revalidatePath(`/${store.slug}`)` setelah publish berhasil, atau gunakan `revalidateTag` dengan tag per-store.

---

## DETAIL TEMUAN P2 — SEDANG / PERLU DIPERBAIKI

### P2-01: Penggunaan `alert()` / `window.confirm()` Primitif di 7+ Tempat
**Files terdampak:**
- [`app/dashboard/produk/page.tsx`](file:///c:/Users/bagas/Downloads/iniwebtokoku/iniwebtokoku/app/dashboard/produk/page.tsx): Baris 98, 113, 141, 167, 203, 208
- Dashboard pesanan, pengaturan

**Contoh:**
```ts
if (!window.confirm('Hapus produk ini? Tindakan tidak bisa dibatalkan.')) return
...
alert('Kategori produk berhasil disimpan!')
alert(error.message || 'Gagal membuat kategori baru')
```

**Masalah:** `alert()` dan `confirm()` adalah dialog browser yang memblokir thread UI, tidak bisa di-style, dan terasa sangat tidak profesional untuk platform SaaS modern. Ini inkonsisten dengan error handling di halaman pengaturan yang sudah menggunakan state-based alerts yang lebih elegan.

---

### P2-02: Subtitle "X produk aktif" Tidak Akurat
**File:** [`app/dashboard/produk/page.tsx`](file:///c:/Users/bagas/Downloads/iniwebtokoku/iniwebtokoku/app/dashboard/produk/page.tsx) — Baris 231

**Kode:**
```tsx
<p className={styles.subtitle}>{products.length} produk aktif</p>
```

**Masalah:** `products` berisi semua produk yang difetch — tidak ada filter `is_active`. Jika ada produk non-aktif di DB, jumlah yang ditampilkan akan salah (lebih dari jumlah yang sebenarnya aktif).

---

### P2-03: `searchDestination` Tidak Handle HTTP Error
**File:** [`components/commerce/CheckoutSummary.tsx`](file:///c:/Users/bagas/Downloads/iniwebtokoku/iniwebtokoku/components/commerce/CheckoutSummary.tsx) — Baris 202-219

**Masalah (lihat juga P0-03):** Fungsi tidak memeriksa `res.ok`. Jika server mengembalikan error 4xx/5xx, `data.data` dan `data.results` adalah `undefined`. `items` menjadi `[]` dan tidak ada error yang di-set ke state.

---

### P2-04: Stok Dikurangi Saat Order Masuk — Tidak Ada Rollback
**File:** [`app/api/orders/route.ts`](file:///c:/Users/bagas/Downloads/iniwebtokoku/iniwebtokoku/app/api/orders/route.ts) — Baris 337-350

**Masalah:** Stok langsung dikurangi saat order dibuat. Tidak ada mekanisme:
- Mengembalikan stok jika order dibatalkan oleh seller atau pembeli
- Dashboard pesanan tidak ada tombol "Batalkan Order" yang otomatis restore stok

**Dampak:** Stok cepat habis walau banyak order tidak jadi. Seller perlu koreksi stok manual.

---

### P2-05: Kolom `store_addresses` Banyak yang Tidak Terisi dari Form
**File:** [`supabase/final_schema.sql`](file:///c:/Users/bagas/Downloads/iniwebtokoku/iniwebtokoku/supabase/final_schema.sql) — Baris 268-292

**Masalah:** Schema mendefinisikan `province_id`, `province_code`, `province_name`, `city_id`, `regency_code`, `regency_name`, `district_id`, `district_code`, `district_name`, `village_code`, `village_name`. Namun form di `alamat/page.tsx` hanya mengisi `subdistrict_id`. Kolom-kolom ini selalu `NULL` setelah save.

**Dampak:** Data alamat tidak lengkap di DB. Kalkulasi ongkir server-side hanya mengambil `subdistrict_id` saja jadi sudah cukup untuk RajaOngkir, tapi data provinsi/kota tidak terisi untuk keperluan lain (laporan, human-readable label, dsb).

---

### P2-06: Admin Panel Tidak Bisa Update Custom Domain
**File:** [`app/admin694/Admin694Client.tsx`](file:///c:/Users/bagas/Downloads/iniwebtokoku/iniwebtokoku/app/admin694/Admin694Client.tsx)

**Masalah:** Berdasarkan panduan di `pengaturan/page.tsx`, seller diminta mengirim nama domain ke admin WebTokoku untuk diverifikasi dan dipasang ke toko. Namun admin panel tidak memiliki UI atau action untuk mengupdate `stores.custom_domain`. Admin harus menggunakan Supabase dashboard secara manual.

---

### P2-07: `gallery.subtitle` Dirender tapi Tidak Ada di Contract
**File:** [`components/templates/shared/TemplateExtraSections.tsx`](file:///c:/Users/bagas/Downloads/iniwebtokoku/iniwebtokoku/components/templates/shared/TemplateExtraSections.tsx) — Baris 188

**Kode:**
```tsx
<p {...getEditableAttr(previewMode, 'gallery.subtitle')}>
  {pick(customizations, 'gallery.subtitle', 'Tampilkan suasana toko...')}
</p>
```

**Masalah:** `gallery.subtitle` tidak terdefinisi di `TEMPLATE_SECTION_CONTRACT` (hanya ada `gallery.visible`, `gallery.title`, `gallery.image1_url`). Editor tidak akan menampilkan field ini sehingga seller tidak bisa mengisinya.

---

### P2-08: Post-Login/Register Tidak Cek Status Onboarding
**File:** Auth flow

**Masalah:** Setelah login, redirect selalu ke `/dashboard`. Jika seller belum punya toko (belum onboarding), mereka landing di dashboard yang menampilkan loading kemudian error. Halaman `EditorPage` sudah handle ini dengan redirect ke `/onboarding`, tapi halaman produk, pesanan, dll. tidak.

---

## DETAIL TEMUAN P3 — RINGAN / POLISHING

### P3-01: Input File Logo Bersarang di Dalam Button (HTML Invalid)
**File:** [`app/dashboard/pengaturan/page.tsx`](file:///c:/Users/bagas/Downloads/iniwebtokoku/iniwebtokoku/app/dashboard/pengaturan/page.tsx) — Baris 192-209

**Kode bermasalah:**
```tsx
<button type="button" className={styles.btnUpload} disabled={uploadingLogo}>
  {uploadingLogo ? <Loader2 ... /> : <Upload size={16} />}
  <span>...</span>
  <input type="file" accept="image/*" onChange={handleLogoUpload} />  {/* ← INVALID */}
</button>
```

**Masalah:** Menyarangkan `<input type="file">` di dalam `<button>` adalah HTML invalid (interactive element inside interactive element). Behavior-nya berbeda di setiap browser — di beberapa browser, klik pada button tidak akan membuka file picker.

**Solusi:** Gunakan `<label htmlFor="logo-input">` dengan `<input id="logo-input" className="sr-only" />` terpisah, atau gunakan `ref.current.click()`.

---

### P3-02: Hapus Logo Tanpa Konfirmasi
**File:** [`app/dashboard/pengaturan/page.tsx`](file:///c:/Users/bagas/Downloads/iniwebtokoku/iniwebtokoku/app/dashboard/pengaturan/page.tsx) — Baris 211-218

**Masalah:** Tombol "Hapus Logo" langsung menghapus logo dari state tanpa konfirmasi. Seller yang tidak sengaja klik akan kehilangan logo mereka (walau belum disimpan ke DB, tapi perlu upload ulang).

---

### P3-03: Breadcrumb Tidak Konsisten
**Konsisten:** `pengaturan/page.tsx`, `pengaturan/alamat/page.tsx` — punya breadcrumb `Dashboard > Pengaturan > ...`
**Tidak ada:** `produk/tambah/page.tsx`, `produk/[id]/edit/page.tsx`, `pesanan/page.tsx`

**Solusi:** Standarisasi breadcrumb component di semua halaman dashboard.

---

### P3-04: Tombol "Kembali" di Checkout Tidak Sadar State `skipAutoShipping`
**File:** [`components/commerce/CheckoutSummary.tsx`](file:///c:/Users/bagas/Downloads/iniwebtokoku/iniwebtokoku/components/commerce/CheckoutSummary.tsx) — Baris 353

**Kode bermasalah:**
```tsx
<button onClick={() => setStep(
  step === 'address' ? 'cart' : 
  step === 'shipping' ? 'address' : 
  'shipping'  // ← dari 'payment', selalu kembali ke 'shipping'
)}>
```

**Masalah:** Dari step `payment`, tombol "Kembali" selalu menuju `shipping`. Padahal jika `skipAutoShipping = true` (tidak ada step shipping), kembali ke `shipping` akan menampilkan halaman kosong. Seharusnya kembali ke `address`.

---

### P3-05: `show_on_homepage` Tidak Ada di Type `Product`
**File:** [`lib/types.ts`](file:///c:/Users/bagas/Downloads/iniwebtokoku/iniwebtokoku/lib/types.ts)

**Masalah:** `product.show_on_homepage` diakses di `produk/page.tsx` tapi field ini tidak ada di interface `Product`. TypeScript tidak error karena ada `any`-casting di beberapa tempat, tapi ini rawan typo yang tidak terdeteksi.

---

### P3-06: Link Placeholder Mati di Footer Template
**File:** [`components/templates/ButikTemplate.tsx`](file:///c:/Users/bagas/Downloads/iniwebtokoku/iniwebtokoku/components/templates/ButikTemplate.tsx) — Baris 288  
**File:** Template lainnya (DapurTemplate, GlowTemplate, dll.)

**Masalah:** `<a href="#">Cara Perawatan</a>` adalah sisa placeholder dari development yang tidak dihapus. Link ini tidak menuju ke mana-mana dan terlihat tidak profesional di toko live.

---

### P3-07: Navbar Template Tidak Memuat Kategori dari DB
**File:** Semua template

**Masalah:** Navbar semua template hanya menampilkan link statis seperti "Koleksi", "Produk", "Info", "Tentang". Tidak ada kategori dinamis dari tabel `product_categories`. Storefront live tampak sama untuk semua seller apapun kategori produknya.

**Solusi:** Fetch `product_categories` di page server component dan pass ke template untuk dirender di navbar.

---

## AUDIT FLOW END-TO-END

### Flow Seller (Onboarding → Buka Toko)
| Step | Status | Catatan |
|------|--------|---------|
| Register | ✅ OK | Sudah ada validasi WA, email |
| Onboarding | ✅ OK | Wizard berjalan |
| Dashboard | ✅ OK | Loading state ada |
| Tambah Produk | ⚠️ | Tidak ada back button, `alert()` untuk error |
| Setup Template | ✅ OK | Editor berfungsi |
| Publish Template | ⚠️ | Tidak ada cache revalidation (P1-06) |
| Setup Alamat | ⚠️ | Terblokir jika RajaOngkir gagal (P1-04) |
| Setup Pembayaran | ✅ OK | Bank transfer & QRIS berfungsi |

### Flow Pembeli (Buka Toko → Checkout)
| Step | Status | Catatan |
|------|--------|---------|
| Buka storefront | ✅ OK | Rendering cepat |
| Lihat produk | ✅ OK | ProductDrawer berfungsi |
| Tambah ke cart | ✅ OK | Zustand store berfungsi |
| Isi alamat | ✅ OK | Dropdown provinsi/kota/kec OK |
| Cari area ongkir | ⚠️🔴 | Jika API gagal → checkout buntu (P0-03) |
| Pilih kurir | ✅ OK (jika API berhasil) | |
| Pilih pembayaran | ✅ OK | QRIS, transfer, dll. |
| Upload bukti bayar | ⚠️🔴 | Link bukti publik bisa diakses siapapun (P0-02) |
| Redirect WA | ✅ OK | Pesan WA terformat dengan baik |

---

## TEMUAN TAMBAHAN: SKEMA DATABASE

### Kolom DB yang Tidak Terpakai Konsisten
- `stores.hero_title` dan `stores.hero_subtitle` — data ini juga ada di `template_customizations`. Terjadi duplikasi, tidak jelas mana yang diprioritaskan.
- `products.kategori` (TEXT) dan `products.category_id` (UUID FK) — ada dua cara menyimpan kategori. Form produk mengisi keduanya via `assignProductsToCategory()`, tapi jika seller tidak assign category, `category_id` tetap NULL.
- `orders` menyimpan `items` sebagai JSONB tapi juga ada tabel `order_items` terpisah. Keduanya diisi — duplikasi data.

### Missing Index
- `ro_locations(query)` sudah ada index — **OK**
- `products(store_id)` tidak ada index eksplisit di schema — bergantung pada FK index otomatis PostgreSQL
- `template_customizations(store_id, section_key, element_key, is_draft)` — composite index untuk PK sudah ada — **OK**

---

## STATUS RajaOngkir

| Aspek | Status | Detail |
|-------|--------|--------|
| Konfigurasi API Key | ⚠️ Opsional | Jika tidak ada, API return 503 dengan pesan jelas |
| Cache lokasi (7 hari) | ✅ Diimplementasikan | Via tabel `ro_locations` |
| Quota tracking | ✅ Diimplementasikan | Via `shipping_api_usage_logs` |
| Fallback manual | ✅ Diimplementasikan | Di server-side (`resolveShippingCost`) |
| Frontend error handling | 🔴 MISSING | `searchDestination` tidak handle HTTP error (P0-03) |
| Seller address setup | 🔴 BLOCKING | Seller blocked jika API down (P1-04) |

---

## REKOMENDASI PRIORITAS PERBAIKAN

### SEGERA (Minggu ini)
1. **P0-01**: Fix backdoor UUID invalid di `adminGuard()` → ganti dengan real UUID dari DB
2. **P0-03**: Fix `searchDestination` di CheckoutSummary → tambah `res.ok` check + auto-skip + error message
3. **P1-04**: Buat `selectedLocation` opsional di form alamat toko
4. **P0-02**: Evaluasi visibility bucket `proofs` — pertimbangkan signed URL

### BULAN INI (Sprint 1-2)
5. **P1-01**: Implementasikan rendering section FAQ di `TemplateExtraSections` + tambah fields konten ke contract
6. **P1-02**: Hapus duplikasi section promo di template Dapur
7. **P1-06**: Tambah `revalidatePath` setelah publish
8. **P1-03**: Ganti footer hardcoded dengan kategori dinamis dari DB
9. **P2-01**: Ganti semua `alert()` dan `confirm()` dengan modal/toast yang elegan

### DALAM 2-3 BULAN (Sprint 3-4)
10. **P2-04**: Implementasikan mekanisme restore stok saat order dibatalkan
11. **P2-06**: Tambah UI di admin panel untuk set `custom_domain` per toko
12. **P3-01-07**: Polish semua masalah UI/UX ringan

---

## CHECKLIST TESTING MANUAL (POST-FIX)

- [ ] Register akun baru → onboarding → buka dashboard tanpa error
- [ ] Tambah produk dengan varian → checkout → pesan WA berisi detail varian yang benar
- [ ] RajaOngkir tanpa API key → checkout → pembeli mendapat pesan "ongkir dikonfirmasi WA" tanpa buntu
- [ ] Admin login sebagai `bagasphensell@gmail.com` → masuk `/admin694` → tidak ada crash UUID
- [ ] Publish template dari editor → refresh storefront → perubahan langsung tampil
- [ ] Seller tanpa RajaOngkir key → isi form alamat → bisa simpan tanpa pilih lokasi API
- [ ] Buka link bukti pembayaran dari dashboard → konfirmasi apakah perlu autentikasi
- [ ] Footer storefront → klik link kategori → navigasi ke filter yang benar

---

*Laporan ini berdasarkan audit kode statis tanggal 22 Mei 2026. Setelah perbaikan, lakukan regression testing pada seluruh checklist di atas.*
