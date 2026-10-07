import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type PlatformAdminCheck =
  | { isAdmin: true; user: any; seller: any | null; platformAdmin: any }
  | { isAdmin: false; user: any | null; seller: any | null; platformAdmin: null }

export async function getPlatformAdminCheck(): Promise<PlatformAdminCheck> {
  const authClient = createClient()
  const { data: { user }, error: authError } = await authClient.auth.getUser()

  if (authError || !user) {
    return { isAdmin: false, user: null, seller: null, platformAdmin: null }
  }

  const adminClient = createAdminClient()

  const [{ data: platformAdmin }, { data: seller }] = await Promise.all([
    adminClient
      .from('platform_admins')
      .select('id, user_id, seller_id, email, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle(),
    adminClient
      .from('sellers')
      .select('id, user_id, email, role')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  if (!platformAdmin) {
    return { isAdmin: false, user, seller: seller || null, platformAdmin: null }
  }

  return { isAdmin: true, user, seller: seller || null, platformAdmin }
}

export async function isPlatformAdmin(): Promise<boolean> {
  const check = await getPlatformAdminCheck()
  return check.isAdmin
}
