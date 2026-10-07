import { getStorefrontHost, getStorefrontUrl } from './domains'

export function getStorefrontDisplayHost(slug: string): string {
  return getStorefrontHost(slug)
}

export function getStorefrontDisplayUrl(slug: string): string {
  return getStorefrontUrl(slug)
}
