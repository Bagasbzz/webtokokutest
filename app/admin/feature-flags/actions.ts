'use server'

import { revalidatePath } from 'next/cache'
import { adminGuard } from '@/lib/admin-guard'
import { createAdminClient } from '@/lib/supabase/admin'

export async function toggleGlobalFeature(flagId: string, enabled: boolean, flagKey: string) {
  // 1. Ensure admin
  const { user } = await adminGuard()

  const supabase = createAdminClient()

  // 2. Update flag
  const { error } = await supabase
    .from('feature_flags')
    .update({ 
      enabled_globally: enabled,
      updated_at: new Date().toISOString()
    })
    .eq('id', flagId)

  if (error) {
    throw new Error(`Failed to update feature flag: ${error.message}`)
  }

  // 3. Log action
  await supabase.from('admin_logs').insert({
    admin_id: user.id,
    action: 'TOGGLE_FEATURE_FLAG',
    target_type: 'feature_flag',
    target_id: flagId,
    description: `Admin changed global flag '${flagKey}' to ${enabled ? 'ENABLED' : 'DISABLED'}`
  })

  // 4. Revalidate cache
  revalidatePath('/admin/feature-flags')
  return { success: true }
}
