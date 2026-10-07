import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  sanitizeFontValue,
  sanitizePlainText,
  sanitizeThemeColorList,
  sanitizeUrl,
} from '@/lib/customization-security';
import {
  moderateContent,
  moderationPatch,
  productModerationInputs,
  storeModerationInputs,
} from '@/lib/moderation';

function slugifyCategory(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      nama_toko, slug, deskripsi, template, no_wa, warna_tema,
      business_category,
      hero_image_url, font_heading, hero_title, hero_subtitle,
      address, products
    } = body;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get Seller ID
    const { data: seller, error: sellerErr } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (sellerErr || !seller) {
      return NextResponse.json({ error: 'Data seller tidak ditemukan' }, { status: 404 });
    }

    if (!nama_toko || !slug || !template || !no_wa) {
      return NextResponse.json({ error: 'Data toko belum lengkap' }, { status: 400 });
    }

    if (!business_category || !String(business_category).trim()) {
      return NextResponse.json({ error: 'Kategori usaha wajib diisi untuk kebutuhan SEO toko' }, { status: 400 });
    }

    if (!address?.alamat_detail || !address?.province_name || !address?.regency_name || !address?.district_name || !address?.village_name) {
      return NextResponse.json({ error: 'Alamat toko wajib diisi lengkap untuk kebutuhan hitung ongkir otomatis' }, { status: 400 });
    }

    const { data: existingStore } = await supabase
      .from('stores')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existingStore) {
      return NextResponse.json({ error: 'URL toko sudah dipakai. Silakan gunakan URL lain.' }, { status: 409 });
    }

    const cityName = address?.regency_name || 'Jakarta Pusat';
    const addressParts = [
      address?.alamat_detail,
      address?.village_name,
      address?.district_name,
      address?.regency_name,
      address?.province_name,
    ].filter(Boolean);
    const displayAddress = addressParts.length > 0
      ? addressParts.join(', ')
      : 'Gondangdia, Menteng, Jakarta Pusat';

    const sanitizedStorePayload = {
      nama_toko: sanitizePlainText(nama_toko),
      slug,
      deskripsi: sanitizePlainText(deskripsi) || null,
      business_category: sanitizePlainText(business_category) || null,
      hero_title: sanitizePlainText(hero_title),
      hero_subtitle: sanitizePlainText(hero_subtitle),
      alamat: displayAddress,
    }

    const initialProductResults = Array.isArray(products)
      ? products.map((p) => moderateContent(productModerationInputs({
          nama: sanitizePlainText(p.nama),
          kategori: sanitizePlainText(p.kategori) || null,
          deskripsi: sanitizePlainText(p.deskripsi) || null,
          badge_label: sanitizePlainText(p.badge_label) || null,
          product_details: p.product_details || {},
          option_groups: p.option_groups || [],
          addons: p.addons || [],
        })))
      : []

    const storeModeration = moderateContent([
      ...storeModerationInputs(sanitizedStorePayload),
      ...initialProductResults.flatMap((result, index) => result.matchedTerms.length
        ? [{ field: `initial_product_${index}`, value: result.matchedTerms.join(' '), weight: 1.2 }]
        : []),
    ])
    const publishAllowed = !storeModeration.shouldBlockPublish

    // 3. Create Store
    const { data: store, error: storeErr } = await supabase
      .from('stores')
      .insert({
        seller_id: seller.id,
        nama_toko: sanitizedStorePayload.nama_toko,
        slug: sanitizedStorePayload.slug,
        deskripsi: sanitizedStorePayload.deskripsi,
        template,
        no_wa,
        warna_tema: sanitizeThemeColorList(warna_tema),
        business_category: sanitizedStorePayload.business_category,
        hero_image_url: sanitizeUrl(hero_image_url, 'image') || null,
        font_heading: sanitizeFontValue(font_heading) || 'Inter',
        hero_title: sanitizedStorePayload.hero_title,
        hero_subtitle: sanitizedStorePayload.hero_subtitle,
        kota: cityName,
        alamat: sanitizedStorePayload.alamat,
        is_published: publishAllowed,
        ...moderationPatch(storeModeration),
      })
      .select()
      .single();

    if (storeErr) {
      return NextResponse.json({ error: storeErr.message }, { status: 400 });
    }

    // 4. Save Store Address (opsional — skip kalau tidak ada village_code)
    if (address?.village_code) {
      const { error: addrErr } = await supabase
        .from('store_addresses')
        .insert({
          store_id: store.id,
          nama_pengirim: nama_toko,
          no_telp: no_wa,
          alamat_lengkap: address.alamat_detail,
          province_code: address.province_code,
          province_name: address.province_name,
          regency_code: address.regency_code,
          regency_name: address.regency_name,
          district_code: address.district_code,
          district_name: address.district_name,
          village_code: address.village_code,
          village_name: address.village_name,
          postal_code: address.postal_code,
          location_notes: sanitizePlainText(address.location_notes),
          map_url: sanitizeUrl(address.map_url, 'link') || null,
          is_default: true
        });

      if (addrErr) {
        console.error('Error saving address (non-fatal):', addrErr);
      }
    }

    // 5. Save Initial Products
    if (products && Array.isArray(products) && products.length > 0) {
      const categoryNames = Array.from(
        new Set(
          products
            .map((p) => String(p.kategori || '').trim())
            .filter(Boolean),
        ),
      )

      if (categoryNames.length > 0) {
        const { error: categoryErr } = await supabase
          .from('product_categories')
          .upsert(
            categoryNames.map((name, index) => ({
              store_id: store.id,
              name: sanitizePlainText(name),
              slug: slugifyCategory(name),
              sort_order: index,
              is_active: true,
            })),
            { onConflict: 'store_id,slug' },
          )

        if (categoryErr) console.error('Error saving product categories:', categoryErr);
      }

      const { data: categories } = await supabase
        .from('product_categories')
        .select('id, name, slug')
        .eq('store_id', store.id)

      const categoryBySlug = new Map(
        (categories || []).map((category) => [category.slug, category.id]),
      )

      const { error: prodErr } = await supabase
        .from('products')
        .insert(
          products.map((p, i) => {
            const productModeration = initialProductResults[i] || moderateContent(productModerationInputs(p))
            return {
            store_id: store.id,
            nama: sanitizePlainText(p.nama),
            harga: parseInt(p.harga) || 0,
            foto_url: sanitizeUrl(p.foto_url, 'image') || null,
            kategori: sanitizePlainText(p.kategori) || null,
            category_id: p.kategori ? categoryBySlug.get(slugifyCategory(p.kategori)) || null : null,
            product_type: p.product_type || 'general',
            option_groups: p.option_groups || [],
            addons: p.addons || [],
            product_details: p.product_details || {},
            show_category: p.show_category ?? true,
            show_on_homepage: p.show_on_homepage ?? i < 6,
            homepage_rank: Number(p.homepage_rank ?? i),
            badge_label: sanitizePlainText(p.badge_label) || null,
            compare_at_price: Number(p.compare_at_price || 0) || null,
            stok: Number(p.stok || 0),
            berat_gram: Number(p.berat_gram || 0),
            deskripsi: sanitizePlainText(p.deskripsi) || null,
            urutan: i,
            ...moderationPatch(productModeration),
          }}),
        );
      
      if (prodErr) console.error('Error saving initial products:', prodErr);
    }

    if (storeModeration.level !== 'safe') {
      await supabase.from('moderation_events').insert({
        store_id: store.id,
        user_id: user.id,
        event_type: 'onboarding_scan',
        risk_level: storeModeration.level,
        category: storeModeration.categories[0] || null,
        matched_terms: storeModeration.matchedTerms,
        reason: storeModeration.reason,
        action: publishAllowed ? 'warning' : 'hold_publish',
      })
    }

    return NextResponse.json({
      success: true,
      store,
      moderation: {
        level: storeModeration.level,
        status: storeModeration.status,
        message: storeModeration.sellerMessage,
        matched_terms: storeModeration.matchedTerms,
      },
    });
  } catch (err: any) {
    console.error('Onboarding API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
