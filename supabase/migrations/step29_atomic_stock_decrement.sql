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
