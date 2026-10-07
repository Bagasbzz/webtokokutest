-- ============================================================
-- WEBTOKOKU FINAL SCHEMA
-- Schema lengkap untuk reset database
-- JANGAN JALANKAN LANGSUNG — Review dulu DATABASE_RESET_PLAN.md
-- ============================================================

-- ============================================================
-- 1. SELLERS (Profil User)
-- ============================================================
CREATE TABLE IF NOT EXISTS sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nama_lengkap TEXT NOT NULL,
  no_wa TEXT NOT NULL,
  role TEXT DEFAULT 'seller',  -- 'seller' | 'admin'
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sellers_select_own" ON sellers FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "sellers_update_own" ON sellers FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sellers_insert_own" ON sellers FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 2. STORES (Data Toko)
-- ============================================================
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
  nama_toko TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  custom_domain TEXT UNIQUE,
  deskripsi TEXT,
  template TEXT DEFAULT 'butik',
  warna_tema TEXT DEFAULT '#16A34A',
  logo_url TEXT,
  no_wa TEXT NOT NULL,
  alamat TEXT,
  kota TEXT,
  is_active BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT false,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  plan_expires_at TIMESTAMPTZ,
  pro_started_at TIMESTAMPTZ,
  pro_notes TEXT,
  hero_image_url TEXT,
  font_heading TEXT DEFAULT 'Outfit',
  font_body TEXT DEFAULT 'Inter',
  hero_title TEXT,
  hero_subtitle TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stores_owner" ON stores FOR ALL 
  USING (seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid()));

CREATE POLICY "stores_public" ON stores FOR SELECT 
  USING (is_active = true);

-- ============================================================
-- 3. PRODUCTS (Katalog Produk)
-- ============================================================
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

CREATE POLICY "products_owner" ON products FOR ALL 
  USING (store_id IN (
    SELECT id FROM stores WHERE seller_id IN (
      SELECT id FROM sellers WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "products_public" ON products FOR SELECT 
  USING (is_active = true);

-- ============================================================
-- 4. PRODUCT_IMAGES (Galeri Foto)
-- ============================================================
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  urutan INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_images_owner" ON product_images FOR ALL 
  USING (product_id IN (
    SELECT id FROM products WHERE store_id IN (
      SELECT id FROM stores WHERE seller_id IN (
        SELECT id FROM sellers WHERE user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "product_images_public" ON product_images FOR SELECT 
  USING (true);

-- ============================================================
-- 5. PRODUCT_CATEGORIES (Kategori Produk)
-- ============================================================
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  slug TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_owner" ON product_categories FOR ALL 
  USING (store_id IN (SELECT id FROM stores WHERE seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())));

CREATE POLICY "categories_public" ON product_categories FOR SELECT 
  USING (is_active = true);

-- ============================================================
-- 6. ORDERS (Pesanan)
-- ============================================================
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

CREATE POLICY "orders_owner" ON orders FOR SELECT 
  USING (store_id IN (SELECT id FROM stores WHERE seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())));

CREATE POLICY "orders_insert" ON orders FOR INSERT 
  WITH CHECK (true);

-- ============================================================
-- 7. ORDER_ITEMS (Detail Item Pesanan)
-- ============================================================
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

CREATE POLICY "order_items_owner" ON order_items FOR SELECT 
  USING (order_id IN (SELECT id FROM orders WHERE store_id IN (SELECT id FROM stores WHERE seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid()))));

-- ============================================================
-- 8. CUSTOMERS (Data Pelanggan)
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 9. PAYMENT_METHODS (Metode Pembayaran)
-- ============================================================
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

CREATE POLICY "payment_methods_owner" ON payment_methods FOR ALL 
  USING (store_id IN (SELECT id FROM stores WHERE seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())));

CREATE POLICY "payment_methods_public" ON payment_methods FOR SELECT 
  USING (is_active = true);

-- ============================================================
-- 10. CHECKOUT_SETTINGS (Setting Checkout)
-- ============================================================
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

CREATE POLICY "checkout_settings_owner" ON checkout_settings FOR ALL 
  USING (store_id IN (SELECT id FROM stores WHERE seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())));

CREATE POLICY "checkout_settings_public" ON checkout_settings FOR SELECT 
  USING (true);

-- ============================================================
-- 11. STORE_ADDRESSES (Alamat Toko)
-- ============================================================
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

CREATE POLICY "store_addresses_owner" ON store_addresses FOR ALL 
  USING (store_id IN (SELECT id FROM stores WHERE seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())));

-- ============================================================
-- 12. SHIPPING_SETTINGS (Setting Pengiriman)
-- ============================================================
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

CREATE POLICY "shipping_settings_owner" ON shipping_settings FOR ALL 
  USING (store_id IN (SELECT id FROM stores WHERE seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())));

-- ============================================================
-- 13. RO_LOCATIONS (Cache RajaOngkir)
-- ============================================================
CREATE TABLE IF NOT EXISTS ro_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  response_json JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days')
);

ALTER TABLE ro_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ro_locations_service" ON ro_locations FOR ALL USING (false);

CREATE INDEX idx_ro_locations_query ON ro_locations(query);
CREATE INDEX idx_ro_locations_expires ON ro_locations(expires_at);

-- ============================================================
-- 14. TEMPLATE_CUSTOMIZATIONS (Custom Visual)
-- ============================================================
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

CREATE POLICY "customizations_owner" ON template_customizations FOR ALL 
  USING (store_id IN (
    SELECT s.id FROM stores s
    JOIN sellers sel ON sel.id = s.seller_id
    WHERE sel.user_id = auth.uid()
  ));

CREATE POLICY "customizations_public" ON template_customizations FOR SELECT 
  USING (is_draft = false);

-- ============================================================
-- 15. TEMPLATE_REVISIONS (Riwayat Revisi)
-- ============================================================
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

CREATE POLICY "revisions_owner" ON template_revisions FOR ALL 
  USING (store_id IN (
    SELECT id FROM stores WHERE seller_id IN (
      SELECT id FROM sellers WHERE user_id = auth.uid()
    )
  ));

CREATE INDEX idx_revisions_store_id ON template_revisions(store_id);
CREATE INDEX idx_revisions_number ON template_revisions(revision_number DESC);

-- ============================================================
-- 16. FEATURE_FLAGS (Fitur Global)
-- ============================================================
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

CREATE POLICY "feature_flags_public" ON feature_flags FOR SELECT USING (true);

CREATE POLICY "feature_flags_admin" ON feature_flags FOR ALL 
  USING (EXISTS (SELECT 1 FROM sellers WHERE user_id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 17. STORE_FEATURE_FLAGS (Override Per Toko)
-- ============================================================
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

CREATE POLICY "store_flags_public" ON store_feature_flags FOR SELECT USING (true);

CREATE POLICY "store_flags_admin" ON store_feature_flags FOR ALL 
  USING (EXISTS (SELECT 1 FROM sellers WHERE user_id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 18. ADMIN_LOGS (Audit Trail)
-- ============================================================
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

CREATE POLICY "admin_logs_read" ON admin_logs FOR SELECT 
  USING (EXISTS (SELECT 1 FROM sellers WHERE user_id = auth.uid() AND role = 'admin'));

CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_created ON admin_logs(created_at DESC);

-- ============================================================
-- 19. PLATFORM_SETTINGS (Settings Global)
-- ============================================================
CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "platform_settings_admin" ON platform_settings FOR ALL 
  USING (EXISTS (SELECT 1 FROM sellers WHERE user_id = auth.uid() AND role = 'admin'));

-- ============================================================
-- SEED DATA
-- ============================================================

-- Feature Flags Default
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
-- STORAGE BUCKETS (Buat manual di Dashboard jika belum ada)
-- ============================================================
-- product-images (public)
-- editor-images (public)

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create shipping settings when store created
CREATE OR REPLACE FUNCTION create_default_shipping_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO shipping_settings (store_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_create_shipping_settings ON stores;
CREATE TRIGGER tr_create_shipping_settings
  AFTER INSERT ON stores
  FOR EACH ROW
  EXECUTE FUNCTION create_default_shipping_settings();

-- ============================================================
-- SELESAI
-- ============================================================
-- Set admin pertama dengan:
-- UPDATE sellers SET role = 'admin' WHERE email = 'your@email.com';
