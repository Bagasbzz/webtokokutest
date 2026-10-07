import React from 'react'
import { getAllFeatureFlags } from '@/lib/feature-flags'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const featureFlags = await getAllFeatureFlags()
  
  return (
    <DashboardClient featureFlags={featureFlags}>
      {children}
    </DashboardClient>
  )
}
