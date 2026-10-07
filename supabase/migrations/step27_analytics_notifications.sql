-- ============================================================
-- STEP 27: Analytics, Notifications, Platform Enhancements
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- 1. PAGE_VIEWS — untuk analytics traffic per toko
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  page TEXT DEFAULT '/',
  referrer TEXT,
  user_agent TEXT,
  ip_hash TEXT,  -- hashed IP untuk privacy
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
-- Public bisa INSERT (tracking), hanya service role / admin yang bisa SELECT
DROP POLICY IF EXISTS "page_views_insert" ON page_views;
CREATE POLICY "page_views_insert" ON page_views FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "page_views_owner_select" ON page_views;
CREATE POLICY "page_views_owner_select" ON page_views FOR SELECT USING (
  store_id IN (
    SELECT id FROM stores
    WHERE seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
  )
);

CREATE INDEX IF NOT EXISTS idx_page_views_store_id ON page_views(store_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);

-- 2. NOTIFICATIONS — notifikasi dari admin ke seller
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
  -- NULL = broadcast ke semua
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'info' | 'warning' | 'success' | 'error'
  is_read BOOLEAN DEFAULT false,
  link_url TEXT, -- optional CTA link
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
-- Seller baca notif mereka + broadcast
DROP POLICY IF EXISTS "notifications_read_own" ON notifications;
CREATE POLICY "notifications_read_own" ON notifications FOR SELECT USING (
  recipient_seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
  OR recipient_seller_id IS NULL
);
-- Hanya admin yang bisa insert
DROP POLICY IF EXISTS "notifications_admin_insert" ON notifications;
CREATE POLICY "notifications_admin_insert" ON notifications FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM sellers WHERE user_id = auth.uid() AND role = 'admin')
);
-- Admin bisa SELECT semua (untuk admin panel)
DROP POLICY IF EXISTS "notifications_admin_select" ON notifications;
CREATE POLICY "notifications_admin_select" ON notifications FOR SELECT USING (
  EXISTS (SELECT 1 FROM sellers WHERE user_id = auth.uid() AND role = 'admin')
);
-- Seller bisa UPDATE (mark as read)
DROP POLICY IF EXISTS "notifications_mark_read" ON notifications;
CREATE POLICY "notifications_mark_read" ON notifications FOR UPDATE USING (
  recipient_seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
  OR recipient_seller_id IS NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_seller_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(is_read) WHERE is_read = false;

-- 3. Fix admin_logs INSERT policy (needed for insert from service-role)
DROP POLICY IF EXISTS "admin_logs_insert" ON admin_logs;
CREATE POLICY "admin_logs_insert" ON admin_logs FOR INSERT WITH CHECK (true);

-- ============================================================
-- DONE — Jalankan perintah ini di Supabase:
-- SELECT * FROM page_views LIMIT 5;
-- SELECT * FROM notifications LIMIT 5;
-- ============================================================
