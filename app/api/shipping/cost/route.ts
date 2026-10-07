import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  getRajaOngkirConfig,
  getRajaOngkirQuota,
  logRajaOngkirHit,
  normalizeCouriers,
  parseDomesticCosts,
  quotaExceededResponse,
} from '@/lib/rajaongkir'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { isLockedModerationStatus } from '@/lib/moderation'

export async function POST(request: NextRequest) {
  const limited = checkRateLimit(request, {
    key: 'shipping:cost',
    limit: 80,
    windowMs: 10 * 60 * 1000,
  })
  if (!limited.ok) return rateLimitResponse(limited)

  const { store_id, destination_id, total_weight } = await request.json()

  if (!store_id || !destination_id || !total_weight) {
    return NextResponse.json({ error: 'Parameter tidak lengkap' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, is_active, is_published, moderation_status')
    .eq('id', store_id)
    .single()

  if (storeError || !store) {
    return NextResponse.json({ error: 'Toko tidak ditemukan' }, { status: 404 })
  }

  if (!store.is_active || !store.is_published || isLockedModerationStatus(store.moderation_status)) {
    return NextResponse.json({ error: 'Toko belum dapat menerima pesanan saat ini.' }, { status: 403 })
  }

  const { data: flag } = await supabase
    .from('feature_flags')
    .select('enabled_globally')
    .eq('key', 'auto_shipping')
    .single()

  const { data: settings } = await supabase
    .from('shipping_settings')
    .select('auto_shipping_enabled, allowed_couriers')
    .eq('store_id', store_id)
    .single()

  if (!flag?.enabled_globally || !settings?.auto_shipping_enabled) {
    return NextResponse.json({
      disabled: true,
      data: [],
      shipping_note: 'Ongkir otomatis sedang nonaktif. Ongkir dikonfirmasi seller via WhatsApp.',
    })
  }

  const { data: address } = await supabase
    .from('store_addresses')
    .select('subdistrict_id')
    .eq('store_id', store_id)
    .eq('is_default', true)
    .single()

  if (!address?.subdistrict_id) {
    return NextResponse.json({ error: 'Alamat asal toko belum diatur.' }, { status: 400 })
  }

  const { apiKey, baseUrl } = getRajaOngkirConfig()
  if (!apiKey) {
    return NextResponse.json({
      error: 'RajaOngkir API key belum dikonfigurasi.',
      code: 'RAJAONGKIR_KEY_MISSING',
      shipping_note: 'Ongkir otomatis belum siap. Ongkir dikonfirmasi seller via WhatsApp.',
    }, { status: 503 })
  }

  const courier = normalizeCouriers(settings.allowed_couriers)
  const weight = String(Math.max(Number(total_weight) || 1, 1))
  const cacheKey = `rajaongkir:cost:${address.subdistrict_id}:${destination_id}:${weight}:${courier}`
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

  const body = new URLSearchParams({
    origin: String(address.subdistrict_id),
    destination: String(destination_id),
    weight,
    courier,
    price: 'lowest',
  })

  try {
    const response = await fetch(`${baseUrl}/calculate/domestic-cost`, {
      method: 'POST',
      headers: {
        key: apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
      cache: 'no-store',
    })
    const payload = await response.json().catch(() => null)
    await logRajaOngkirHit(supabase, {
      endpoint: 'calculate/domestic-cost',
      storeId: store_id,
      statusCode: response.status,
      metadata: { destination_id, weight, courier },
    })

    if (!response.ok) {
      return NextResponse.json({
        error: payload?.meta?.message || 'Gagal menghitung ongkir.',
        code: 'RAJAONGKIR_COST_FAILED',
        shipping_note: 'Rute atau kurir belum tersedia. Ongkir dikonfirmasi seller via WhatsApp.',
        quota: await getRajaOngkirQuota(supabase),
      }, { status: response.status })
    }

    const options = parseDomesticCosts(payload)
    const result = {
      data: options,
      meta: payload?.meta || null,
      quota: await getRajaOngkirQuota(supabase),
    }

    await supabase.from('ro_locations').insert({
      query: cacheKey,
      response_json: result,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('RajaOngkir cost error:', error)
    return NextResponse.json({
      error: 'Gagal menghitung ongkir. Coba lagi nanti.',
      code: 'RAJAONGKIR_COST_ERROR',
      shipping_note: 'Ongkir akan dikonfirmasi seller via WhatsApp.',
    }, { status: 502 })
  }
}
