import React from 'react'
import { getAllFeatureFlags } from '@/lib/feature-flags'
import OnboardingClient from './OnboardingClient'

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const featureFlags = await getAllFeatureFlags()
  
  return <OnboardingClient featureFlags={featureFlags} />
}
