-- Step 12: RajaOngkir V2 Migration
-- Jalankan di Supabase SQL Editor

-- Tabel untuk alamat asal toko (multi-pickup point ready)
CREATE TABLE IF NOT EXISTS store_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Utama',
  nama_pengirim TEXT NOT NULL,
  no_telp TEXT NOT NULL,
  alamat_lengkap TEXT NOT NULL,
  province_id TEXT, 
  city_id TEXT, 
  district_id TEXT, 
  subdistrict_id TEXT,
  postal_code TEXT, 
  is_default BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabel setting pengiriman per toko
CREATE TABLE IF NOT EXISTS shipping_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE UNIQUE,
  auto_shipping_enabled BOOLEAN DEFAULT false,
  pickup_enabled BOOLEAN DEFAULT true,
  cod_enabled BOOLEAN DEFAULT false,
  allowed_couriers JSONB DEFAULT '["jne","jnt","sicepat"]',
  free_shipping_minimum INTEGER DEFAULT 0
);

-- Tabel cache lokasi RajaOngkir (expires 7 hari)
CREATE TABLE IF NOT EXISTS ro_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  response_json JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days')
);

CREATE INDEX IF NOT EXISTS idx_ro_locations_query ON ro_locations(query);
CREATE INDEX IF NOT EXISTS idx_ro_locations_expires ON ro_locations(expires_at);

-- Enable RLS
ALTER TABLE store_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ro_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies untuk store_addresses
CREATE POLICY "store_addresses_owner" ON store_addresses 
  FOR ALL USING (
    store_id IN (SELECT id FROM stores WHERE seller_id IN (
      SELECT id FROM sellers WHERE user_id = auth.uid()
    ))
  );

-- RLS Policies untuk shipping_settings
CREATE POLICY "shipping_settings_owner" ON shipping_settings 
  FOR ALL USING (
    store_id IN (SELECT id FROM stores WHERE seller_id IN (
      SELECT id FROM sellers WHERE user_id = auth.uid()
    ))
  );

-- RLS untuk ro_locations (hanya service role yang bisa akses)
CREATE POLICY "ro_locations_service_only" ON ro_locations 
  FOR ALL USING (false);

-- Trigger: Set default address when new store created
CREATE OR REPLACE FUNCTION create_default_shipping_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO shipping_settings (store_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_create_shipping_settings ON stores;
CREATE TRIGGER tr_create_shipping_settings
  AFTER INSERT ON stores
  FOR EACH ROW
  EXECUTE FUNCTION create_default_shipping_settings();
