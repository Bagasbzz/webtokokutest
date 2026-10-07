import { NextResponse } from 'next/server';
import { fetchFromApiCoId, mapToRegionOption } from '@/lib/apicoid';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.length < 3) {
    return NextResponse.json([]);
  }

  try {
    const data = await fetchFromApiCoId(`/indonesia/search`, { q });
    const results = (data.data || data || []).map(mapToRegionOption);
    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
