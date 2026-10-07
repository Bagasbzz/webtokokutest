-- =====================================================================
-- RESEARCH_ALL_IN_ONE.sql  (GENERATED - JANGAN DIEDIT MANUAL)
-- Baseline penelitian: baseline-v1 (commit bdf47ab)
--
-- Gabungan file SQL asli sesuai urutan di docs/RESEARCH_SETUP.md.
-- Isi tiap file disalin APA ADANYA (tidak ada perubahan isi).
-- Dilewati: 1_RESET_ONLY.sql (destruktif), migrations/step12 & step21
--           (policy duplikat dgn 2_CREATE_ALL.sql; isi lain sudah tercakup).
--
-- HANYA untuk project Supabase PENELITIAN yang BARU & KOSONG.
-- Dibungkus satu transaksi: jika ada error, semua dibatalkan (rollback).
--
-- Sumber (SHA-256 isi file asli):
--   supabase/2_CREATE_ALL.sql  a1d129e3378c4b9c191144b479641dd125cae89f65b5eeda83a36a4e083e417b
--   supabase/phase_5_setup_wizard.sql  8808e76fd4632fd20f0dc8f76f788ca801145220547e3e649d9b3404132b1338
--   supabase/migrations/step20_formal_regions.sql  3989a7cd6f2445393e5f23bc3410f39890425d238136f70dc6517fd5c6949517
--   supabase/migrations/step22_custom_domains.sql  bc4af267a487e626ec7651f54f2731bb1aad17e8c5745788a5487f998bf93f3b
--   supabase/migrations/step23_rajaongkir_komerce_usage.sql  5c41b901da645b83470d28ba145bed4d7b71d67c0c03c765630042fe860d0442
--   supabase/migrations/step24_product_options_categories.sql  5cef4f6ee62e06398eec04850fa1aa364ba7bdf4fdcf734913d1f43d6ddd8f4c
--   supabase/migrations/step25_homepage_product_controls.sql  53023a6a6e44ae0d760336b01183b0e432fc875edb0d4b124c82fa6bbe538b05
--   supabase/migrations/step26_fix_product_categories_constraints.sql  4216684cb1f7760176f5600743305a59a6d4298a877a853462d68d474147de06
--   supabase/migrations/step27_analytics_notifications.sql  33a95fb6ee7961f7b51cbf08491334efc9bb8e08e1d4c7370b7fb777d0cf3976
--   supabase/migrations/step28_fix_orders_policies.sql  1aa7eceb281390cd0be62b1cc1fd089548fb44d5d2c92071f5e9f8bb88948220
--   supabase/migrations/step29_atomic_stock_decrement.sql  b1c3161113f19de1536a872a0d03d089969c4816b6c1b63ea662810bbca6a23c
--   supabase/migrations/step31_store_traffic_table.sql  55227fcfd10f3ec963be0b1d6744bd1fcf9d81031ebc2daf3eed83517d241454
--   supabase/migrations/step32_store_plan.sql  0ca7529bfab2b94c326a0cf3f5dc006086e99a4f68e837591ff6923ef8446f17
--   supabase/migrations/step33_store_business_category.sql  dd9edbbdb9d1328fdbdbea68e032d4d0d334896d57f76bfdeedccfa9e533ecf8
--   supabase/migrations/step34_order_payment_proof_path.sql  05068c7750b81e1acf5b08c24e6a500ad8cf5f60510e8d8928030b01181bdd7e
--   supabase/migrations/step35_option_stock_rpc.sql  56e873294bf66530584df7197635d3bed66402bd38f1f262ebf31eead13bae88
--   supabase/migrations/step36_security_batch1_rls_admin_hardening.sql  0b077608529decf41f966a46ee39442d40bcc3a9e0281f96561702bcc3194210
--   supabase/migrations/step37_security_batch5_moderation.sql  43487cb0081b0d30fad5587af529ad11b74d9b6cbaeb940e65d2181cc8e84e0c
--   supabase/migrations/step38_security_batch5_1_moderation_gap_fixes.sql  4ff84ccf71dce1aa0d6e18fe890cdc641fb75645799eec90a5a5421ef0d9ade3
--   supabase/migrations/step39_security_batch5_2_moderation_insert_lock.sql  48dc03481a28eada180ba871314293ddeeb1050ac674592bec82bc259d556f44
--   supabase/migrations/step40_dashboard_analytics_aggregation.sql  1326d4370f2acc6faaeacaebe3da61daac64ccece1afbd3f1ca5d99c26c6e970
-- =====================================================================

BEGIN;

-- >>>>>>>>>>>>>>>>>>>> BEGIN FILE: supabase/2_CREATE_ALL.sql
-- ============================================================
-- STEP 2: CREATE ALL - BUAT SEMUA TABEL BARU
-- Jalankan setelah 1_RESET_ONLY.sql selesai
-- ============================================================

-- 1. SELLERS
CREATE TABLE IF NOT EXISTS sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nama_lengkap TEXT NOT NULL,
  no_wa TEXT NOT NULL,
  role TEXT DEFAULT 'seller',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sellers_select_own" ON sellers;
CREATE POLICY "sellers_select_own" ON sellers FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "sellers_update_own" ON sellers;
CREATE POLICY "sellers_update_own" ON sellers FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "sellers_insert_own" ON sellers;
CREATE POLICY "sellers_insert_own" ON sellers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 2. STORES
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
  nama_toko TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  deskripsi TEXT,
  template TEXT DEFAULT 'butik',
  warna_tema TEXT DEFAULT '#16A34A',
  logo_url TEXT,
  no_wa TEXT NOT NULL,
  alamat TEXT,
  kota TEXT,
  is_active BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT false,
  hero_image_url TEXT,
  font_heading TEXT DEFAULT 'Outfit',
  font_body TEXT DEFAULT 'Inter',
  hero_title TEXT,
  hero_subtitle TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "stores_owner" ON stores;
CREATE POLICY "stores_owner" ON stores FOR ALL USING (seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "stores_public" ON stores;
CREATE POLICY "stores_public" ON stores FOR SELECT USING (is_active = true);

-- 3. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  harga INTEGER NOT NULL,
  deskripsi TEXT,
  foto_url TEXT,
  kategori TEXT,
  is_active BOOLEAN DEFAULT true,
  stok INTEGER DEFAULT 0,
  berat_gram INTEGER DEFAULT 0,
  urutan INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_owner" ON products;
CREATE POLICY "products_owner" ON products FOR ALL USING (store_id IN (SELECT id FROM stores WHERE seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())));
DROP POLICY IF EXISTS "products_public" ON products;
CREATE POLICY "products_public" ON products FOR SELECT USING (is_active = true);

-- 4. PRODUCT_IMAGES
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  urutan INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_images_owner" ON product_images;
CREATE POLICY "product_images_owner" ON product_images FOR ALL USING (product_id IN (SELECT id FROM products WHERE store_id IN (SELECT id FROM stores WHERE seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid()))));
DROP POLICY IF EXISTS "product_images_public" ON product_images;
CREATE POLICY "product_images_public" ON product_images FOR SELECT USING (true);

-- 5. PRODUCT_CATEGORIES
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(store_id, slug)
);

-- Safety untuk DB yang sudah ada tanpa constraint ini
CREATE UNIQUE INDEX IF NOT EXISTS product_categories_store_id_slug_key
  ON product_categories(store_id, slug);

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "categories_owner" ON product_categories;
CREATE POLICY "categories_owner" ON product_categories FOR ALL USING (store_id IN (SELECT id FROM stores WHERE seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())));
DROP POLICY IF EXISTS "categories_public" ON product_categories;
CREATE POLICY "categories_public" ON product_categories FOR SELECT USING (is_active = true);

-- 6. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  order_code TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  customer_address TEXT,
  province_id TEXT,
  city_id TEXT,
  district_id TEXT,
  subdistrict_id TEXT,
  postal_code TEXT,
  items JSONB NOT NULL,
  subtotal INTEGER NOT NULL,
  shipping_cost INTEGER DEFAULT 0,
  shipping_courier TEXT,
  shipping_service TEXT,
  shipping_etd TEXT,
  total INTEGER NOT NULL,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  order_status TEXT DEFAULT 'menunggu_konfirmasi',
  bukti_url TEXT,
  bukti_uploaded_at TIMESTAMPTZ,
  customer_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "orders_owner" ON orders;
CREATE POLICY "orders_owner" ON orders FOR SELECT USING (store_id IN (SELECT id FROM stores WHERE seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())));
DROP POLICY IF EXISTS "orders_insert" ON orders;
CREATE POLICY "orders_insert" ON orders FOR INSERT WITH CHECK (true);

-- 7. ORDER_ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  weight_gram INTEGER DEFAULT 0,
  total INTEGER NOT NULL
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "order_items_owner" ON order_items;
CREATE POLICY "order_items_owner" ON order_items FOR SELECT USING (order_id IN (SELECT id FROM orders WHERE store_id IN (SELECT id FROM stores WHERE seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid()))));

-- 8. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 9. PAYMENT_METHODS
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  qr_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payment_methods_owner" ON payment_methods;
CREATE POLICY "payment_methods_owner" ON payment_methods FOR ALL USING (store_id IN (SELECT id FROM stores WHERE seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())));
DROP POLICY IF EXISTS "payment_methods_public" ON payment_methods;
CREATE POLICY "payment_methods_public" ON payment_methods FOR SELECT USING (is_active = true);

-- 10. CHECKOUT_SETTINGS
CREATE TABLE IF NOT EXISTS checkout_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  enable_checkout BOOLEAN DEFAULT true,
  enable_whatsapp_redirect BOOLEAN DEFAULT true,
  enable_payment_proof BOOLEAN DEFAULT true,
  whatsapp_template TEXT,
  success_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE checkout_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "checkout_settings_owner" ON checkout_settings;
CREATE POLICY "checkout_settings_owner" ON checkout_settings FOR ALL USING (store_id IN (SELECT id FROM stores WHERE seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())));
DROP POLICY IF EXISTS "checkout_settings_public" ON checkout_settings;
CREATE POLICY "checkout_settings_public" ON checkout_settings FOR SELECT USING (true);

-- 11. STORE_ADDRESSES
CREATE TABLE IF NOT EXISTS store_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Utama',
  nama_pengirim TEXT NOT NULL,
  no_telp TEXT NOT NULL,
  alamat_lengkap TEXT NOT NULL,
  province_id TEXT,
  province_code TEXT,
  province_name TEXT,
  city_id TEXT,
  regency_code TEXT,
  regency_name TEXT,
  district_id TEXT,
  district_code TEXT,
  district_name TEXT,
  subdistrict_id TEXT,
  village_code TEXT,
  village_name TEXT,
  postal_code TEXT,
  location_notes TEXT,
  map_url TEXT,
  is_default BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE store_addresses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "store_addresses_owner" ON store_addresses;
CREATE POLICY "store_addresses_owner" ON store_addresses FOR ALL USING (store_id IN (SELECT id FROM stores WHERE seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())));

-- 12. SHIPPING_SETTINGS
CREATE TABLE IF NOT EXISTS shipping_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE UNIQUE,
  auto_shipping_enabled BOOLEAN DEFAULT false,
  pickup_enabled BOOLEAN DEFAULT true,
  cod_enabled BOOLEAN DEFAULT false,
  allowed_couriers JSONB DEFAULT '["jne","jnt","sicepat"]',
  free_shipping_minimum INTEGER DEFAULT 0
);

ALTER TABLE shipping_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "shipping_settings_owner" ON shipping_settings;
CREATE POLICY "shipping_settings_owner" ON shipping_settings FOR ALL USING (store_id IN (SELECT id FROM stores WHERE seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())));

-- 13. RO_LOCATIONS
CREATE TABLE IF NOT EXISTS ro_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  response_json JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days')
);

ALTER TABLE ro_locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ro_locations_service" ON ro_locations;
CREATE POLICY "ro_locations_service" ON ro_locations FOR ALL USING (false);
CREATE INDEX IF NOT EXISTS idx_ro_locations_query ON ro_locations(query);
CREATE INDEX IF NOT EXISTS idx_ro_locations_expires ON ro_locations(expires_at);

-- 14. TEMPLATE_CUSTOMIZATIONS
CREATE TABLE IF NOT EXISTS template_customizations (
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL,
  element_key TEXT NOT NULL,
  value TEXT NOT NULL,
  is_draft BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (store_id, section_key, element_key, is_draft)
);

ALTER TABLE template_customizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "customizations_owner" ON template_customizations;
CREATE POLICY "customizations_owner" ON template_customizations FOR ALL USING (store_id IN (SELECT s.id FROM stores s JOIN sellers sel ON sel.id = s.seller_id WHERE sel.user_id = auth.uid()));
DROP POLICY IF EXISTS "customizations_public" ON template_customizations;
CREATE POLICY "customizations_public" ON template_customizations FOR SELECT USING (is_draft = false);

-- 15. TEMPLATE_REVISIONS
CREATE TABLE IF NOT EXISTS template_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  is_auto_save BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  is_published BOOLEAN DEFAULT false,
  UNIQUE(store_id, revision_number)
);

ALTER TABLE template_revisions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "revisions_owner" ON template_revisions;
CREATE POLICY "revisions_owner" ON template_revisions FOR ALL USING (store_id IN (SELECT id FROM stores WHERE seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())));
CREATE INDEX IF NOT EXISTS idx_revisions_store_id ON template_revisions(store_id);
CREATE INDEX IF NOT EXISTS idx_revisions_number ON template_revisions(revision_number DESC);

-- 16. FEATURE_FLAGS
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
DROP POLICY IF EXISTS "feature_flags_public" ON feature_flags;
CREATE POLICY "feature_flags_public" ON feature_flags FOR SELECT USING (true);
DROP POLICY IF EXISTS "feature_flags_admin" ON feature_flags;
CREATE POLICY "feature_flags_admin" ON feature_flags FOR ALL USING (EXISTS (SELECT 1 FROM sellers WHERE user_id = auth.uid() AND role = 'admin'));

-- 17. STORE_FEATURE_FLAGS
CREATE TABLE IF NOT EXISTS store_feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  feature_key TEXT REFERENCES feature_flags(key) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(store_id, feature_key)
);

ALTER TABLE store_feature_flags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "store_flags_public" ON store_feature_flags;
CREATE POLICY "store_flags_public" ON store_feature_flags FOR SELECT USING (true);
DROP POLICY IF EXISTS "store_flags_admin" ON store_feature_flags;
CREATE POLICY "store_flags_admin" ON store_feature_flags FOR ALL USING (EXISTS (SELECT 1 FROM sellers WHERE user_id = auth.uid() AND role = 'admin'));

-- 18. ADMIN_LOGS
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_logs_read" ON admin_logs;
CREATE POLICY "admin_logs_read" ON admin_logs FOR SELECT USING (EXISTS (SELECT 1 FROM sellers WHERE user_id = auth.uid() AND role = 'admin'));
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_logs(created_at DESC);

-- 19. PLATFORM_SETTINGS
CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "platform_settings_admin" ON platform_settings;
CREATE POLICY "platform_settings_admin" ON platform_settings FOR ALL USING (EXISTS (SELECT 1 FROM sellers WHERE user_id = auth.uid() AND role = 'admin'));

-- ============================================================
-- SEED DATA: FEATURE FLAGS DEFAULT
-- ============================================================

INSERT INTO feature_flags (key, name, description, enabled_globally) VALUES
  ('auto_shipping', 'Ongkir Otomatis', 'Kalkulasi ongkir via RajaOngkir/Komerce. Matikan jika API error atau kuota menipis.', false),
  ('formal_region_address', 'Alamat Formal (API)', 'Form alamat via dropdown API.co.id.', false),
  ('setup_wizard', 'Setup Wizard', 'Guided wizard 8-step untuk setup toko.', false),
  ('visual_editor', 'Visual Editor', 'Click-to-edit template editor.', false),
  ('qris_checkout', 'Checkout QRIS', 'Pembayaran via upload bukti QRIS.', true),
  ('product_gallery', 'Galeri Produk', 'Multiple foto per produk.', true),
  ('turnstile_captcha', 'Cloudflare Turnstile', 'CAPTCHA di register.', true),
  ('email_verification', 'Verifikasi Email', 'Wajib verifikasi email.', true),
  ('maintenance_mode', 'Maintenance Mode', 'Platform maintenance.', false)
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- SEED DATA: PLATFORM SETTINGS (Admin Credentials)
-- Catatan: Password disimpan dengan aman di platform_settings
-- ============================================================

INSERT INTO platform_settings (key, value, description) VALUES
  ('admin_credentials', '{"username": "Bazazi", "password": "<REDACTED>", "email": "admin@webtokoku.com"}', 'Default admin login credentials')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION create_default_shipping_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO shipping_settings (store_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER tr_create_shipping_settings
  AFTER INSERT ON stores
  FOR EACH ROW
  EXECUTE FUNCTION create_default_shipping_settings();

-- ============================================================
-- ✅ SELESAI! Semua tabel sudah dibuat dengan seed data.
-- ============================================================
-- Catatan Penting:
-- - Feature flags sudah di-set default
-- - Admin credentials tersimpan di platform_settings
-- - Setiap store baru akan auto-create shipping_settings
-- ============================================================
;
-- <<<<<<<<<<<<<<<<<<<< END FILE: supabase/2_CREATE_ALL.sql

-- >>>>>>>>>>>>>>>>>>>> BEGIN FILE: supabase/phase_5_setup_wizard.sql
-- ============================================================
-- PHASE 5 — Setup Wizard
-- Migration: 4 tabel baru untuk konten toko
-- ============================================================

-- 1. STORE_TESTIMONIALS (Ulasan pelanggan)
CREATE TABLE IF NOT EXISTS store_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  content TEXT,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  urutan INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE store_testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "testimonials_owner" ON store_testimonials FOR ALL 
  USING (store_id IN (
    SELECT id FROM stores WHERE seller_id IN (
      SELECT id FROM sellers WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "testimonials_public" ON store_testimonials FOR SELECT 
  USING (is_active = true);

CREATE INDEX idx_testimonials_store ON store_testimonials(store_id);

-- 2. STORE_PROMOS (Promo & diskon)
CREATE TABLE IF NOT EXISTS store_promos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  badge_text TEXT,
  image_url TEXT,
  discount_type TEXT,   -- 'percent' | 'fixed'
  discount_value INTEGER,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE store_promos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "promos_owner" ON store_promos FOR ALL 
  USING (store_id IN (
    SELECT id FROM stores WHERE seller_id IN (
      SELECT id FROM sellers WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "promos_public" ON store_promos FOR SELECT 
  USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

CREATE INDEX idx_promos_store ON store_promos(store_id);

-- 3. STORE_BRAND_CONTENTS (Konten brand: story, gallery, sertifikat, video)
CREATE TABLE IF NOT EXISTS store_brand_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  type TEXT NOT NULL,   -- 'story' | 'gallery' | 'certificate' | 'video'
  title TEXT,
  content TEXT,
  media_url TEXT,
  urutan INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE store_brand_contents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brand_contents_owner" ON store_brand_contents FOR ALL 
  USING (store_id IN (
    SELECT id FROM stores WHERE seller_id IN (
      SELECT id FROM sellers WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "brand_contents_public" ON store_brand_contents FOR SELECT 
  USING (is_active = true);

CREATE INDEX idx_brand_contents_store ON store_brand_contents(store_id);

-- 4. STORE_SOCIAL_LINKS (Link sosial media)
CREATE TABLE IF NOT EXISTS store_social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,  -- 'instagram' | 'tiktok' | 'shopee' | 'tokopedia' | 'whatsapp' | 'website'
  url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  urutan INTEGER DEFAULT 0
);

ALTER TABLE store_social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "social_links_owner" ON store_social_links FOR ALL 
  USING (store_id IN (
    SELECT id FROM stores WHERE seller_id IN (
      SELECT id FROM sellers WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "social_links_public" ON store_social_links FOR SELECT 
  USING (is_active = true);

CREATE INDEX idx_social_links_store ON store_social_links(store_id);

-- ============================================================
-- SELESAI! 4 tabel baru untuk Setup Wizard
-- ============================================================
;
-- <<<<<<<<<<<<<<<<<<<< END FILE: supabase/phase_5_setup_wizard.sql

-- >>>>>>>>>>>>>>>>>>>> BEGIN FILE: supabase/migrations/step20_formal_regions.sql
-- Migration Step 20: Formal Regions & Detailed Address
-- Menambahkan kolom wilayah resmi ke tabel store_addresses

ALTER TABLE store_addresses
  ADD COLUMN IF NOT EXISTS province_code TEXT,
  ADD COLUMN IF NOT EXISTS province_name TEXT,
  ADD COLUMN IF NOT EXISTS regency_code TEXT,
  ADD COLUMN IF NOT EXISTS regency_name TEXT,
  ADD COLUMN IF NOT EXISTS district_code TEXT,
  ADD COLUMN IF NOT EXISTS district_name TEXT,
  ADD COLUMN IF NOT EXISTS village_code TEXT,
  ADD COLUMN IF NOT EXISTS village_name TEXT,
  ADD COLUMN IF NOT EXISTS location_notes TEXT,
  ADD COLUMN IF NOT EXISTS map_url TEXT;

-- Index untuk mempermudah pencarian wilayah
CREATE INDEX IF NOT EXISTS idx_store_addresses_village_code ON store_addresses(village_code);
;
-- <<<<<<<<<<<<<<<<<<<< END FILE: supabase/migrations/step20_formal_regions.sql

-- >>>>>>>>>>>>>>>>>>>> BEGIN FILE: supabase/migrations/step22_custom_domains.sql
-- Custom domains for tenant storefronts.
-- Example: stores.slug = 'rina' serves rina.webtokoku.id, and custom_domain = 'rina.id' serves rina.id.

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS custom_domain TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS stores_custom_domain_unique
  ON stores (custom_domain)
  WHERE custom_domain IS NOT NULL;

COMMENT ON COLUMN stores.custom_domain IS
  'Optional seller-owned domain mapped to this store, normalized without protocol or leading www.';
;
-- <<<<<<<<<<<<<<<<<<<< END FILE: supabase/migrations/step22_custom_domains.sql

-- >>>>>>>>>>>>>>>>>>>> BEGIN FILE: supabase/migrations/step23_rajaongkir_komerce_usage.sql
-- Step 23: RajaOngkir by Komerce usage guard
-- Jalankan di Supabase SQL Editor setelah deploy kode.

-- Store address upsert di dashboard memakai store_id + label.
WITH ranked_addresses AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY store_id, label
      ORDER BY is_default DESC, created_at DESC, id DESC
    ) AS row_number
  FROM store_addresses
)
DELETE FROM store_addresses
WHERE id IN (
  SELECT id FROM ranked_addresses WHERE row_number > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_store_addresses_store_label
  ON store_addresses(store_id, label);

-- Catatan hit API agar paket Starter 100 hit/hari bisa dijaga server-side.
CREATE TABLE IF NOT EXISTS shipping_api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service TEXT NOT NULL DEFAULT 'rajaongkir',
  endpoint TEXT NOT NULL,
  store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'counted',
  status_code INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE shipping_api_usage_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shipping_usage_admin_read" ON shipping_api_usage_logs;
CREATE POLICY "shipping_usage_admin_read" ON shipping_api_usage_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sellers
      WHERE sellers.user_id = auth.uid()
      AND sellers.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "shipping_usage_service_write" ON shipping_api_usage_logs;
CREATE POLICY "shipping_usage_service_write" ON shipping_api_usage_logs
  FOR ALL USING (false);

CREATE INDEX IF NOT EXISTS idx_shipping_api_usage_service_created
  ON shipping_api_usage_logs(service, created_at);

CREATE INDEX IF NOT EXISTS idx_shipping_api_usage_store
  ON shipping_api_usage_logs(store_id);

UPDATE feature_flags
SET
  name = 'Ongkir Otomatis',
  description = 'Kalkulasi ongkir via RajaOngkir/Komerce Shipping Cost API. Jika dimatikan, checkout tetap jalan dan ongkir dikonfirmasi via WhatsApp.',
  updated_at = now()
WHERE key = 'auto_shipping';
;
-- <<<<<<<<<<<<<<<<<<<< END FILE: supabase/migrations/step23_rajaongkir_komerce_usage.sql

-- >>>>>>>>>>>>>>>>>>>> BEGIN FILE: supabase/migrations/step24_product_options_categories.sql
-- Step 24: Product categories, option groups, variants, add-ons, and richer product details.
-- Jalankan di Supabase SQL Editor setelah deploy kode.

CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(store_id, slug)
);

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_categories_public_read" ON product_categories;
CREATE POLICY "product_categories_public_read" ON product_categories
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "product_categories_owner_all" ON product_categories;
CREATE POLICY "product_categories_owner_all" ON product_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1
      FROM stores
      JOIN sellers ON sellers.id = stores.seller_id
      WHERE stores.id = product_categories.store_id
      AND sellers.user_id = auth.uid()
    )
  );

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS product_type TEXT NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS option_groups JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS variants JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS addons JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS product_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS show_category BOOLEAN NOT NULL DEFAULT true;

INSERT INTO product_categories (store_id, name, slug)
SELECT DISTINCT
  store_id,
  trim(kategori) AS name,
  lower(regexp_replace(trim(kategori), '[^a-zA-Z0-9]+', '-', 'g')) AS slug
FROM products
WHERE kategori IS NOT NULL
AND trim(kategori) <> ''
ON CONFLICT (store_id, slug) DO NOTHING;

UPDATE products
SET category_id = product_categories.id
FROM product_categories
WHERE products.store_id = product_categories.store_id
AND lower(regexp_replace(trim(products.kategori), '[^a-zA-Z0-9]+', '-', 'g')) = product_categories.slug
AND products.category_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_product_categories_store_active
  ON product_categories(store_id, is_active, sort_order);

CREATE INDEX IF NOT EXISTS idx_products_category_id
  ON products(category_id);

CREATE INDEX IF NOT EXISTS idx_products_type
  ON products(product_type);
;
-- <<<<<<<<<<<<<<<<<<<< END FILE: supabase/migrations/step24_product_options_categories.sql

-- >>>>>>>>>>>>>>>>>>>> BEGIN FILE: supabase/migrations/step25_homepage_product_controls.sql
-- Step 25: Homepage product controls.
-- Jalankan setelah step24 agar seller bisa memilih produk yang tampil di landing toko.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS show_on_homepage BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS homepage_rank INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS badge_label TEXT,
  ADD COLUMN IF NOT EXISTS compare_at_price INTEGER;

CREATE INDEX IF NOT EXISTS idx_products_homepage
  ON products(store_id, is_active, show_on_homepage, homepage_rank);
;
-- <<<<<<<<<<<<<<<<<<<< END FILE: supabase/migrations/step25_homepage_product_controls.sql

-- >>>>>>>>>>>>>>>>>>>> BEGIN FILE: supabase/migrations/step26_fix_product_categories_constraints.sql
-- ============================================================
-- step26_fix_product_categories_constraints.sql
-- Fix: tambah UNIQUE(store_id, slug) constraint yang hilang
-- dan rename kolom 'nama' ke 'name' jika belum
-- Aman dijalankan berulang kali (idempotent)
-- ============================================================

-- 1. Rename kolom 'nama' ke 'name' jika masih ada kolom lama
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'product_categories'
      AND column_name = 'nama'
  ) THEN
    ALTER TABLE public.product_categories RENAME COLUMN nama TO name;
    RAISE NOTICE 'Kolom "nama" berhasil di-rename ke "name"';
  ELSE
    RAISE NOTICE 'Kolom "name" sudah ada, skip rename';
  END IF;
END $$;

-- 2. Tambah UNIQUE INDEX (store_id, slug) jika belum ada
-- Ini juga berlaku sebagai constraint untuk ON CONFLICT (store_id, slug)
CREATE UNIQUE INDEX IF NOT EXISTS product_categories_store_id_slug_key
  ON public.product_categories(store_id, slug);

-- 3. Tambah kolom 'description' dan 'updated_at' jika belum ada
--    (step24 menambahkan ini, tapi 2_CREATE_ALL.sql tidak punya)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'product_categories'
      AND column_name = 'description'
  ) THEN
    ALTER TABLE public.product_categories ADD COLUMN description TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'product_categories'
      AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.product_categories
      ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Selesai
SELECT 'product_categories constraints berhasil diperbaiki' AS status;
;
-- <<<<<<<<<<<<<<<<<<<< END FILE: supabase/migrations/step26_fix_product_categories_constraints.sql

-- >>>>>>>>>>>>>>>>>>>> BEGIN FILE: supabase/migrations/step27_analytics_notifications.sql
-- ============================================================
-- STEP 27: Analytics, Notifications, Platform Enhancements
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- 1. PAGE_VIEWS — untuk analytics traffic per toko
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  page TEXT DEFAULT '/',
  referrer TEXT,
  user_agent TEXT,
  ip_hash TEXT,  -- hashed IP untuk privacy
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
-- Public bisa INSERT (tracking), hanya service role / admin yang bisa SELECT
DROP POLICY IF EXISTS "page_views_insert" ON page_views;
CREATE POLICY "page_views_insert" ON page_views FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "page_views_owner_select" ON page_views;
CREATE POLICY "page_views_owner_select" ON page_views FOR SELECT USING (
  store_id IN (
    SELECT id FROM stores
    WHERE seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
  )
);

CREATE INDEX IF NOT EXISTS idx_page_views_store_id ON page_views(store_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);

-- 2. NOTIFICATIONS — notifikasi dari admin ke seller
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
  -- NULL = broadcast ke semua
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'info' | 'warning' | 'success' | 'error'
  is_read BOOLEAN DEFAULT false,
  link_url TEXT, -- optional CTA link
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
-- Seller baca notif mereka + broadcast
DROP POLICY IF EXISTS "notifications_read_own" ON notifications;
CREATE POLICY "notifications_read_own" ON notifications FOR SELECT USING (
  recipient_seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
  OR recipient_seller_id IS NULL
);
-- Hanya admin yang bisa insert
DROP POLICY IF EXISTS "notifications_admin_insert" ON notifications;
CREATE POLICY "notifications_admin_insert" ON notifications FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM sellers WHERE user_id = auth.uid() AND role = 'admin')
);
-- Admin bisa SELECT semua (untuk admin panel)
DROP POLICY IF EXISTS "notifications_admin_select" ON notifications;
CREATE POLICY "notifications_admin_select" ON notifications FOR SELECT USING (
  EXISTS (SELECT 1 FROM sellers WHERE user_id = auth.uid() AND role = 'admin')
);
-- Seller bisa UPDATE (mark as read)
DROP POLICY IF EXISTS "notifications_mark_read" ON notifications;
CREATE POLICY "notifications_mark_read" ON notifications FOR UPDATE USING (
  recipient_seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
  OR recipient_seller_id IS NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_seller_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(is_read) WHERE is_read = false;

-- 3. Fix admin_logs INSERT policy (needed for insert from service-role)
DROP POLICY IF EXISTS "admin_logs_insert" ON admin_logs;
CREATE POLICY "admin_logs_insert" ON admin_logs FOR INSERT WITH CHECK (true);

-- ============================================================
-- DONE — Jalankan perintah ini di Supabase:
-- SELECT * FROM page_views LIMIT 5;
-- SELECT * FROM notifications LIMIT 5;
-- ============================================================
;
-- <<<<<<<<<<<<<<<<<<<< END FILE: supabase/migrations/step27_analytics_notifications.sql

-- >>>>>>>>>>>>>>>>>>>> BEGIN FILE: supabase/migrations/step28_fix_orders_policies.sql
-- ============================================================
-- STEP 28: Fix Orders and Order Items RLS Policies (Infinite Recursion Fix)
-- Jalankan file SQL ini di Supabase SQL Editor Anda
-- ============================================================

-- 1. Bersihkan semua policy lama di tabel 'orders' untuk menghindari konflik/duplikasi
DROP POLICY IF EXISTS "orders_owner" ON orders;
DROP POLICY IF EXISTS "orders_insert" ON orders;
DROP POLICY IF EXISTS "seller_view_orders" ON orders;
DROP POLICY IF EXISTS "seller_update_orders" ON orders;
DROP POLICY IF EXISTS "orders_update" ON orders;
DROP POLICY IF EXISTS "orders_seller_update" ON orders;
DROP POLICY IF EXISTS "orders_seller_select" ON orders;
DROP POLICY IF EXISTS "orders_public_insert" ON orders;

-- 2. Buat policy baru yang bebas dari rekursi untuk tabel 'orders'
-- a. Seller bisa SELECT (melihat) order milik tokonya
CREATE POLICY "orders_seller_select" ON orders FOR SELECT
  USING (
    store_id IN (
      SELECT s.id FROM stores s
      JOIN sellers sel ON sel.id = s.seller_id
      WHERE sel.user_id = auth.uid()
    )
  );

-- b. Seller bisa UPDATE (mengubah status/bukti) order milik tokonya
CREATE POLICY "orders_seller_update" ON orders FOR UPDATE
  USING (
    store_id IN (
      SELECT s.id FROM stores s
      JOIN sellers sel ON sel.id = s.seller_id
      WHERE sel.user_id = auth.uid()
    )
  )
  WITH CHECK (
    store_id IN (
      SELECT s.id FROM stores s
      JOIN sellers sel ON sel.id = s.seller_id
      WHERE sel.user_id = auth.uid()
    )
  );

-- c. Publik / Customer bisa INSERT (membuat) order baru saat checkout
CREATE POLICY "orders_public_insert" ON orders FOR INSERT
  WITH CHECK (true);


-- 3. Bersihkan semua policy lama di tabel 'order_items'
DROP POLICY IF EXISTS "order_items_owner" ON order_items;
DROP POLICY IF EXISTS "order_items_insert" ON order_items;
DROP POLICY IF EXISTS "seller_view_order_items" ON order_items;
DROP POLICY IF EXISTS "order_items_seller_select" ON order_items;
DROP POLICY IF EXISTS "order_items_public_insert" ON order_items;

-- 4. Buat policy baru yang aman untuk tabel 'order_items'
-- a. Seller bisa SELECT (melihat) item order milik tokonya
CREATE POLICY "order_items_seller_select" ON order_items FOR SELECT
  USING (
    order_id IN (
      SELECT o.id FROM orders o
      JOIN stores s ON s.id = o.store_id
      JOIN sellers sel ON sel.id = s.seller_id
      WHERE sel.user_id = auth.uid()
    )
  );

-- b. Publik / Customer bisa INSERT item order saat checkout
CREATE POLICY "order_items_public_insert" ON order_items FOR INSERT
  WITH CHECK (true);
;
-- <<<<<<<<<<<<<<<<<<<< END FILE: supabase/migrations/step28_fix_orders_policies.sql

-- >>>>>>>>>>>>>>>>>>>> BEGIN FILE: supabase/migrations/step29_atomic_stock_decrement.sql
-- ============================================================
-- STEP 29: Atomic Product Stock Decrement & Increment
-- Menghindari race condition saat checkout dan pembatalan order.
-- ============================================================

-- 1. Fungsi decrement stock aman
CREATE OR REPLACE FUNCTION decrement_product_stock(product_id UUID, quantity INT)
RETURNS BOOLEAN AS $$
DECLARE
  current_stock INT;
  is_owner BOOLEAN;
BEGIN
  -- 1. Cek otorisasi (Bypass jika dipicu service_role)
  IF auth.role() = 'service_role' THEN
    is_owner := TRUE;
  ELSE
    SELECT EXISTS (
      SELECT 1 FROM products p
      JOIN stores s ON s.id = p.store_id
      JOIN sellers sel ON sel.id = s.seller_id
      WHERE p.id = product_id AND sel.user_id = auth.uid()
    ) INTO is_owner;
  END IF;

  IF NOT is_owner THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- 2. Ambil dan kunci baris produk
  SELECT stok INTO current_stock FROM products WHERE id = product_id FOR UPDATE;
  
  IF current_stock IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- 3. Cek kecukupan stok
  IF current_stock < quantity THEN
    RETURN FALSE;
  END IF;
  
  -- 4. Kurangi stok
  UPDATE products SET stok = current_stock - quantity WHERE id = product_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fungsi increment stock aman
CREATE OR REPLACE FUNCTION increment_product_stock(product_id UUID, quantity INT)
RETURNS BOOLEAN AS $$
DECLARE
  is_owner BOOLEAN;
BEGIN
  -- 1. Cek otorisasi (Bypass jika dipicu service_role)
  IF auth.role() = 'service_role' THEN
    is_owner := TRUE;
  ELSE
    SELECT EXISTS (
      SELECT 1 FROM products p
      JOIN stores s ON s.id = p.store_id
      JOIN sellers sel ON sel.id = s.seller_id
      WHERE p.id = product_id AND sel.user_id = auth.uid()
    ) INTO is_owner;
  END IF;

  IF NOT is_owner THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- 2. Tambah stok
  UPDATE products SET stok = stok + quantity WHERE id = product_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Berikan hak akses eksekusi
GRANT EXECUTE ON FUNCTION decrement_product_stock(UUID, INT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION increment_product_stock(UUID, INT) TO anon, authenticated, service_role;
;
-- <<<<<<<<<<<<<<<<<<<< END FILE: supabase/migrations/step29_atomic_stock_decrement.sql

-- >>>>>>>>>>>>>>>>>>>> BEGIN FILE: supabase/migrations/step31_store_traffic_table.sql
-- ============================================================
-- STEP 31: STORE TRAFFIC TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS store_traffic (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE, -- NULL jika landing page utama webtokoku
  visitor_id TEXT NOT NULL, -- identifier unik (hash cookie / localstorage uuid)
  path TEXT NOT NULL,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexing untuk performa kueri yang cepat
CREATE INDEX IF NOT EXISTS idx_store_traffic_store_id ON store_traffic(store_id);
CREATE INDEX IF NOT EXISTS idx_store_traffic_created_at ON store_traffic(created_at);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE store_traffic ENABLE ROW LEVEL SECURITY;

-- Kebijakan RLS: Seller dapat membaca data traffic toko mereka sendiri, admin dapat membaca semuanya.
DROP POLICY IF EXISTS "traffic_select_owner" ON store_traffic;
CREATE POLICY "traffic_select_owner" ON store_traffic
  FOR SELECT TO authenticated
  USING (
    store_id IN (
      SELECT id FROM stores WHERE seller_id IN (
        SELECT id FROM sellers WHERE user_id = auth.uid()
      )
    ) OR EXISTS (
      SELECT 1 FROM sellers WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Kebijakan RLS: Siapa pun (anonymous/public) dapat mencatat traffic (insert).
DROP POLICY IF EXISTS "traffic_insert_public" ON store_traffic;
CREATE POLICY "traffic_insert_public" ON store_traffic
  FOR INSERT WITH CHECK (true);
;
-- <<<<<<<<<<<<<<<<<<<< END FILE: supabase/migrations/step31_store_traffic_table.sql

-- >>>>>>>>>>>>>>>>>>>> BEGIN FILE: supabase/migrations/step32_store_plan.sql
-- Basic Free/Pro plan fields for WebTokoku stores.
-- Payment is still manual via WhatsApp/admin confirmation.

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pro_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pro_notes TEXT;

ALTER TABLE stores
  DROP CONSTRAINT IF EXISTS stores_plan_check;

ALTER TABLE stores
  ADD CONSTRAINT stores_plan_check CHECK (plan IN ('free', 'pro'));

CREATE INDEX IF NOT EXISTS idx_stores_plan ON stores(plan);
CREATE INDEX IF NOT EXISTS idx_stores_plan_expires_at ON stores(plan_expires_at);
;
-- <<<<<<<<<<<<<<<<<<<< END FILE: supabase/migrations/step32_store_plan.sql

-- >>>>>>>>>>>>>>>>>>>> BEGIN FILE: supabase/migrations/step33_store_business_category.sql
-- Step 33: Store business category for onboarding and SEO.

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS business_category TEXT;

CREATE INDEX IF NOT EXISTS idx_stores_business_category
  ON stores(business_category);
;
-- <<<<<<<<<<<<<<<<<<<< END FILE: supabase/migrations/step33_store_business_category.sql

-- >>>>>>>>>>>>>>>>>>>> BEGIN FILE: supabase/migrations/step34_order_payment_proof_path.sql
-- Store private payment proof storage path separately from temporary signed URLs.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS bukti_storage_path TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_bukti_storage_path
  ON orders (bukti_storage_path)
  WHERE bukti_storage_path IS NOT NULL;
;
-- <<<<<<<<<<<<<<<<<<<< END FILE: supabase/migrations/step34_order_payment_proof_path.sql

-- >>>>>>>>>>>>>>>>>>>> BEGIN FILE: supabase/migrations/step35_option_stock_rpc.sql
-- Atomic stock update for product stock and option stock stored in products.option_groups.
-- This keeps the existing JSONB option model while preventing option stock oversell.

CREATE OR REPLACE FUNCTION decrement_product_stock_with_options(
  p_product_id UUID,
  p_quantity INT,
  p_selected_option_ids TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS BOOLEAN AS $$
DECLARE
  current_stock INT;
  current_option_groups JSONB;
  next_option_groups JSONB := '[]'::JSONB;
  option_group JSONB;
  option_value JSONB;
  next_values JSONB;
  option_key TEXT;
  selected_count INT := 0;
  expected_count INT := 0;
  option_stock INT;
  is_owner BOOLEAN;
BEGIN
  IF p_quantity <= 0 THEN
    RETURN FALSE;
  END IF;

  IF auth.role() = 'service_role' THEN
    is_owner := TRUE;
  ELSE
    SELECT EXISTS (
      SELECT 1 FROM products p
      JOIN stores s ON s.id = p.store_id
      JOIN sellers sel ON sel.id = s.seller_id
      WHERE p.id = p_product_id AND sel.user_id = auth.uid()
    ) INTO is_owner;
  END IF;

  IF NOT is_owner THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT stok, COALESCE(option_groups, '[]'::JSONB)
  INTO current_stock, current_option_groups
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;

  IF current_stock IS NULL OR current_stock < p_quantity THEN
    RETURN FALSE;
  END IF;

  SELECT COUNT(DISTINCT option_id)
  INTO expected_count
  FROM unnest(COALESCE(p_selected_option_ids, ARRAY[]::TEXT[])) AS selected_options(option_id)
  WHERE option_id IS NOT NULL AND option_id <> '';

  FOR option_group IN SELECT * FROM jsonb_array_elements(current_option_groups)
  LOOP
    next_values := '[]'::JSONB;

    FOR option_value IN SELECT * FROM jsonb_array_elements(COALESCE(option_group->'values', '[]'::JSONB))
    LOOP
      option_key := COALESCE(option_group->>'id', option_group->>'name', '') || '-' ||
                    COALESCE(option_value->>'id', option_value->>'label', '');

      IF option_key = ANY(COALESCE(p_selected_option_ids, ARRAY[]::TEXT[])) THEN
        selected_count := selected_count + 1;

        IF option_value ? 'stock' AND jsonb_typeof(option_value->'stock') = 'number' THEN
          option_stock := (option_value->>'stock')::INT;
          IF option_stock < p_quantity THEN
            RETURN FALSE;
          END IF;

          option_value := jsonb_set(option_value, '{stock}', to_jsonb(option_stock - p_quantity), TRUE);
        END IF;
      END IF;

      next_values := next_values || jsonb_build_array(option_value);
    END LOOP;

    next_option_groups := next_option_groups || jsonb_build_array(
      jsonb_set(option_group, '{values}', next_values, TRUE)
    );
  END LOOP;

  IF selected_count < expected_count THEN
    RETURN FALSE;
  END IF;

  UPDATE products
  SET
    stok = current_stock - p_quantity,
    option_groups = next_option_groups
  WHERE id = p_product_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_product_stock_with_options(
  p_product_id UUID,
  p_quantity INT,
  p_selected_option_ids TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS BOOLEAN AS $$
DECLARE
  current_option_groups JSONB;
  next_option_groups JSONB := '[]'::JSONB;
  option_group JSONB;
  option_value JSONB;
  next_values JSONB;
  option_key TEXT;
  option_stock INT;
  is_owner BOOLEAN;
BEGIN
  IF p_quantity <= 0 THEN
    RETURN FALSE;
  END IF;

  IF auth.role() = 'service_role' THEN
    is_owner := TRUE;
  ELSE
    SELECT EXISTS (
      SELECT 1 FROM products p
      JOIN stores s ON s.id = p.store_id
      JOIN sellers sel ON sel.id = s.seller_id
      WHERE p.id = p_product_id AND sel.user_id = auth.uid()
    ) INTO is_owner;
  END IF;

  IF NOT is_owner THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT COALESCE(option_groups, '[]'::JSONB)
  INTO current_option_groups
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;

  IF current_option_groups IS NULL THEN
    RETURN FALSE;
  END IF;

  FOR option_group IN SELECT * FROM jsonb_array_elements(current_option_groups)
  LOOP
    next_values := '[]'::JSONB;

    FOR option_value IN SELECT * FROM jsonb_array_elements(COALESCE(option_group->'values', '[]'::JSONB))
    LOOP
      option_key := COALESCE(option_group->>'id', option_group->>'name', '') || '-' ||
                    COALESCE(option_value->>'id', option_value->>'label', '');

      IF option_key = ANY(COALESCE(p_selected_option_ids, ARRAY[]::TEXT[])) THEN
        IF option_value ? 'stock' AND jsonb_typeof(option_value->'stock') = 'number' THEN
          option_stock := (option_value->>'stock')::INT;
          option_value := jsonb_set(option_value, '{stock}', to_jsonb(option_stock + p_quantity), TRUE);
        END IF;
      END IF;

      next_values := next_values || jsonb_build_array(option_value);
    END LOOP;

    next_option_groups := next_option_groups || jsonb_build_array(
      jsonb_set(option_group, '{values}', next_values, TRUE)
    );
  END LOOP;

  UPDATE products
  SET
    stok = stok + p_quantity,
    option_groups = next_option_groups
  WHERE id = p_product_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION decrement_product_stock_with_options(UUID, INT, TEXT[]) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION increment_product_stock_with_options(UUID, INT, TEXT[]) TO anon, authenticated, service_role;
;
-- <<<<<<<<<<<<<<<<<<<< END FILE: supabase/migrations/step35_option_stock_rpc.sql

-- >>>>>>>>>>>>>>>>>>>> BEGIN FILE: supabase/migrations/step36_security_batch1_rls_admin_hardening.sql
-- STEP 36: Security Batch 1 - RLS and admin role hardening
-- Scope:
-- 1. Move admin access checks to a locked platform_admins table.
-- 2. Prevent ordinary sellers from changing sellers.role through Supabase client.
-- 3. Remove public direct INSERT policies for order/log/analytics tables.

-- A locked admin membership table. This is the authority for platform admin access.
-- sellers.role remains for display/legacy data, but no longer controls admin access.
CREATE TABLE IF NOT EXISTS public.platform_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_admins_active_user
  ON public.platform_admins(user_id)
  WHERE is_active = true;

ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

-- Admin membership is readable by the owner only; service-role bypasses RLS for admin panels.
DROP POLICY IF EXISTS "platform_admins_self_read" ON public.platform_admins;
CREATE POLICY "platform_admins_self_read" ON public.platform_admins
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Helper used by RLS policies. SECURITY DEFINER prevents recursive RLS lookups.
CREATE OR REPLACE FUNCTION public.is_platform_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.platform_admins pa
    WHERE pa.user_id = p_user_id
      AND pa.is_active = true
  );
$$;

REVOKE ALL ON FUNCTION public.is_platform_admin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_platform_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_platform_admin(UUID) TO service_role;

-- Bootstrap current admins into the locked admin table.
-- This keeps existing admin access after the migration is applied.
INSERT INTO public.platform_admins (user_id, seller_id, email, is_active)
SELECT s.user_id, s.id, s.email, true
FROM public.sellers s
WHERE s.user_id IS NOT NULL
  AND (
    s.role = 'admin'
    OR lower(s.email) = 'bagasphensell@gmail.com'
  )
ON CONFLICT (user_id) DO UPDATE
SET
  seller_id = EXCLUDED.seller_id,
  email = EXCLUDED.email,
  is_active = true,
  updated_at = now();

-- Prevent client-side role escalation. Admin role changes must use service-role code.
CREATE OR REPLACE FUNCTION public.prevent_seller_role_self_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF OLD.role IS DISTINCT FROM NEW.role THEN
    RAISE EXCEPTION 'sellers.role can only be changed by platform admin service';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_seller_role_self_update_trigger ON public.sellers;
CREATE TRIGGER prevent_seller_role_self_update_trigger
  BEFORE UPDATE OF role ON public.sellers
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_seller_role_self_update();

-- Keep existing profile-edit behavior, but make the role-protection explicit via trigger above.
DROP POLICY IF EXISTS "sellers_update_own" ON public.sellers;
DROP POLICY IF EXISTS "Sellers can update own profile" ON public.sellers;
CREATE POLICY "sellers_update_own" ON public.sellers
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Remove direct public inserts. Checkout and logging must go through server routes/service-role.
DROP POLICY IF EXISTS "orders_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_public_insert" ON public.orders;
DROP POLICY IF EXISTS "customer_create_order" ON public.orders;

DROP POLICY IF EXISTS "order_items_insert" ON public.order_items;
DROP POLICY IF EXISTS "order_items_public_insert" ON public.order_items;

DROP POLICY IF EXISTS "admin_logs_insert" ON public.admin_logs;
DROP POLICY IF EXISTS "admin_insert_logs" ON public.admin_logs;

DROP POLICY IF EXISTS "page_views_insert" ON public.page_views;
DROP POLICY IF EXISTS "traffic_insert_public" ON public.store_traffic;

-- Refresh admin/read policies so they do not trust sellers.role.
DROP POLICY IF EXISTS "admin_logs_read" ON public.admin_logs;
DROP POLICY IF EXISTS "admin_read_logs" ON public.admin_logs;
CREATE POLICY "admin_logs_read" ON public.admin_logs
  FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "page_views_owner_select" ON public.page_views;
CREATE POLICY "page_views_owner_select" ON public.page_views
  FOR SELECT TO authenticated
  USING (
    public.is_platform_admin(auth.uid())
    OR store_id IN (
      SELECT s.id
      FROM public.stores s
      JOIN public.sellers sel ON sel.id = s.seller_id
      WHERE sel.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "traffic_select_owner" ON public.store_traffic;
CREATE POLICY "traffic_select_owner" ON public.store_traffic
  FOR SELECT TO authenticated
  USING (
    public.is_platform_admin(auth.uid())
    OR store_id IN (
      SELECT s.id
      FROM public.stores s
      JOIN public.sellers sel ON sel.id = s.seller_id
      WHERE sel.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "notifications_admin_insert" ON public.notifications;
CREATE POLICY "notifications_admin_insert" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "notifications_admin_select" ON public.notifications;
CREATE POLICY "notifications_admin_select" ON public.notifications
  FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "feature_flags_admin" ON public.feature_flags;
DROP POLICY IF EXISTS "admin_only_feature_flags" ON public.feature_flags;
CREATE POLICY "feature_flags_admin" ON public.feature_flags
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "store_flags_admin" ON public.store_feature_flags;
DROP POLICY IF EXISTS "admin_manage_store_flags" ON public.store_feature_flags;
CREATE POLICY "store_flags_admin" ON public.store_feature_flags
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "platform_settings_admin" ON public.platform_settings;
DROP POLICY IF EXISTS "admin_manage_settings" ON public.platform_settings;
CREATE POLICY "platform_settings_admin" ON public.platform_settings
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- Optional tables from later migrations. These DO blocks keep this migration safe
-- if a deployment has not run every optional migration yet.
DO $$
BEGIN
  IF to_regclass('public.shipping_api_usage_logs') IS NOT NULL THEN
    DROP POLICY IF EXISTS "shipping_usage_admin_read" ON public.shipping_api_usage_logs;
    CREATE POLICY "shipping_usage_admin_read" ON public.shipping_api_usage_logs
      FOR SELECT TO authenticated
      USING (public.is_platform_admin(auth.uid()));
  END IF;
END $$;
;
-- <<<<<<<<<<<<<<<<<<<< END FILE: supabase/migrations/step36_security_batch1_rls_admin_hardening.sql

-- >>>>>>>>>>>>>>>>>>>> BEGIN FILE: supabase/migrations/step37_security_batch5_moderation.sql
-- STEP 37: Security Batch 5 - Store/content moderation and appeal workflow
-- Adds reversible moderation status, internal events, and seller appeal records.

ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS moderation_status TEXT NOT NULL DEFAULT 'safe',
  ADD COLUMN IF NOT EXISTS moderation_reason TEXT,
  ADD COLUMN IF NOT EXISTS moderation_score INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS moderation_matched_terms TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS moderation_categories TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS moderation_checked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS moderation_reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS moderation_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS moderation_admin_note TEXT;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS moderation_status TEXT NOT NULL DEFAULT 'safe',
  ADD COLUMN IF NOT EXISTS moderation_reason TEXT,
  ADD COLUMN IF NOT EXISTS moderation_score INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS moderation_matched_terms TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS moderation_categories TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS moderation_checked_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'stores_moderation_status_check'
      AND conrelid = 'public.stores'::regclass
  ) THEN
    ALTER TABLE public.stores
      ADD CONSTRAINT stores_moderation_status_check
      CHECK (moderation_status IN ('safe', 'flagged', 'pending_review', 'suspended', 'blocked'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'products_moderation_status_check'
      AND conrelid = 'public.products'::regclass
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_moderation_status_check
      CHECK (moderation_status IN ('safe', 'flagged', 'pending_review', 'suspended', 'blocked'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_stores_moderation_status
  ON public.stores(moderation_status, is_active, is_published);

CREATE INDEX IF NOT EXISTS idx_products_moderation_status
  ON public.products(store_id, moderation_status, is_active);

CREATE OR REPLACE FUNCTION public.prevent_store_moderation_bypass()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' OR public.is_platform_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  IF OLD.moderation_status IN ('pending_review', 'suspended', 'blocked')
     AND NEW.moderation_status IS DISTINCT FROM OLD.moderation_status THEN
    RAISE EXCEPTION 'moderation_status can only be changed by platform admin review';
  END IF;

  IF NEW.is_published = true
     AND NEW.moderation_status IN ('pending_review', 'suspended', 'blocked') THEN
    RAISE EXCEPTION 'store cannot be published while under moderation review';
  END IF;

  IF OLD.moderation_score IS DISTINCT FROM NEW.moderation_score
     AND OLD.moderation_status IN ('pending_review', 'suspended', 'blocked') THEN
    RAISE EXCEPTION 'moderation fields can only be changed by platform admin review';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_store_moderation_bypass_trigger ON public.stores;
CREATE TRIGGER prevent_store_moderation_bypass_trigger
  BEFORE UPDATE ON public.stores
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_store_moderation_bypass();

CREATE TABLE IF NOT EXISTS public.moderation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  risk_level TEXT NOT NULL DEFAULT 'safe',
  category TEXT,
  matched_terms TEXT[] NOT NULL DEFAULT '{}',
  reason TEXT,
  action TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moderation_events_store_created
  ON public.moderation_events(store_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.moderation_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'submitted',
  reason TEXT NOT NULL,
  context TEXT,
  fixed_content BOOLEAN NOT NULL DEFAULT false,
  admin_note TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'moderation_appeals_status_check'
      AND conrelid = 'public.moderation_appeals'::regclass
  ) THEN
    ALTER TABLE public.moderation_appeals
      ADD CONSTRAINT moderation_appeals_status_check
      CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'request_edit'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_moderation_appeals_store_status
  ON public.moderation_appeals(store_id, status, created_at DESC);

ALTER TABLE public.moderation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_appeals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "moderation_events_owner_read" ON public.moderation_events;
CREATE POLICY "moderation_events_owner_read" ON public.moderation_events
  FOR SELECT
  USING (
    store_id IN (
      SELECT s.id
      FROM public.stores s
      JOIN public.sellers sel ON sel.id = s.seller_id
      WHERE sel.user_id = auth.uid()
    )
    OR public.is_platform_admin(auth.uid())
  );

DROP POLICY IF EXISTS "moderation_events_owner_insert" ON public.moderation_events;
CREATE POLICY "moderation_events_owner_insert" ON public.moderation_events
  FOR INSERT
  WITH CHECK (
    store_id IN (
      SELECT s.id
      FROM public.stores s
      JOIN public.sellers sel ON sel.id = s.seller_id
      WHERE sel.user_id = auth.uid()
    )
    OR public.is_platform_admin(auth.uid())
  );

DROP POLICY IF EXISTS "moderation_appeals_owner_read" ON public.moderation_appeals;
CREATE POLICY "moderation_appeals_owner_read" ON public.moderation_appeals
  FOR SELECT
  USING (
    seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid())
    OR public.is_platform_admin(auth.uid())
  );

DROP POLICY IF EXISTS "moderation_appeals_owner_insert" ON public.moderation_appeals;
CREATE POLICY "moderation_appeals_owner_insert" ON public.moderation_appeals
  FOR INSERT
  WITH CHECK (
    seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid())
    AND store_id IN (
      SELECT s.id
      FROM public.stores s
      JOIN public.sellers sel ON sel.id = s.seller_id
      WHERE sel.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "moderation_appeals_admin_update" ON public.moderation_appeals;
CREATE POLICY "moderation_appeals_admin_update" ON public.moderation_appeals
  FOR UPDATE
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- Public storefront policies should not expose stores/products under review.
DROP POLICY IF EXISTS "store_public" ON public.stores;
DROP POLICY IF EXISTS "stores_public" ON public.stores;
CREATE POLICY "stores_public" ON public.stores
  FOR SELECT
  USING (
    is_active = true
    AND is_published = true
    AND moderation_status IN ('safe', 'flagged')
  );

DROP POLICY IF EXISTS "product_public" ON public.products;
DROP POLICY IF EXISTS "products_public" ON public.products;
CREATE POLICY "products_public" ON public.products
  FOR SELECT
  USING (
    is_active = true
    AND moderation_status IN ('safe', 'flagged')
    AND store_id IN (
      SELECT id
      FROM public.stores
      WHERE is_active = true
        AND is_published = true
        AND moderation_status IN ('safe', 'flagged')
    )
  );
;
-- <<<<<<<<<<<<<<<<<<<< END FILE: supabase/migrations/step37_security_batch5_moderation.sql

-- >>>>>>>>>>>>>>>>>>>> BEGIN FILE: supabase/migrations/step38_security_batch5_1_moderation_gap_fixes.sql
-- STEP 38: Security Batch 5.1 - moderation gap fixes
-- Scope:
-- 1. Prevent ordinary sellers from changing internal moderation fields.
-- 2. Prevent direct seller/client inserts into moderation_events.
-- 3. Keep normal store/product edits available through existing owner policies.

CREATE OR REPLACE FUNCTION public.prevent_store_moderation_field_client_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' OR public.is_platform_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  IF OLD.moderation_status IS DISTINCT FROM NEW.moderation_status
    OR OLD.moderation_reason IS DISTINCT FROM NEW.moderation_reason
    OR OLD.moderation_score IS DISTINCT FROM NEW.moderation_score
    OR OLD.moderation_matched_terms IS DISTINCT FROM NEW.moderation_matched_terms
    OR OLD.moderation_categories IS DISTINCT FROM NEW.moderation_categories
    OR OLD.moderation_checked_at IS DISTINCT FROM NEW.moderation_checked_at
    OR OLD.moderation_admin_note IS DISTINCT FROM NEW.moderation_admin_note THEN
    RAISE EXCEPTION 'store moderation fields can only be changed by platform moderation service';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_store_moderation_field_client_update_trigger ON public.stores;
CREATE TRIGGER prevent_store_moderation_field_client_update_trigger
  BEFORE UPDATE OF
    moderation_status,
    moderation_reason,
    moderation_score,
    moderation_matched_terms,
    moderation_categories,
    moderation_checked_at,
    moderation_admin_note
  ON public.stores
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_store_moderation_field_client_update();

CREATE OR REPLACE FUNCTION public.prevent_product_moderation_field_client_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' OR public.is_platform_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  IF OLD.moderation_status IS DISTINCT FROM NEW.moderation_status
    OR OLD.moderation_reason IS DISTINCT FROM NEW.moderation_reason
    OR OLD.moderation_score IS DISTINCT FROM NEW.moderation_score
    OR OLD.moderation_matched_terms IS DISTINCT FROM NEW.moderation_matched_terms
    OR OLD.moderation_categories IS DISTINCT FROM NEW.moderation_categories
    OR OLD.moderation_checked_at IS DISTINCT FROM NEW.moderation_checked_at THEN
    RAISE EXCEPTION 'product moderation fields can only be changed by platform moderation service';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_product_moderation_field_client_update_trigger ON public.products;
CREATE TRIGGER prevent_product_moderation_field_client_update_trigger
  BEFORE UPDATE OF
    moderation_status,
    moderation_reason,
    moderation_score,
    moderation_matched_terms,
    moderation_categories,
    moderation_checked_at
  ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_product_moderation_field_client_update();

DROP POLICY IF EXISTS "moderation_events_owner_insert" ON public.moderation_events;
DROP POLICY IF EXISTS "moderation_events_admin_insert" ON public.moderation_events;
CREATE POLICY "moderation_events_admin_insert" ON public.moderation_events
  FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_admin(auth.uid()));
;
-- <<<<<<<<<<<<<<<<<<<< END FILE: supabase/migrations/step38_security_batch5_1_moderation_gap_fixes.sql

-- >>>>>>>>>>>>>>>>>>>> BEGIN FILE: supabase/migrations/step39_security_batch5_2_moderation_insert_lock.sql
-- STEP 39: Security Batch 5.2 - moderation insert lock
-- Scope:
-- 1. Prevent ordinary sellers from injecting internal moderation fields on INSERT.
-- 2. Preserve normal store/product inserts by normalizing moderation fields to review defaults.
-- 3. Keep service-role/admin moderation pipelines unchanged.

CREATE OR REPLACE FUNCTION public.normalize_store_moderation_fields_on_client_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' OR public.is_platform_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  NEW.moderation_status := 'pending_review';
  NEW.moderation_reason := 'Menunggu pemeriksaan moderasi otomatis.';
  NEW.moderation_score := 0;
  NEW.moderation_matched_terms := '{}';
  NEW.moderation_categories := ARRAY['pending_review'];
  NEW.moderation_checked_at := NULL;
  NEW.moderation_admin_note := NULL;
  NEW.is_published := false;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS normalize_store_moderation_fields_on_client_insert_trigger ON public.stores;
CREATE TRIGGER normalize_store_moderation_fields_on_client_insert_trigger
  BEFORE INSERT ON public.stores
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_store_moderation_fields_on_client_insert();

CREATE OR REPLACE FUNCTION public.normalize_product_moderation_fields_on_client_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' OR public.is_platform_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  NEW.moderation_status := 'pending_review';
  NEW.moderation_reason := 'Menunggu pemeriksaan moderasi otomatis.';
  NEW.moderation_score := 0;
  NEW.moderation_matched_terms := '{}';
  NEW.moderation_categories := ARRAY['pending_review'];
  NEW.moderation_checked_at := NULL;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS normalize_product_moderation_fields_on_client_insert_trigger ON public.products;
CREATE TRIGGER normalize_product_moderation_fields_on_client_insert_trigger
  BEFORE INSERT ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_product_moderation_fields_on_client_insert();
;
-- <<<<<<<<<<<<<<<<<<<< END FILE: supabase/migrations/step39_security_batch5_2_moderation_insert_lock.sql

-- >>>>>>>>>>>>>>>>>>>> BEGIN FILE: supabase/migrations/step40_dashboard_analytics_aggregation.sql
-- STEP 40: Accurate seller dashboard analytics without PostgREST's 1,000-row cap.

create or replace function public.get_store_dashboard_analytics(target_store_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  caller_id uuid := auth.uid();
  result jsonb;
begin
  if caller_id is null then
    raise exception 'Authentication required';
  end if;

  if not (
    public.is_platform_admin(caller_id)
    or exists (
      select 1
      from public.stores st
      join public.sellers se on se.id = st.seller_id
      where st.id = target_store_id
        and se.user_id = caller_id
    )
  ) then
    raise exception 'Access denied';
  end if;

  with traffic_summary as (
    select
      count(*)::bigint as total_views,
      count(distinct visitor_id)::bigint as unique_visitors
    from public.store_traffic
    where store_id = target_store_id
      and created_at >= now() - interval '30 days'
  ),
  order_summary as (
    select
      coalesce(sum(total) filter (where order_status = 'selesai'), 0)::numeric as completed_revenue,
      count(*) filter (
        where order_status in ('menunggu_pembayaran', 'menunggu_konfirmasi')
      )::bigint as pending_confirmation,
      count(*) filter (where order_status <> 'dibatalkan')::bigint as active_orders
    from public.orders
    where store_id = target_store_id
  ),
  days as (
    select generate_series(
      date_trunc('day', now() at time zone 'Asia/Jakarta') - interval '6 days',
      date_trunc('day', now() at time zone 'Asia/Jakarta'),
      interval '1 day'
    ) as local_day
  ),
  daily as (
    select
      to_char(days.local_day, 'YYYY-MM-DD') as date,
      (
        select count(*)::bigint
        from public.store_traffic traffic
        where traffic.store_id = target_store_id
          and traffic.created_at >= days.local_day at time zone 'Asia/Jakarta'
          and traffic.created_at < (days.local_day + interval '1 day') at time zone 'Asia/Jakarta'
      ) as views,
      (
        select coalesce(sum(orders.total), 0)::numeric
        from public.orders orders
        where orders.store_id = target_store_id
          and orders.order_status = 'selesai'
          and orders.created_at >= days.local_day at time zone 'Asia/Jakarta'
          and orders.created_at < (days.local_day + interval '1 day') at time zone 'Asia/Jakarta'
      ) as sales
    from days
    order by days.local_day
  )
  select jsonb_build_object(
    'totalViews', traffic_summary.total_views,
    'uniqueVisitors', traffic_summary.unique_visitors,
    'completedRevenue', order_summary.completed_revenue,
    'pendingConfirmation', order_summary.pending_confirmation,
    'activeOrders', order_summary.active_orders,
    'dailyTrend', coalesce(
      (select jsonb_agg(jsonb_build_object('date', date, 'views', views, 'sales', sales)) from daily),
      '[]'::jsonb
    )
  )
  into result
  from traffic_summary
  cross join order_summary;

  return result;
end;
$$;

revoke all on function public.get_store_dashboard_analytics(uuid) from public;
revoke all on function public.get_store_dashboard_analytics(uuid) from anon;
grant execute on function public.get_store_dashboard_analytics(uuid) to authenticated;

;
-- <<<<<<<<<<<<<<<<<<<< END FILE: supabase/migrations/step40_dashboard_analytics_aggregation.sql

COMMIT;
