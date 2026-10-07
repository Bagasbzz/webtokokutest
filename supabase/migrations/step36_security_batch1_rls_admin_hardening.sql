-- STEP 36: Security Batch 1 - RLS and admin role hardening
-- Scope:
-- 1. Move admin access checks to a locked platform_admins table.
-- 2. Prevent ordinary sellers from changing sellers.role through Supabase client.
-- 3. Remove public direct INSERT policies for order/log/analytics tables.

-- A locked admin membership table. This is the authority for platform admin access.
-- sellers.role remains for display/legacy data, but no longer controls admin access.
CREATE TABLE IF NOT EXISTS public.platform_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_admins_active_user
  ON public.platform_admins(user_id)
  WHERE is_active = true;

ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

-- Admin membership is readable by the owner only; service-role bypasses RLS for admin panels.
DROP POLICY IF EXISTS "platform_admins_self_read" ON public.platform_admins;
CREATE POLICY "platform_admins_self_read" ON public.platform_admins
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Helper used by RLS policies. SECURITY DEFINER prevents recursive RLS lookups.
CREATE OR REPLACE FUNCTION public.is_platform_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.platform_admins pa
    WHERE pa.user_id = p_user_id
      AND pa.is_active = true
  );
$$;

REVOKE ALL ON FUNCTION public.is_platform_admin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_platform_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_platform_admin(UUID) TO service_role;

-- Bootstrap current admins into the locked admin table.
-- This keeps existing admin access after the migration is applied.
INSERT INTO public.platform_admins (user_id, seller_id, email, is_active)
SELECT s.user_id, s.id, s.email, true
FROM public.sellers s
WHERE s.user_id IS NOT NULL
  AND (
    s.role = 'admin'
    OR lower(s.email) = 'bagasphensell@gmail.com'
  )
ON CONFLICT (user_id) DO UPDATE
SET
  seller_id = EXCLUDED.seller_id,
  email = EXCLUDED.email,
  is_active = true,
  updated_at = now();

-- Prevent client-side role escalation. Admin role changes must use service-role code.
CREATE OR REPLACE FUNCTION public.prevent_seller_role_self_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF OLD.role IS DISTINCT FROM NEW.role THEN
    RAISE EXCEPTION 'sellers.role can only be changed by platform admin service';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_seller_role_self_update_trigger ON public.sellers;
CREATE TRIGGER prevent_seller_role_self_update_trigger
  BEFORE UPDATE OF role ON public.sellers
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_seller_role_self_update();

-- Keep existing profile-edit behavior, but make the role-protection explicit via trigger above.
DROP POLICY IF EXISTS "sellers_update_own" ON public.sellers;
DROP POLICY IF EXISTS "Sellers can update own profile" ON public.sellers;
CREATE POLICY "sellers_update_own" ON public.sellers
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Remove direct public inserts. Checkout and logging must go through server routes/service-role.
DROP POLICY IF EXISTS "orders_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_public_insert" ON public.orders;
DROP POLICY IF EXISTS "customer_create_order" ON public.orders;

DROP POLICY IF EXISTS "order_items_insert" ON public.order_items;
DROP POLICY IF EXISTS "order_items_public_insert" ON public.order_items;

DROP POLICY IF EXISTS "admin_logs_insert" ON public.admin_logs;
DROP POLICY IF EXISTS "admin_insert_logs" ON public.admin_logs;

DROP POLICY IF EXISTS "page_views_insert" ON public.page_views;
DROP POLICY IF EXISTS "traffic_insert_public" ON public.store_traffic;

-- Refresh admin/read policies so they do not trust sellers.role.
DROP POLICY IF EXISTS "admin_logs_read" ON public.admin_logs;
DROP POLICY IF EXISTS "admin_read_logs" ON public.admin_logs;
CREATE POLICY "admin_logs_read" ON public.admin_logs
  FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "page_views_owner_select" ON public.page_views;
CREATE POLICY "page_views_owner_select" ON public.page_views
  FOR SELECT TO authenticated
  USING (
    public.is_platform_admin(auth.uid())
    OR store_id IN (
      SELECT s.id
      FROM public.stores s
      JOIN public.sellers sel ON sel.id = s.seller_id
      WHERE sel.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "traffic_select_owner" ON public.store_traffic;
CREATE POLICY "traffic_select_owner" ON public.store_traffic
  FOR SELECT TO authenticated
  USING (
    public.is_platform_admin(auth.uid())
    OR store_id IN (
      SELECT s.id
      FROM public.stores s
      JOIN public.sellers sel ON sel.id = s.seller_id
      WHERE sel.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "notifications_admin_insert" ON public.notifications;
CREATE POLICY "notifications_admin_insert" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "notifications_admin_select" ON public.notifications;
CREATE POLICY "notifications_admin_select" ON public.notifications
  FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "feature_flags_admin" ON public.feature_flags;
DROP POLICY IF EXISTS "admin_only_feature_flags" ON public.feature_flags;
CREATE POLICY "feature_flags_admin" ON public.feature_flags
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "store_flags_admin" ON public.store_feature_flags;
DROP POLICY IF EXISTS "admin_manage_store_flags" ON public.store_feature_flags;
CREATE POLICY "store_flags_admin" ON public.store_feature_flags
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "platform_settings_admin" ON public.platform_settings;
DROP POLICY IF EXISTS "admin_manage_settings" ON public.platform_settings;
CREATE POLICY "platform_settings_admin" ON public.platform_settings
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- Optional tables from later migrations. These DO blocks keep this migration safe
-- if a deployment has not run every optional migration yet.
DO $$
BEGIN
  IF to_regclass('public.shipping_api_usage_logs') IS NOT NULL THEN
    DROP POLICY IF EXISTS "shipping_usage_admin_read" ON public.shipping_api_usage_logs;
    CREATE POLICY "shipping_usage_admin_read" ON public.shipping_api_usage_logs
      FOR SELECT TO authenticated
      USING (public.is_platform_admin(auth.uid()));
  END IF;
END $$;
