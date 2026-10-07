/**
 * API.co.id Region Service Helper
 */

const API_BASE_URL = 'https://api.co.id/v1'; // Asumsi base URL

export async function fetchFromApiCoId(path: string, params: Record<string, string> = {}) {
  const apiKey = process.env.APICOID_API_KEY;
  
  if (!apiKey) {
    console.warn('APICOID_API_KEY is not set. API calls will fail.');
  }

  const url = new URL(`${API_BASE_URL}${path}`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API.co.id error: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error(`Error fetching from API.co.id (${path}):`, error);
    throw error;
  }
}

// Map to consistent frontend response
export interface RegionOption {
  code: string;
  name: string;
  postal_code?: string;
}

export function mapToRegionOption(item: any): RegionOption {
  return {
    code: item.code || item.id || '',
    name: item.name || item.nama || '',
    postal_code: item.postal_code || item.kodepos || undefined
  };
}
