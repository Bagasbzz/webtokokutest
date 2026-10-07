import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  getRajaOngkirConfig,
  getRajaOngkirQuota,
  logRajaOngkirHit,
  normalizeCouriers,
  parseDomesticCosts,
} from '@/lib/rajaongkir'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { isLockedModerationStatus } from '@/lib/moderation'

type ShippingSelection = {
  courier?: string
  service?: string
  cost?: number
  etd?: string | null
}

function normalizeText(value: unknown) {
  return String(value || '').trim().toLowerCase()
}

function asArray(value: unknown): any[] {
  return Array.isArray(value) ? value : []
}

function resolveProductOptions(dbProduct: any, item: any) {
  const selectedVariantIds = String(item.variant_id || '')
    .split('__')
    .map((id) => id.trim())
    .filter(Boolean)
  const selectedVariantIdSet = new Set(selectedVariantIds)
  const optionValues = asArray(dbProduct.option_groups).flatMap((group: any) => {
    const values = asArray(group.values)
    if (group.required && values.length > 0) {
      const selectedInGroup = values.some((value: any) =>
        selectedVariantIdSet.has(`${group.id || group.name}-${value.id || value.label}`)
      )
      if (!selectedInGroup) {
        throw new Error(`Pilihan "${group.name || 'produk'}" wajib dipilih untuk "${dbProduct.nama}"`)
      }
    }
    return values.map((value: any) => ({
      id: `${group.id || group.name}-${value.id || value.label}`,
      label: `${group.name || 'Pilihan'}: ${value.label || value.value || ''}`,
      priceDelta: Number(value.price_delta || 0),
      weightDelta: Number(value.weight_delta || 0),
      stock: typeof value.stock === 'number' ? value.stock : null,
    }))
  })
  const selectedOptions = selectedVariantIds.map((id) => optionValues.find((option) => option.id === id)).filter(Boolean)
  selectedOptions.forEach((option: any) => {
    if (typeof option.stock === 'number' && option.stock < item.quantity) {
      throw new Error(`Stok pilihan "${option.label}" tidak cukup. Tersedia: ${option.stock}`)
    }
  })

  const addonSelections = asArray(item.addon_selections)
  const quantityByAddonId = new Map<string, number>()
  addonSelections.forEach((selection: any) => {
    const id = String(selection?.id || '').trim()
    const quantity = Math.max(0, Number(selection?.quantity || 0))
    if (id && quantity > 0) quantityByAddonId.set(id, quantity)
  })
  asArray(item.addon_ids).forEach((id) => {
    const key = String(id)
    if (key && !quantityByAddonId.has(key)) quantityByAddonId.set(key, 1)
  })
  const selectedAddons = asArray(dbProduct.addons)
    .map((addon: any) => {
      const id = String(addon.id || addon.name)
      const requestedQty = quantityByAddonId.get(id) || 0
      const maxQty = Math.max(1, Number(addon.max_qty || 1))
      if (addon.required && requestedQty <= 0) {
        throw new Error(`Tambahan "${addon.name || 'produk'}" wajib dipilih untuk "${dbProduct.nama}"`)
      }
      if (requestedQty > maxQty) {
        throw new Error(`Jumlah tambahan "${addon.name || 'produk'}" maksimal ${maxQty}`)
      }
      return {
        id,
        requestedQty,
        maxQty,
        required: Boolean(addon.required),
        name: String(addon.name || 'Tambahan'),
        price: Number(addon.price || 0),
      }
    })
    .filter((addon: any) => addon.requestedQty > 0)
    .map((addon: any) => ({
      id: addon.id,
      name: String(addon.name || 'Tambahan'),
      price: addon.price,
      quantity: addon.requestedQty,
    }))

  return {
    optionLabel: selectedOptions.map((option: any) => option.label).join(', '),
    addonLabel: selectedAddons.length > 0
      ? `Tambahan: ${selectedAddons.map((addon: any) => `${addon.name}${addon.quantity > 1 ? ` x${addon.quantity}` : ''}`).join(', ')}`
      : '',
    priceDelta: selectedOptions.reduce((sum: number, option: any) => sum + option.priceDelta, 0)
      + selectedAddons.reduce((sum: number, addon: any) => sum + (addon.price * addon.quantity), 0),
    weightDelta: selectedOptions.reduce((sum: number, option: any) => sum + option.weightDelta, 0),
    selectedAddons,
    selectedOptions,
    selectedOptionIds: selectedOptions.map((option: any) => option.id),
  }
}

async function resolveShippingCost({
  supabase,
  storeId,
  destinationId,
  totalWeight,
  selectedShipping,
  subtotal,
}: {
  supabase: any
  storeId: string
  destinationId?: string | null
  totalWeight: number
  selectedShipping: ShippingSelection | null
  subtotal: number
}) {
  const manualShipping = {
    cost: 0,
    courier: null as string | null,
    service: 'Dikonfirmasi seller via WhatsApp',
    etd: null as string | null,
    note: 'Ongkir akan dikonfirmasi seller via WhatsApp',
  }

  if (!destinationId || !selectedShipping?.courier || !selectedShipping?.service) {
    return manualShipping
  }

  const { apiKey, baseUrl } = getRajaOngkirConfig()
  if (!apiKey) {
    return {
      ...manualShipping,
      note: 'RajaOngkir belum dikonfigurasi. Ongkir akan dikonfirmasi seller via WhatsApp',
    }
  }

  const quota = await getRajaOngkirQuota(supabase)
  if (quota.exhausted) {
    return {
      ...manualShipping,
      note: 'Kuota cek ongkir hari ini habis. Ongkir akan dikonfirmasi seller via WhatsApp',
    }
  }

  const [{ data: address }, { data: settings }] = await Promise.all([
    supabase
      .from('store_addresses')
      .select('subdistrict_id')
      .eq('store_id', storeId)
      .eq('is_default', true)
      .single(),
    supabase
      .from('shipping_settings')
      .select('auto_shipping_enabled, allowed_couriers, free_shipping_minimum')
      .eq('store_id', storeId)
      .single(),
  ])

  if (!settings?.auto_shipping_enabled) return manualShipping
  if (!address?.subdistrict_id) return manualShipping

  const body = new URLSearchParams({
    origin: address.subdistrict_id,
    destination: destinationId,
    weight: String(Math.max(totalWeight, 1)),
    courier: normalizeCouriers(settings?.allowed_couriers),
    price: 'lowest',
  })

  const res = await fetch(`${baseUrl}/calculate/domestic-cost`, {
    method: 'POST',
    headers: {
      key: apiKey,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
    cache: 'no-store',
  })
  await logRajaOngkirHit(supabase, {
    endpoint: 'calculate/domestic-cost',
    storeId,
    statusCode: res.status,
    metadata: { destinationId, totalWeight },
  })

  if (!res.ok) return manualShipping

  const options = parseDomesticCosts(await res.json())
  const matched = options.find((option) =>
    (normalizeText(option.code) === normalizeText(selectedShipping.courier) ||
      normalizeText(option.name) === normalizeText(selectedShipping.courier)) &&
    normalizeText(option.service) === normalizeText(selectedShipping.service)
  )

  if (!matched) return manualShipping

  const freeShippingMinimum = Number(settings.free_shipping_minimum || 0)
  const getsFreeShipping = freeShippingMinimum > 0 && subtotal >= freeShippingMinimum

  return {
    cost: getsFreeShipping ? 0 : matched.cost || 0,
    courier: matched.code || matched.name || null,
    service: matched.service || null,
    etd: matched.etd || null,
    note: getsFreeShipping ? 'Gratis ongkir berlaku untuk pesanan ini' : null as string | null,
  }
}

export async function POST(request: NextRequest) {
  const limited = checkRateLimit(request, {
    key: 'orders:create',
    limit: 20,
    windowMs: 10 * 60 * 1000,
  })
  if (!limited.ok) return rateLimitResponse(limited)

  const { store_id, customer, cart, shipping, bukti_url, payment_method } = await request.json()

  // 1. Validasi input dasar
  if (!store_id || !customer || !cart || cart.length === 0) {
    return NextResponse.json({ error: 'Data pesanan tidak lengkap' }, { status: 400 })
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

  // 2. Cek feature flag auto_shipping
  const { data: autoShippingFlag } = await supabase
    .from('feature_flags')
    .select('enabled_globally')
    .eq('key', 'auto_shipping')
    .single()
  
  const autoShippingEnabled = autoShippingFlag?.enabled_globally ?? false

  // 3. Fetch produk lengkap dari DB dengan validasi ketat
  const productIds = cart.map((i: any) => i.id)
  const { data: dbProducts, error: dbError } = await supabase
    .from('products')
    .select('id, nama, harga, stok, berat_gram, is_active, store_id, option_groups, addons, moderation_status')
    .in('id', productIds)

  if (dbError || !dbProducts) {
    return NextResponse.json({ error: 'Gagal memvalidasi produk' }, { status: 500 })
  }

  // 4. Validasi setiap item cart dengan hardening
  let safeCart: any[] = []
  try {
    for (const item of cart) {
      const dbProduct = dbProducts.find((p: any) => p.id === item.id)
      
      // Validasi: Produk harus ada
      if (!dbProduct) {
        throw new Error(`Produk tidak ditemukan: ${item.id}`)
      }
      
      // Validasi: Produk harus aktif
      if (!dbProduct.is_active) {
        throw new Error(`Produk "${dbProduct.nama}" tidak aktif`)
      }

      if (isLockedModerationStatus(dbProduct.moderation_status)) {
        throw new Error(`Produk "${dbProduct.nama}" belum dapat dipesan saat ini`)
      }
      
      // Validasi: Produk harus milik toko yang benar
      if (dbProduct.store_id !== store_id) {
        throw new Error(`Produk "${dbProduct.nama}" tidak termasuk toko ini`)
      }
      
      // Validasi: Quantity harus > 0
      if (item.quantity <= 0) {
        throw new Error(`Quantity untuk "${dbProduct.nama}" harus lebih dari 0`)
      }
      
      // Validasi: Stok harus cukup
      if (dbProduct.stok < item.quantity) {
        throw new Error(`Stok "${dbProduct.nama}" tidak cukup. Tersedia: ${dbProduct.stok}, Dibutuhkan: ${item.quantity}`)
      }
      
      const optionSummary = resolveProductOptions(dbProduct, item)
      const lineNameDetails = [optionSummary.optionLabel, optionSummary.addonLabel].filter(Boolean).join('; ')
      const safeName = lineNameDetails ? `${dbProduct.nama} (${lineNameDetails})` : dbProduct.nama
      const safePrice = dbProduct.harga + optionSummary.priceDelta
      const safeWeight = (dbProduct.berat_gram || 0) + optionSummary.weightDelta

      safeCart.push({
        ...item,
        nama: safeName,
        harga: safePrice,
        berat_gram: safeWeight,
        selected_options: optionSummary.selectedOptions,
        selected_option_ids: optionSummary.selectedOptionIds,
        selected_addons: optionSummary.selectedAddons,
        stok_asli: dbProduct.stok
      })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  // 5. Hitung ulang server-side (WAJIB — jangan percaya frontend)
  const subtotal = safeCart.reduce((s: number, i: any) => s + (i.harga * i.quantity), 0)
  const totalWeight = safeCart.reduce((w: number, i: any) => w + ((i.berat_gram || 0) * i.quantity), 0)
  
  // 6. Handle shipping berdasarkan feature flag
  let shipping_cost = 0
  let shipping_service: string | null = shipping?.service || null
  let shipping_courier: string | null = shipping?.courier || null
  let shipping_etd: string | null = shipping?.etd || null
  let shipping_note: string | null = null
  
  if (autoShippingEnabled) {
    // Hitung ulang ongkir di server, lalu cocokkan dengan layanan yang dipilih pembeli.
    const resolvedShipping = await resolveShippingCost({
      supabase,
      storeId: store_id,
      destinationId: customer.subdistrict_id,
      totalWeight,
      selectedShipping: shipping || null,
      subtotal,
    })

    shipping_cost = resolvedShipping.cost
    shipping_courier = resolvedShipping.courier
    shipping_service = resolvedShipping.service
    shipping_etd = resolvedShipping.etd
    shipping_note = resolvedShipping.note
  } else {
    // Jika auto_shipping OFF, ongkir = 0 dan beri keterangan
    shipping_cost = 0
    shipping_service = 'Dikonfirmasi seller via WhatsApp'
    shipping_courier = null
    shipping_etd = null
    shipping_note = 'Ongkir akan dikonfirmasi seller via WhatsApp'
  }
  
  const total = subtotal + shipping_cost
  const order_code = `ORD-${Date.now()}`

  // 7. Kurangi stok produk dan stok opsi secara atomik sebelum order dibuat.
  const deductedItems: any[] = []
  try {
    for (const item of safeCart) {
      const { data: success, error: rpcError } = await supabase
        .rpc('decrement_product_stock_with_options', {
          p_product_id: item.id,
          p_quantity: item.quantity,
          p_selected_option_ids: item.selected_option_ids || [],
        })

      if (rpcError || !success) {
        throw new Error(`Stok untuk produk "${item.nama}" tidak mencukupi. Silakan coba beberapa saat lagi.`)
      }

      deductedItems.push(item)
    }

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        store_id,
        order_code,
        customer_name: customer.name,
        customer_whatsapp: customer.whatsapp,
        customer_address: customer.address,
        subdistrict_id: customer.subdistrict_id || null,
        items: safeCart,
        subtotal,
        shipping_cost,
        shipping_courier,
        shipping_service,
        shipping_etd,
        total,
        payment_method: payment_method || 'manual_whatsapp',
        payment_status: bukti_url ? 'menunggu_konfirmasi' : 'pending',
        order_status: 'menunggu_konfirmasi',
        bukti_url: bukti_url || null,
        bukti_uploaded_at: bukti_url ? new Date().toISOString() : null,
      })
      .select('id, order_code')
      .single()

    if (error) {
      throw new Error(error.message)
    }

    const { error: itemsError } = await supabase.from('order_items').insert(
      safeCart.map((item: any) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.nama,
        price: item.harga,
        quantity: item.quantity,
        weight_gram: item.berat_gram || 0,
        total: item.harga * item.quantity,
      }))
    )

    if (itemsError) {
      await supabase.from('orders').delete().eq('id', order.id)
      throw new Error(itemsError.message)
    }

    return NextResponse.json({
      order_code: order.order_code,
      shipping_note,
      total,
    })
  } catch (err: any) {
    // Rollback: kembalikan stok produk dan opsi yang sudah terlanjur dikurangi.
    for (const item of deductedItems) {
      const { error: rbErr } = await supabase.rpc('increment_product_stock_with_options', {
        p_product_id: item.id,
        p_quantity: item.quantity,
        p_selected_option_ids: item.selected_option_ids || [],
      })
      if (rbErr) console.error('Gagal rollback stok:', rbErr)
    }

    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
