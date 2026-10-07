-- ============================================================
-- STEP 1: RESET ONLY - HAPUS SEMUA TABEL
-- ⚠️ DANGER: This will DELETE ALL DATA!
-- Jalankan ini dulu sampai bersih, baru jalankan 2_CREATE_ALL.sql
-- ============================================================

-- Drop triggers first
DROP TRIGGER IF EXISTS tr_create_shipping_settings ON stores;
DROP FUNCTION IF EXISTS create_default_shipping_settings();

-- Drop tables (child first, parent last)
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS checkout_settings CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS store_addresses CASCADE;
DROP TABLE IF EXISTS shipping_settings CASCADE;
DROP TABLE IF EXISTS ro_locations CASCADE;
DROP TABLE IF EXISTS template_customizations CASCADE;
DROP TABLE IF EXISTS template_revisions CASCADE;
DROP TABLE IF EXISTS store_feature_flags CASCADE;
DROP TABLE IF EXISTS admin_logs CASCADE;
DROP TABLE IF EXISTS platform_settings CASCADE;
DROP TABLE IF EXISTS feature_flags CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS sellers CASCADE;

-- ✅ SELESAI! Database kosong, siap CREATE.
-- Langkah selanjutnya: Jalankan 2_CREATE_ALL.sql
