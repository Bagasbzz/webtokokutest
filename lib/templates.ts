/**
 * Template Configuration System
 * 
 * File ini mendefinisikan semua template yang tersedia di webtokoku.
 * Setiap template memiliki konfigurasi warna, font, dan demo URL.
 * 
 * Jika menambah template baru:
 * 1. Tambahkan entry di array TEMPLATES
 * 2. Buat file HTML di public/demo/[nama].html
 * 3. Generate preview image di public/template-previews/
 * 4. Update types.ts jika perlu
 * 
 * @see docs/SYSTEM_PLAN.md untuk detail arsitektur template
 */

import type { TemplateId } from './types';

export interface TemplateConfig {
  id: TemplateId;
  nama: string;
  deskripsi: string;
  kategori: string;
  warna_default: string;
  preview_image: string;
  demo_url: string;
  hero_bg: string;
  font_heading_default: string;
  font_body_default: string;
}

export const TEMPLATES: TemplateConfig[] = [
  {
    id: 'butik',
    nama: 'Butik Hana',
    deskripsi: 'Bersih dan rapi untuk fashion, hijab, dan aksesori',
    kategori: 'Fashion & Hijab',
    warna_default: '#C5A059',
    preview_image: '/template-previews/butik-desktop.jpg',
    demo_url: '/demo/fashion.html',
    hero_bg: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
    font_heading_default: 'Cinzel',
    font_body_default: 'Montserrat',
  },
  {
    id: 'dapur',
    nama: 'Dapur Nusantara',
    deskripsi: 'Hangat untuk makanan, minuman, dan menu pre-order',
    kategori: 'Makanan & Minuman',
    warna_default: '#D86B43',
    preview_image: '/template-previews/dapur-desktop.jpg',
    demo_url: '/demo/makanan.html',
    hero_bg: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
    font_heading_default: 'Playfair Display',
    font_body_default: 'Plus Jakarta Sans',
  },
  {
    id: 'glow',
    nama: 'Glow Lab',
    deskripsi: 'Tenang dan bersih untuk skincare dan perawatan diri',
    kategori: 'Skincare',
    warna_default: '#059669',
    preview_image: '/template-previews/glow-desktop.jpg',
    demo_url: '/demo/skincare.html',
    hero_bg: 'linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 100%)',
    font_heading_default: 'Playfair Display',
    font_body_default: 'Inter',
  },
  {
    id: 'luxe',
    nama: 'Luna Beauty',
    deskripsi: 'Tegas dan modern untuk kosmetik dan beauty brand',
    kategori: 'Kosmetik',
    warna_default: '#8B5CF6',
    preview_image: '/template-previews/luxe-desktop.jpg',
    demo_url: '/demo/kosmetik.html',
    hero_bg: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%)',
    font_heading_default: 'Syne',
    font_body_default: 'Inter',
  },
  {
    id: 'herba',
    nama: 'Bazzhealth',
    deskripsi: 'Rapi dan informatif untuk produk kesehatan',
    kategori: 'Kesehatan & Apotek',
    warna_default: '#2d6a4f',
    preview_image: '/template-previews/herba-desktop.jpg',
    demo_url: '/demo/kesehatan.html',
    hero_bg: 'linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%)',
    font_heading_default: 'Fraunces',
    font_body_default: 'Plus Jakarta Sans',
  },
];

export function getTemplateById(id: TemplateId): TemplateConfig {
  return TEMPLATES.find(t => t.id === id) ?? TEMPLATES[0];
}
