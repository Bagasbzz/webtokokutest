import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireStoreOwner } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get('order_id')
  if (!orderId) {
    return NextResponse.json({ error: 'Order id wajib diisi' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey)
  const { data: order, error } = await adminClient
    .from('orders')
    .select('id, store_id, bukti_url, bukti_storage_path')
    .eq('id', orderId)
    .single()

  if (error || !order) {
    return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })
  }

  const auth = await requireStoreOwner(order.store_id)
  if (!auth.ok) return auth.response

  if (!order.bukti_storage_path) {
    if (order.bukti_url && /^https?:\/\//.test(order.bukti_url)) {
      return NextResponse.json({ url: order.bukti_url })
    }
    return NextResponse.json({ error: 'Bukti bayar tidak tersedia' }, { status: 404 })
  }

  const { data: signed, error: signError } = await adminClient
    .storage
    .from('proofs')
    .createSignedUrl(order.bukti_storage_path, 60 * 10)

  if (signError || !signed?.signedUrl) {
    return NextResponse.json({ error: 'Gagal membuat link bukti bayar' }, { status: 500 })
  }

  return NextResponse.json({ url: signed.signedUrl })
}
