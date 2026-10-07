-- STEP 37: Security Batch 5 - Store/content moderation and appeal workflow
-- Adds reversible moderation status, internal events, and seller appeal records.

ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS moderation_status TEXT NOT NULL DEFAULT 'safe',
  ADD COLUMN IF NOT EXISTS moderation_reason TEXT,
  ADD COLUMN IF NOT EXISTS moderation_score INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS moderation_matched_terms TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS moderation_categories TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS moderation_checked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS moderation_reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS moderation_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS moderation_admin_note TEXT;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS moderation_status TEXT NOT NULL DEFAULT 'safe',
  ADD COLUMN IF NOT EXISTS moderation_reason TEXT,
  ADD COLUMN IF NOT EXISTS moderation_score INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS moderation_matched_terms TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS moderation_categories TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS moderation_checked_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'stores_moderation_status_check'
      AND conrelid = 'public.stores'::regclass
  ) THEN
    ALTER TABLE public.stores
      ADD CONSTRAINT stores_moderation_status_check
      CHECK (moderation_status IN ('safe', 'flagged', 'pending_review', 'suspended', 'blocked'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'products_moderation_status_check'
      AND conrelid = 'public.products'::regclass
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_moderation_status_check
      CHECK (moderation_status IN ('safe', 'flagged', 'pending_review', 'suspended', 'blocked'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_stores_moderation_status
  ON public.stores(moderation_status, is_active, is_published);

CREATE INDEX IF NOT EXISTS idx_products_moderation_status
  ON public.products(store_id, moderation_status, is_active);

CREATE OR REPLACE FUNCTION public.prevent_store_moderation_bypass()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' OR public.is_platform_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  IF OLD.moderation_status IN ('pending_review', 'suspended', 'blocked')
     AND NEW.moderation_status IS DISTINCT FROM OLD.moderation_status THEN
    RAISE EXCEPTION 'moderation_status can only be changed by platform admin review';
  END IF;

  IF NEW.is_published = true
     AND NEW.moderation_status IN ('pending_review', 'suspended', 'blocked') THEN
    RAISE EXCEPTION 'store cannot be published while under moderation review';
  END IF;

  IF OLD.moderation_score IS DISTINCT FROM NEW.moderation_score
     AND OLD.moderation_status IN ('pending_review', 'suspended', 'blocked') THEN
    RAISE EXCEPTION 'moderation fields can only be changed by platform admin review';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_store_moderation_bypass_trigger ON public.stores;
CREATE TRIGGER prevent_store_moderation_bypass_trigger
  BEFORE UPDATE ON public.stores
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_store_moderation_bypass();

CREATE TABLE IF NOT EXISTS public.moderation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  risk_level TEXT NOT NULL DEFAULT 'safe',
  category TEXT,
  matched_terms TEXT[] NOT NULL DEFAULT '{}',
  reason TEXT,
  action TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moderation_events_store_created
  ON public.moderation_events(store_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.moderation_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'submitted',
  reason TEXT NOT NULL,
  context TEXT,
  fixed_content BOOLEAN NOT NULL DEFAULT false,
  admin_note TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'moderation_appeals_status_check'
      AND conrelid = 'public.moderation_appeals'::regclass
  ) THEN
    ALTER TABLE public.moderation_appeals
      ADD CONSTRAINT moderation_appeals_status_check
      CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'request_edit'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_moderation_appeals_store_status
  ON public.moderation_appeals(store_id, status, created_at DESC);

ALTER TABLE public.moderation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_appeals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "moderation_events_owner_read" ON public.moderation_events;
CREATE POLICY "moderation_events_owner_read" ON public.moderation_events
  FOR SELECT
  USING (
    store_id IN (
      SELECT s.id
      FROM public.stores s
      JOIN public.sellers sel ON sel.id = s.seller_id
      WHERE sel.user_id = auth.uid()
    )
    OR public.is_platform_admin(auth.uid())
  );

DROP POLICY IF EXISTS "moderation_events_owner_insert" ON public.moderation_events;
CREATE POLICY "moderation_events_owner_insert" ON public.moderation_events
  FOR INSERT
  WITH CHECK (
    store_id IN (
      SELECT s.id
      FROM public.stores s
      JOIN public.sellers sel ON sel.id = s.seller_id
      WHERE sel.user_id = auth.uid()
    )
    OR public.is_platform_admin(auth.uid())
  );

DROP POLICY IF EXISTS "moderation_appeals_owner_read" ON public.moderation_appeals;
CREATE POLICY "moderation_appeals_owner_read" ON public.moderation_appeals
  FOR SELECT
  USING (
    seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid())
    OR public.is_platform_admin(auth.uid())
  );

DROP POLICY IF EXISTS "moderation_appeals_owner_insert" ON public.moderation_appeals;
CREATE POLICY "moderation_appeals_owner_insert" ON public.moderation_appeals
  FOR INSERT
  WITH CHECK (
    seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid())
    AND store_id IN (
      SELECT s.id
      FROM public.stores s
      JOIN public.sellers sel ON sel.id = s.seller_id
      WHERE sel.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "moderation_appeals_admin_update" ON public.moderation_appeals;
CREATE POLICY "moderation_appeals_admin_update" ON public.moderation_appeals
  FOR UPDATE
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- Public storefront policies should not expose stores/products under review.
DROP POLICY IF EXISTS "store_public" ON public.stores;
DROP POLICY IF EXISTS "stores_public" ON public.stores;
CREATE POLICY "stores_public" ON public.stores
  FOR SELECT
  USING (
    is_active = true
    AND is_published = true
    AND moderation_status IN ('safe', 'flagged')
  );

DROP POLICY IF EXISTS "product_public" ON public.products;
DROP POLICY IF EXISTS "products_public" ON public.products;
CREATE POLICY "products_public" ON public.products
  FOR SELECT
  USING (
    is_active = true
    AND moderation_status IN ('safe', 'flagged')
    AND store_id IN (
      SELECT id
      FROM public.stores
      WHERE is_active = true
        AND is_published = true
        AND moderation_status IN ('safe', 'flagged')
    )
  );
