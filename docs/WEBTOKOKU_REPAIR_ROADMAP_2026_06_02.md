# WebTokoku Repair Roadmap - 2026-06-02

Dokumen ini mencatat rencana perbaikan besar WebTokoku berdasarkan audit ulang dan keputusan user. Pengerjaan wajib bertahap agar perubahan besar tidak merusak alur utama.

## Prinsip Pengerjaan

- Jangan mengerjakan semua modul sekaligus.
- Dahulukan bug nyata yang berdampak ke user, seller, order, pembayaran, keamanan, dan onboarding.
- Setiap batch harus dicatat: apa yang diubah, apa yang belum, dan hasil verifikasi.
- Fitur yang terlihat di UI harus benar-benar tersambung ke logic, database, dan pengalaman pengguna.
- UMKM awam harus bisa memakai sistem tanpa memahami format teknis.

## Prioritas Besar

### Batch 1 - Fondasi UX dan Bug Onboarding

Status: sebagian selesai pada batch pertama.

Target:
- Landing page setiap template hanya menampilkan 6 produk.
- Halaman semua produk tetap menjadi tempat melihat seluruh produk.
- Upload gambar hero saat onboarding tidak lagi memakai `temp-onboarding` yang gagal validasi ownership.
- Alamat hasil onboarding harus mengisi data toko sesuai input user, bukan hardcoded Jakarta.
- Kategori usaha harus disimpan sebagai data toko dan dipakai untuk SEO/metadata.
- Kategori usaha harus fleksibel: pilihan umum tersedia, tapi user tetap bisa isi sendiri.

Hasil batch pertama:
- Landing page catalog aktif di template Butik, Dapur, Luxe, Glow, dan Bazz dibatasi menjadi 6 produk.
- Halaman semua produk tetap menampilkan seluruh produk yang lolos batas plan.
- Upload hero onboarding memakai purpose `onboarding`, disimpan di folder user, dan tidak lagi butuh store existing.
- API onboarding menyimpan `kota` dan `alamat` dari input user, bukan hardcoded Jakarta.
- API onboarding mewajibkan kategori usaha dan alamat lengkap.
- Kategori usaha disimpan ke kolom `stores.business_category`.
- Metadata SEO halaman toko dan halaman produk memakai kategori usaha.
- Setup cepat admin tetap memakai default Jakarta jika alamat tidak diisi, dan kategori usaha default mengikuti template.

Catatan migration:
- Jalankan `supabase/migrations/step33_store_business_category.sql` sebelum deploy kode yang membaca `business_category`.

### Batch 2 - Form Produk dan Variasi Ecommerce

Status: tahap awal selesai, perlu lanjut ke preview/validasi dan checkout.

Yang sudah dikerjakan:
- Input variasi berbentuk teks teknis diganti menjadi `ProductOptionsBuilder`.
- Form tambah dan edit produk memakai builder yang sama.
- Seller bisa membuat grup variasi seperti warna, ukuran, porsi, shade, rasa, topping, material, dan custom.
- Setiap opsi bisa punya harga tambahan, berat tambahan, warna swatch, dan stok.
- Add-on bisa diinput lewat UI terstruktur dengan harga, status wajib, dan `max_qty`.
- Struktur data tetap memakai `option_groups` dan `addons`, sehingga schema tidak diguncang pada tahap ini.
- Form tambah/edit produk menormalisasi variasi dan add-on sebelum simpan: grup kosong dibuang, nama wajib dicek, minimal satu pilihan wajib ada, angka negatif dicegah, dan harga produk harus lebih dari 0.
- Verifikasi: `npx tsc --noEmit` lolos dan `git diff --check` lolos.

Yang masih perlu lanjut:
- Preview kombinasi variasi sebelum simpan belum dibuat.
- Stok kombinasi SKU belum dibuat; stok opsi tunggal sudah divalidasi di checkout.

### Batch 3 - Inventory dan Checkout

Status: tahap awal selesai, perlu lanjut ke stok kombinasi dan transaksi penuh.

Yang sudah dikerjakan:
- Add-on publik tidak lagi checkbox sederhana; pembeli bisa memilih jumlah sesuai `maxQty`.
- Add-on wajib otomatis terpilih minimal 1 dan tidak bisa dikurangi ke 0.
- Harga cart menghitung harga tambahan berdasarkan jumlah add-on.
- Cart dan pesan WhatsApp menampilkan jumlah add-on, misalnya `Extra sambal x2`.
- API order menghitung ulang harga variasi/add-on dari database, bukan dari harga frontend.
- API order memvalidasi variasi wajib, add-on wajib, batas maksimal add-on, dan stok opsi variasi.
- RPC `decrement_product_stock_with_options` dan `increment_product_stock_with_options` ditambahkan untuk mengurangi/mengembalikan stok produk utama sekaligus stok opsi variasi di `option_groups`.
- Checkout sekarang mengurangi stok sebelum order dibuat; jika insert order/order_items gagal, stok yang sudah dikurangi di-rollback.
- Dashboard pesanan saat membatalkan atau memulihkan order memakai RPC stok opsi agar pembatalan juga mengembalikan stok variasi.
- COD dari pengaturan pengiriman sekarang muncul sebagai metode bayar di checkout saat diaktifkan.
- Gratis ongkir dari `free_shipping_minimum` dihitung di checkout dan dihitung ulang di server order.
- Checkout tidak langsung redirect ke WhatsApp; setelah order tercatat, pembeli melihat halaman sukses berisi kode order dan tombol `Buka WhatsApp`.
- Verifikasi: `npx tsc --noEmit` lolos dan `git diff --check` lolos.

Catatan migration:
- Jalankan `supabase/migrations/step35_option_stock_rpc.sql`.

Yang masih perlu lanjut:
- Jika butuh kombinasi SKU seperti `Warna Hitam + Ukuran L`, perlu tabel/struktur variant combination yang lebih eksplisit.
- Order insert, order_items insert, dan pengurangan stok sudah dibuat lebih aman dengan rollback manual, tetapi belum benar-benar transaction database tunggal.
- Pickup sebagai metode pengiriman masih perlu dirapikan agar tidak tercampur dengan metode pembayaran ambil di toko.

### Batch 4 - Payment Proof dan Order Management

Status: tahap awal selesai, perlu lanjut ke aksi pembayaran seller.

Yang sudah dikerjakan:
- Bukti bayar baru disimpan sebagai storage path di `bukti_storage_path`.
- `bukti_url` untuk upload baru tidak lagi berisi signed URL panjang, tetapi path internal sebagai fallback kompatibilitas.
- API baru `/api/orders/payment-proof-url` membuat signed URL 10 menit untuk seller yang berhak mengakses order.
- Dashboard pesanan mengambil signed URL saat perlu menampilkan tombol bukti bayar.
- Pesan WhatsApp tidak lagi menampilkan path internal Supabase.
- Seller bisa menandai pembayaran sebagai `lunas` atau `ditolak` dari modal detail pesanan.
- Label status pembayaran di modal lebih spesifik: belum bayar, menunggu konfirmasi, lunas, atau bukti ditolak.
- Verifikasi: `npx tsc --noEmit` lolos dan `git diff --check` lolos.

Catatan migration:
- Jalankan `supabase/migrations/step34_order_payment_proof_path.sql`.

Yang masih perlu lanjut:
- Flow minta upload ulang belum dibuat; sementara seller bisa menolak bukti dan menghubungi pembeli via WhatsApp.
- Dashboard order masih mengambil semua order client-side; perlu pagination server-side saat data banyak.
- Existing order lama yang `bukti_url`-nya sudah signed URL tetap dibuka sebagai fallback.

### Batch 5 - Admin dan Operasional

Status: belum dikerjakan.

Target:
- Admin tetap powerful untuk developer tunggal, tetapi aksi destruktif harus lebih aman.
- Hardcoded email admin dipindahkan ke mekanisme bootstrap yang lebih bersih.
- Delete user perlu dikaji ulang: opsi suspend/soft delete, reset toko, atau hard delete dengan konfirmasi ketat.
- Super admin dashboard perlu pagination/lazy load agar tetap cepat saat data banyak.

### Batch 6 - Security dan Anti-Abuse

Status: belum dikerjakan.

Target:
- Rate limit endpoint publik: traffic analytics, shipping search, shipping cost, order, upload bukti bayar.
- Validasi lebih ketat untuk endpoint yang memakai service role.
- Audit RLS dan API ownership.
- Bahas keamanan menyeluruh setelah batch UX/fungsional utama lebih stabil.

### Batch 7 - UI Consistency dan Maintainability

Status: belum dikerjakan.

Target:
- Kurangi inline style besar di dashboard.
- Standarkan komponen button, input, card, modal, toast, loading, empty state.
- Hapus atau arsipkan flow katalog/checkout lama yang tidak dipakai produksi.
- Rapikan copy agar formal, jelas, dan tidak terasa seperti teks AI/marketing berlebihan.

## Keputusan User

- Admin untuk saat ini cukup developer/user utama, belum perlu role granular kompleks.
- Admin tetap harus leluasa mengelola platform tanpa buka database/coding.
- User harus wajib isi alamat saat daftar/onboarding karena dipakai untuk hitung ongkir otomatis.
- Jika admin membuat toko lewat setup cepat dan alamat tidak diisi, default boleh Jakarta.
- Kategori usaha dipakai untuk SEO dan boleh input manual.
- Fokus awal: jangan tambah fitur baru sebelum flow utama benar.

## Catatan Risiko

- Perubahan variasi dan stok bisa berdampak besar ke checkout, cart, order_items, dan UI produk.
- Perubahan order transaction perlu hati-hati karena menyentuh data uang dan stok.
- Perubahan delete user perlu keputusan produk: apakah user menghapus akun sendiri, reset toko, atau request ke admin.

## Verifikasi Sesi Ini

- `npx tsc --noEmit` lolos setelah Batch 1, 2, 3, dan 4.
- `git diff --check` lolos; warning yang muncul hanya normalisasi LF/CRLF di Windows.
- `npm run build` lolos pada 3 Juni 2026.
- Build masih menghasilkan warning lint lama, terutama penggunaan `<img>` dan beberapa dependency hook. Warning tersebut belum dibersihkan semua karena tidak boleh mengalihkan fokus dari logic produk, checkout, dan pembayaran.
