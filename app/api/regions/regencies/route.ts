import { NextResponse } from 'next/server';
import { getRegencies } from '@/lib/wilayah';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provinceCode = searchParams.get('province_code');

  if (!provinceCode) {
    return NextResponse.json({ error: 'province_code is required' }, { status: 400 });
  }

  try {
    const regencies = await getRegencies(provinceCode);
    return NextResponse.json(regencies);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
