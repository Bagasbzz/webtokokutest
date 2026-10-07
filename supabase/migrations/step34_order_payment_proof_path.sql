-- Store private payment proof storage path separately from temporary signed URLs.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS bukti_storage_path TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_bukti_storage_path
  ON orders (bukti_storage_path)
  WHERE bukti_storage_path IS NOT NULL;
