import { NextRequest } from 'next/server'
import { POST as calculateRajaOngkirCost } from '../cost/route'

/**
 * Legacy compatibility route.
 * Older code may still call /api/shipping/apico-cost; keep it wired to the
 * RajaOngkir implementation so deployed clients fail gracefully instead of 404.
 */
export async function POST(request: NextRequest) {
  return calculateRajaOngkirCost(request)
}
