/**
 * TEMPLATE EDITABLES — Phase 4B Content Contract
 * 
 * Semua 5 template memiliki 15 section wajib dengan struktur seragam:
 * header, hero, value_props, featured_categories, catalog, promo,
 * reviews, brand_story, brand_gallery, location, contact, faq, footer
 */

export type EditableElementType = 
  | 'text' 
  | 'textarea' 
  | 'richtext'
  | 'image' 
  | 'color'
  | 'gradient'
  | 'toggle' 
  | 'link'
  | 'video';

export interface EditableElement {
  section: string;      // section key: 'hero', 'promo', 'reviews', dll
  element: string;      // element key: 'title', 'subtitle', 'image_url', dll
  type: EditableElementType;
  label: string;
  default_value?: string;
  helperText?: string;
  maxLength?: number;
  required?: boolean;
}

/**
 * 15 SECTION WAJIB SEMUA TEMPLATE:
 * 1. header (wajib, no toggle)
 * 2. hero
 * 3. value_props
 * 4. featured_categories
 * 5. catalog
 * 6. promo
 * 7. reviews
 * 8. brand_story
 * 9. brand_gallery
 * 10. location
 * 11. contact (wajib, no toggle)
 * 12. faq
 * 13. footer (wajib, no toggle)
 */

export const TEMPLATE_EDITABLES: Record<string, EditableElement[]> = {
  dapur: [
    { section: 'hero', element: 'title', type: 'text', label: 'Judul Hero', default_value: 'Masakan rumahan siap dipesan.' },
    { section: 'hero', element: 'subtitle', type: 'textarea', label: 'Subjudul Hero', default_value: 'Menu harian, paket makan, dan pesanan khusus bisa dicek langsung dari katalog.' },
    { section: 'hero', element: 'bg_image_url', type: 'image', label: 'Background Foto Hero (Opsional)', helperText: 'Foto latar belakang paling luas. Jika diisi, akan menggantikan warna background bawaan.' },
    { section: 'hero', element: 'image_url', type: 'image', label: 'Gambar Utama Hero', default_value: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=1000&auto=format&fit=crop', helperText: 'Rekomendasi 1600 x 1200 px atau rasio 4:3.' },
    { section: 'hero', element: 'float_image_url', type: 'image', label: 'Gambar Mengambang', default_value: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop', helperText: 'Rekomendasi 1000 x 1200 px atau rasio 4:5.' },
    { section: 'hero', element: 'spin_text', type: 'text', label: 'Teks Melingkar', default_value: 'MENU HARIAN - ORDER WA -' },
    
    { section: 'menu', element: 'visible', type: 'toggle', label: 'Tampilkan Katalog Menu', default_value: 'true' },
    { section: 'menu', element: 'title', type: 'text', label: 'Judul Menu', default_value: 'Menu yang tersedia' },
    { section: 'menu', element: 'description', type: 'textarea', label: 'Deskripsi Menu', default_value: 'Cek pilihan menu, harga, dan stok sebelum menghubungi admin.' },
    { section: 'menu', element: 'show_categories', type: 'toggle', label: 'Tampilkan Filter Kategori', default_value: 'true', helperText: 'Kategori muncul otomatis dari produk yang sudah dibuat.' },
    
    { section: 'promo', element: 'visible', type: 'toggle', label: 'Tampilkan Promo', default_value: 'true' },
    { section: 'promo', element: 'title', type: 'text', label: 'Judul Promo Section', default_value: 'Info pesanan' },
    { section: 'promo', element: 'image_url', type: 'image', label: 'Gambar Promo', default_value: 'https://images.unsplash.com/photo-1627042633145-b780d842ba45?q=80&w=1000&auto=format&fit=crop', helperText: 'Rekomendasi 1600 x 900 px.' },
    { section: 'promo', element: 'badge', type: 'text', label: 'Badge Promo', default_value: 'PESANAN HARI INI' },
    { section: 'promo', element: 'main_title', type: 'richtext', label: 'Judul Utama Promo', default_value: 'Order<br/>rombongan' },
    { section: 'promo', element: 'main_desc', type: 'textarea', label: 'Deskripsi Promo', default_value: 'Untuk acara kantor, keluarga, atau komunitas, hubungi admin agar jumlah dan jadwalnya bisa dicatat.' },
    { section: 'promo', element: 'box1_title', type: 'text', label: 'Judul Fitur 1', default_value: 'Opsi kirim' },
    { section: 'promo', element: 'box1_desc', type: 'textarea', label: 'Deskripsi Fitur 1', default_value: 'Pengiriman bisa disesuaikan dengan jarak dan jam produksi toko.' },
    { section: 'promo', element: 'box2_title', type: 'text', label: 'Judul Fitur 2', default_value: 'Pesan via WA' },
    { section: 'promo', element: 'box2_desc', type: 'textarea', label: 'Deskripsi Fitur 2', default_value: 'Tanya stok, jadwal masak, atau pesanan khusus langsung lewat WhatsApp.' },
    
    { section: 'outlet', element: 'visible', type: 'toggle', label: 'Tampilkan Kontak Outlet', default_value: 'true' },
    { section: 'outlet', element: 'title', type: 'text', label: 'Judul Outlet', default_value: 'Info toko' },
    { section: 'outlet', element: 'subtitle', type: 'text', label: 'Subjudul Outlet', default_value: 'Cek area layanan dan hubungi admin sebelum order.' },
  ],
  butik: [
    { section: 'hero', element: 'title', type: 'text', label: 'Judul Hero', default_value: 'Butik Hana' },
    { section: 'hero', element: 'subtitle', type: 'textarea', label: 'Subjudul Hero', default_value: 'Pilihan pakaian dan aksesori yang mudah dipakai untuk acara harian maupun momen khusus.' },
    { section: 'hero', element: 'bg_image_url', type: 'image', label: 'Background Foto Hero (Opsional)', helperText: 'Foto latar belakang paling luas. Jika diisi, akan menggantikan warna background bawaan.' },
    { section: 'hero', element: 'image_url', type: 'image', label: 'Gambar/Video Hero', default_value: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop', helperText: 'Rekomendasi 1600 x 1200 px atau rasio 4:3.' },
    
    { section: 'catalog', element: 'title', type: 'text', label: 'Judul Katalog', default_value: 'Katalog' },
    { section: 'catalog', element: 'show_categories', type: 'toggle', label: 'Tampilkan Filter Kategori', default_value: 'true', helperText: 'Kategori muncul otomatis dari produk yang sudah dibuat.' },
    
    { section: 'split', element: 'visible', type: 'toggle', label: 'Tampilkan Detail Produk', default_value: 'true' },
    { section: 'split', element: 'subtitle', type: 'text', label: 'Subjudul Info', default_value: 'Detail produk' },
    { section: 'split', element: 'title', type: 'text', label: 'Judul Info', default_value: 'Bahan, potongan, dan ukuran' },
    { section: 'split', element: 'description', type: 'textarea', label: 'Deskripsi Info', default_value: 'Kami menampilkan detail bahan, ukuran, dan cara perawatan supaya pelanggan lebih mudah memilih sebelum order.' },
    { section: 'split', element: 'image_url', type: 'image', label: 'Gambar Info', default_value: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop', helperText: 'Rekomendasi 1200 x 900 px.' },
    
    { section: 'masterpiece', element: 'visible', type: 'toggle', label: 'Tampilkan Tentang Koleksi', default_value: 'true' },
    { section: 'masterpiece', element: 'image_url', type: 'image', label: 'Gambar Tentang Koleksi', default_value: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1200&auto=format&fit=crop', helperText: 'Rekomendasi 1200 x 900 px.' },
    { section: 'masterpiece', element: 'title', type: 'text', label: 'Judul Tentang Koleksi', default_value: 'Tentang koleksi' },
    { section: 'masterpiece', element: 'description', type: 'textarea', label: 'Deskripsi Tentang Koleksi', default_value: 'Koleksi disusun agar mudah dipadukan. Cek katalog untuk warna, ukuran, dan stok yang tersedia.' },
  ],
  glow: [
    { section: 'hero', element: 'badge', type: 'text', label: 'Badge Hero', default_value: 'Katalog skincare' },
    { section: 'hero', element: 'title', type: 'text', label: 'Judul Hero', default_value: 'Glow Lab' },
    { section: 'hero', element: 'subtitle', type: 'textarea', label: 'Subjudul Hero', default_value: 'Produk perawatan kulit untuk rutinitas harian. Cek katalog dan tanyakan kecocokan produk lewat WhatsApp.' },
    { section: 'hero', element: 'bg_image_url', type: 'image', label: 'Background Foto Hero (Opsional)', helperText: 'Foto latar belakang paling luas. Jika diisi, akan menggantikan warna background bawaan.' },
    { section: 'hero', element: 'image_url', type: 'image', label: 'Gambar Produk Hero', default_value: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1000&auto=format&fit=crop', helperText: 'Rekomendasi 1600 x 1200 px atau rasio 4:3.' },
    { section: 'hero', element: 'texture_image_url', type: 'image', label: 'Gambar Tekstur Mengambang', default_value: 'https://images.unsplash.com/photo-1596462502277-27bfdc403348?q=80&w=800&auto=format&fit=crop', helperText: 'Gambar mengambang kecil di bagian bawah. Rekomendasi 800 x 1000 px atau rasio 4:5.' },
    { section: 'hero', element: 'note1', type: 'text', label: 'Catatan Hero 1', default_value: 'Tanpa parfum' },
    { section: 'hero', element: 'note2', type: 'text', label: 'Catatan Hero 2', default_value: 'Untuk pemakaian harian' },
    { section: 'hero', element: 'note3', type: 'text', label: 'Catatan Hero 3', default_value: 'Chat admin sebelum order' },
    
    { section: 'catalog', element: 'title', type: 'text', label: 'Judul Katalog', default_value: 'Koleksi Terpilih' },
    { section: 'catalog', element: 'show_categories', type: 'toggle', label: 'Tampilkan Filter Kategori', default_value: 'true', helperText: 'Kategori muncul otomatis dari produk yang sudah dibuat.' },
    { section: 'banner', element: 'visible', type: 'toggle', label: 'Tampilkan Banner Masalah', default_value: 'true' },
    { section: 'banner', element: 'title', type: 'text', label: 'Judul Banner Masalah', default_value: 'Pilih sesuai kebutuhan kulit' },
    { section: 'banner', element: 'description', type: 'textarea', label: 'Deskripsi Banner Masalah', default_value: 'Baca deskripsi produk dan tanyakan ke admin bila ragu memilih varian.' },
    
    { section: 'routine', element: 'visible', type: 'toggle', label: 'Tampilkan Informasi Rutin', default_value: 'true' },
    { section: 'routine', element: 'title', type: 'text', label: 'Judul Informasi', default_value: 'Informasi Penting' },
    { section: 'routine', element: 'image_url', type: 'image', label: 'Gambar Informasi', default_value: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=1000&auto=format&fit=crop', helperText: 'Rekomendasi 1200 x 900 px.' },
    { section: 'routine', element: 'step1_title', type: 'text', label: 'Judul Poin 1', default_value: 'Info produk' },
    { section: 'routine', element: 'step1_desc', type: 'textarea', label: 'Deskripsi Poin 1', default_value: 'Setiap produk bisa dilengkapi deskripsi, harga, dan stok.' },
    { section: 'routine', element: 'step2_title', type: 'text', label: 'Judul Poin 2', default_value: 'Layanan Pelanggan' },
    { section: 'routine', element: 'step2_desc', type: 'textarea', label: 'Deskripsi Poin 2', default_value: 'Tim admin kami siap membantu pertanyaan dan keluhan Anda setiap hari kerja melalui WhatsApp.' },
    { section: 'routine', element: 'step3_title', type: 'text', label: 'Judul Poin 3', default_value: 'Packing rapi' },
    { section: 'routine', element: 'step3_desc', type: 'textarea', label: 'Deskripsi Poin 3', default_value: 'Tambahkan info pengemasan dan pengiriman agar pembeli lebih tenang.' },
    
    { section: 'reviews', element: 'visible', type: 'toggle', label: 'Tampilkan Ulasan', default_value: 'true' },
    { section: 'reviews', element: 'title', type: 'text', label: 'Judul Ulasan', default_value: 'Catatan pelanggan' },
    { section: 'reviews', element: 'subtitle', type: 'text', label: 'Subjudul Ulasan', default_value: 'Tampilkan testimoni asli dari pelanggan toko.' },
    { section: 'reviews', element: 'item1_name', type: 'text', label: 'Ulasan 1 - Nama', default_value: 'Rani, Bandung' },
    { section: 'reviews', element: 'item1_text', type: 'textarea', label: 'Ulasan 1 - Isi', default_value: 'Teksturnya ringan, gampang dipakai pagi, dan kulitku keliatan lebih tenang.' },
  ],
  herba: [
    { section: 'topbar', element: 'text1', type: 'text', label: 'Teks Topbar 1', default_value: 'Berizin Resmi Kemenkes RI' },
    { section: 'topbar', element: 'text2', type: 'text', label: 'Teks Topbar 2', default_value: 'Garansi 100% Asli' },
    { section: 'topbar', element: 'text3', type: 'text', label: 'Teks Topbar 3', default_value: 'Buka Setiap Hari 24 Jam' },
    
    { section: 'hero', element: 'badge', type: 'text', label: 'Badge Hero', default_value: 'Katalog kesehatan' },
    { section: 'hero', element: 'title', type: 'richtext', label: 'Judul Hero', default_value: 'Produk kesehatan siap dicek' },
    { section: 'hero', element: 'subtitle', type: 'textarea', label: 'Subjudul Hero', default_value: 'Lihat katalog produk, cek ketersediaan, dan hubungi admin sebelum membeli.' },
    { section: 'hero', element: 'bg_image_url', type: 'image', label: 'Background Foto Hero (Opsional)', helperText: 'Foto latar belakang paling luas. Jika diisi, akan menggantikan warna background bawaan.' },
    { section: 'hero', element: 'image_url', type: 'image', label: 'Gambar Latar Hero', default_value: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=1400&auto=format&fit=crop', helperText: 'Rekomendasi 1600 x 1200 px atau rasio 4:3.' },
    
    { section: 'catalog', element: 'title', type: 'text', label: 'Judul Katalog', default_value: 'Katalog yang sering dicari' },
    { section: 'catalog', element: 'show_categories', type: 'toggle', label: 'Tampilkan Filter Kategori', default_value: 'true', helperText: 'Kategori muncul otomatis dari produk yang sudah dibuat.' },
    
    { section: 'features', element: 'visible', type: 'toggle', label: 'Tampilkan Keunggulan', default_value: 'true' },
    { section: 'features', element: 'feat1_title', type: 'text', label: 'Judul Fitur 1', default_value: 'Info produk' },
    { section: 'features', element: 'feat1_desc', type: 'text', label: 'Deskripsi Fitur 1', default_value: 'Cantumkan stok, varian, dan catatan penggunaan.' },
    { section: 'features', element: 'feat2_title', type: 'text', label: 'Judul Fitur 2', default_value: 'Pengiriman' },
    { section: 'features', element: 'feat2_desc', type: 'text', label: 'Deskripsi Fitur 2', default_value: 'Jelaskan area layanan dan estimasi kirim.' },
    { section: 'features', element: 'feat3_title', type: 'text', label: 'Judul Fitur 3', default_value: 'Tanya admin' },
    { section: 'features', element: 'feat3_desc', type: 'text', label: 'Deskripsi Fitur 3', default_value: 'Pembeli bisa bertanya dulu lewat WhatsApp.' },
    
    { section: 'consult', element: 'visible', type: 'toggle', label: 'Tampilkan Konsultasi', default_value: 'true' },
    { section: 'consult', element: 'title', type: 'text', label: 'Judul Konsultasi', default_value: 'Butuh bantuan memilih produk?' },
    { section: 'consult', element: 'description', type: 'textarea', label: 'Deskripsi Konsultasi', default_value: 'Kirim pertanyaan ke WhatsApp agar admin bisa membantu mengecek produk yang tersedia.' },
    { section: 'consult', element: 'image_url', type: 'image', label: 'Gambar Konsultasi', default_value: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&auto=format&fit=crop', helperText: 'Rekomendasi 1200 x 900 px.' },
  ],
  luxe: [
    { section: 'hero', element: 'title', type: 'richtext', label: 'Judul Hero', default_value: 'Makeup harian, warna yang mudah dipakai.' },
    { section: 'hero', element: 'subtitle', type: 'textarea', label: 'Subjudul Hero', default_value: 'Cek pilihan kosmetik, shade, dan harga. Order atau tanya stok langsung lewat WhatsApp.' },
    { section: 'hero', element: 'bg_image_url', type: 'image', label: 'Background Foto Hero (Opsional)', helperText: 'Foto latar belakang paling luas. Jika diisi, akan menggantikan warna background bawaan.' },
    { section: 'hero', element: 'image2_url', type: 'image', label: 'Gambar Bento 2', default_value: 'https://images.unsplash.com/photo-1596462502277-27bfdc40334a?q=80&w=800&auto=format&fit=crop', helperText: 'Rekomendasi 1200 x 1200 px.' },
    { section: 'hero', element: 'image2_title', type: 'text', label: 'Teks Bento 2', default_value: 'Flawless Base' },
    { section: 'hero', element: 'image3_url', type: 'image', label: 'Gambar Bento 3', default_value: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=800&auto=format&fit=crop', helperText: 'Rekomendasi 1200 x 1200 px.' },
    { section: 'hero', element: 'image3_title', type: 'text', label: 'Teks Bento 3', default_value: 'Statement Lips' },
    
    { section: 'catalog', element: 'title', type: 'text', label: 'Judul Katalog', default_value: 'Katalog produk' },
    { section: 'catalog', element: 'show_categories', type: 'toggle', label: 'Tampilkan Filter Kategori', default_value: 'true', helperText: 'Kategori muncul otomatis dari produk yang sudah dibuat.' },
    { section: 'marquee', element: 'visible', type: 'toggle', label: 'Tampilkan Teks Berjalan', default_value: 'true' },
    { section: 'marquee', element: 'text', type: 'text', label: 'Teks Berjalan (Marquee)', default_value: 'INFO PRODUK - CEK SHADE - ORDER VIA WHATSAPP -' },
    
    { section: 'values', element: 'visible', type: 'toggle', label: 'Tampilkan Keunggulan', default_value: 'true' },
    { section: 'values', element: 'val1_title', type: 'text', label: 'Judul Nilai 1', default_value: 'Pilihan shade' },
    { section: 'values', element: 'val1_desc', type: 'textarea', label: 'Deskripsi Nilai 1', default_value: 'Tanyakan shade yang tersedia sebelum order agar warna yang dipilih lebih sesuai.' },
    { section: 'values', element: 'val2_title', type: 'text', label: 'Judul Nilai 2', default_value: 'Info produk jelas' },
    { section: 'values', element: 'val2_desc', type: 'textarea', label: 'Deskripsi Nilai 2', default_value: 'Setiap produk bisa dilengkapi foto, harga, deskripsi, dan stok.' },
    { section: 'values', element: 'val3_title', type: 'text', label: 'Judul Nilai 3', default_value: 'Order lewat WhatsApp' },
    { section: 'values', element: 'val3_desc', type: 'textarea', label: 'Deskripsi Nilai 3', default_value: 'Pembeli bisa bertanya dulu, lalu mengirim ringkasan pesanan ke admin toko.' },
    
    { section: 'cta', element: 'visible', type: 'toggle', label: 'Tampilkan Call-To-Action', default_value: 'true' },
    { section: 'cta', element: 'image_url', type: 'image', label: 'Gambar CTA', default_value: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop', helperText: 'Rekomendasi 1600 x 900 px.' },
    { section: 'cta', element: 'title', type: 'text', label: 'Judul CTA', default_value: 'Butuh rekomendasi produk?' },
    { section: 'cta', element: 'description', type: 'richtext', label: 'Deskripsi CTA', default_value: '<p>Hubungi admin toko untuk mengecek stok, shade, dan cara pakai produk.</p><p>Kami bantu pilihkan produk sesuai kebutuhan sebelum kamu order.</p>' },
  ]
};

const SHARED_BUSINESS_SECTIONS: EditableElement[] = [
  { section: 'promo_banner', element: 'visible', type: 'toggle', label: 'Tampilkan Banner Promo', default_value: 'true' },
  { section: 'promo_banner', element: 'title', type: 'text', label: 'Judul Banner Promo', default_value: 'Promo spesial minggu ini' },
  { section: 'promo_banner', element: 'description', type: 'textarea', label: 'Deskripsi Banner Promo', default_value: 'Tambahkan penawaran singkat yang mudah dipahami pelanggan.' },
  { section: 'promo_banner', element: 'code', type: 'text', label: 'Kode Promo / Catatan Khusus', default_value: 'WEBTOKOKU' },
  { section: 'promo_banner', element: 'image_url', type: 'image', label: 'Gambar Banner Promo', helperText: 'Rekomendasi 1600 x 900 px.' },

  { section: 'reviews', element: 'visible', type: 'toggle', label: 'Tampilkan Ulasan Pelanggan', default_value: 'true' },
  { section: 'reviews', element: 'title', type: 'text', label: 'Judul Ulasan', default_value: 'Ulasan pelanggan' },
  { section: 'reviews', element: 'subtitle', type: 'textarea', label: 'Penjelasan Ulasan', default_value: 'Tambahkan testimoni asli pelanggan agar toko terasa lebih meyakinkan.' },
  { section: 'reviews', element: 'item1_name', type: 'text', label: 'Ulasan 1 - Nama', default_value: 'Nadia' },
  { section: 'reviews', element: 'item1_text', type: 'textarea', label: 'Ulasan 1 - Isi', default_value: 'Adminnya responsif, pilihan produknya jelas, dan proses order gampang.' },
  { section: 'reviews', element: 'item2_name', type: 'text', label: 'Ulasan 2 - Nama', default_value: 'Bagas' },
  { section: 'reviews', element: 'item2_text', type: 'textarea', label: 'Ulasan 2 - Isi', default_value: 'Tampilan tokonya enak dilihat. Saya langsung tahu harus klik ke mana.' },
  { section: 'reviews', element: 'item3_name', type: 'text', label: 'Ulasan 3 - Nama', default_value: 'Sari' },
  { section: 'reviews', element: 'item3_text', type: 'textarea', label: 'Ulasan 3 - Isi', default_value: 'Produk sampai sesuai ekspektasi dan komunikasinya rapi dari awal.' },
  { section: 'reviews', element: 'item4_name', type: 'text', label: 'Ulasan 4 - Nama (opsional)' },
  { section: 'reviews', element: 'item4_text', type: 'textarea', label: 'Ulasan 4 - Isi (opsional)' },
  { section: 'reviews', element: 'item5_name', type: 'text', label: 'Ulasan 5 - Nama (opsional)' },
  { section: 'reviews', element: 'item5_text', type: 'textarea', label: 'Ulasan 5 - Isi (opsional)' },
  { section: 'reviews', element: 'item6_name', type: 'text', label: 'Ulasan 6 - Nama (opsional)' },
  { section: 'reviews', element: 'item6_text', type: 'textarea', label: 'Ulasan 6 - Isi (opsional)' },

  { section: 'gallery', element: 'visible', type: 'toggle', label: 'Tampilkan Galeri Toko', default_value: 'true' },
  { section: 'gallery', element: 'title', type: 'text', label: 'Judul Galeri', default_value: 'Galeri toko' },
  { section: 'gallery', element: 'subtitle', type: 'textarea', label: 'Penjelasan Galeri', default_value: 'Tampilkan suasana toko, proses packing, katalog, atau dokumentasi pelanggan.' },
  { section: 'gallery', element: 'image1_url', type: 'image', label: 'Galeri Foto 1', helperText: 'Rekomendasi 1200 x 1200 px atau 4:5 sesuai template.' },
  { section: 'gallery', element: 'image1_caption', type: 'text', label: 'Galeri Caption 1', default_value: 'Behind the scene' },
  { section: 'gallery', element: 'image2_url', type: 'image', label: 'Galeri Foto 2', helperText: 'Rekomendasi 1200 x 1200 px atau 4:5 sesuai template.' },
  { section: 'gallery', element: 'image2_caption', type: 'text', label: 'Galeri Caption 2', default_value: 'Produk favorit' },
  { section: 'gallery', element: 'image3_url', type: 'image', label: 'Galeri Foto 3', helperText: 'Rekomendasi 1200 x 1200 px atau 4:5 sesuai template.' },
  { section: 'gallery', element: 'image3_caption', type: 'text', label: 'Galeri Caption 3', default_value: 'Pesanan pelanggan' },

  { section: 'docs', element: 'visible', type: 'toggle', label: 'Tampilkan Dokumentasi', default_value: 'true' },
  { section: 'docs', element: 'title', type: 'text', label: 'Judul Dokumentasi', default_value: 'Dokumentasi & panduan' },
  { section: 'docs', element: 'youtube_url', type: 'video', label: 'Link YouTube Dokumentasi (opsional)' },
  { section: 'docs', element: 'image_url', type: 'image', label: 'Foto Dokumentasi Pengganti Video', helperText: 'Rekomendasi 1200 x 1600 px untuk dokumen, 1600 x 900 px untuk thumbnail.' },
  { section: 'docs', element: 'article_title', type: 'text', label: 'Judul Artikel/Link', default_value: 'Panduan memilih produk yang tepat' },
  { section: 'docs', element: 'article_url', type: 'link', label: 'URL Artikel/Link Dokumentasi' },

  { section: 'location', element: 'visible', type: 'toggle', label: 'Tampilkan Map / Lokasi', default_value: 'true' },
  { section: 'location', element: 'title', type: 'text', label: 'Judul Lokasi', default_value: 'Kunjungi atau hubungi toko' },
  { section: 'location', element: 'address', type: 'textarea', label: 'Alamat Toko' },
  { section: 'location', element: 'map_url', type: 'link', label: 'Link Google Maps. Buka Maps, klik Share, lalu tempel link atau embed URL di sini.' },
  { section: 'location', element: 'outlet1_name', type: 'text', label: 'Cabang 1 - Nama' },
  { section: 'location', element: 'outlet1_address', type: 'textarea', label: 'Cabang 1 - Alamat' },
  { section: 'location', element: 'outlet1_hours', type: 'text', label: 'Cabang 1 - Jam buka' },
  { section: 'location', element: 'outlet2_name', type: 'text', label: 'Cabang 2 - Nama (opsional)' },
  { section: 'location', element: 'outlet2_address', type: 'textarea', label: 'Cabang 2 - Alamat (opsional)' },
  { section: 'location', element: 'outlet2_hours', type: 'text', label: 'Cabang 2 - Jam buka (opsional)' },
  { section: 'location', element: 'outlet3_name', type: 'text', label: 'Cabang 3 - Nama (opsional)' },
  { section: 'location', element: 'outlet3_address', type: 'textarea', label: 'Cabang 3 - Alamat (opsional)' },
  { section: 'location', element: 'outlet3_hours', type: 'text', label: 'Cabang 3 - Jam buka (opsional)' },
  { section: 'location', element: 'outlet4_name', type: 'text', label: 'Cabang 4 - Nama (opsional)' },
  { section: 'location', element: 'outlet4_address', type: 'textarea', label: 'Cabang 4 - Alamat (opsional)' },
  { section: 'location', element: 'outlet4_hours', type: 'text', label: 'Cabang 4 - Jam buka (opsional)' },

  { section: 'contact', element: 'visible', type: 'toggle', label: 'Tampilkan Kontak Cepat', default_value: 'true' },
  { section: 'contact', element: 'title', type: 'text', label: 'Judul Kontak', default_value: 'Kontak cepat' },
  { section: 'contact', element: 'description', type: 'textarea', label: 'Penjelasan Kontak', default_value: 'Punya pertanyaan soal produk, stok, ukuran, atau promo? Hubungi admin toko.' },
  { section: 'contact', element: 'whatsapp_label', type: 'text', label: 'Label Tombol WhatsApp', default_value: 'Chat WhatsApp' },

  { section: 'faq', element: 'visible', type: 'toggle', label: 'Tampilkan FAQ', default_value: 'true' },
  { section: 'faq', element: 'title', type: 'text', label: 'Judul FAQ', default_value: 'Pertanyaan Umum' },
  { section: 'faq', element: 'q1', type: 'text', label: 'FAQ 1 - Pertanyaan', default_value: 'Bagaimana cara order?' },
  { section: 'faq', element: 'a1', type: 'textarea', label: 'FAQ 1 - Jawaban', default_value: 'Pilih produk dari katalog lalu hubungi admin lewat WhatsApp untuk konfirmasi stok dan pengiriman.' },
  { section: 'faq', element: 'q2', type: 'text', label: 'FAQ 2 - Pertanyaan', default_value: 'Apakah bisa bayar COD?' },
  { section: 'faq', element: 'a2', type: 'textarea', label: 'FAQ 2 - Jawaban', default_value: 'Metode pembayaran mengikuti kebijakan toko. Silakan tanyakan ke admin sebelum checkout.' },
  { section: 'faq', element: 'q3', type: 'text', label: 'FAQ 3 - Pertanyaan', default_value: 'Berapa lama pengiriman?' },
  { section: 'faq', element: 'a3', type: 'textarea', label: 'FAQ 3 - Jawaban', default_value: 'Estimasi pengiriman tergantung alamat dan kurir. Admin akan membantu mengecek total biaya sebelum pesanan diproses.' },

  { section: 'social', element: 'instagram_url', type: 'link', label: 'Link Instagram (opsional)' },
  { section: 'social', element: 'tiktok_url', type: 'link', label: 'Link TikTok (opsional)' },
]

Object.keys(TEMPLATE_EDITABLES).forEach((templateId) => {
  const keys = new Set(TEMPLATE_EDITABLES[templateId].map((field) => `${field.section}.${field.element}`))
  SHARED_BUSINESS_SECTIONS.forEach((field) => {
    const key = `${field.section}.${field.element}`
    if (!keys.has(key)) TEMPLATE_EDITABLES[templateId].push(field)
  })
})
