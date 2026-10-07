-- STEP 39: Security Batch 5.2 - moderation insert lock
-- Scope:
-- 1. Prevent ordinary sellers from injecting internal moderation fields on INSERT.
-- 2. Preserve normal store/product inserts by normalizing moderation fields to review defaults.
-- 3. Keep service-role/admin moderation pipelines unchanged.

CREATE OR REPLACE FUNCTION public.normalize_store_moderation_fields_on_client_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' OR public.is_platform_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  NEW.moderation_status := 'pending_review';
  NEW.moderation_reason := 'Menunggu pemeriksaan moderasi otomatis.';
  NEW.moderation_score := 0;
  NEW.moderation_matched_terms := '{}';
  NEW.moderation_categories := ARRAY['pending_review'];
  NEW.moderation_checked_at := NULL;
  NEW.moderation_admin_note := NULL;
  NEW.is_published := false;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS normalize_store_moderation_fields_on_client_insert_trigger ON public.stores;
CREATE TRIGGER normalize_store_moderation_fields_on_client_insert_trigger
  BEFORE INSERT ON public.stores
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_store_moderation_fields_on_client_insert();

CREATE OR REPLACE FUNCTION public.normalize_product_moderation_fields_on_client_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' OR public.is_platform_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  NEW.moderation_status := 'pending_review';
  NEW.moderation_reason := 'Menunggu pemeriksaan moderasi otomatis.';
  NEW.moderation_score := 0;
  NEW.moderation_matched_terms := '{}';
  NEW.moderation_categories := ARRAY['pending_review'];
  NEW.moderation_checked_at := NULL;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS normalize_product_moderation_fields_on_client_insert_trigger ON public.products;
CREATE TRIGGER normalize_product_moderation_fields_on_client_insert_trigger
  BEFORE INSERT ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_product_moderation_fields_on_client_insert();
