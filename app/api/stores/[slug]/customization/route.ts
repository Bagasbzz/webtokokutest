import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  sanitizeFontValue,
  sanitizePlainText,
  sanitizeThemeColorList,
  sanitizeUrl,
} from '@/lib/customization-security';

export async function PATCH(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();
    const supabase = createClient();

    // Verify ownership first
    const { data: { user } } = await supabase.auth.getUser();
    const { data: store, error: storeErr } = await supabase
      .from('stores')
      .select('id, seller_id')
      .eq('slug', slug)
      .single();

    if (storeErr || !store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const { data: seller } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', user?.id)
      .single();

    if (!seller || store.seller_id !== seller.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update store customization fields
    const { error: updateErr } = await supabase
      .from('stores')
      .update({
        warna_tema: sanitizeThemeColorList(body.warna_tema),
        font_heading: sanitizeFontValue(body.font_heading) || 'Inter',
        hero_title: sanitizePlainText(body.hero_title),
        hero_subtitle: sanitizePlainText(body.hero_subtitle),
        hero_image_url: sanitizeUrl(body.hero_image_url, 'image') || null,
        deskripsi: sanitizePlainText(body.deskripsi),
        nama_toko: sanitizePlainText(body.nama_toko)
      })
      .eq('id', store.id);

    if (updateErr) throw updateErr;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API Store Update Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
