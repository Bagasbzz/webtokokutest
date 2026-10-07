import { NextResponse } from 'next/server';
import { getProvinces } from '@/lib/wilayah';

export async function GET() {
  try {
    const provinces = await getProvinces();
    return NextResponse.json(provinces);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
