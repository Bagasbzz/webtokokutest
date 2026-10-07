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
