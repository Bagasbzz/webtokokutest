'use client'
import React, { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { ButikTemplate } from '@/components/templates/ButikTemplate'
import { DapurTemplate } from '@/components/templates/DapurTemplate'
import { GlowTemplate } from '@/components/templates/GlowTemplate'
import { LuxeTemplate } from '@/components/templates/LuxeTemplate'
import { HerbaTemplate } from '@/components/templates/HerbaTemplate'
import { CommerceLayer } from '@/components/commerce/CommerceLayer'
import type { PublicStore, PublicProduct } from '@/lib/public-store'

// Helper to generate mock products
function generateMockProducts(template: string): PublicProduct[] {
  const images: Record<string, string[]> = {
    butik: [
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=900&auto=format&fit=crop'
    ],
    dapur: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1529042410759-befb1204b468?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1559847844-5315695dadae?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=900&auto=format&fit=crop'
    ],
    glow: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=900&auto=format&fit=crop'
    ],
    luxe: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=900&auto=format&fit=crop'
    ],
    herba: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=900&auto=format&fit=crop'
    ]
  }

  const names: Record<string, string[]> = {
    butik: [
      'Kania Earth Dress', 'Zara Royal Silk', 'Safira Couture', 'Hijab Premium Silk', 'Outer Linen Casual',
      'Aira Tunic Set', 'Selma Pleated Skirt', 'Nara Blouse Ivory', 'Rana Abaya Premium', 'Mila Scarf Voal',
      'Livia Vest Linen', 'Ayla Wide Pants', 'Hara Knit Cardigan', 'Sora Dress Navy', 'Keira Belt Classic'
    ],
    dapur: [
      'Rendang Daging Sapi', 'Sate Ayam Madura (Isi 20)', 'Ayam Penyet Kremes', 'Sambal Bawang Extra Pedas', 'Dimsum Mentai Premium',
      'Es Jeruk Sonkit Selasih', 'Nasi Box Ayam Lengkuas', 'Soto Betawi Kuah Susu', 'Pempek Kapal Selam', 'Bakso Aci Pedas',
      'Cireng Bumbu Rujak', 'Tahu Bakso Semarang', 'Ayam Geprek Sambal Ijo', 'Paket Liwetan Keluarga', 'Kue Lumpur Pandan'
    ],
    glow: [
      'Hydrating Cleanser', 'Daily Glow Toner', 'Ceramide Moisturizer', 'UV Shield Sunscreen', 'Niacinamide Serum',
      'Gentle Exfoliating Pad', 'Barrier Repair Cream', 'Calming Mugwort Mask', 'Retinol Night Serum', 'Brightening Essence',
      'Hyaluronic Gel Cream', 'Acne Spot Treatment', 'Cleansing Balm', 'Lip Sleeping Mask', 'Travel Skincare Kit'
    ],
    luxe: [
      'Lip Tint Velvet', 'Cushion Matte SPF 30', 'Brow Definer Pencil', 'Powder Blush', 'Soft Matte Lip Cream',
      'Liquid Highlighter', 'Eyeshadow Palette Nude', 'Setting Spray Longwear', 'Pressed Powder Blur', 'Mascara Waterproof',
      'Concealer Full Cover', 'Makeup Sponge Set', 'Cream Contour Stick', 'Lip Gloss Clear', 'Complete Daily Makeup Kit'
    ],
    herba: [
      'Madu Herbal Imun', 'Pure Vitamin C 1000mg', 'Omega 3 Fish Oil', 'Masker Medis 3-Ply', 'Minyak Kayu Putih',
      'Jahe Merah Instan', 'Propolis Spray', 'Multivitamin Keluarga', 'Teh Herbal Relaks', 'Kapsul Kunyit Asam',
      'Susu Kolostrum', 'Hand Sanitizer Aloe', 'Minyak Telon Bayi', 'Paket P3K Rumah', 'Zinc Plus Vitamin D'
    ]
  }

  const prices: Record<string, number[]> = {
    butik: [850000, 450000, 1250000, 1850000, 320000],
    dapur: [120000, 65000, 85000, 35000, 45000, 20000],
    glow: [120000, 145000, 180000, 150000],
    luxe: [95000, 165000, 75000, 110000],
    herba: [125000, 95000, 185000, 45000]
  }

  const descs: Record<string, string[]> = {
    butik: [
      'Dress anggun bahan katun premium yang lembut dan jatuh dengan indah.',
      'Sutra kerajaan kualitas tinggi dengan kilau natural yang mewah.',
      'Koleksi adi busana eksklusif untuk penampilan istimewa Anda.',
      'Hijab silk premium bertekstur lembut, mudah dibentuk dan tegak di dahi.',
      'Luar santai yang nyaman dipakai untuk hangout maupun semi-formal.'
    ],
    dapur: [
      'Daging sapi lulur pilihan yang dimasak perlahan selama 8 jam dengan rempah rahasia khas Minang.',
      'Frozen sate full daging ayam (tanpa lemak) yang dibakar setengah matang. Termasuk bumbu kacang kental.',
      '1 Ekor ayam kampung ungkep bumbu kuning. Empuk hingga ke tulang, disajikan dengan kremesan gurih.',
      'Sambal botolan homemade yang pedasnya nendang. Tahan hingga 1 bulan di kulkas.',
      'Isian udang dan ayam dengan saus mentai gurih berlimpah.',
      'Minuman segar perasan jeruk sonkit asli dengan biji selasih untuk kesegaran instan.'
    ],
    glow: [
      'Pembersih wajah lembut dengan pH balance untuk menjaga barrier kulit.',
      'Toner hidrasi ringan yang mencerahkan dan menyegarkan kulit kusam.',
      'Pelembap kaya ceramide untuk mengunci kelembapan sepanjang hari.',
      'Perlindungan matahari harian dari sinar UV tanpa rasa lengket atau whitecast.'
    ],
    luxe: [
      'Lip tint bertekstur velvet yang memberikan warna merona alami dan tahan lama.',
      'Cushion berdaya tutup tinggi dengan hasil akhir matte bebas minyak sepanjang hari.',
      'Pensil alis presisi untuk hasil alis alami, rapi, dan tahan air.',
      'Blush on bubuk dengan pigmentasi tinggi untuk rona pipi segar berseri.'
    ],
    herba: [
      'Madu murni pilihan yang diperkaya ekstrak herbal untuk menjaga daya tahan tubuh.',
      'Suplemen Vitamin C harian untuk menjaga kesehatan tubuh dan kulit.',
      'Minyak ikan kaya asam lemak esensial untuk kesehatan jantung dan otak.',
      'Masker medis 3 lapis pelindung pernapasan dari debu dan bakteri.'
    ]
  }

  const categories: Record<string, string[]> = {
    butik: ['Ready to Wear', 'Hijab', 'Dress'],
    dapur: ['Lauk Pauk', 'Frozen Food', 'Sambal', 'Minuman'],
    glow: ['Cleanser', 'Toner', 'Moisturizer', 'Sunscreen'],
    luxe: ['Lip', 'Base', 'Eye', 'Blush'],
    herba: ['Herbal', 'Vitamin', 'Suplemen', 'Alat Kesehatan']
  }

  const tplImages = images[template] || []
  const tplNames = names[template] || []
  const tplPrices = prices[template] || []
  const tplDescs = descs[template] || []
  const tplCats = categories[template] || []

  return tplNames.map((name, index) => {
    const isFood = template === 'dapur'
    const isWear = template === 'butik'
    const isCare = template === 'glow' || template === 'luxe'
    return {
      id: `demo-${template}-${index + 1}`,
      nama: name,
      harga: tplPrices[index % tplPrices.length],
      deskripsi: tplDescs[index % tplDescs.length],
      foto_url: tplImages[index % tplImages.length],
      kategori: tplCats[index % tplCats.length],
      berat_gram: isFood ? 500 : 250,
      stok: 50,
      product_type: isFood ? 'food' : isWear ? 'fashion' : 'general',
      show_category: true,
      show_on_homepage: true,
      homepage_rank: index,
      badge_label: index === 0 ? 'Best Seller' : index === 2 ? 'Promo' : null,
      compare_at_price: index === 2 ? tplPrices[index % tplPrices.length] + 15000 : null,
      option_groups: isFood
        ? [{ id: 'portion', name: 'Porsi', type: 'portion', required: true, values: [{ id: 'regular', label: 'Reguler' }, { id: 'large', label: 'Large', price_delta: 15000 }] }]
        : isWear
          ? [{ id: 'size', name: 'Ukuran', type: 'size', required: true, values: [{ id: 's', label: 'S' }, { id: 'm', label: 'M' }, { id: 'l', label: 'L' }] }]
          : isCare
            ? [{ id: 'variant', name: template === 'luxe' ? 'Shade' : 'Jenis Kulit', type: template === 'luxe' ? 'shade' : 'skin_type', required: false, values: template === 'luxe' ? [{ id: 'natural', label: 'Natural' }, { id: 'warm', label: 'Warm' }, { id: 'rose', label: 'Rose' }] : [{ id: 'normal', label: 'Normal' }, { id: 'dry', label: 'Kering' }, { id: 'oily', label: 'Berminyak' }] }]
            : [{ id: 'package', name: 'Paket', type: 'package', required: false, values: [{ id: 'single', label: 'Satuan' }, { id: 'family', label: 'Paket Keluarga', price_delta: 25000 }] }],
      addons: isFood ? [{ id: 'sambal', name: 'Extra Sambal', price: 5000, max_qty: 3 }] : [],
      product_details: {
        unit: isFood ? 'porsi' : 'pcs',
        portion_detail: isFood ? 'Reguler dan large' : undefined,
        contents: isCare ? '1 produk utama' : undefined,
        material: isWear ? 'Bahan katun/silk pilihan' : undefined,
        usage: isCare ? 'Gunakan sesuai petunjuk pemakaian' : undefined,
        shipping_note: 'Dikemas rapi dan aman'
      }
    }
  })
}

const demoExtraContent: Record<string, Record<string, string>> = {
  butik: {
    'gallery.title': 'Galeri Atelier',
    'gallery.subtitle': 'Sudut butik, detail bahan, dan koleksi yang sedang dikurasi.',
    'gallery.image1_url': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop',
    'gallery.image1_caption': 'Ruang koleksi',
    'gallery.image2_url': 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=1000&auto=format&fit=crop',
    'gallery.image2_caption': 'Tekstur pilihan',
    'gallery.image3_url': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop',
    'gallery.image3_caption': 'Display butik',
    'docs.title': 'Lookbook & panduan ukuran',
    'docs.image_url': 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop',
    'split.image_url': 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=1000&auto=format&fit=crop',
    'masterpiece.image_url': 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop',
    'contact.title': 'Konsultasi styling',
    'contact.description': 'Tanya ukuran, bahan, warna, atau rekomendasi padanan sebelum order.',
    'faq.title': 'Pertanyaan koleksi'
  },
  dapur: {
    'gallery.title': 'Dari Dapur Kami',
    'gallery.subtitle': 'Masakan, proses packing, dan pesanan yang siap dikirim.',
    'gallery.image1_url': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop',
    'gallery.image1_caption': 'Menu hangat',
    'gallery.image2_url': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1000&auto=format&fit=crop',
    'gallery.image2_caption': 'Proses masak',
    'gallery.image3_url': 'https://images.unsplash.com/photo-1529042410759-befb1204b468?q=80&w=1000&auto=format&fit=crop',
    'gallery.image3_caption': 'Pesanan siap',
    'docs.title': 'Catatan dapur & cara simpan',
    'docs.image_url': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1200&auto=format&fit=crop',
    'hero.float_image_url': 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=900&auto=format&fit=crop',
    'promo.image_url': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop',
    'contact.title': 'Pesan untuk hari ini',
    'contact.description': 'Tanya stok menu, jadwal masak, paket keluarga, atau pesanan acara.',
    'faq.title': 'Tanya soal pesanan'
  },
  glow: {
    'gallery.title': 'Skin Shelf',
    'gallery.subtitle': 'Rutinitas, tekstur produk, dan paket basic skincare.',
    'gallery.image1_url': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1000&auto=format&fit=crop',
    'gallery.image1_caption': 'Daily routine',
    'gallery.image2_url': 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=1000&auto=format&fit=crop',
    'gallery.image2_caption': 'Hero product',
    'gallery.image3_url': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1000&auto=format&fit=crop',
    'gallery.image3_caption': 'Clean shelf',
    'docs.title': 'Routine guide',
    'docs.image_url': 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=1200&auto=format&fit=crop',
    'hero.texture_image_url': 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=1000&auto=format&fit=crop',
    'routine.image_url': 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=1200&auto=format&fit=crop',
    'contact.title': 'Tanya kecocokan kulit',
    'contact.description': 'Ceritakan jenis kulit dan kebutuhanmu, admin bantu arahkan produk yang pas.',
    'faq.title': 'Skin FAQ'
  },
  luxe: {
    'gallery.title': 'Beauty Campaign',
    'gallery.subtitle': 'Shade, tekstur, dan tampilan produk untuk referensi sebelum checkout.',
    'gallery.image1_url': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop',
    'gallery.image1_caption': 'Shade board',
    'gallery.image2_url': 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=1000&auto=format&fit=crop',
    'gallery.image2_caption': 'Produk favorit',
    'gallery.image3_url': 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1000&auto=format&fit=crop',
    'gallery.image3_caption': 'Detail finish',
    'docs.title': 'Shade guide & pemakaian',
    'docs.image_url': 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?q=80&w=1200&auto=format&fit=crop',
    'hero.image2_url': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop',
    'hero.image3_url': 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=1000&auto=format&fit=crop',
    'cta.image_url': 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?q=80&w=1200&auto=format&fit=crop',
    'contact.title': 'Chat beauty admin',
    'contact.description': 'Tanya shade, finish, stok, atau rekomendasi bundle yang cocok.',
    'faq.title': 'Beauty FAQ'
  },
  herba: {
    'gallery.title': 'Rak Perawatan',
    'gallery.subtitle': 'Produk kesehatan, paket keluarga, dan kebutuhan harian yang tersedia.',
    'gallery.image1_url': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=1000&auto=format&fit=crop',
    'gallery.image1_caption': 'Stok vitamin',
    'gallery.image2_url': 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=1000&auto=format&fit=crop',
    'gallery.image2_caption': 'Produk herbal',
    'gallery.image3_url': 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?q=80&w=1000&auto=format&fit=crop',
    'gallery.image3_caption': 'Paket keluarga',
    'docs.title': 'Info produk & anjuran pakai',
    'docs.image_url': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1200&auto=format&fit=crop',
    'consult.image_url': 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=1000&auto=format&fit=crop',
    'contact.title': 'Konsultasi kebutuhan',
    'contact.description': 'Tanyakan stok, cara pakai, atau produk pendukung untuk kebutuhan keluarga.',
    'faq.title': 'Pertanyaan kesehatan'
  }
}

export default function DemoPage({ params }: { params: { slug: string } }) {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  const cleanPreview = isMounted && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('preview') === '1'

  const rawSlug = params.slug.toLowerCase()
  const cleanSlug = rawSlug.replace(/\.html$/, '')

  // Mapping slug to template id
  const slugToTemplate: Record<string, string> = {
    'fashion': 'butik',
    'makanan': 'dapur',
    'skincare': 'glow',
    'kosmetik': 'luxe',
    'kesehatan': 'herba',
    // Fallback names
    'butik': 'butik',
    'dapur': 'dapur',
    'glow': 'glow',
    'luxe': 'luxe',
    'herba': 'herba'
  }

  const templateId = slugToTemplate[cleanSlug]
  if (!templateId) {
    notFound()
  }

  // Predefined store profiles for demo
  const mockStores: Record<string, PublicStore> = {
    butik: {
      id: 'demo-store-butik',
      nama_toko: 'Butik Hana',
      slug: 'fashion',
      deskripsi: 'Koleksi pakaian terkurasi dengan jahitan rapi, bahan premium, dan kenyamanan ekstra untuk menemani aktivitas harian Anda.',
      template: 'butik',
      warna_tema: '#C5A059',
      logo_url: null,
      no_wa: '6281234567890',
      kota: 'Jakarta Selatan',
      alamat: 'Jl. Kemang Raya No. 45, Jakarta Selatan',
      hero_image_url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1600&auto=format&fit=crop',
      font_heading: 'Cinzel',
      font_body: 'Montserrat',
      hero_title: 'Butik Hana',
      hero_subtitle: 'Rancangan Klasik untuk Hari-Hari Istimewamu.'
    },
    dapur: {
      id: 'demo-store-dapur',
      nama_toko: 'Dapur Nusantara',
      slug: 'makanan',
      deskripsi: 'Melestarikan kelezatan resep warisan keluarga sejak 2010. 100% Halal dan tanpa bahan pengawet.',
      template: 'dapur',
      warna_tema: '#D86B43',
      logo_url: null,
      no_wa: '6281234567890',
      kota: 'Jakarta',
      alamat: 'Jl. Boulevard Barat Blok A No. 12, Kelapa Gading, Jakarta Utara',
      hero_image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600&auto=format&fit=crop',
      font_heading: 'Playfair Display',
      font_body: 'Plus Jakarta Sans',
      hero_title: 'Cita Rasa <br><span class="italic-accent">Asli</span> Nusantara.',
      hero_subtitle: 'Nikmati kelezatan sejati masakan rumahan. Setiap porsi dimasak dengan 100% bumbu alami dan resep warisan turun-temurun keluarga kami.'
    },
    glow: {
      id: 'demo-store-glow',
      nama_toko: 'Glow Lab',
      slug: 'skincare',
      deskripsi: 'Katalog skincare dengan info produk yang ringkas dan mudah dicek.',
      template: 'glow',
      warna_tema: '#059669',
      logo_url: null,
      no_wa: '6281234567890',
      kota: 'Bandung',
      alamat: 'Jl. Riau No. 102, Bandung',
      hero_image_url: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=1600&auto=format&fit=crop',
      font_heading: 'Playfair Display',
      font_body: 'Inter',
      hero_title: 'Glow Lab',
      hero_subtitle: 'Produk perawatan kulit untuk rutinitas harian. Cek katalog dan tanyakan kecocokan produk lewat WhatsApp.'
    },
    luxe: {
      id: 'demo-store-luxe',
      nama_toko: 'Luna Beauty',
      slug: 'kosmetik',
      deskripsi: 'Koleksi produk kosmetik modern untuk menunjang penampilan percaya diri Anda setiap hari.',
      template: 'luxe',
      warna_tema: '#8B5CF6',
      logo_url: null,
      no_wa: '6281234567890',
      kota: 'Surabaya',
      alamat: 'Pakuwon Mall Lt. 1, Surabaya',
      hero_image_url: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?q=80&w=1600&auto=format&fit=crop',
      font_heading: 'Syne',
      font_body: 'Inter',
      hero_title: 'Makeup<br>Anti<br>Luntur.',
      hero_subtitle: 'Kosmetik lokal dengan pigmentasi tinggi. Tahan keringat, tahan air, tahan dehidrasi - cocok banget buat cuaca panas Indonesia.'
    },
    herba: {
      id: 'demo-store-herba',
      nama_toko: 'Bazzhealth',
      slug: 'kesehatan',
      deskripsi: 'Rapi dan informatif untuk penyediaan suplemen dan produk kesehatan alami keluarga.',
      template: 'herba',
      warna_tema: '#2d6a4f',
      logo_url: null,
      no_wa: '6281234567890',
      kota: 'Yogyakarta',
      alamat: 'Jl. Kaliurang Km 5.5, Yogyakarta',
      hero_image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1600&auto=format&fit=crop',
      font_heading: 'Fraunces',
      font_body: 'Plus Jakarta Sans',
      hero_title: 'Bazzhealth',
      hero_subtitle: 'Menjaga Kesehatan Alami dengan Suplemen Terbaik Terpercaya.'
    }
  }

  const store = mockStores[templateId]
  const products = generateMockProducts(templateId)
  const demoMapUrls: Record<string, string> = {
    butik: 'https://www.google.com/maps?q=Kemang%20Jakarta%20Selatan&output=embed',
    dapur: 'https://www.google.com/maps?q=Kelapa%20Gading%20Jakarta%20Utara&output=embed',
    glow: 'https://www.google.com/maps?q=Jalan%20Riau%20Bandung&output=embed',
    luxe: 'https://www.google.com/maps?q=Pakuwon%20Mall%20Surabaya&output=embed',
    herba: 'https://www.google.com/maps?q=Jalan%20Kaliurang%20Yogyakarta&output=embed'
  }
   // Customizations presets matching the visual identities of Phase 7
  const customizations: Record<string, string> = {
    'hero.title': store.hero_title || store.nama_toko,
    'hero.subtitle': store.hero_subtitle || store.deskripsi || '',
    'hero.image_url': store.hero_image_url || '',
    'hero.badge': '',
    'banner.visible': 'true',
    'routine.visible': 'true',
    'reviews.visible': 'true',
    'reviews.title': 'Apa Kata Pelanggan Kami',
    'reviews.item1_text': templateId === 'dapur' ? 'Rendangnya luar biasa empuk dan bumbunya benar-benar meresap!' : 'Sangat puas dengan kualitas produk dan pelayanan ramah admin.',
    'reviews.item1_name': 'Sarah, Jakarta',
    'reviews.item2_text': 'Pengiriman sangat cepat, dikemas rapi dan aman sampai di tempat.',
    'reviews.item2_name': 'Budi, Bandung',
    'reviews.item3_text': 'Informasi produknya jelas, jadi lebih mudah memilih sebelum checkout.',
    'reviews.item3_name': 'Nadia, Surabaya',
    'feat1.title': templateId === 'herba' ? 'Bahan Alami' : 'Kualitas Premium',
    'feat1.desc': templateId === 'herba' ? '100% menggunakan bahan herbal alami terkurasi.' : 'Diproduksi dengan standar kontrol kualitas tinggi.',
    'feat2.title': 'Layanan Cepat',
    'feat2.desc': 'Konsultasi dan pesanan langsung ditangani admin via WhatsApp.',
    'feat3.title': 'Pengiriman Aman',
    'feat3.desc': 'Dikemas menggunakan proteksi maksimal sampai ke tangan Anda.',
    'location.visible': 'true',
    'location.title': 'Lokasi dan informasi toko',
    'location.address': store.alamat || `${store.kota}, Indonesia`,
    'location.map_url': demoMapUrls[templateId] || 'https://www.google.com/maps?q=Jakarta%20Indonesia&output=embed',
    'location.outlet1_name': 'Outlet utama',
    'location.outlet1_address': store.alamat || `${store.kota}, Indonesia`,
    'location.outlet1_hours': 'Senin-Sabtu, 09.00-20.00',
    'location.outlet2_name': 'Layanan online',
    'location.outlet2_address': `Pengiriman dari ${store.kota || 'Jakarta'} ke seluruh Indonesia`,
    'location.outlet2_hours': 'Admin WhatsApp aktif setiap hari',
    'contact.title': 'Hubungi admin toko',
    'contact.description': 'Tanyakan stok, ukuran, varian, pengiriman, atau rekomendasi produk sebelum melakukan pesanan.',
    'faq.title': 'Pertanyaan yang sering diajukan',
    'faq.item1_question': 'Apakah stok produk selalu tersedia?',
    'faq.item1_answer': 'Stok mengikuti katalog terbaru. Admin akan mengonfirmasi kembali sebelum pesanan diproses.',
    'faq.item2_question': 'Apakah bisa konsultasi sebelum membeli?',
    'faq.item2_answer': 'Bisa. Klik tombol WhatsApp untuk bertanya detail produk, varian, dan estimasi pengiriman.',
    'faq.item3_question': 'Bagaimana proses pengiriman?',
    'faq.item3_answer': 'Pesanan dikemas rapi, lalu dikirim menggunakan ekspedisi yang tersedia di area pembeli.',
    'footer.tagline': `${store.nama_toko} melayani pemesanan online dengan katalog yang jelas dan mudah diakses.`,
    'footer.copyright': `© 2026 ${store.nama_toko}. Semua hak dilindungi.`,
    'outlet.visible': 'true',
    'outlet.title': 'Info outlet',
    'outlet.subtitle': 'Cek area layanan dan hubungi admin sebelum order.',
    ...(demoExtraContent[templateId] || {})
  }

  // Categories helper
  const categoriesList = Array.from(new Set(products.map(p => p.kategori))).map((cat, idx) => ({
    id: `cat-${idx + 1}`,
    name: cat,
    slug: cat?.toLowerCase().replace(/\s+/g, '-') || ''
  }))

  let templateComponent
  switch (templateId) {
    case 'dapur':
      templateComponent = <DapurTemplate store={store} products={products} customizations={customizations} categories={categoriesList} previewMode={false} />
      break
    case 'glow':
      templateComponent = <GlowTemplate store={store} products={products} customizations={customizations} categories={categoriesList} previewMode={false} />
      break
    case 'luxe':
      templateComponent = <LuxeTemplate store={store} products={products} customizations={customizations} categories={categoriesList} previewMode={false} />
      break
    case 'herba':
      templateComponent = <HerbaTemplate store={store} products={products} customizations={customizations} categories={categoriesList} previewMode={false} />
      break
    case 'butik':
    default:
      templateComponent = <ButikTemplate store={store} products={products} customizations={customizations} categories={categoriesList} previewMode={false} />
  }

  if (!isMounted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center', color: '#64748B' }}>
          <p>Memuat tampilan demo...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Demo Warning Banner */}
      {!cleanPreview && <div style={{
        position: 'sticky',
        top: 0,
        left: 0,
        width: '100%',
        background: 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)',
        color: '#FFFFFF',
        textAlign: 'center',
        padding: '10px 20px',
        fontSize: '13px',
        fontWeight: '600',
        zIndex: 99999,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <span><i className="fa-solid fa-circle-info" style={{ marginRight: '6px' }}></i> Ini adalah <strong>Halaman Demo Storefront</strong>. Semua transaksi dan produk hanya simulasi visual.</span>
        <a href="https://www.webtokoku.id" style={{
          background: '#FFFFFF',
          color: '#D97706',
          padding: '4px 12px',
          borderRadius: '20px',
          textDecoration: 'none',
          fontSize: '11px',
          fontWeight: '700',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          transition: 'all 0.2s'
        }} onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)'
        }} onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
        }}>
          Buat Toko Anda Sekarang
        </a>
      </div>}

      <CommerceLayer
        store={{
          id: store.id,
          nama_toko: store.nama_toko,
          wa_nomor: store.no_wa,
          slug: store.slug,
          warna_tema: store.warna_tema,
          template: store.template,
          paymentMethods: [
            { id: 'pay-1', type: 'bank_transfer', bank_name: 'BCA', account_number: '1234567890', account_name: 'Toko Demo', qr_image_url: null, is_active: true }
          ],
          shippingSettings: {
            auto_shipping_enabled: false,
            pickup_enabled: true,
            cod_enabled: true,
            allowed_couriers: ['jne', 'jnt', 'sicepat'],
            free_shipping_minimum: 0
          }
        }}
        featureFlags={{}}
      >
        {templateComponent}
      </CommerceLayer>
    </>
  )
}
