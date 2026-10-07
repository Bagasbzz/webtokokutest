/**
 * Feature Flags - Client Types
 * 
 * Tidak boleh akses DB langsung dari client — gunakan API route atau server props
 */

export type FeatureKey =
  | 'auto_shipping'
  | 'formal_region_address'
  | 'setup_wizard'
  | 'visual_editor'
  | 'qris_checkout'
  | 'product_gallery'
  | 'turnstile_captcha'
  | 'email_verification'
  | 'maintenance_mode'

export type FeatureFlags = Record<FeatureKey, boolean>

/**
 * Default flags untuk client-side fallback
 * Selalu sync dengan database seed di supabase/phase_4a_admin_feature_flags.sql
 */
export const DEFAULT_FLAGS: FeatureFlags = {
  auto_shipping: false,          // RajaOngkir dinyalakan setelah API key siap
  formal_region_address: false,  // API.co.id sedang error
  setup_wizard: false,           // Belum selesai dibangun
  visual_editor: false,          // Belum selesai dibangun
  qris_checkout: true,           // Sudah stabil
  product_gallery: true,         // Sudah stabil
  turnstile_captcha: true,       // Sudah dibuat, build sukses
  email_verification: true,      // Sudah dibuat, build sukses
  maintenance_mode: false,       // Default OFF
}

/**
 * Label dan deskripsi untuk UI admin
 */
export const FEATURE_FLAGS_METADATA: Record<FeatureKey, { name: string; description: string }> = {
  auto_shipping: {
    name: 'Ongkir Otomatis',
    description: 'Kalkulasi ongkir via RajaOngkir/Komerce. Matikan jika API error atau kuota menipis.',
  },
  formal_region_address: {
    name: 'Alamat Formal (API)',
    description: 'Form alamat wajib via dropdown wilayah API.co.id.',
  },
  setup_wizard: {
    name: 'Setup Wizard',
    description: 'Guided wizard 8-step untuk setup toko.',
  },
  visual_editor: {
    name: 'Visual Editor',
    description: 'Click-to-edit template editor di dashboard.',
  },
  qris_checkout: {
    name: 'Checkout QRIS',
    description: 'Pembayaran via upload bukti QRIS.',
  },
  product_gallery: {
    name: 'Galeri Produk',
    description: 'Multiple foto per produk.',
  },
  turnstile_captcha: {
    name: 'Cloudflare Turnstile',
    description: 'CAPTCHA di halaman register.',
  },
  email_verification: {
    name: 'Verifikasi Email',
    description: 'Wajib verifikasi email setelah register.',
  },
  maintenance_mode: {
    name: 'Maintenance Mode',
    description: 'Tampilkan halaman maintenance ke semua user.',
  },
}
