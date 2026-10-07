/**
 * TypeScript Type Definitions
 * 
 * File ini berisi semua tipe data yang digunakan di aplikasi.
 * Harus sinkron dengan schema database di supabase/schema.sql
 * 
 * Jika mengubah struktur database:
 * 1. Update schema.sql
 * 2. Update file ini
 * 3. Check semua file yang pakai tipe tersebut
 */

/**
 * Seller/User yang mendaftar di platform
 * Terhubung dengan auth.users Supabase
 */
export interface Seller {
  id: string;
  user_id: string;  // Foreign key ke auth.users
  email: string;
  nama_lengkap: string;
  no_wa: string;
  created_at: string;
}

export type TemplateId = 'butik' | 'dapur' | 'glow' | 'luxe' | 'herba';
export type StorePlan = 'free' | 'pro';
export type FontHeading = 'Outfit' | 'Poppins' | 'Playfair Display' | 'Montserrat';
export type FontBody = 'Inter' | 'Poppins' | 'Montserrat';
export type ProductType = 'general' | 'fashion' | 'food' | 'skincare' | 'beauty' | 'health';
export type ProductOptionType = 'size' | 'color' | 'portion' | 'shade' | 'flavor' | 'scent' | 'material' | 'topping' | 'custom';

export interface ProductCategory {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface ProductOptionValue {
  id: string;
  label: string;
  color_hex?: string;
  price_delta?: number;
  stock?: number;
  weight_delta?: number;
}

export interface ProductOptionGroup {
  id: string;
  name: string;
  type: ProductOptionType;
  required: boolean;
  values: ProductOptionValue[];
}

export interface ProductVariantOption {
  id: string;
  label: string;
  sku?: string;
  option_values: string[];
  price_delta?: number;
  stock?: number;
  weight_gram?: number;
  image_url?: string | null;
}

export interface ProductAddon {
  id: string;
  name: string;
  price: number;
  required?: boolean;
  max_qty?: number;
}

export interface ProductDetails {
  unit?: string;
  portion_detail?: string;
  contents?: string;
  ingredients?: string;
  usage?: string;
  material?: string;
  size_chart?: string;
  expiry_info?: string;
  storage?: string;
  shipping_note?: string;
}

/**
 * Data Toko - Core entity aplikasi
 * URL toko: /[slug] (multi-tenant)
 * Satu seller bisa punya banyak toko (untuk future scalability)
 */
export interface Store {
  id: string;
  seller_id: string;  // Foreign key ke sellers
  nama_toko: string;
  slug: string;       // Unique, untuk URL: /[slug]
  deskripsi: string | null;
  template: TemplateId;
  warna_tema: string; // Hex color, contoh: #16a34a
  logo_url: string | null;
  no_wa: string;      // Format: 08123456789
  alamat: string | null;
  kota: string | null;
  business_category: string | null;
  is_active: boolean;
  plan: StorePlan;
  plan_expires_at: string | null;
  pro_started_at: string | null;
  pro_notes: string | null;
  // Kustomisasi template
  hero_image_url: string | null;
  font_heading: FontHeading;
  font_body: FontBody;
  hero_title: string | null;
  hero_subtitle: string | null;
  is_published: boolean;  // True = bisa diakses publik
  created_at: string;
  updated_at: string;
}

/**
 * Produk dalam katalog toko
 * Semua produk terkait dengan satu store_id
 * Urutan digunakan untuk sorting manual
 */
export interface Product {
  id: string;
  store_id: string;   // Foreign key ke stores
  nama: string;
  harga: number;      // Dalam Rupiah
  deskripsi: string | null;
  foto_url: string | null;  // URL dari Supabase Storage
  kategori: string | null;
  category_id?: string | null;
  product_type?: ProductType;
  option_groups?: ProductOptionGroup[];
  variants?: ProductVariantOption[];
  addons?: ProductAddon[];
  product_details?: ProductDetails;
  show_category?: boolean;
  show_on_homepage?: boolean;
  homepage_rank?: number;
  badge_label?: string | null;
  compare_at_price?: number | null;
  is_active: boolean; // True = muncul di katalog publik
  urutan: number;     // Untuk custom ordering
  stok: number;       // Stok tersedia
  berat_gram: number; // Untuk kalkulasi ongkir
  created_at: string;
  updated_at: string;
}

export interface ShippingOption {
  courier: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
}

export interface StoreAddress {
  id: string;
  store_id: string;
  label: string;
  nama_pengirim: string;
  no_telp: string;
  alamat_lengkap: string;
  province_id: string | null;
  city_id: string | null;
  district_id: string | null;
  subdistrict_id: string | null;
  postal_code: string | null;
  is_default: boolean;
}
