import RegisterClient from './RegisterClient'
import { getAllFeatureFlags } from '@/lib/feature-flags'

export const dynamic = 'force-dynamic'

export default async function RegisterPage() {
  const featureFlags = await getAllFeatureFlags()

  return <RegisterClient featureFlags={featureFlags} />
}
