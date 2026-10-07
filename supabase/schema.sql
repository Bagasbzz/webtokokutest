-- Sellers: hanya bisa akses data sendiri
CREATE TABLE sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nama_lengkap TEXT NOT NULL,
  no_wa TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own profile
CREATE POLICY "Sellers can select own profile" 
ON sellers FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Sellers can update own profile" 
ON sellers FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to insert their own profile during registration
CREATE POLICY "Sellers can insert own profile" 
ON sellers FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Stores: seller akses sendiri, publik bisa SELECT store aktif
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
  nama_toko TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,          -- URL path: /butikhana
  custom_domain TEXT UNIQUE,          -- domain seller: rina.id
  deskripsi TEXT,
  template TEXT DEFAULT 'butik',      -- 'butik' | 'dapur' | 'glow' | 'luxe' | 'herba'
  warna_tema TEXT DEFAULT '#16A34A',  -- hex color
  logo_url TEXT,
  no_wa TEXT NOT NULL,
  alamat TEXT,
  kota TEXT,
  is_active BOOLEAN DEFAULT true,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  plan_expires_at TIMESTAMPTZ,
  pro_started_at TIMESTAMPTZ,
  pro_notes TEXT,
  -- Kustomisasi template
  hero_image_url TEXT DEFAULT NULL,   -- URL gambar hero section
  font_heading TEXT DEFAULT 'Outfit', -- Font heading: Outfit | Poppins | Playfair Display | Montserrat
  font_body TEXT DEFAULT 'Inter',     -- Font body: Inter | Poppins | Montserrat
  hero_title TEXT DEFAULT NULL,       -- Override judul hero (default: nama_toko)
  hero_subtitle TEXT DEFAULT NULL,    -- Override tagline hero (default: deskripsi)
  is_published BOOLEAN DEFAULT false, -- false = draft, true = live
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- SQL untuk ALTER TABLE jika tabel sudah ada (jalankan ini jika schema sudah diimport sebelumnya):
-- ALTER TABLE stores ADD COLUMN IF NOT EXISTS hero_image_url TEXT DEFAULT NULL;
-- ALTER TABLE stores ADD COLUMN IF NOT EXISTS font_heading TEXT DEFAULT 'Outfit';
-- ALTER TABLE stores ADD COLUMN IF NOT EXISTS font_body TEXT DEFAULT 'Inter';
-- ALTER TABLE stores ADD COLUMN IF NOT EXISTS hero_title TEXT DEFAULT NULL;
-- ALTER TABLE stores ADD COLUMN IF NOT EXISTS hero_subtitle TEXT DEFAULT NULL;
-- ALTER TABLE stores ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
-- ALTER TABLE stores ALTER COLUMN template SET DEFAULT 'butik';
-- ALTER TABLE stores ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free';
-- ALTER TABLE stores ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;
-- ALTER TABLE stores ADD COLUMN IF NOT EXISTS pro_started_at TIMESTAMPTZ;
-- ALTER TABLE stores ADD COLUMN IF NOT EXISTS pro_notes TEXT;

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "store_owner" ON stores FOR ALL USING (
  seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
);
CREATE POLICY "store_public" ON stores FOR SELECT USING (is_active = true);

-- Products: seller akses sendiri, publik bisa SELECT produk aktif
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  harga INTEGER NOT NULL,             -- dalam Rupiah, tanpa desimal
  deskripsi TEXT,
  foto_url TEXT,
  kategori TEXT,
  is_active BOOLEAN DEFAULT true,
  urutan INTEGER DEFAULT 0,           -- untuk sorting manual
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_owner" ON products FOR ALL USING (
  store_id IN (
    SELECT id FROM stores WHERE seller_id IN (
      SELECT id FROM sellers WHERE user_id = auth.uid()
    )
  )
);
CREATE POLICY "product_public" ON products FOR SELECT USING (is_active = true);

-- Bucket untuk foto produk
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Policy: seller bisa upload, semua bisa baca
CREATE POLICY "upload_own" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "read_public" ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');
