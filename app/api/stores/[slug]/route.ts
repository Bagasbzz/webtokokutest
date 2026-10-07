import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const supabase = createClient();

    // Fetch store data
    const { data: store, error: storeErr } = await supabase
      .from('stores')
      .select(`
        *,
        store_brand_contents (*),
        store_testimonials (*),
        store_promos (*),
        store_social_links (*),
        store_addresses (*)
      `)
      .eq('slug', slug)
      .single();

    if (storeErr || !store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Verify ownership
    const { data: { user } } = await supabase.auth.getUser();
    const { data: seller } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', user?.id)
      .single();

    if (!seller || store.seller_id !== seller.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ store });
  } catch (err) {
    console.error('API Store Fetch Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
