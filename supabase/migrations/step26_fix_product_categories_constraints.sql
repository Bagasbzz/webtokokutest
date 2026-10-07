-- ============================================================
-- step26_fix_product_categories_constraints.sql
-- Fix: tambah UNIQUE(store_id, slug) constraint yang hilang
-- dan rename kolom 'nama' ke 'name' jika belum
-- Aman dijalankan berulang kali (idempotent)
-- ============================================================

-- 1. Rename kolom 'nama' ke 'name' jika masih ada kolom lama
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'product_categories'
      AND column_name = 'nama'
  ) THEN
    ALTER TABLE public.product_categories RENAME COLUMN nama TO name;
    RAISE NOTICE 'Kolom "nama" berhasil di-rename ke "name"';
  ELSE
    RAISE NOTICE 'Kolom "name" sudah ada, skip rename';
  END IF;
END $$;

-- 2. Tambah UNIQUE INDEX (store_id, slug) jika belum ada
-- Ini juga berlaku sebagai constraint untuk ON CONFLICT (store_id, slug)
CREATE UNIQUE INDEX IF NOT EXISTS product_categories_store_id_slug_key
  ON public.product_categories(store_id, slug);

-- 3. Tambah kolom 'description' dan 'updated_at' jika belum ada
--    (step24 menambahkan ini, tapi 2_CREATE_ALL.sql tidak punya)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'product_categories'
      AND column_name = 'description'
  ) THEN
    ALTER TABLE public.product_categories ADD COLUMN description TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'product_categories'
      AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.product_categories
      ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Selesai
SELECT 'product_categories constraints berhasil diperbaiki' AS status;
