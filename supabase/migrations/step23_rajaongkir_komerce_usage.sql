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
