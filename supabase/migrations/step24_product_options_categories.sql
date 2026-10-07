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
