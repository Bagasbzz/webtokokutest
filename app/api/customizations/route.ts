import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import {
  getAllowedCustomizationField,
  isValidCustomizationKey,
  sanitizeCustomizationValue,
} from '@/lib/customization-security'

/**
 * API Route: Simpan Kustomisasi (Server-Side)
 * 
 * Alur:
 * 1. Cek sesi user (login) via cookie
 * 2. Verifikasi kepemilikan toko (store_id)
 * 3. Upsert data ke template_customizations menggunakan SERVICE_ROLE_KEY
 *    (untuk menembus RLS secara aman di sisi server)
 */

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  
  // 1. Inisialisasi Auth Client (untuk cek session)
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

  // Ambil user yang sedang login
  const { data: { user }, error: authError } = await authClient.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Sesi habis atau tidak sah' }, { status: 401 })
  }

  try {
    const { store_id, data } = await req.json()

    if (!store_id || !data) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // 2. Verifikasi Kepemilikan Toko
    // Ambil data seller dari user_id
    const { data: seller } = await authClient
      .from('sellers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!seller) {
      return NextResponse.json({ error: 'Data seller tidak ditemukan' }, { status: 403 })
    }

    // Cek apakah store_id tersebut memang milik seller ini
    const { data: store } = await authClient
      .from('stores')
      .select('id, template')
      .eq('id', store_id)
      .eq('seller_id', seller.id)
      .single()

    if (!store) {
      return NextResponse.json({ error: 'Anda tidak memiliki akses ke toko ini' }, { status: 403 })
    }

    // 3. Simpan ke Database (Upsert) menggunakan SERVICE_ROLE_KEY
    // Kita buat client admin baru yang bypass RLS
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const customizationData = data as Record<string, unknown>

    // Format data ke bentuk baris tabel (flattening).
    // Expected key format is "section.element" (example: "hero.title").
    const malformedKey = Object.keys(customizationData).find(key => !isValidCustomizationKey(key))

    if (malformedKey) {
      return NextResponse.json({ error: `Key kustomisasi tidak valid: ${malformedKey}` }, { status: 400 })
    }

    const rows = []
    for (const [compositeKey, rawValue] of Object.entries(customizationData)) {
      const field = getAllowedCustomizationField(store.template || 'butik', compositeKey)
      if (!field) {
        return NextResponse.json({ error: `Field kustomisasi tidak diizinkan: ${compositeKey}` }, { status: 400 })
      }

      const sanitized = sanitizeCustomizationValue(field, rawValue)
      if (!sanitized.ok) {
        return NextResponse.json({ error: sanitized.error }, { status: 400 })
      }

      const dotIdx = compositeKey.indexOf('.')
      const section_key = compositeKey.substring(0, dotIdx)
      const element_key = compositeKey.substring(dotIdx + 1)

      rows.push({
        store_id,
        section_key,
        element_key,
        value: sanitized.value,
        is_draft: true, // Selalu simpan sebagai draft dari editor
        updated_at: new Date().toISOString()
      })
    }

    if (rows.length === 0) {
      return NextResponse.json({ success: true, message: 'Tidak ada data untuk disimpan' })
    }

    const { error: upsertError } = await adminClient
      .from('template_customizations')
      .upsert(rows, {
        onConflict: 'store_id,section_key,element_key,is_draft'
      })

    if (upsertError) {
      console.error('Database Error:', upsertError)
      return NextResponse.json({ error: upsertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
    
  } catch (err: any) {
    console.error('Server Error:', err)
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan server' }, { status: 500 })
  }
}
