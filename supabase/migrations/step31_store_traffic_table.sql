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
