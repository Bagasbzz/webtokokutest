/**
 * TEMPLATE CONTENT CONTRACT — Phase 4B
 * 
 * Semua 5 template (butik, dapur, glow, luxe, herba) wajib memiliki
 * 15 section ini dengan struktur editable yang seragam.
 * 
 * Contract ini memastikan Setup Wizard dan Visual Editor V2 bisa
 * berjalan konsisten di semua template.
 */

export type FieldType =
  | 'text'        // input satu baris
  | 'textarea'    // teks panjang  
  | 'richtext'    // teks dengan formatting (bold, list)
  | 'image'       // URL gambar (upload)
  | 'color'       // hex color picker
  | 'gradient'    // gradient JSON { from, to, direction }
  | 'toggle'      // boolean show/hide section
  | 'link'        // URL + label
  | 'video'       // URL video embed

export interface EditableField {
  key: string          // format: 'section.element' (e.g., 'hero.title')
  label: string        // label di sidebar editor
  type: FieldType
  placeholder?: string
  helperText?: string
  maxLength?: number
  required?: boolean
  defaultValue?: string
}

export interface SectionContract {
  key: string          // e.g., 'hero', 'promo', 'reviews'
  label: string        // e.g., 'Hero Section', 'Promo Section'
  hasVisibilityToggle: boolean   // apakah section bisa disembunyikan
  fields: EditableField[]
}

/**
 * 15 SECTION WAJIB SEMUA TEMPLATE
 * 
 * Setiap template harus implement semua section ini.
 * Desain visual boleh beda, tapi struktur editable harus sama.
 */
export const TEMPLATE_SECTION_CONTRACT: SectionContract[] = [
  {
    key: 'header',
    label: 'Header & Navigasi',
    hasVisibilityToggle: false, // header wajib ada
    fields: [
      { key: 'header.logo_text', label: 'Teks Logo', type: 'text', defaultValue: 'Nama Toko' },
      { key: 'header.announcement', label: 'Teks Announcement', type: 'text', defaultValue: '' },
    ]
  },
  {
    key: 'hero',
    label: 'Hero Section',
    hasVisibilityToggle: true,
    fields: [
      { key: 'hero.visible', label: 'Tampilkan Hero', type: 'toggle', defaultValue: 'true' },
      { key: 'hero.badge', label: 'Badge Hero', type: 'text', defaultValue: '' },
      { key: 'hero.title', label: 'Judul Hero', type: 'text', required: true, maxLength: 60 },
      { key: 'hero.subtitle', label: 'Subjudul Hero', type: 'textarea', maxLength: 150 },
      { key: 'hero.image_url', label: 'Gambar Hero', type: 'image', helperText: 'Rekomendasi 1600 x 1200 px atau rasio 4:3.' },
      { key: 'hero.background_color', label: 'Warna Background', type: 'color', defaultValue: '#ffffff' },
      { key: 'hero.cta_text', label: 'Teks Tombol CTA', type: 'text', defaultValue: 'Belanja Sekarang' },
    ]
  },
  {
    key: 'value_props',
    label: 'Keunggulan/Value Propositions',
    hasVisibilityToggle: true,
    fields: [
      { key: 'value_props.visible', label: 'Tampilkan Keunggulan', type: 'toggle', defaultValue: 'true' },
      { key: 'value_props.title', label: 'Judul Section', type: 'text', defaultValue: 'Mengapa Memilih Kami' },
      { key: 'value_props.prop1_title', label: 'Keunggulan 1 - Judul', type: 'text', defaultValue: 'Kualitas Terbaik' },
      { key: 'value_props.prop1_desc', label: 'Keunggulan 1 - Deskripsi', type: 'textarea' },
      { key: 'value_props.prop2_title', label: 'Keunggulan 2 - Judul', type: 'text', defaultValue: 'Pelayanan Prima' },
      { key: 'value_props.prop2_desc', label: 'Keunggulan 2 - Deskripsi', type: 'textarea' },
      { key: 'value_props.prop3_title', label: 'Keunggulan 3 - Judul', type: 'text', defaultValue: 'Opsi pengiriman' },
      { key: 'value_props.prop3_desc', label: 'Keunggulan 3 - Deskripsi', type: 'textarea' },
    ]
  },
  {
    key: 'featured_categories',
    label: 'Kategori Unggulan',
    hasVisibilityToggle: true,
    fields: [
      { key: 'featured_categories.visible', label: 'Tampilkan Kategori', type: 'toggle', defaultValue: 'true' },
      { key: 'featured_categories.title', label: 'Judul Section', type: 'text', defaultValue: 'Kategori Populer' },
      { key: 'featured_categories.image_url', label: 'Gambar Kategori', type: 'image', helperText: 'Rekomendasi 1000 x 700 px.' },
    ]
  },
  {
    key: 'catalog',
    label: 'Katalog Produk',
    hasVisibilityToggle: true,
    fields: [
      { key: 'catalog.visible', label: 'Tampilkan Katalog', type: 'toggle', defaultValue: 'true' },
      { key: 'catalog.title', label: 'Judul Katalog', type: 'text', defaultValue: 'Produk Kami' },
      { key: 'catalog.description', label: 'Deskripsi Katalog', type: 'textarea' },
      { key: 'catalog.show_categories', label: 'Tampilkan Filter Kategori', type: 'toggle', defaultValue: 'true' },
      { key: 'catalog.category_list', label: 'Daftar Kategori', type: 'textarea', placeholder: 'Satu kategori per baris' },
    ]
  },
  {
    key: 'promo_banner',
    label: 'Promo & Penawaran',
    hasVisibilityToggle: true,
    fields: [
      { key: 'promo_banner.visible', label: 'Tampilkan Promo', type: 'toggle', defaultValue: 'true' },
      { key: 'promo_banner.title', label: 'Judul Promo', type: 'text', defaultValue: 'Promo minggu ini' },
      { key: 'promo_banner.description', label: 'Deskripsi Promo', type: 'textarea' },
      { key: 'promo_banner.image_url', label: 'Gambar Promo', type: 'image', helperText: 'Rekomendasi 1600 x 900 px.' },
      { key: 'promo_banner.code', label: 'Kode Promo', type: 'text' },
    ]
  },
  {
    key: 'reviews',
    label: 'Ulasan Pelanggan',
    hasVisibilityToggle: true,
    fields: [
      { key: 'reviews.visible', label: 'Tampilkan Ulasan', type: 'toggle', defaultValue: 'true' },
      { key: 'reviews.title', label: 'Judul Section', type: 'text', defaultValue: 'Testimoni Pelanggan' },
      { key: 'reviews.subtitle', label: 'Subjudul', type: 'textarea' },
    ]
  },
  {
    key: 'brand_story',
    label: 'Brand Story / Tentang Kami',
    hasVisibilityToggle: true,
    fields: [
      { key: 'brand_story.visible', label: 'Tampilkan Brand Story', type: 'toggle', defaultValue: 'true' },
      { key: 'brand_story.title', label: 'Judul', type: 'text', defaultValue: 'Cerita Kami' },
      { key: 'brand_story.content', label: 'Konten', type: 'richtext' },
      { key: 'brand_story.image_url', label: 'Gambar', type: 'image', helperText: 'Rekomendasi 1200 x 900 px.' },
    ]
  },
  {
    key: 'gallery',
    label: 'Galeri Brand',
    hasVisibilityToggle: true,
    fields: [
      { key: 'gallery.visible', label: 'Tampilkan Galeri', type: 'toggle', defaultValue: 'true' },
      { key: 'gallery.title', label: 'Judul Galeri', type: 'text', defaultValue: 'Galeri' },
      { key: 'gallery.image1_url', label: 'Gambar Galeri 1', type: 'image', helperText: 'Rekomendasi 1200 x 1200 px atau 4:5 sesuai template.' },
    ]
  },
  {
    key: 'docs',
    label: 'Dokumentasi',
    hasVisibilityToggle: true,
    fields: [
      { key: 'docs.visible', label: 'Tampilkan Dokumentasi', type: 'toggle', defaultValue: 'true' },
      { key: 'docs.title', label: 'Judul Dokumentasi', type: 'text', defaultValue: 'Dokumentasi & panduan' },
      { key: 'docs.youtube_url', label: 'Link YouTube', type: 'video' },
      { key: 'docs.image_url', label: 'Gambar Dokumen', type: 'image', helperText: 'Rekomendasi 1200 x 1600 px untuk dokumen atau 1600 x 900 px untuk thumbnail.' },
    ]
  },
  {
    key: 'location',
    label: 'Lokasi Toko',
    hasVisibilityToggle: true,
    fields: [
      { key: 'location.visible', label: 'Tampilkan Lokasi', type: 'toggle', defaultValue: 'true' },
      { key: 'location.title', label: 'Judul', type: 'text', defaultValue: 'Kunjungi Kami' },
      { key: 'location.address', label: 'Alamat Utama', type: 'textarea' },
      { key: 'location.map_url', label: 'URL Google Maps', type: 'link' },
      { key: 'location.outlet1_name', label: 'Nama Cabang 1', type: 'text' },
      { key: 'location.outlet1_address', label: 'Alamat Cabang 1', type: 'textarea' },
      { key: 'location.outlet1_hours', label: 'Jam Cabang 1', type: 'text' },
    ]
  },
  {
    key: 'contact',
    label: 'Kontak & WhatsApp',
    hasVisibilityToggle: false, // contact wajib ada
    fields: [
      { key: 'contact.whatsapp_text', label: 'Teks CTA WhatsApp', type: 'text', defaultValue: 'Chat WhatsApp' },
      { key: 'contact.email_text', label: 'Teks Email', type: 'text', defaultValue: 'email@toko.com' },
    ]
  },
  {
    key: 'social',
    label: 'Sosial & Marketplace',
    hasVisibilityToggle: true,
    fields: [
      { key: 'social.visible', label: 'Tampilkan Social', type: 'toggle', defaultValue: 'true' },
      { key: 'social.instagram_url', label: 'Instagram', type: 'link' },
      { key: 'social.tiktok_url', label: 'TikTok', type: 'link' },
      { key: 'social.shopee_url', label: 'Shopee', type: 'link' },
      { key: 'social.tokopedia_url', label: 'Tokopedia', type: 'link' },
    ]
  },
  {
    key: 'faq',
    label: 'FAQ',
    hasVisibilityToggle: true,
    fields: [
      { key: 'faq.visible', label: 'Tampilkan FAQ', type: 'toggle', defaultValue: 'true' },
      { key: 'faq.title', label: 'Judul FAQ', type: 'text', defaultValue: 'Pertanyaan Umum' },
      { key: 'faq.q1', label: 'Pertanyaan 1', type: 'text', defaultValue: 'Bagaimana cara melakukan pemesanan?' },
      { key: 'faq.a1', label: 'Jawaban 1', type: 'textarea', defaultValue: 'Pilih produk yang diinginkan, tambahkan ke keranjang, isi data pengiriman, dan lakukan checkout. Detail pesanan akan dikirim langsung ke WhatsApp kami.' },
      { key: 'faq.q2', label: 'Pertanyaan 2', type: 'text', defaultValue: 'Apakah melayani pengiriman ke seluruh Indonesia?' },
      { key: 'faq.a2', label: 'Jawaban 2', type: 'textarea', defaultValue: 'Ya, kami melayani pengiriman ke seluruh wilayah di Indonesia menggunakan kurir terpercaya.' },
      { key: 'faq.q3', label: 'Pertanyaan 3', type: 'text', defaultValue: 'Metode pembayaran apa saja yang didukung?' },
      { key: 'faq.a3', label: 'Jawaban 3', type: 'textarea', defaultValue: 'Kami mendukung transfer bank manual, pembayaran instan QRIS, serta COD (tergantung kesepakatan via WhatsApp).' },
    ]
  },
  {
    key: 'footer',
    label: 'Footer',
    hasVisibilityToggle: false, // footer wajib ada
    fields: [
      { key: 'footer.tagline', label: 'Tagline Footer', type: 'text', defaultValue: 'Terima kasih telah berkunjung' },
      { key: 'footer.copyright', label: 'Teks Copyright', type: 'text', defaultValue: '© 2024 Nama Toko' },
    ]
  },
];

/**
 * Mapping template ID ke nama display
 */
export const TEMPLATE_NAMES: Record<string, string> = {
  butik: 'Butik Hana (Fashion)',
  dapur: 'Dapur Nusantara (Kuliner)',
  glow: 'Glow Lab (Skincare)',
  luxe: 'Luna Beauty (Kosmetik)',
  herba: 'Bazzhealth (Kesehatan)',
};

/**
 * Validasi apakah template memiliki semua section wajib
 */
export function validateTemplateSections(templateId: string, existingSections: string[]): {
  valid: boolean;
  missing: string[];
} {
  const requiredSections = TEMPLATE_SECTION_CONTRACT.map(s => s.key);
  const missing = requiredSections.filter(section => !existingSections.includes(section));
  
  return {
    valid: missing.length === 0,
    missing,
  };
}
