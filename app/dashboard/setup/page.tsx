import { redirect } from 'next/navigation'
import { getAllFeatureFlags } from '@/lib/feature-flags'
import SetupWizardClient from './SetupWizardClient'

export const dynamic = 'force-dynamic'

export default async function SetupPage() {
  const featureFlags = await getAllFeatureFlags()

  // Check if setup_wizard feature is enabled
  if (!featureFlags?.['setup_wizard']) {
    redirect('/dashboard')
  }

  return <SetupWizardClient />
}
