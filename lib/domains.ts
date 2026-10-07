const DEFAULT_PRIMARY_DOMAIN = 'webtokoku.id'
const VERCEL_PREVIEW_SUFFIX = '.vercel.app'

const RESERVED_SUBDOMAINS = new Set([
  'www',
  'app',
  'admin',
  'api',
  'dashboard',
  'auth',
  'onboarding',
  'support',
  'help',
])

export const PRIMARY_DOMAIN =
  process.env.NEXT_PUBLIC_PRIMARY_DOMAIN ||
  process.env.NEXT_PUBLIC_STOREFRONT_DOMAIN ||
  DEFAULT_PRIMARY_DOMAIN

export const LEGACY_VERCEL_DOMAIN =
  process.env.NEXT_PUBLIC_LEGACY_VERCEL_DOMAIN || 'webtokoku.vercel.app'

export function normalizeHost(host: string | null): string {
  return (host || '')
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/:\d+$/, '')
    .replace(/\.$/, '')
}

export function isLocalHost(host: string): boolean {
  return host === 'localhost' || host === '127.0.0.1' || host === '::1'
}

export function isPrimaryDomain(host: string): boolean {
  return host === PRIMARY_DOMAIN || host === `www.${PRIMARY_DOMAIN}`
}

export function isLegacyVercelHost(host: string): boolean {
  return host === LEGACY_VERCEL_DOMAIN || host.endsWith(VERCEL_PREVIEW_SUFFIX)
}

export function getTenantSlugFromHost(host: string): string | null {
  if (!host.endsWith(`.${PRIMARY_DOMAIN}`)) return null

  const slug = host.slice(0, -1 * (`.${PRIMARY_DOMAIN}`).length)
  if (!slug || slug.includes('.') || RESERVED_SUBDOMAINS.has(slug)) return null

  return slug
}

export function isPlatformHost(host: string): boolean {
  return isLocalHost(host) || isPrimaryDomain(host) || isLegacyVercelHost(host)
}

export function getStorefrontHost(slug: string): string {
  return `${slug}.${PRIMARY_DOMAIN}`
}

export function getStorefrontUrl(slug: string, path = '/'): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `https://${getStorefrontHost(slug)}${normalizedPath}`
}
