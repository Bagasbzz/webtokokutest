-- Step 25: Homepage product controls.
-- Jalankan setelah step24 agar seller bisa memilih produk yang tampil di landing toko.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS show_on_homepage BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS homepage_rank INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS badge_label TEXT,
  ADD COLUMN IF NOT EXISTS compare_at_price INTEGER;

CREATE INDEX IF NOT EXISTS idx_products_homepage
  ON products(store_id, is_active, show_on_homepage, homepage_rank);
