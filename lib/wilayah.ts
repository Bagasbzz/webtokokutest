/**
 * Wilayah.id Region API Helper
 * Free static API - no API key required
 * Docs: https://wilayah.id/
 */

const WILAYAH_BASE = 'https://wilayah.id/api';

export interface RegionOption {
  code: string;
  name: string;
  postal_code?: string;
}

function mapWilayah(item: any): RegionOption {
  return {
    code: item.code || '',
    name: item.name || '',
    postal_code: item.postal_code || undefined,
  };
}

export async function getProvinces(): Promise<RegionOption[]> {
  const res = await fetch(`${WILAYAH_BASE}/provinces.json`, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error('Gagal memuat data provinsi');
  const json = await res.json();
  return (json.data || []).map(mapWilayah);
}

export async function getRegencies(provinceCode: string): Promise<RegionOption[]> {
  const res = await fetch(`${WILAYAH_BASE}/regencies/${provinceCode}.json`, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error('Gagal memuat data kabupaten/kota');
  const json = await res.json();
  return (json.data || []).map(mapWilayah);
}

export async function getDistricts(regencyCode: string): Promise<RegionOption[]> {
  const res = await fetch(`${WILAYAH_BASE}/districts/${regencyCode}.json`, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error('Gagal memuat data kecamatan');
  const json = await res.json();
  return (json.data || []).map(mapWilayah);
}

export async function getVillages(districtCode: string): Promise<RegionOption[]> {
  const res = await fetch(`${WILAYAH_BASE}/villages/${districtCode}.json`, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error('Gagal memuat data kelurahan/desa');
  const json = await res.json();
  return (json.data || []).map(mapWilayah);
}
