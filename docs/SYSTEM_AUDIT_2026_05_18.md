# System Audit 2026-05-18

Audit ini dibuat setelah masukan user tentang UI yang masih terasa template AI, preview template yang tidak sesuai, demo yang belum representatif, dashboard yang belum ergonomis, produk yang belum lengkap, payment, domain, notifikasi, akun, dan integrasi RajaOngkir/Komerce.

## Prioritas P0

1. Sidebar dashboard seller dan admin harus bisa scroll, lebih rapat, dan tombol keluar tidak boleh kepotong layar.
2. Form produk harus punya stok yang bisa diatur karena tabel `products.stok` sudah tersedia dan checkout sudah memakai stok untuk pembatasan jumlah.
3. Onboarding setelah pilih template harus menampilkan preview template asli yang dipilih, bukan preview generik. Input awal cukup: info toko, alamat/kontak, produk awal, gambar hero, judul utama, deskripsi, warna.
4. Screenshot preview template desktop dan mobile harus dibuat ulang dari template terbaru agar kartu template di pendaftaran dan landing sesuai tampilan asli.
5. Demo harus menjadi alur demo produk yang benar: daftar, data auto-fill saat user klik layar, onboarding, dashboard, edit template, produk, checkout, dan admin, dengan aksi dibatasi tapi tampilan tetap asli.

## Prioritas P1

1. Produk perlu field lebih lengkap:
   - stok
   - berat gram
   - SKU/kode produk
   - varian seperti ukuran, warna, rasa, porsi, level pedas, paket
   - harga varian jika diperlukan
   - status aktif, habis, pre-order
   - galeri foto
   - catatan packing/pengiriman
2. Payment perlu mendukung:
   - transfer bank: nama bank, nama rekening, nomor rekening
   - QRIS upload manual
   - e-wallet: provider, nama akun, nomor
   - ambil di toko: kode ambil, instruksi, jam ambil
   - semua metode tetap masuk ke WhatsApp dengan format pesanan yang rapi.
3. Data toko harus satu sumber:
   - data alamat/kontak saat daftar harus tersimpan ke `stores` dan `store_addresses`
   - halaman pengaturan tidak boleh meminta ulang data yang sama secara terpisah
   - URL Google Maps harus memakai field yang sama di onboarding, pengaturan, dan template.
4. Template editor perlu toggle CTA/section yang konsisten di semua template.
5. Domain education perlu ditambah setelah publish dan di pengaturan:
   - domain bawaan `slug.webtokoku.id`
   - fungsi domain untuk brand dan link toko
   - opsi beli domain di penyedia seperti Hostinger, IDWebHost, Niagahoster, Rumahweb
   - cara menghubungkan CNAME/A record ke webtokoku
   - status verifikasi domain.

## Prioritas P2

1. Delete akun user:
   - perlu endpoint server memakai service role
   - soft-delete data toko dulu atau hard-delete sesuai keputusan produk
   - setelah delete, email bisa dipakai daftar ulang.
2. Notifikasi:
   - pesanan baru
   - bukti pembayaran masuk
   - stok hampir habis
   - domain belum valid
   - setting pengiriman/payment belum lengkap
3. Integrasi RajaOngkir/Komerce:
   - gunakan env `APICO_API_KEY`
   - endpoint repo sekarang masih memakai `use.api.co.id`
   - perlu verifikasi format response dari dokumentasi Komerce/RajaOngkir terbaru
   - sandbox/live mode harus jelas di admin/platform settings
   - admin bisa mengatur courier aktif dan ongkir otomatis global/per toko.

## Catatan Keamanan

Screenshot yang dikirim menampilkan API key Komerce. Key yang terlihat di chat/screenshot sebaiknya di-rotate dari dashboard Komerce sebelum dipakai production.

## Perubahan Cepat yang Sudah Diambil

- Sidebar dashboard seller dibuat lebih rapat dan scrollable.
- Sidebar admin dibuat lebih rapat dan scrollable.
- Form tambah/edit produk mulai menyimpan `stok` ke tabel `products`.
- Preview onboarding sekarang memakai template asli yang dipilih, termasuk preview mobile dan preview sebelum publish.
- Pengaturan Toko sekarang punya edukasi domain/hosting, domain bawaan, DNS dasar, dan referensi tempat beli domain.
- Pengaturan Pembayaran mulai mendukung transfer bank, QRIS, e-wallet, dan ambil di toko; checkout mengirim format WhatsApp yang lebih lengkap.
- Dokumentasi audit ini dibuat agar perubahan besar berikutnya tidak tercecer.

## Update 2026-05-19

- Integrasi ongkir otomatis sudah diarahkan ke RajaOngkir/Komerce Shipping Cost API.
- API key tidak dipakai di frontend; semua request melewati route server `/api/shipping/search` dan `/api/shipping/cost`.
- Toggle admin `auto_shipping` menjadi saklar utama. Jika OFF, semua toko otomatis fallback ke ongkir konfirmasi WhatsApp.
- Toggle seller `shipping_settings.auto_shipping_enabled` menjadi saklar per toko. Seller tidak bisa benar-benar mengaktifkan ongkir kalau global admin OFF.
- Limit 100 hit/hari dijaga lewat tabel `shipping_api_usage_logs`; jika kuota habis, checkout menampilkan pesan fallback dan order tetap bisa masuk.
- Dashboard seller dan admin terhubung ke akun:
  - seller dashboard memakai Supabase Auth + `getMyStore()` sehingga data toko mengikuti user login;
  - admin dashboard memakai server-side `adminGuard()` dan hanya terbuka untuk `sellers.role = admin`.
- Maintenance mode tidak wajib dipakai untuk setiap pengembangan. Jika `maintenance_mode` ON, toko publik dan dashboard user diarahkan ke halaman maintenance, sementara `/admin` tetap bisa dibuka untuk memulihkan sistem.
