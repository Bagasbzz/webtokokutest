# Session Audit 2026-05-19 - Product System

## Konteks

Repo terbaru sudah ditarik dari `Bazzcuy/webtokoku.git`. Dokumen Markdown dibaca ulang sebelum coding. Dokumen lama di `docs/archive/legacy-plans` tetap dianggap histori, bukan sumber kebenaran utama, karena beberapa status "complete" tidak selalu cocok dengan kode aktif.

## Yang Sudah Dikerjakan

- Pull terbaru berhasil masuk ke branch `main`.
- Dependency lokal diperbarui dengan `npm install` karena build gagal mencari `tailwindcss`.
- Audit kode produk, kategori, template, landing, upload, admin guard, onboarding, dan checkout.
- Form tambah/edit produk sekarang membuat atau memakai kategori dari tabel `product_categories`, bukan hanya teks bebas di kolom `products.kategori`.
- Dashboard produk diberi search dan filter kategori agar katalog besar tetap mudah dicari.
- Halaman publik `/{slug}/produk` diberi search produk.
- Landing tiap template dibatasi maksimal 6 produk. Seller bisa memilih produk mana yang tampil di halaman utama dari form tambah/edit produk.
- Produk bisa diberi label seperti `Best seller`, `Terlaris`, atau `Promo`, serta harga sebelum diskon untuk tampilan harga coret.
- Produk yang tidak ditampilkan di landing tetap muncul di halaman semua produk `/{slug}/produk`.
- Onboarding API sekarang menyimpan kategori, tipe produk, variasi, add-on, detail produk, stok, berat, dan deskripsi untuk produk awal.
- Product drawer publik sekarang mendukung pilihan variasi dari beberapa grup sekaligus, misalnya ukuran dan warna.
- Add-on produk sekarang bisa dipilih sebelum masuk keranjang.
- Checkout mengirim detail variasi dan add-on ke API order.
- API order menghitung ulang harga variasi dan add-on dari data database, bukan mempercayai total dari frontend.
- Dokumentasi admin diperbarui: admin memakai email `bagasphensell@gmail.com`, password `<REDACTED>`, lalu role dinaikkan dengan `sellers.role = 'admin'`.

## Hal Yang Masih Perlu Dicek di Supabase/Vercel

- Pastikan migration `supabase/migrations/step24_product_options_categories.sql` sudah dijalankan di Supabase production.
- Pastikan migration `supabase/migrations/step25_homepage_product_controls.sql` sudah dijalankan di Supabase production.
- Pastikan migration admin/feature flag sudah punya kolom `sellers.role`.
- Pastikan akun `bagasphensell@gmail.com` sudah ada di Supabase Auth dan tabel `sellers`.
- Pastikan SQL promosi admin sudah dijalankan. Versi lengkap ada di `docs/ADMIN_SETUP.md`; minimal jika baris `sellers` sudah ada:

```sql
update public.sellers
set role = 'admin'
where email = 'bagasphensell@gmail.com';
```

- Pastikan Vercel punya env:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
  - `TURNSTILE_SECRET_KEY`
  - `RAJAONGKIR_API_KEY`
  - `RAJAONGKIR_BASE_URL`
  - `RAJAONGKIR_DAILY_LIMIT`

## Keluhan User Yang Harus Dijaga

- Jangan mengklaim fitur selesai hanya karena UI sudah ada.
- Jangan membuat teks terlalu lebay atau terasa seperti template AI.
- Jangan membuat user harus mencari data besar tanpa search/filter.
- Jangan membuat upload file harus input URL manual jika bisa memakai upload.
- Jangan membiarkan aksi penting tanpa feedback sukses/gagal/loading.
- Jangan membuat admin guard hanya dari tampilan frontend.
- Jangan percaya harga, stok, berat, subtotal, atau total dari frontend.
- Jangan biarkan gambar template rusak atau preview tidak sesuai tampilan aktual.

## Keputusan Teknis

- Kategori produk tetap memakai tabel `product_categories`; kategori kosong tidak tampil karena halaman publik mengambil kategori dari produk aktif yang punya kategori.
- Kategori baru dapat dibuat dari form produk saat seller mengetik nama kategori baru.
- Variasi produk disimpan di `products.option_groups` sebagai JSONB agar fleksibel untuk fashion, makanan, skincare, beauty, kesehatan, dan kategori lain.
- Add-on disimpan di `products.addons` sebagai JSONB.
- Detail produk spesifik kategori disimpan di `products.product_details`.
- Order tetap divalidasi server-side dan harga variasi/add-on dihitung ulang dari JSONB produk.

## Risiko Tersisa

- Manajemen kategori khusus, seperti rename/delete kategori massal, belum dibuat sebagai halaman sendiri.
- Kombinasi varian belum menjadi SKU matriks penuh seperti marketplace besar. Sistem saat ini mendukung multi-grup pilihan dan delta harga/stok per pilihan.
- Add-on saat ini dipilih sekali per item; kuantitas add-on lebih dari satu belum dibuat.
- Build production lokal sudah berhasil. Warning yang tersisa adalah warning lint lama tentang `<img>` dan beberapa dependency React Hook.

## Rencana Lanjutan

1. Screenshot ulang landing, template section, pilihan template onboarding, dan halaman produk publik.
2. Jika dibutuhkan, buat halaman khusus manajemen kategori produk.
3. Jika toko butuh SKU marketplace penuh, tambah tabel/JSON kombinasi varian dengan harga, stok, berat, dan foto per kombinasi.
