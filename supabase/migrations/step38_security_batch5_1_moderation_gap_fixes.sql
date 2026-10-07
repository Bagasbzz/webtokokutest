-- STEP 38: Security Batch 5.1 - moderation gap fixes
-- Scope:
-- 1. Prevent ordinary sellers from changing internal moderation fields.
-- 2. Prevent direct seller/client inserts into moderation_events.
-- 3. Keep normal store/product edits available through existing owner policies.

CREATE OR REPLACE FUNCTION public.prevent_store_moderation_field_client_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' OR public.is_platform_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  IF OLD.moderation_status IS DISTINCT FROM NEW.moderation_status
    OR OLD.moderation_reason IS DISTINCT FROM NEW.moderation_reason
    OR OLD.moderation_score IS DISTINCT FROM NEW.moderation_score
    OR OLD.moderation_matched_terms IS DISTINCT FROM NEW.moderation_matched_terms
    OR OLD.moderation_categories IS DISTINCT FROM NEW.moderation_categories
    OR OLD.moderation_checked_at IS DISTINCT FROM NEW.moderation_checked_at
    OR OLD.moderation_admin_note IS DISTINCT FROM NEW.moderation_admin_note THEN
    RAISE EXCEPTION 'store moderation fields can only be changed by platform moderation service';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_store_moderation_field_client_update_trigger ON public.stores;
CREATE TRIGGER prevent_store_moderation_field_client_update_trigger
  BEFORE UPDATE OF
    moderation_status,
    moderation_reason,
    moderation_score,
    moderation_matched_terms,
    moderation_categories,
    moderation_checked_at,
    moderation_admin_note
  ON public.stores
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_store_moderation_field_client_update();

CREATE OR REPLACE FUNCTION public.prevent_product_moderation_field_client_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' OR public.is_platform_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  IF OLD.moderation_status IS DISTINCT FROM NEW.moderation_status
    OR OLD.moderation_reason IS DISTINCT FROM NEW.moderation_reason
    OR OLD.moderation_score IS DISTINCT FROM NEW.moderation_score
    OR OLD.moderation_matched_terms IS DISTINCT FROM NEW.moderation_matched_terms
    OR OLD.moderation_categories IS DISTINCT FROM NEW.moderation_categories
    OR OLD.moderation_checked_at IS DISTINCT FROM NEW.moderation_checked_at THEN
    RAISE EXCEPTION 'product moderation fields can only be changed by platform moderation service';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_product_moderation_field_client_update_trigger ON public.products;
CREATE TRIGGER prevent_product_moderation_field_client_update_trigger
  BEFORE UPDATE OF
    moderation_status,
    moderation_reason,
    moderation_score,
    moderation_matched_terms,
    moderation_categories,
    moderation_checked_at
  ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_product_moderation_field_client_update();

DROP POLICY IF EXISTS "moderation_events_owner_insert" ON public.moderation_events;
DROP POLICY IF EXISTS "moderation_events_admin_insert" ON public.moderation_events;
CREATE POLICY "moderation_events_admin_insert" ON public.moderation_events
  FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_admin(auth.uid()));
