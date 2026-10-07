import { redirect } from 'next/navigation'
import { getPlatformAdminCheck } from '@/lib/admin-access'

/**
 * Server-side Admin Guard.
 * Admin access is controlled by platform_admins, not by sellers.role.
 */
export async function adminGuard() {
  const check = await getPlatformAdminCheck()

  if (!check.user) {
    redirect('/auth/login')
  }

  if (!check.seller) {
    if (check.user.email === 'bagasphensell@gmail.com') redirect('/onboarding')
    redirect('/dashboard')
  }

  if (!check.isAdmin) {
    redirect('/dashboard')
  }

  return { user: check.user, seller: check.seller, platformAdmin: check.platformAdmin }
}

export async function isAdmin(): Promise<boolean> {
  const check = await getPlatformAdminCheck()
  return check.isAdmin
}
