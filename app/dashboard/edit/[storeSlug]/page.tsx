import { redirect } from 'next/navigation'
import { getAllFeatureFlags } from '@/lib/feature-flags'
import VisualEditorClient from './VisualEditorClient'

export const dynamic = 'force-dynamic'

interface EditPageProps {
  params: {
    storeSlug: string
  }
}

export default async function EditPage({ params }: EditPageProps) {
  const featureFlags = await getAllFeatureFlags()
  
  // Check if visual_editor feature is enabled
  if (!featureFlags?.['visual_editor']) {
    redirect('/dashboard')
  }
  
  return <VisualEditorClient storeSlug={params.storeSlug} />
}
