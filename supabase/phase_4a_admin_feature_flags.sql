-- PHASE 4A — Admin Dashboard + Feature Flags
-- Migration: Buat tabel admin dan feature flags
-- Jalankan di Supabase SQL Editor

-- =====================================================
-- 1. TABEL FEATURE_FLAGS (Global platform flags)
-- =====================================================
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  enabled_globally BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Policy: Hanya admin yang bisa baca/ubah
CREATE POLICY "admin_only_feature_flags" ON feature_flags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM sellers
      WHERE sellers.user_id = auth.uid()
      AND sellers.role = 'admin'
    )
  );

-- =====================================================
-- 2. TABEL STORE_FEATURE_FLAGS (Override per toko)
-- =====================================================
CREATE TABLE IF NOT EXISTS store_feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(store_id, feature_key)
);

ALTER TABLE store_feature_flags ENABLE ROW LEVEL SECURITY;

-- Policy: Admin manage, tapi seller bisa baca untuk toko sendiri
CREATE POLICY "admin_manage_store_flags" ON store_feature_flags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM sellers
      WHERE sellers.user_id = auth.uid()
      AND sellers.role = 'admin'
    )
  );

CREATE POLICY "store_owner_read_flags" ON store_feature_flags FOR SELECT
  USING (
    store_id IN (
      SELECT id FROM stores WHERE seller_id IN (
        SELECT id FROM sellers WHERE user_id = auth.uid()
      )
    )
  );

-- =====================================================
-- 3. TABEL ADMIN_LOGS (Audit trail)
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_type TEXT,       -- 'store' | 'user' | 'feature_flag' | 'system'
  target_id UUID,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Hanya admin bisa baca log
CREATE POLICY "admin_read_logs" ON admin_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sellers
      WHERE sellers.user_id = auth.uid()
      AND sellers.role = 'admin'
    )
  );

-- Policy: Insert oleh admin (untuk logging)
CREATE POLICY "admin_insert_logs" ON admin_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sellers
      WHERE sellers.user_id = auth.uid()
      AND sellers.role = 'admin'
    )
  );

-- =====================================================
-- 4. TABEL PLATFORM_SETTINGS (Key-value settings)
-- =====================================================
CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Admin only
CREATE POLICY "admin_manage_settings" ON platform_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM sellers
      WHERE sellers.user_id = auth.uid()
      AND sellers.role = 'admin'
    )
  );

-- =====================================================
-- 5. TAMBAH KOLOM ROLE KE TABEL SELLERS
-- =====================================================
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'seller';

-- Validasi role: 'seller' | 'admin'
-- Note: Belum pakai CHECK constraint agar backward compatible
-- Set admin pertama manual dengan:
-- UPDATE sellers SET role = 'admin' WHERE email = 'your-email@example.com';

-- =====================================================
-- 6. SEED FEATURE FLAGS DEFAULT
-- =====================================================
INSERT INTO feature_flags (key, name, description, enabled_globally) VALUES
  ('auto_shipping',          'Ongkir Otomatis',         'Kalkulasi ongkir via RajaOngkir/Komerce. Matikan jika API error atau kuota menipis.', false),
  ('formal_region_address',  'Alamat Formal (API)',      'Form alamat wajib via dropdown wilayah API.co.id.',          false),
  ('setup_wizard',           'Setup Wizard',             'Guided wizard 8-step untuk setup toko.',                     false),
  ('visual_editor',          'Visual Editor',            'Click-to-edit template editor di dashboard.',                false),
  ('qris_checkout',          'Checkout QRIS',            'Pembayaran via upload bukti QRIS.',                          true),
  ('product_gallery',        'Galeri Produk',            'Multiple foto per produk.',                                  true),
  ('turnstile_captcha',      'Cloudflare Turnstile',     'CAPTCHA di halaman register.',                               true),
  ('email_verification',     'Verifikasi Email',         'Wajib verifikasi email setelah register.',                   true),
  ('maintenance_mode',       'Maintenance Mode',         'Tampilkan halaman maintenance ke semua user.',               false)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- 7. INDEX UNTUK PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(key);
CREATE INDEX IF NOT EXISTS idx_store_feature_flags_store ON store_feature_flags(store_id);
CREATE INDEX IF NOT EXISTS idx_store_feature_flags_key ON store_feature_flags(feature_key);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_logs(created_at DESC);

-- =====================================================
-- SELESAI
-- =====================================================
-- Setelah menjalankan SQL ini:
-- 1. Set admin pertama: UPDATE sellers SET role = 'admin' WHERE email = 'your@email.com';
-- 2. Verifikasi: SELECT * FROM feature_flags;
-- 3. Cek admin_logs: SELECT * FROM admin_logs LIMIT 5;
