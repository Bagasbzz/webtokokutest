import { NextResponse } from 'next/server';
import { getDistricts } from '@/lib/wilayah';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const regencyCode = searchParams.get('regency_code');

  if (!regencyCode) {
    return NextResponse.json({ error: 'regency_code is required' }, { status: 400 });
  }

  try {
    const districts = await getDistricts(regencyCode);
    return NextResponse.json(districts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
