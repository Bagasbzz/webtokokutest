import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { processImageUpload, safeStorageSegment } from '@/lib/upload-security'

export const runtime = 'nodejs'

function normalizeWhatsApp(value: string) {
  return value.replace(/\D/g, '')
}

export async function POST(request: NextRequest) {
  const limited = checkRateLimit(request, {
    key: 'upload:payment-proof',
    limit: 12,
    windowMs: 10 * 60 * 1000,
  })
  if (!limited.ok) return rateLimitResponse(limited)

  try {
    // Initialize Supabase client inside handler (not at build time)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing Supabase credentials' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const formData = await request.formData()
    const file = formData.get('file') as File
    const storeId = formData.get('store_id') as string
    const orderCode = formData.get('order_code') as string
    const customerWhatsapp = formData.get('customer_whatsapp') as string

    if (!file) {
      return NextResponse.json(
        { error: 'File tidak ditemukan' },
        { status: 400 }
      )
    }

    if (!storeId || !orderCode || !customerWhatsapp) {
      return NextResponse.json(
        { error: 'Data order tidak lengkap' },
        { status: 400 }
      )
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_code, store_id, customer_whatsapp, bukti_url, bukti_storage_path')
      .eq('order_code', orderCode)
      .eq('store_id', storeId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order tidak ditemukan' },
        { status: 404 }
      )
    }

    if (normalizeWhatsApp(order.customer_whatsapp || '') !== normalizeWhatsApp(customerWhatsapp)) {
      return NextResponse.json(
        { error: 'Order tidak cocok dengan nomor WhatsApp pembeli' },
        { status: 403 }
      )
    }

    if (order.bukti_url || order.bukti_storage_path) {
      return NextResponse.json(
        { error: 'Bukti pembayaran untuk order ini sudah ada' },
        { status: 409 }
      )
    }

    const processed = await processImageUpload(file, {
      maxOriginalBytes: 5 * 1024 * 1024,
      maxOriginalLabel: '5MB',
      maxStoredBytes: 2 * 1024 * 1024,
      maxStoredLabel: '2MB',
      maxDimension: 2400,
      outputFormat: 'webp',
    })

    if (!processed.ok) {
      return NextResponse.json({ error: processed.error }, { status: processed.status })
    }

    const safeStoreId = safeStorageSegment(storeId)
    const safeOrderId = safeStorageSegment(order.id)
    const fileName = `payment-proofs/${safeStoreId}/${safeOrderId}/${crypto.randomUUID()}.${processed.extension}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase
      .storage
      .from('proofs')
      .upload(fileName, processed.buffer, {
        contentType: processed.contentType,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Gagal upload file: ' + uploadError.message },
        { status: 500 }
      )
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        bukti_url: fileName,
        bukti_storage_path: fileName,
        bukti_uploaded_at: new Date().toISOString(),
        payment_status: 'menunggu_konfirmasi',
        order_status: 'menunggu_konfirmasi',
      })
      .eq('id', order.id)
      .is('bukti_storage_path', null)

    if (updateError) {
      console.error('Order proof update error:', updateError)
      return NextResponse.json(
        { error: 'Bukti terupload, tapi gagal menyimpan ke order' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      order_code: orderCode,
      url: fileName,
      path: fileName
    })

  } catch (error) {
    console.error('Payment proof upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
