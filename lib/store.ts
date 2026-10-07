import { createClient } from '@/lib/supabase/client'
import { canChangeTemplate } from '@/lib/plan'
import { isLockedModerationStatus } from '@/lib/moderation'

async function scanStoreModeration(storeId: string) {
  const res = await fetch('/api/moderation/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storeId }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.error) {
    throw new Error(json.error || 'Gagal memeriksa moderasi toko')
  }
  return json
}

export async function getMyStore() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: seller } = await supabase.from('sellers').select('id').eq('user_id', user.id).single()
  if (!seller) return null
  const { data: store } = await supabase.from('stores').select('*').eq('seller_id', seller.id).single()
  return store
}

export async function updateStore(storeId: string, data: {
  nama_toko?: string; deskripsi?: string; no_wa?: string; warna_tema?: string;
  kota?: string; alamat?: string; template?: string; logo_url?: string | null;
  hero_image_url?: string | null; font_heading?: string; font_body?: string;
  hero_title?: string | null; hero_subtitle?: string | null; is_published?: boolean;
}): Promise<void> {
  const supabase = createClient()
  const { data: currentStore, error: storeError } = await supabase
    .from('stores')
    .select('*')
    .eq('id', storeId)
    .single()

  if (storeError) {
    console.error('Error loading store before update:', storeError)
    throw new Error('Gagal memeriksa status toko')
  }

  if (isLockedModerationStatus(currentStore?.moderation_status) && data.is_published) {
    throw new Error('Toko sedang dalam peninjauan moderasi dan belum bisa dipublikasikan.')
  }

  if (data.template) {
    if (currentStore?.template !== data.template && !canChangeTemplate(currentStore as any)) {
      throw new Error('Paket Gratis mengunci template setelah toko dipublish. Upgrade Pro untuk ganti template kapan saja.')
    }
  }

  const { error } = await supabase
    .from('stores')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', storeId)

  if (error) { console.error('Error updating store:', error); throw new Error('Gagal menyimpan pengaturan toko') }

  const scan = await scanStoreModeration(storeId)
  if (scan?.blocked) {
    throw new Error(scan.message || 'Konten toko perlu ditinjau sebelum dipublikasikan.')
  }
}
