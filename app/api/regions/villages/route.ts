import { NextResponse } from 'next/server';
import { getVillages } from '@/lib/wilayah';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const districtCode = searchParams.get('district_code');

  if (!districtCode) {
    return NextResponse.json({ error: 'district_code is required' }, { status: 400 });
  }

  try {
    const villages = await getVillages(districtCode);
    return NextResponse.json(villages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
