import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getRajaOngkirConfig, getRajaOngkirQuota, logRajaOngkirHit, quotaExceededResponse } from '@/lib/rajaongkir'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { isLockedModerationStatus } from '@/lib/moderation'

export async function GET(request: NextRequest) {
  const limited = checkRateLimit(request, {
    key: 'shipping:search',
    limit: 60,
    windowMs: 10 * 60 * 1000,
  })
  if (!limited.ok) return rateLimitResponse(limited)

  const q = request.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 3) {
    return NextResponse.json({ data: [] })
  }

  const { apiKey, baseUrl } = getRajaOngkirConfig()
  if (!apiKey) {
    return NextResponse.json({
      error: 'RajaOngkir API key belum dikonfigurasi.',
      code: 'RAJAONGKIR_KEY_MISSING',
    }, { status: 503 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const storeId = request.nextUrl.searchParams.get('store_id')?.trim()

  if (storeId) {
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, is_active, is_published, moderation_status')
      .eq('id', storeId)
      .single()

    if (storeError || !store) {
      return NextResponse.json({ error: 'Toko tidak ditemukan' }, { status: 404 })
    }

    if (!store.is_active || !store.is_published || isLockedModerationStatus(store.moderation_status)) {
      return NextResponse.json({ error: 'Toko belum dapat menerima pesanan saat ini.' }, { status: 403 })
    }
  }

  const cacheKey = `rajaongkir:destination:${q.toLowerCase()}`
  const now = new Date().toISOString()

  const { data: cached } = await supabase
    .from('ro_locations')
    .select('response_json, expires_at')
    .eq('query', cacheKey)
    .gt('expires_at', now)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (cached?.response_json) {
    const quota = await getRajaOngkirQuota(supabase)
    return NextResponse.json({ ...cached.response_json, quota, cached: true })
  }

  const quota = await getRajaOngkirQuota(supabase)
  if (quota.exhausted) {
    return NextResponse.json(quotaExceededResponse(quota), { status: 429 })
  }

  const url = `${baseUrl}/destination/domestic-destination?search=${encodeURIComponent(q)}&limit=20&offset=0`

  try {
    const response = await fetch(url, {
      headers: { key: apiKey },
      cache: 'no-store',
    })
    const payload = await response.json().catch(() => null)
    await logRajaOngkirHit(supabase, {
      endpoint: 'destination/domestic-destination',
      statusCode: response.status,
      metadata: { q },
    })

    if (!response.ok) {
      return NextResponse.json({
        error: payload?.meta?.message || 'Gagal mencari lokasi pengiriman.',
        code: 'RAJAONGKIR_SEARCH_FAILED',
        quota: await getRajaOngkirQuota(supabase),
      }, { status: response.status })
    }

    const result = {
      data: Array.isArray(payload?.data) ? payload.data : [],
      meta: payload?.meta || null,
      quota: await getRajaOngkirQuota(supabase),
    }

    await supabase.from('ro_locations').insert({
      query: cacheKey,
      response_json: result,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('RajaOngkir search error:', error)
    return NextResponse.json({
      error: 'Gagal mengambil data lokasi. Coba lagi nanti.',
      code: 'RAJAONGKIR_SEARCH_ERROR',
    }, { status: 502 })
  }
}
