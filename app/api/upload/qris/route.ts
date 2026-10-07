import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { processImageUpload, safeStorageSegment } from '@/lib/upload-security'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const limited = checkRateLimit(request, {
    key: 'upload:qris',
    limit: 20,
    windowMs: 10 * 60 * 1000,
  })
  if (!limited.ok) return rateLimitResponse(limited)

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const authClient = createServerSupabaseClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const storeId = formData.get('store_id') as string

    if (!file || !storeId) {
      return NextResponse.json({ error: 'Data upload tidak lengkap' }, { status: 400 })
    }

    const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey)

    const { data: seller, error: sellerError } = await serviceClient
      .from('sellers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (sellerError || !seller) {
      return NextResponse.json({ error: 'Seller tidak ditemukan' }, { status: 403 })
    }

    const { data: store, error: storeError } = await serviceClient
      .from('stores')
      .select('id')
      .eq('id', storeId)
      .eq('seller_id', seller.id)
      .single()

    if (storeError || !store) {
      return NextResponse.json({ error: 'Toko tidak ditemukan' }, { status: 404 })
    }

    const processed = await processImageUpload(file, {
      maxOriginalBytes: 2 * 1024 * 1024,
      maxOriginalLabel: '2MB',
      maxStoredBytes: 2 * 1024 * 1024,
      maxStoredLabel: '2MB',
      maxDimension: 2400,
      outputFormat: 'png',
    })

    if (!processed.ok) {
      return NextResponse.json({ error: processed.error }, { status: processed.status })
    }

    const safeStoreId = safeStorageSegment(storeId)
    const fileName = `qris/${safeStoreId}/${crypto.randomUUID()}.${processed.extension}`

    const { error: uploadError } = await serviceClient
      .storage
      .from('payment-methods')
      .upload(fileName, processed.buffer, {
        contentType: processed.contentType,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: 'Gagal upload gambar: ' + uploadError.message },
        { status: 500 }
      )
    }

    const { data: { publicUrl } } = serviceClient
      .storage
      .from('payment-methods')
      .getPublicUrl(fileName)

    const { data: existingMethod, error: existingError } = await serviceClient
      .from('payment_methods')
      .select('id')
      .eq('store_id', storeId)
      .eq('type', 'qris')
      .maybeSingle()

    if (existingError) {
      return NextResponse.json(
        { error: 'Gagal membaca data pembayaran: ' + existingError.message },
        { status: 500 }
      )
    }

    const payload = {
      store_id: storeId,
      type: 'qris',
      qr_image_url: publicUrl,
      is_active: true,
    }

    const saveResult = existingMethod?.id
      ? await serviceClient
          .from('payment_methods')
          .update(payload)
          .eq('id', existingMethod.id)
      : await serviceClient
          .from('payment_methods')
          .insert(payload)

    if (saveResult.error) {
      return NextResponse.json(
        { error: 'Gagal simpan data: ' + saveResult.error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: fileName,
    })
  } catch (error) {
    console.error('QRIS upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
