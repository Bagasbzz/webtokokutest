-- Migration Step 20: Formal Regions & Detailed Address
-- Menambahkan kolom wilayah resmi ke tabel store_addresses

ALTER TABLE store_addresses
  ADD COLUMN IF NOT EXISTS province_code TEXT,
  ADD COLUMN IF NOT EXISTS province_name TEXT,
  ADD COLUMN IF NOT EXISTS regency_code TEXT,
  ADD COLUMN IF NOT EXISTS regency_name TEXT,
  ADD COLUMN IF NOT EXISTS district_code TEXT,
  ADD COLUMN IF NOT EXISTS district_name TEXT,
  ADD COLUMN IF NOT EXISTS village_code TEXT,
  ADD COLUMN IF NOT EXISTS village_name TEXT,
  ADD COLUMN IF NOT EXISTS location_notes TEXT,
  ADD COLUMN IF NOT EXISTS map_url TEXT;

-- Index untuk mempermudah pencarian wilayah
CREATE INDEX IF NOT EXISTS idx_store_addresses_village_code ON store_addresses(village_code);
