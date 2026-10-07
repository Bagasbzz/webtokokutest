/**
 * Template Definitions for Visual Editor
 * 
 * File ini mendefinisikan struktur setiap template yang bisa diedit.
 * Setiap section memiliki konfigurasi editable fields dan visibility rules.
 */

import type { TemplateId } from '@/lib/types'

export interface SectionDefinition {
  id: string
  type: string
  required: boolean
  editable: string[]
  deletable: boolean
  defaultContent: Record<string, any>
}

export interface TemplateDefinition {
  id: TemplateId
  nama: string
  sections: SectionDefinition[]
}

// Default content untuk setiap section type
const defaultHero = {
  title: '',
  subtitle: '',
  description: '',
  image_url: '',
  cta_text: 'Pesan Sekarang',
  background_color: ''
}

const defaultAbout = {
  title: 'Tentang Kami',
  text: '',
  image_url: ''
}

const defaultContact = {
  title: 'Hubungi Kami',
  address: '',
  phone: '',
  show_map: true
}

const defaultFooter = {
  copyright: '',
  social_links: []
}

// Template Definitions
export const TEMPLATE_DEFINITIONS: TemplateDefinition[] = [
  {
    id: 'dapur',
    nama: 'Dapur Nusantara',
    sections: [
      {
        id: 'hero',
        type: 'hero',
        required: true,
        editable: ['title', 'subtitle', 'description', 'image_url', 'cta_text', 'background_color'],
        deletable: false,
        defaultContent: {
          ...defaultHero,
          title: 'Dapur Nusantara',
          subtitle: 'Masakan Indonesia Autentik',
          description: 'Nikmati kelezatan masakan tradisional Indonesia dengan cita rasa autentik',
          cta_text: 'Lihat Menu Kami',
          background_color: '#c2410c'
        }
      },
      {
        id: 'about',
        type: 'about',
        required: false,
        editable: ['title', 'text', 'image_url'],
        deletable: true,
        defaultContent: {
          ...defaultAbout,
          title: 'Cerita Kami',
          text: 'Dapur Nusantara hadir untuk membawa kekayaan kuliner Indonesia ke meja makan Anda. Dengan resep turun-temurun dan bahan-bahan pilihan, kami menjaga keaslian setiap hidangan.',
          image_url: '/templates/dapur/about.jpg'
        }
      },
      {
        id: 'menu_highlights',
        type: 'menu_highlights',
        required: false,
        editable: ['title', 'items'],
        deletable: true,
        defaultContent: {
          title: 'Menu Unggulan',
          items: [
            { name: 'Rendang Padang', price: 'Rp 45.000', description: 'Daging sapi empuk dengan bumbu rempah khas Padang' },
            { name: 'Nasi Goreng Special', price: 'Rp 35.000', description: 'Nasi goreng dengan telur matah, ayam suwir, dan kerupuk' },
            { name: 'Soto Ayam', price: 'Rp 30.000', description: 'Soto ayam kampung dengan kuah kuning segar' }
          ]
        }
      },
      {
        id: 'contact',
        type: 'contact',
        required: true,
        editable: ['title', 'address', 'phone', 'show_map'],
        deletable: false,
        defaultContent: {
          ...defaultContact,
          title: 'Kunjungi Kami',
          address: 'Jl. Pangan No. 123, Jakarta Selatan',
          phone: '08123456789',
          show_map: true
        }
      },
      {
        id: 'footer',
        type: 'footer',
        required: true,
        editable: ['copyright', 'social_links'],
        deletable: false,
        defaultContent: {
          ...defaultFooter,
          copyright: '© 2024 Dapur Nusantara. All rights reserved.',
          social_links: [
            { platform: 'instagram', url: '#' },
            { platform: 'facebook', url: '#' },
            { platform: 'whatsapp', url: '#' }
          ]
        }
      }
    ]
  },
  {
    id: 'butik',
    nama: 'Butik Hana',
    sections: [
      {
        id: 'hero',
        type: 'hero',
        required: true,
        editable: ['title', 'subtitle', 'description', 'image_url', 'cta_text', 'background_color'],
        deletable: false,
        defaultContent: {
          ...defaultHero,
          title: 'Butik Hana',
          subtitle: 'Elegansi dalam Setiap Jahitan',
          description: 'Temukan keanggunan busana muslimah modern dengan desain eksklusif dan material berkualitas tinggi',
          cta_text: 'Belanja Sekarang',
          background_color: '#be185d'
        }
      },
      {
        id: 'featured_products',
        type: 'featured_products',
        required: false,
        editable: ['title', 'products'],
        deletable: true,
        defaultContent: {
          title: 'Koleksi Terbaru',
          products: [
            { name: 'Gamis Premium', price: 'Rp 350.000', image: '/templates/butik/gamis.jpg' },
            { name: 'Hijab Silk', price: 'Rp 150.000', image: '/templates/butik/hijab.jpg' },
            { name: 'Setelan Casual', price: 'Rp 280.000', image: '/templates/butik/setelan.jpg' }
          ]
        }
      },
      {
        id: 'brand_story',
        type: 'brand_story',
        required: false,
        editable: ['title', 'text', 'image_url'],
        deletable: true,
        defaultContent: {
          ...defaultAbout,
          title: 'Tentang Butik Hana',
          text: 'Butik Hana lahir dari passion untuk menciptakan busana muslimah yang tidak hanya syar\'i tetapi juga fashionable. Setiap desain dibuat dengan cinta dan perhatian pada detail.',
          image_url: '/templates/butik/story.jpg'
        }
      },
      {
        id: 'contact',
        type: 'contact',
        required: true,
        editable: ['title', 'address', 'phone', 'show_map'],
        deletable: false,
        defaultContent: {
          ...defaultContact,
          title: 'Hubungi Kami',
          address: 'Jl. Mode No. 45, Jakarta Pusat',
          phone: '08123456789',
          show_map: true
        }
      },
      {
        id: 'footer',
        type: 'footer',
        required: true,
        editable: ['copyright', 'social_links'],
        deletable: false,
        defaultContent: {
          ...defaultFooter,
          copyright: '© 2024 Butik Hana. All rights reserved.',
          social_links: [
            { platform: 'instagram', url: '#' },
            { platform: 'tiktok', url: '#' },
            { platform: 'whatsapp', url: '#' }
          ]
        }
      }
    ]
  },
  {
    id: 'glow',
    nama: 'Glow Lab',
    sections: [
      {
        id: 'hero',
        type: 'hero',
        required: true,
        editable: ['title', 'subtitle', 'description', 'image_url', 'cta_text', 'background_color'],
        deletable: false,
        defaultContent: {
          ...defaultHero,
          title: 'Glow Lab',
          subtitle: 'Radiate Your Natural Beauty',
          description: 'Skincare alami dengan bahan-bahan pilihan untuk merawat kecantikanmu dari dalam',
          cta_text: 'Mulai Perjalananmu',
          background_color: '#059669'
        }
      },
      {
        id: 'benefits',
        type: 'benefits',
        required: false,
        editable: ['title', 'items'],
        deletable: true,
        defaultContent: {
          title: 'Manfaat untuk Kulitmu',
          items: [
            { title: 'Mencerahkan', description: 'Vitamin C dan Niacinamide untuk kulit cerah merona' },
            { title: 'Melembapkan', description: 'Hyaluronic Acid menjaga kelembapan 24 jam' },
            { title: 'Anti Aging', description: 'Retinol dan Peptides untuk mengurangi kerutan' }
          ]
        }
      },
      {
        id: 'ingredients',
        type: 'ingredients',
        required: false,
        editable: ['title', 'items'],
        deletable: true,
        defaultContent: {
          title: 'Bahan Aktif Pilihan',
          items: [
            { name: 'Vitamin C', benefit: 'Antioxidant & brightening' },
            { name: 'Hyaluronic Acid', benefit: 'Deep hydration' },
            { name: 'Niacinamide', benefit: 'Pore minimizing & brightening' },
            { name: 'Peptides', benefit: 'Collagen boosting' }
          ]
        }
      },
      {
        id: 'contact',
        type: 'contact',
        required: true,
        editable: ['title', 'address', 'phone', 'show_map'],
        deletable: false,
        defaultContent: {
          ...defaultContact,
          title: 'Konsultasi Gratis',
          address: 'Jl. Skincare No. 88, Jakarta Selatan',
          phone: '08123456789',
          show_map: true
        }
      },
      {
        id: 'footer',
        type: 'footer',
        required: true,
        editable: ['copyright', 'social_links'],
        deletable: false,
        defaultContent: {
          ...defaultFooter,
          copyright: '© 2024 Glow Lab. All rights reserved.',
          social_links: [
            { platform: 'instagram', url: '#' },
            { platform: 'tiktok', url: '#' },
            { platform: 'whatsapp', url: '#' }
          ]
        }
      }
    ]
  },
  {
    id: 'luxe',
    nama: 'Luna Beauty',
    sections: [
      {
        id: 'hero',
        type: 'hero',
        required: true,
        editable: ['title', 'subtitle', 'description', 'image_url', 'cta_text', 'background_color'],
        deletable: false,
        defaultContent: {
          ...defaultHero,
          title: 'Luna Beauty',
          subtitle: 'Unleash Your Inner Goddess',
          description: 'Kosmetik premium dengan formula advanced untuk tampilan memukau dan percaya diri yang maksimal',
          cta_text: 'Discover Collection',
          background_color: '#7c3aed'
        }
      },
      {
        id: 'product_showcase',
        type: 'product_showcase',
        required: false,
        editable: ['title', 'products'],
        deletable: true,
        defaultContent: {
          title: 'Best Sellers',
          products: [
            { name: 'Luna Foundation', price: 'Rp 450.000', image: '/templates/luxe/foundation.jpg' },
            { name: 'Velvet Lipstick', price: 'Rp 180.000', image: '/templates/luxe/lipstick.jpg' },
            { name: 'Glow Serum', price: 'Rp 380.000', image: '/templates/luxe/serum.jpg' }
          ]
        }
      },
      {
        id: 'testimonials',
        type: 'testimonials',
        required: false,
        editable: ['title', 'testimonials'],
        deletable: true,
        defaultContent: {
          title: 'Love from Our Customers',
          testimonials: [
            { name: 'Sarah K.', text: 'Foundation ini coverage-nya perfect tapi tetap ringan!', rating: 5 },
            { name: 'Maya P.', text: 'Lipstick-nya long-lasting dan pigmented banget', rating: 5 },
            { name: 'Rina S.', text: 'Serumnya bikin kulit aku glowing banget', rating: 5 }
          ]
        }
      },
      {
        id: 'contact',
        type: 'contact',
        required: true,
        editable: ['title', 'address', 'phone', 'show_map'],
        deletable: false,
        defaultContent: {
          ...defaultContact,
          title: 'Beauty Consultant',
          address: 'Jl. Luxury No. 99, Jakarta Selatan',
          phone: '08123456789',
          show_map: true
        }
      },
      {
        id: 'footer',
        type: 'footer',
        required: true,
        editable: ['copyright', 'social_links'],
        deletable: false,
        defaultContent: {
          ...defaultFooter,
          copyright: '© 2024 Luna Beauty. All rights reserved.',
          social_links: [
            { platform: 'instagram', url: '#' },
            { platform: 'youtube', url: '#' },
            { platform: 'whatsapp', url: '#' }
          ]
        }
      }
    ]
  },
  {
    id: 'herba',
    nama: 'Bazzhealth',
    sections: [
      {
        id: 'hero',
        type: 'hero',
        required: true,
        editable: ['title', 'subtitle', 'description', 'image_url', 'cta_text', 'background_color'],
        deletable: false,
        defaultContent: {
          ...defaultHero,
          title: 'Bazzhealth',
          subtitle: 'Your Trusted Health Partner',
          description: 'Produk kesehatan berkualitas dengan izin BPOM dan terbuat dari bahan alami pilihan',
          cta_text: 'Konsultasi Sekarang',
          background_color: '#16a34a'
        }
      },
      {
        id: 'services',
        type: 'services',
        required: false,
        editable: ['title', 'services'],
        deletable: true,
        defaultContent: {
          title: 'Layanan Kami',
          services: [
            { name: 'Konsultasi Apoteker', description: 'Gratis konsultasi dengan apoteker berpengalaman', icon: 'pharmacy' },
            { name: 'Delivery Obat', description: 'Antar obat resep langsung ke rumah', icon: 'delivery' },
            { name: 'Cek Kesehatan', description: 'Tes kesehatan dasar gratis setiap bulan', icon: 'health' }
          ]
        }
      },
      {
        id: 'certifications',
        type: 'certifications',
        required: false,
        editable: ['title', 'certificates'],
        deletable: true,
        defaultContent: {
          title: 'Sertifikasi & Izin',
          certifies: [
            { name: 'BPOM', description: 'Badan Pengawas Obat dan Makanan' },
            { name: 'Halal MUI', description: 'Majelis Ulama Indonesia' },
            { name: 'ISO 9001', description: 'International Standard Organization' },
            { name: 'PFI', description: 'Pharmacy Facility Inspection' }
          ]
        }
      },
      {
        id: 'contact',
        type: 'contact',
        required: true,
        editable: ['title', 'address', 'phone', 'show_map'],
        deletable: false,
        defaultContent: {
          ...defaultContact,
          title: 'Hubungi Kami',
          address: 'Jl. Sehat No. 77, Jakarta Timur',
          phone: '08123456789',
          show_map: true
        }
      },
      {
        id: 'footer',
        type: 'footer',
        required: true,
        editable: ['copyright', 'social_links'],
        deletable: false,
        defaultContent: {
          ...defaultFooter,
          copyright: '© 2024 Bazzhealth. All rights reserved.',
          social_links: [
            { platform: 'website', url: '#' },
            { platform: 'whatsapp', url: '#' },
            { platform: 'email', url: '#' }
          ]
        }
      }
    ]
  }
]

// Helper functions
export function getTemplateDefinition(templateId: TemplateId): TemplateDefinition | undefined {
  return TEMPLATE_DEFINITIONS.find(t => t.id === templateId)
}

export function getSectionDefinition(templateId: TemplateId, sectionId: string): SectionDefinition | undefined {
  const template = getTemplateDefinition(templateId)
  return template?.sections.find(s => s.id === sectionId)
}

export function getDefaultContent(templateId: TemplateId, sectionId: string): Record<string, any> {
  const section = getSectionDefinition(templateId, sectionId)
  return section?.defaultContent || {}
}
