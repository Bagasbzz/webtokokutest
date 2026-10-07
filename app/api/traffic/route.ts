import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const limited = checkRateLimit(request, {
    key: 'traffic:insert',
    limit: 120,
    windowMs: 10 * 60 * 1000,
  })
  if (!limited.ok) return rateLimitResponse(limited)

  try {
    const { store_id, visitor_id, path, referrer } = await request.json()

    if (!visitor_id || !path) {
      return NextResponse.json({ error: 'Parameter tidak lengkap' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Lakukan insert ke tabel store_traffic.
    // Jika tabel store_traffic belum terbuat (misal migrasi belum dieksekusi di Cloud Supabase),
    // tangani error secara anggun tanpa menyebabkan HTTP 500 crash.
    const { error } = await supabase.from('store_traffic').insert({
      store_id: store_id || null,
      visitor_id,
      path,
      referrer: referrer || null,
    })

    if (error) {
      console.warn('Traffic insert failed (check if step31 migration has been executed in database):', error.message)
      return NextResponse.json({ 
        success: false, 
        warning: 'Pencatatan dilewati. Pastikan tabel store_traffic sudah dibuat di database cloud.' 
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Traffic API exception:', err)
    // Sembunyikan error dan kirimkan status 200/success false agar tidak memblokir user experience pengunjung
    return NextResponse.json({ success: false, error: 'Silent suppression' }, { status: 200 })
  }
}
