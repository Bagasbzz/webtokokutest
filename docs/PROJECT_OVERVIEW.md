# 📖 PROJECT OVERVIEW — webtokoku

> **webtokoku** adalah platform SaaS website builder yang memungkinkan UMKM Indonesia membuat toko online profesional dalam 10 menit — tanpa coding, tanpa developer, tanpa potongan komisi. Seller daftar, pilih template, isi produk, publish. Semua pesanan masuk langsung via WhatsApp.

**Tagline:** *"Bukan Sekadar Link di Bio. Ini Toko Online Profesionalmu."*

---

## 🎯 Value Proposition

| Masalah di Marketplace | Solusi webtokoku |
|---|---|
| Potongan komisi 3–15% | 0% potongan, seller terima penuh |
| Data pelanggan milik marketplace | Data pelanggan milik seller |
| Algoritma berubah, toko tenggelam | Link toko sendiri, bebas algoritma |
| Tampilan toko seragam | 5 template premium berkualitas tinggi |
| Butuh developer untuk buat website | Bangun toko sendiri dalam 10 menit |

**Posisi:** Pelengkap marketplace, bukan pengganti. Marketplace untuk akuisisi pelanggan baru, webtokoku untuk repeat order dan brand building.

---

## 👥 Target Users

**Seller (User Utama):**
- Pelaku UMKM Indonesia (kuliner, fashion, skincare, kosmetik, kesehatan)
- Seller marketplace yang ingin punya toko mandiri
- Pebisnis kecil yang jualan via WhatsApp / Instagram

**Admin Platform:**
- Pemilik webtokoku — memantau user, toko, template, dan sistem

---

## 🛒 Cara Kerja

```
Seller Daftar → Isi Info Toko → Pilih Template → Kustomisasi
→ Isi Katalog Produk → Preview → Publish → Website Aktif
```

**Checkout pembeli:**
```
Lihat Katalog → Tambah ke Keranjang → Isi Alamat → Pilih Kurir
→ Upload Bukti Bayar (QRIS) → Auto-redirect WhatsApp Seller
```

---

## ✅ MVP Features (Status: COMPLETED)

| Fitur | Status |
|---|---|
| Registrasi & Login Seller | ✅ Live |
| Onboarding Buat Toko (multi-step) | ✅ Live |
| 5 Template Premium (React dinamis) | ✅ Live |
| CRUD Produk + Upload Foto | ✅ Live |
| Halaman Toko Publik (Multi-tenant `/[slug]`) | ✅ Live |
| Dashboard Seller (stats, produk, pengaturan) | ✅ Live |
| Landing Page Premium (`app/page.tsx`) | ✅ Live |
| Interactive Demo Mode (`/inidemo/`) | ✅ Live |
| Universal Catalog + WhatsApp Checkout | ✅ Live |
| QRIS Manual + Order Management | ✅ Live |
| API Route `/api/orders` (server-side validation) | ✅ Live |
| Responsive Dashboard (mobile/tablet) | ✅ Live |

---

## 🗺️ Roadmap (Post-MVP)

| Prioritas | Fitur | Status |
|---|---|---|
| 🔴 P0 | Integrasi API.co.id (Ongkir Otomatis) | 🔧 API route ready, perlu integrasi UI |
| 🟡 P1 | Visual Template Editor (Click-to-Edit) | 📋 Planned |
| 🟡 P1 | Dashboard Admin Platform | ❌ Belum |
| 🟡 P1 | Analytics Dashboard Seller | ❌ Belum |
| 🟡 P1 | Custom Domain | ❌ Belum |
| 🟢 P2 | Notifikasi WhatsApp Otomatis | ❌ Belum |
| 🟢 P2 | Marketplace Sync (Shopee, TikTok) | ❌ Belum |
| ~~P0~~ | ~~Payment Gateway (Midtrans)~~ | ⏭️ Skip (butuh verifikasi bisnis) |

---

## 🏗️ Tech Stack

| Komponen | Teknologi |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password) |
| Storage | Supabase Storage (foto produk, bukti bayar) |
| Hosting | Vercel (auto-deploy dari GitHub) |
| Styling | CSS Modules + Inline Styles |
| Icons | Lucide React + Font Awesome |
| Shipping API | API.co.id (cek ongkir) |

---

## 🎨 Template yang Tersedia

| Template | Kategori | Accent Color | Font |
|---|---|---|---|
| Dapur Nusantara | Kuliner / F&B | `#D86B43` (Orange) | Playfair Display + Plus Jakarta Sans |
| Butik Hana | Fashion / Pakaian | `#16A34A` (Green) | Outfit + Inter |
| Glow Lab | Skincare / Beauty | Sage Green | DM Sans |
| Luna Beauty | Kosmetik Modern | Pink/Rose | Poppins |
| Bazzhealth | Apotek / Kesehatan | Forest Green | Montserrat |

Semua template:
- 100% mereplikasi desain orisinal dari `public/demo/`
- Menerima data dinamis dari Supabase (nama toko, produk, warna tema, font)
- Menggunakan `UniversalCatalog` sebagai checkout engine yang seragam

---

## 🔐 Keamanan

- **RLS (Row Level Security)** aktif pada semua tabel — seller hanya akses data sendiri
- **SUPABASE_SERVICE_ROLE_KEY** hanya di server-side (API Routes), dilarang di frontend
- **Bucket `payment-proofs`** bersifat PRIVATE
- **Server-side price recalculation** — total harga dihitung ulang di `/api/orders`
- **HTTPS** enforced via Vercel

---

## 🌐 URL Structure

```
webtokoku.my.id/                    ← Landing Page
webtokoku.my.id/auth/login          ← Login Seller
webtokoku.my.id/auth/register       ← Register Seller
webtokoku.my.id/onboarding          ← Setup Toko Pertama
webtokoku.my.id/dashboard           ← Dashboard Seller
webtokoku.my.id/dashboard/pesanan   ← Manajemen Pesanan
webtokoku.my.id/[namatoko]          ← Website Toko Publik
webtokoku.my.id/inidemo/            ← Demo Mode (Isolated)
```

---

## 💰 Business Model (Planned)

| Tier | Harga | Fitur |
|---|---|---|
| Free | Rp 0 | 1 toko, 20 produk, template dasar |
| Pro | ~Rp 50-100rb/bulan | Unlimited produk, custom domain, analytics |
| Business | TBD | Multi-toko, API access, priority support |

**Infrastruktur saat ini:** Free tier Supabase + Vercel cukup untuk ~10-30 toko aktif. Upgrade ke Pro saat ada user berbayar.

---

## Update 2026-05-19: Ongkir Otomatis

- Provider ongkir aktif yang ditargetkan sekarang adalah RajaOngkir/Komerce Shipping Cost API, bukan API.co.id lama.
- Endpoint server aktif:
  - `/api/shipping/search` untuk mencari destination id.
  - `/api/shipping/cost` untuk menghitung ongkir domestik.
  - `/api/shipping/apico-cost` hanya legacy compatibility.
- Auto shipping berjalan hanya jika:
  - admin menyalakan global feature flag `auto_shipping`;
  - seller menyalakan `auto_shipping_enabled` di Pengaturan Pengiriman;
  - `RAJAONGKIR_API_KEY` sudah diisi di Vercel;
  - alamat asal toko punya `subdistrict_id`;
  - kuota harian belum habis.
- Jika salah satu syarat gagal, checkout tetap menerima order dan menulis catatan bahwa ongkir dikonfirmasi seller lewat WhatsApp.
