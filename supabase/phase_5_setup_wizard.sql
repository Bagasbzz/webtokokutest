-- ============================================================
-- PHASE 5 — Setup Wizard
-- Migration: 4 tabel baru untuk konten toko
-- ============================================================

-- 1. STORE_TESTIMONIALS (Ulasan pelanggan)
CREATE TABLE IF NOT EXISTS store_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  content TEXT,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  urutan INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE store_testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "testimonials_owner" ON store_testimonials FOR ALL 
  USING (store_id IN (
    SELECT id FROM stores WHERE seller_id IN (
      SELECT id FROM sellers WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "testimonials_public" ON store_testimonials FOR SELECT 
  USING (is_active = true);

CREATE INDEX idx_testimonials_store ON store_testimonials(store_id);

-- 2. STORE_PROMOS (Promo & diskon)
CREATE TABLE IF NOT EXISTS store_promos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  badge_text TEXT,
  image_url TEXT,
  discount_type TEXT,   -- 'percent' | 'fixed'
  discount_value INTEGER,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE store_promos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "promos_owner" ON store_promos FOR ALL 
  USING (store_id IN (
    SELECT id FROM stores WHERE seller_id IN (
      SELECT id FROM sellers WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "promos_public" ON store_promos FOR SELECT 
  USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

CREATE INDEX idx_promos_store ON store_promos(store_id);

-- 3. STORE_BRAND_CONTENTS (Konten brand: story, gallery, sertifikat, video)
CREATE TABLE IF NOT EXISTS store_brand_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  type TEXT NOT NULL,   -- 'story' | 'gallery' | 'certificate' | 'video'
  title TEXT,
  content TEXT,
  media_url TEXT,
  urutan INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE store_brand_contents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brand_contents_owner" ON store_brand_contents FOR ALL 
  USING (store_id IN (
    SELECT id FROM stores WHERE seller_id IN (
      SELECT id FROM sellers WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "brand_contents_public" ON store_brand_contents FOR SELECT 
  USING (is_active = true);

CREATE INDEX idx_brand_contents_store ON store_brand_contents(store_id);

-- 4. STORE_SOCIAL_LINKS (Link sosial media)
CREATE TABLE IF NOT EXISTS store_social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,  -- 'instagram' | 'tiktok' | 'shopee' | 'tokopedia' | 'whatsapp' | 'website'
  url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  urutan INTEGER DEFAULT 0
);

ALTER TABLE store_social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "social_links_owner" ON store_social_links FOR ALL 
  USING (store_id IN (
    SELECT id FROM stores WHERE seller_id IN (
      SELECT id FROM sellers WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "social_links_public" ON store_social_links FOR SELECT 
  USING (is_active = true);

CREATE INDEX idx_social_links_store ON store_social_links(store_id);

-- ============================================================
-- SELESAI! 4 tabel baru untuk Setup Wizard
-- ============================================================
