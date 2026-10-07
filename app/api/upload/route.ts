import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { IMAGE_UPLOAD } from '@/lib/upload-limits'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { processImageUpload, safeStorageSegment } from '@/lib/upload-security'

export const runtime = 'nodejs'

/**
 * API Route: Secure Image Upload (Server-Side)
 * 
 * Melakukan upload ke Supabase Storage menggunakan SERVICE_ROLE_KEY
 * untuk menghindari RLS block di sisi client.
 */

export async function POST(req: NextRequest) {
  const limited = checkRateLimit(req, {
    key: 'upload:asset',
    limit: 40,
    windowMs: 10 * 60 * 1000,
  })
  if (!limited.ok) return rateLimitResponse(limited)

  const cookieStore = cookies()
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const storeId = formData.get('store_id') as string
    const purpose = formData.get('purpose') as string | null

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })
    }

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID tidak ditemukan' }, { status: 400 })
    }

    // Pastikan user hanya upload asset untuk tokonya sendiri.
    const { data: seller } = await authClient
      .from('sellers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!seller) {
      return NextResponse.json({ error: 'Data seller tidak ditemukan' }, { status: 404 })
    }

    const isOnboardingUpload = purpose === 'onboarding' && storeId === 'temp-onboarding'

    if (!isOnboardingUpload) {
      const { data: store } = await authClient
        .from('stores')
        .select('id')
        .eq('id', storeId)
        .eq('seller_id', seller.id)
        .single()

      if (!store) {
        return NextResponse.json({ error: 'Toko tidak ditemukan atau bukan milik akun ini' }, { status: 403 })
      }
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Konfigurasi upload belum lengkap: SUPABASE_SERVICE_ROLE_KEY belum diset.' }, { status: 500 })
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const processed = await processImageUpload(file, {
      maxOriginalBytes: IMAGE_UPLOAD.maxOriginalBytes,
      maxOriginalLabel: IMAGE_UPLOAD.maxOriginalLabel,
      maxStoredBytes: IMAGE_UPLOAD.maxStoredBytes,
      maxStoredLabel: IMAGE_UPLOAD.maxStoredLabel,
      maxDimension: 1800,
      outputFormat: 'webp',
    })

    if (!processed.ok) {
      return NextResponse.json({ error: processed.error }, { status: processed.status })
    }

    const folder = purpose === 'product' ? 'products' : purpose === 'onboarding' ? 'onboarding' : 'editor'
    const ownerPath = safeStorageSegment(isOnboardingUpload ? user.id : storeId)
    const filePath = `${ownerPath}/${folder}/${crypto.randomUUID()}.${processed.extension}`

    const { error: uploadError } = await adminClient.storage
      .from('editor-images')
      .upload(filePath, processed.buffer, {
        contentType: processed.contentType,
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Storage Error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Ambil Public URL
    const { data: { publicUrl } } = adminClient.storage
      .from('editor-images')
      .getPublicUrl(filePath)

    return NextResponse.json({ url: publicUrl })

  } catch (err: any) {
    console.error('Upload API Error:', err)
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan saat upload' }, { status: 500 })
  }
}
