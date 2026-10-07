const DEFAULT_BASE_URL = 'https://rajaongkir.komerce.id/api/v1'
const DEFAULT_DAILY_LIMIT = 100

export type RajaOngkirOption = {
  name: string
  code: string
  service: string
  description: string
  cost: number
  etd: string | null
}

export type RajaOngkirQuota = {
  limit: number
  used: number
  remaining: number
  exhausted: boolean
  warning: string | null
}

export function getRajaOngkirConfig() {
  return {
    apiKey: process.env.RAJAONGKIR_API_KEY || process.env.KOMERCE_SHIPPING_COST_API_KEY || '',
    baseUrl: (process.env.RAJAONGKIR_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, ''),
    dailyLimit: Number(process.env.RAJAONGKIR_DAILY_LIMIT || DEFAULT_DAILY_LIMIT) || DEFAULT_DAILY_LIMIT,
  }
}

export function normalizeCouriers(value: unknown, fallback = ['jne', 'jnt', 'sicepat']) {
  const couriers = Array.isArray(value) ? value : fallback
  return couriers
    .map((courier) => String(courier || '').trim().toLowerCase())
    .filter(Boolean)
    .join(':')
}

export function parseDomesticCosts(payload: any): RajaOngkirOption[] {
  const data = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.results)
      ? payload.results
      : []

  const options: RajaOngkirOption[] = []

  for (const item of data) {
    const nestedServices = item?.costs || item?.services

    if (Array.isArray(nestedServices)) {
      for (const service of nestedServices) {
        const firstCost = Array.isArray(service?.cost) ? service.cost[0] : null
        options.push({
          name: String(item?.name || item?.courier_name || item?.code || 'Kurir'),
          code: String(item?.code || item?.courier || item?.name || 'kurir').toLowerCase(),
          service: String(service?.service || service?.name || 'REG'),
          description: String(service?.description || service?.desc || ''),
          cost: Number(firstCost?.value ?? service?.price ?? service?.cost ?? 0) || 0,
          etd: firstCost?.etd || service?.etd || service?.estimation || null,
        })
      }
      continue
    }

    options.push({
      name: String(item?.name || item?.courier_name || item?.code || 'Kurir'),
      code: String(item?.code || item?.courier || item?.name || 'kurir').toLowerCase(),
      service: String(item?.service || item?.name || 'REG'),
      description: String(item?.description || item?.desc || ''),
      cost: Number(item?.cost ?? item?.price ?? 0) || 0,
      etd: item?.etd || item?.estimation || null,
    })
  }

  return options.filter((option) => option.cost > 0)
}

export async function getRajaOngkirQuota(supabase: any): Promise<RajaOngkirQuota> {
  const { dailyLimit } = getRajaOngkirConfig()
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  try {
    const { count, error } = await supabase
      .from('shipping_api_usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('service', 'rajaongkir')
      .eq('status', 'counted')
      .gte('created_at', start.toISOString())

    if (error) throw error

    const used = count || 0
    const remaining = Math.max(dailyLimit - used, 0)
    return {
      limit: dailyLimit,
      used,
      remaining,
      exhausted: used >= dailyLimit,
      warning: remaining <= 10
        ? `Sisa kuota cek ongkir hari ini ${remaining}/${dailyLimit}.`
        : null,
    }
  } catch {
    return {
      limit: dailyLimit,
      used: 0,
      remaining: dailyLimit,
      exhausted: false,
      warning: null,
    }
  }
}

export async function logRajaOngkirHit(
  supabase: any,
  params: {
    endpoint: string
    storeId?: string | null
    statusCode?: number | null
    metadata?: Record<string, unknown>
  }
) {
  try {
    await supabase.from('shipping_api_usage_logs').insert({
      service: 'rajaongkir',
      endpoint: params.endpoint,
      store_id: params.storeId || null,
      status: 'counted',
      status_code: params.statusCode || null,
      metadata: params.metadata || {},
    })
  } catch {
    // The usage table may not exist yet on older deployments. Shipping should
    // still work, but docs tell the owner to run the migration.
  }
}

export function quotaExceededResponse(quota: RajaOngkirQuota) {
  return {
    error: 'Kuota cek ongkir harian sudah habis.',
    code: 'RAJAONGKIR_DAILY_LIMIT',
    shipping_note: 'Kuota cek ongkir hari ini habis. Pesanan tetap bisa masuk, ongkir dikonfirmasi seller via WhatsApp.',
    quota,
  }
}
