-- Migration Step 21: Product Gallery & Inventory
-- Menambahkan fitur galeri foto dan manajemen stok produk

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS stok INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS berat_gram INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  urutan INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Policies for product_images
CREATE POLICY "product_images_owner" ON product_images 
  FOR ALL USING (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE seller_id IN (
          SELECT id FROM sellers WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "product_images_public" ON product_images 
  FOR SELECT USING (true);
