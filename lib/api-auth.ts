import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isPlatformAdmin } from '@/lib/admin-access'

export type ApiAuthResult =
  | { ok: true; user: any; seller: any }
  | { ok: false; response: NextResponse }

export async function getApiUserSeller(): Promise<ApiAuthResult> {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  const { data: seller, error: sellerError } = await supabase
    .from('sellers')
    .select('id, user_id, email, role')
    .eq('user_id', user.id)
    .single()

  if (sellerError || !seller) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Seller tidak ditemukan' }, { status: 404 }),
    }
  }

  return { ok: true, user, seller }
}

export async function requireApiAdmin(): Promise<ApiAuthResult> {
  const auth = await getApiUserSeller()
  if (!auth.ok) return auth

  const admin = await isPlatformAdmin()
  if (!admin) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }

  return auth
}

export async function requireStoreOwner(storeId: string): Promise<ApiAuthResult> {
  const auth = await getApiUserSeller()
  if (!auth.ok) return auth
  const admin = await isPlatformAdmin()

  const supabase = createClient()
  const { data: store, error } = await supabase
    .from('stores')
    .select('id, seller_id')
    .eq('id', storeId)
    .single()

  if (error || !store) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Toko tidak ditemukan' }, { status: 404 }),
    }
  }

  if (store.seller_id !== auth.seller.id && !admin) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }

  return auth
}
