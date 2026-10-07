-- 🛒 STEP 11: UNIVERSAL CATALOG & ORDERS
-- Jalankan SQL ini di Supabase SQL Editor

-- 1. Tabel Kategori Produk
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  slug TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabel Pesanan (Orders)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  order_code TEXT UNIQUE NOT NULL,   -- ORD-20260507-001
  customer_name TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  customer_address TEXT,
  province_id TEXT,
  city_id TEXT,
  district_id TEXT,
  subdistrict_id TEXT,
  postal_code TEXT,
  items JSONB NOT NULL,              -- [{product_id, nama, qty, harga, berat}]
  subtotal INTEGER NOT NULL,
  shipping_cost INTEGER DEFAULT 0,
  shipping_courier TEXT,
  shipping_service TEXT,
  shipping_etd TEXT,
  total INTEGER NOT NULL,
  payment_method TEXT,              -- 'qris' | 'bank_transfer' | 'cod'
  payment_status TEXT DEFAULT 'pending',
  order_status TEXT DEFAULT 'menunggu_konfirmasi',
  proof_image_url TEXT,
  customer_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabel Detail Item Pesanan (Order Items)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,       -- Snapshot nama saat order
  price INTEGER NOT NULL,           -- Snapshot harga saat order
  quantity INTEGER NOT NULL,
  weight_gram INTEGER NOT NULL,
  total INTEGER NOT NULL
);

-- 4. Tabel Pelanggan (Customers)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabel Metode Pembayaran (Payment Methods)
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  type TEXT NOT NULL,               -- 'qris' | 'bank_transfer' | 'cod'
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  qr_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Tabel Pengaturan Checkout (Checkout Settings)
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

-- 🔐 AKTIFKAN RLS (Row Level Security)
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_settings ENABLE ROW LEVEL SECURITY;

-- 🛡️ POLICIES (Seller Access)
-- Seller hanya bisa melihat/mengelola data milik tokonya sendiri

CREATE POLICY "seller_manage_categories" ON product_categories FOR ALL
  USING (store_id IN (SELECT id FROM stores WHERE seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())));

CREATE POLICY "seller_view_orders" ON orders FOR SELECT
  USING (store_id IN (SELECT id FROM stores WHERE seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())));

CREATE POLICY "seller_update_orders" ON orders FOR UPDATE
  USING (store_id IN (SELECT id FROM stores WHERE seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())))
  WITH CHECK (store_id IN (SELECT id FROM stores WHERE seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())));

CREATE POLICY "seller_view_order_items" ON order_items FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE store_id IN (SELECT id FROM stores WHERE seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid()))));

CREATE POLICY "seller_manage_payment_methods" ON payment_methods FOR ALL
  USING (store_id IN (SELECT id FROM stores WHERE seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())));

CREATE POLICY "seller_manage_checkout_settings" ON checkout_settings FOR ALL
  USING (store_id IN (SELECT id FROM stores WHERE seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())));

-- 🌐 POLICIES (Public/Customer Access)
-- Publik bisa melihat kategori aktif
CREATE POLICY "public_view_categories" ON product_categories FOR SELECT
  USING (is_active = true);

-- Customer bisa membuat order (INSERT), tapi tidak bisa sembarang SELECT order orang lain
CREATE POLICY "customer_create_order" ON orders FOR INSERT
  WITH CHECK (true);

-- Customer bisa melihat order miliknya sendiri (berdasarkan order_code + WA) -- opsional untuk tracking
-- Untuk MVP, tracking bisa lewat API route saja.

-- Publik bisa melihat metode pembayaran aktif
CREATE POLICY "public_view_payment_methods" ON payment_methods FOR SELECT
  USING (is_active = true);

-- Publik bisa melihat setting checkout
CREATE POLICY "public_view_checkout_settings" ON checkout_settings FOR SELECT
  USING (true);
