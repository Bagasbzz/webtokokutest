import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json()
    if (!slug) {
      return NextResponse.json({ error: 'Slug tidak ditemukan' }, { status: 400 })
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Pastikan user adalah pemilik toko dengan slug tersebut
    const { data: seller } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!seller) {
      return NextResponse.json({ error: 'Seller tidak ditemukan' }, { status: 404 })
    }

    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('slug', slug)
      .eq('seller_id', seller.id)
      .single()

    if (!store) {
      return NextResponse.json({ error: 'Toko tidak ditemukan atau bukan milik akun ini' }, { status: 403 })
    }

    // Pemicu revalidasi cache
    revalidatePath(`/${slug}`)
    revalidatePath(`/custom-domain/${slug}`)

    return NextResponse.json({ success: true, message: `Cache untuk toko ${slug} berhasil direvalidasi.` })
  } catch (err: any) {
    console.error('Revalidation error:', err)
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan saat revalidasi cache' }, { status: 500 })
  }
}
